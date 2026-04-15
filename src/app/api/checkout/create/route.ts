import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  COURSE_PRICES_CENTS,
  COURSE_TITLES,
  grossUpCents,
  type SvaCourseKey,
} from '@/lib/jidopay'

// SVA → JidoPay dynamic checkout bridge.
//
// The cart page posts `{ courseKeys, cohortId }` here and we:
//   1. Authenticate the Supabase user (RLS also enforces it).
//   2. Resolve the cohort's meeting time so multi-item purchases all
//      unlock access at the same moment.
//   3. Build line items from the server-side price catalog — never trust
//      cart-supplied amounts.
//   4. Call JidoPay's dynamic checkout API with metadata the webhook will
//      use to grant access.
//   5. Return the buy.stripe.com URL that window.JidoPay.openCheckout opens
//      inside the embed modal.

export const runtime = 'nodejs'

const VALID_COURSE_KEYS: SvaCourseKey[] = [
  'iv-therapy-certification',
  'complete-mastery-bundle',
  'iv-complications-emergency',
  'vitamin-nutrient-therapy',
  'nad-plus-masterclass',
  'iv-push-administration',
]

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { courseKeys?: unknown; cohortId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    !Array.isArray(body.courseKeys) ||
    body.courseKeys.length === 0 ||
    body.courseKeys.length > 10 ||
    !body.courseKeys.every((k): k is SvaCourseKey =>
      typeof k === 'string' && VALID_COURSE_KEYS.includes(k as SvaCourseKey)
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid courseKeys' },
      { status: 400 }
    )
  }
  if (typeof body.cohortId !== 'string' || body.cohortId.length === 0) {
    return NextResponse.json({ error: 'Missing cohortId' }, { status: 400 })
  }

  const courseKeys = body.courseKeys as SvaCourseKey[]
  // De-dupe so a glitchy cart can't charge for the same course twice.
  const uniqueKeys = Array.from(new Set(courseKeys))

  // Look up the selected cohort so we can pin `cohortMeetingAt` in metadata.
  // The webhook will use that meeting_at to find each purchased course's
  // matching cohort (bulk-created by admin with the same meeting_at).
  const service = await createServiceClient()
  const { data: cohort, error: cohortErr } = await service
    .from('course_cohorts')
    .select('id, meeting_at, active')
    .eq('id', body.cohortId)
    .maybeSingle()
  if (cohortErr || !cohort || !cohort.active) {
    return NextResponse.json(
      { error: 'Selected cohort is unavailable' },
      { status: 400 }
    )
  }

  // Build line items using the server-authoritative catalog.
  const netLineItems = uniqueKeys.map((key) => ({
    name: COURSE_TITLES[key],
    amount: COURSE_PRICES_CENTS[key],
    quantity: 1,
  }))
  const subtotalCents = netLineItems.reduce((s, i) => s + i.amount, 0)
  const grossTotalCents = grossUpCents(subtotalCents)
  const feeCents = grossTotalCents - subtotalCents

  const lineItems = [
    ...netLineItems,
    // Processing fee as its own line so the Stripe receipt itemizes it —
    // much clearer for shoppers than scaling each product up.
    {
      name: 'Processing fee',
      description: '3.5% + $0.30 — covers card processing',
      amount: feeCents,
      quantity: 1,
    },
  ]

  const apiKey = process.env.JIDOPAY_API_KEY
  const jidopayBase =
    process.env.NEXT_PUBLIC_JIDOPAY_BASE_URL ?? 'https://jidopay.com'
  if (!apiKey) {
    console.error('[checkout/create] JIDOPAY_API_KEY not set')
    return NextResponse.json(
      { error: 'Checkout is temporarily unavailable. Please contact support.' },
      { status: 500 }
    )
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://skilledvisitsacademy.com'

  // Metadata the webhook will receive back verbatim — these drive access
  // grants and cohort pinning. Keep keys short so we stay under Stripe's
  // 500-char value limit (courses list is our only concern at 6 keys max).
  const metadata: Record<string, string> = {
    sva_user_id: user.id,
    sva_courses: uniqueKeys.join(','),
    sva_cohort_id: cohort.id,
    sva_cohort_meeting_at: cohort.meeting_at,
  }

  let response: Response
  try {
    response = await fetch(`${jidopayBase}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        line_items: lineItems,
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${appUrl}/dashboard?purchase=success`,
        cancel_url: `${appUrl}/checkout${
          uniqueKeys.length === 1 ? `?course=${uniqueKeys[0]}` : '?from=cart'
        }`,
        metadata,
      }),
    })
  } catch (err) {
    console.error('[checkout/create] network error calling JidoPay', err)
    return NextResponse.json(
      { error: 'Could not reach checkout provider. Please try again.' },
      { status: 502 }
    )
  }

  if (!response.ok) {
    const text = await response.text()
    console.error(
      '[checkout/create] JidoPay returned non-2xx',
      response.status,
      text
    )
    return NextResponse.json(
      { error: 'Checkout provider rejected the request.' },
      { status: 502 }
    )
  }

  const json = (await response.json()) as {
    id?: string
    url?: string
    amount_total?: number
  }
  if (!json.url) {
    console.error('[checkout/create] JidoPay response missing url', json)
    return NextResponse.json(
      { error: 'Unexpected checkout provider response.' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    checkoutId: json.id ?? null,
    url: json.url,
    amountTotal: json.amount_total ?? grossTotalCents,
  })
}
