import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Public list of upcoming cohorts for a course, used by the checkout page.
// We count purchases per cohort to compute "seats left" for scarcity display
// — this is cosmetic; no actual cap is enforced.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('courseSlug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing courseSlug' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .maybeSingle()
  if (!course) {
    return NextResponse.json({ cohorts: [] })
  }

  const { data: cohortRows } = await supabase
    .from('course_cohorts')
    .select('id, course_id, meeting_at, meeting_link, seats_cap, active')
    .eq('course_id', course.id)
    .eq('active', true)
    .gte('meeting_at', new Date().toISOString())
    .order('meeting_at', { ascending: true })

  const cohorts = cohortRows ?? []

  // Tally purchases per cohort for display-only scarcity.
  const cohortIds = cohorts.map((c) => c.id)
  const counts = new Map<string, number>()
  if (cohortIds.length > 0) {
    const { data: purchases } = await supabase
      .from('course_purchases')
      .select('cohort_id')
      .in('cohort_id', cohortIds)
    for (const p of purchases ?? []) {
      if (!p.cohort_id) continue
      counts.set(p.cohort_id, (counts.get(p.cohort_id) ?? 0) + 1)
    }
  }

  return NextResponse.json({
    courseId: course.id,
    cohorts: cohorts.map((c) => {
      const taken = counts.get(c.id) ?? 0
      // Floor at 1 so we never flash "0 seats left" which would confuse
      // shoppers — capacity is cosmetic anyway.
      const seatsLeft = Math.max(1, c.seats_cap - taken)
      return {
        id: c.id,
        meetingAt: c.meeting_at,
        hasMeetingLink: Boolean(c.meeting_link),
        seatsLeft,
      }
    }),
  })
}
