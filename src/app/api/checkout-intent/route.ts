import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Stamped by the checkout page right before it opens the JidoPay embed.
// The webhook looks this row up to learn which cohort the student chose,
// since JidoPay payment links can't carry per-checkout metadata.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { courseSlug?: string; cohortId?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.courseSlug) {
    return NextResponse.json({ error: 'Missing courseSlug' }, { status: 400 })
  }

  const { error } = await supabase.from('checkout_intents').insert({
    user_id: user.id,
    course_slug: body.courseSlug,
    cohort_id: body.cohortId ?? null,
  })

  if (error) {
    console.error('[checkout-intent] insert failed', error)
    return NextResponse.json({ error: 'Failed to save intent' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
