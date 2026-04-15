import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import {
  purchaseConfirmationHtml,
  purchaseConfirmationText,
} from '@/lib/emails/purchase-confirmation'
import {
  COURSE_PRICES,
  COURSE_TITLES,
  linkIdToCourseKey,
  verifyJidopaySignature,
  type SvaCourseKey,
} from '@/lib/jidopay'

// JidoPay → Skilled Visits Academy webhook receiver.
//
// Flow when a student pays:
//   1. JidoPay fires "checkout.session.completed" with HMAC-signed body.
//   2. We verify the signature against JIDOPAY_WEBHOOK_SECRET.
//   3. We map paymentLinkId → course key, look up the Supabase user by the
//      email Stripe collected at checkout, and upsert into course_purchases.
//   4. We send a confirmation email via Resend.
//
// The student's identity is established by email — the SVA checkout page
// prefills the embed with the same email they used to create their Supabase
// account, so by the time this webhook fires, both systems agree on who
// they are. As a belt-and-braces fallback we also honor clientReferenceId
// (Supabase user id) if it's present on the session.

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signatureHeader = headersList.get('jidopay-signature')
  const secret = process.env.JIDOPAY_WEBHOOK_SECRET ?? ''

  const result = verifyJidopaySignature({
    payload: body,
    header: signatureHeader,
    secret,
  })
  if (!result.ok) {
    console.error('[jidopay-webhook] signature check failed', result.reason)
    return NextResponse.json(
      { error: 'Invalid signature', reason: result.reason },
      { status: 400 }
    )
  }

  let event: {
    id?: string
    type?: string
    data?: {
      sessionId?: string
      paymentLinkId?: string | null
      clientReferenceId?: string | null
      customerEmail?: string | null
      amountTotal?: number | null
      currency?: string | null
      metadata?: Record<string, unknown>
    }
  }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only the checkout completion event grants access. Other events
  // (payment.succeeded, payment.refunded, etc.) are acknowledged but not
  // acted on here — add cases if/when we need them.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true, ignored: event.type ?? null })
  }

  const data = event.data ?? {}
  const courseKey = linkIdToCourseKey(data.paymentLinkId ?? null)
  const customerEmail = data.customerEmail?.toLowerCase().trim() ?? null

  if (!courseKey) {
    console.error(
      '[jidopay-webhook] unknown paymentLinkId — map a NEXT_PUBLIC_JIDOPAY_LINK_* env var',
      data.paymentLinkId
    )
    return NextResponse.json(
      { error: 'Unknown paymentLinkId' },
      { status: 200 } // 200 so JidoPay doesn't retry — this is an operator bug, not a transient failure
    )
  }

  if (!customerEmail && !data.clientReferenceId) {
    console.error(
      '[jidopay-webhook] session missing customerEmail and clientReferenceId'
    )
    return NextResponse.json({ error: 'No identifier' }, { status: 200 })
  }

  const supabase = await createServiceClient()

  // Resolve the Supabase user. Prefer clientReferenceId (explicit uid the
  // checkout page stamped on the session), fall back to email lookup.
  let userId: string | null = null
  let userEmail: string | null = null

  if (data.clientReferenceId) {
    const { data: userAuth } = await supabase.auth.admin.getUserById(
      data.clientReferenceId
    )
    if (userAuth?.user) {
      userId = userAuth.user.id
      userEmail = userAuth.user.email ?? null
    }
  }

  if (!userId && customerEmail) {
    // auth.admin.listUsers doesn't support filtering by email directly; the
    // pragmatic path is to query the profiles table (which mirrors auth.users
    // on insert via a trigger) or use the profiles email column if present.
    // Here we hit auth.admin.listUsers and find the match — safe for SVA's
    // scale and avoids coupling to profile schema details.
    const { data: listed } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    const match = listed?.users.find(
      (u) => u.email?.toLowerCase() === customerEmail
    )
    if (match) {
      userId = match.id
      userEmail = match.email ?? customerEmail
    }
  }

  if (!userId) {
    console.error(
      '[jidopay-webhook] no Supabase user found for',
      customerEmail,
      data.clientReferenceId
    )
    // Return 200 so the delivery is recorded as "delivered" and not retried —
    // this is an auth-state issue that retries won't resolve.
    return NextResponse.json({ error: 'User not found' }, { status: 200 })
  }

  const amountPaid = data.amountTotal ?? 0
  const paymentId = data.sessionId ?? event.id ?? 'jidopay-unknown'

  // Look up the student's cohort pick from the most recent unconsumed
  // checkout_intent row. The checkout page stamps this right before opening
  // the JidoPay embed, so it's always fresh. If there's no intent on file,
  // the purchase still goes through — access just won't be gated on a
  // cohort date (falls back to the legacy "unlock immediately" behavior).
  const { data: intent } = await supabase
    .from('checkout_intents')
    .select('id, cohort_id')
    .eq('user_id', userId)
    .eq('course_slug', courseKey)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let cohortId: string | null = intent?.cohort_id ?? null
  let meetingAt: string | null = null
  let meetingLink: string | null = null
  let accessUnlocksAt: string | null = null

  if (cohortId) {
    const { data: cohort } = await supabase
      .from('course_cohorts')
      .select('meeting_at, meeting_link')
      .eq('id', cohortId)
      .maybeSingle()
    if (cohort) {
      meetingAt = cohort.meeting_at
      meetingLink = cohort.meeting_link
      // 48 hours before the meeting — denormalized onto the purchase row
      // so the course-gating query stays a single column read.
      accessUnlocksAt = new Date(
        new Date(cohort.meeting_at).getTime() - 48 * 60 * 60 * 1000
      ).toISOString()
    }
  }

  if (intent?.id) {
    await supabase
      .from('checkout_intents')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', intent.id)
  }

  // Grant course access. Bundle expands to every core + addon course, matching
  // the Square webhook's behavior so existing LMS gating continues to work.
  const coursesGranted = await grantCourseAccess({
    supabase,
    userId,
    courseKey,
    paymentId,
    linkId: data.paymentLinkId ?? null,
    cohortId,
    accessUnlocksAt,
    amountPaid,
  })

  // Mark the profile as a subscriber so the dashboard renders the paid UI.
  await supabase
    .from('profiles')
    .update({ role: 'subscriber' })
    .eq('id', userId)

  // Send confirmation email. Failures here are logged but never fail the
  // webhook — enrollment is the source of truth, email is a nicety.
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    const toEmail = userEmail ?? customerEmail
    if (toEmail && coursesGranted.length > 0) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://skilledvisitsacademy.com'
      const meetingInfo =
        meetingAt && accessUnlocksAt
          ? {
              meetingAt,
              meetingLink,
              accessUnlocksAt,
            }
          : undefined
      const emailProps = {
        studentName: profile?.full_name ?? 'Provider',
        studentEmail: toEmail,
        courses: coursesGranted.map((k) => ({
          title: COURSE_TITLES[k] ?? k,
          price: COURSE_PRICES[k] ?? '',
        })),
        totalPaid: `$${(amountPaid / 100).toFixed(2)}`,
        loginUrl: `${appUrl}/dashboard`,
        meeting: meetingInfo,
      }
      await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: 'Your enrollment is confirmed — Skilled Visits Academy',
        html: purchaseConfirmationHtml(emailProps),
        text: purchaseConfirmationText(emailProps),
      })
    }
  } catch (emailErr) {
    console.error('[jidopay-webhook] confirmation email failed', emailErr)
  }

  return NextResponse.json({ received: true, granted: coursesGranted })
}

type SupabaseServiceClient = Awaited<ReturnType<typeof createServiceClient>>

async function grantCourseAccess({
  supabase,
  userId,
  courseKey,
  paymentId,
  linkId,
  cohortId,
  accessUnlocksAt,
  amountPaid,
}: {
  supabase: SupabaseServiceClient
  userId: string
  courseKey: SvaCourseKey
  paymentId: string
  linkId: string | null
  cohortId: string | null
  accessUnlocksAt: string | null
  amountPaid: number
}): Promise<SvaCourseKey[]> {
  const baseRow = {
    jidopay_session_id: paymentId,
    jidopay_payment_link_id: linkId,
    cohort_id: cohortId,
    access_unlocks_at: accessUnlocksAt,
    amount_paid: amountPaid,
  }

  if (courseKey === 'complete-mastery-bundle') {
    const { data: courses } = await supabase
      .from('courses')
      .select('id, slug')
      .in('course_type', ['core', 'addon'])

    if (!courses || courses.length === 0) return []

    for (const course of courses) {
      await supabase.from('course_purchases').upsert(
        {
          user_id: userId,
          course_id: course.id,
          ...baseRow,
        },
        { onConflict: 'user_id,course_id' }
      )
    }
    // Return the bundle key so the confirmation email reads "Complete IV
    // Therapy Mastery Bundle" instead of six individual courses.
    return ['complete-mastery-bundle']
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseKey)
    .single()

  if (!course) return []

  await supabase.from('course_purchases').upsert(
    {
      user_id: userId,
      course_id: course.id,
      ...baseRow,
    },
    { onConflict: 'user_id,course_id' }
  )

  return [courseKey]
}
