import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getSquare } from '@/lib/square'

const COURSE_PLAN_MAP: Record<string, string | undefined> = {
  'iv-therapy-certification': process.env.SQUARE_IV_CERTIFICATION_PLAN_ID,
  'complete-mastery-bundle': process.env.SQUARE_BUNDLE_PLAN_ID,
  'iv-complications-emergency': process.env.SQUARE_COMPLICATIONS_PLAN_ID,
  'vitamin-nutrient-therapy': process.env.SQUARE_VITAMIN_PLAN_ID,
  'nad-plus-masterclass': process.env.SQUARE_NAD_PLAN_ID,
  'iv-push-administration': process.env.SQUARE_IV_PUSH_PLAN_ID,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SQUARE_LOCATION_ID) {
    return NextResponse.json({ error: 'SQUARE_LOCATION_ID is not set.' }, { status: 503 })
  }

  const body = await request.json()
  const { course, items } = body as { course?: string; items?: { key: string }[] }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Resolve course keys → line items
  let lineItems: { quantity: string; catalogObjectId: string }[] = []
  let courseKeysStr = ''

  if (course) {
    // Single course buy-now
    const catalogObjectId = COURSE_PLAN_MAP[course]
    if (!catalogObjectId) {
      return NextResponse.json(
        { error: 'Course payment not configured yet. Square catalog IDs are required.' },
        { status: 503 }
      )
    }
    lineItems = [{ quantity: '1', catalogObjectId }]
    courseKeysStr = course
  } else if (items && items.length > 0) {
    // Cart checkout
    const missing: string[] = []
    for (const item of items) {
      const catalogObjectId = COURSE_PLAN_MAP[item.key]
      if (!catalogObjectId) {
        missing.push(item.key)
      } else {
        lineItems.push({ quantity: '1', catalogObjectId })
      }
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Courses not yet configured for payment: ${missing.join(', ')}` },
        { status: 503 }
      )
    }
    courseKeysStr = items.map((i) => i.key).join(',')
  } else {
    return NextResponse.json({ error: 'No course or cart items provided' }, { status: 400 })
  }

  try {
    const square = getSquare()

    const response = await square.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems,
        referenceId: user.id,
        metadata: { course_keys: courseKeysStr },
      },
      checkoutOptions: {
        redirectUrl: `${appUrl}/dashboard?enrolled=success`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: user.email ?? undefined,
      },
    })

    const url = response.paymentLink?.url

    if (!url) {
      return NextResponse.json({ error: 'Failed to create checkout link' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Square checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
