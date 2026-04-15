// Seed the 4 missing masterclass courses into Supabase and create cohort
// rows for each at the two launch dates (May 7 + May 28 2026, 10:00 EDT).
//
// `complete-mastery-bundle` is a pseudo-SKU: the webhook expands it to
// every core+addon course at grant time, so it intentionally has no
// courses row.
//
// Titles/descriptions/categories mirror /src/app/pricing/page.tsx so the
// DB matches what the storefront shows.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const TARGET_DATES = [
  '2026-05-07T14:00:00.000Z',
  '2026-05-28T14:00:00.000Z',
]

const NEW_COURSES = [
  {
    slug: 'iv-complications-emergency',
    title: 'Advanced IV Complications & Emergency Management',
    description:
      'Master the recognition and management of IV complications and emergency situations to keep your patients safe.',
    category: 'Advanced Masterclass',
    course_type: 'addon',
    price: 149,
  },
  {
    slug: 'vitamin-nutrient-therapy',
    title: 'Vitamin & Nutrient Therapy Masterclass',
    description:
      'Deep-dive into vitamin pharmacology, advanced nutrient protocols, and safe mixing and dosing strategies.',
    category: 'Advanced Masterclass',
    course_type: 'addon',
    price: 149,
  },
  {
    slug: 'nad-plus-masterclass',
    title: 'NAD+ Therapy Masterclass',
    description:
      'Master NAD+ infusion protocols for anti-aging, cellular repair, and addiction recovery applications.',
    category: 'Advanced Masterclass',
    course_type: 'addon',
    price: 149,
  },
  {
    slug: 'iv-push-administration',
    title: 'IV Push Administration Masterclass',
    description:
      'Learn safe and effective IV push techniques including glutathione, vitamin push protocols, and safe administration rates.',
    category: 'Advanced Masterclass',
    course_type: 'addon',
    price: 149,
  },
]

async function main() {
  // Step 1: find which slugs already exist so we don't double-insert.
  const { data: existing, error: existErr } = await supabase
    .from('courses')
    .select('id, slug')
    .in(
      'slug',
      NEW_COURSES.map((c) => c.slug)
    )
  if (existErr) {
    console.error('select existing failed', existErr)
    process.exit(1)
  }
  const existingSlugs = new Set((existing ?? []).map((c) => c.slug))

  const toInsert = NEW_COURSES.filter((c) => !existingSlugs.has(c.slug)).map(
    (c) => ({
      ...c,
      published: true,
      is_featured: false,
    })
  )

  if (toInsert.length > 0) {
    const { data: inserted, error: insErr } = await supabase
      .from('courses')
      .insert(toInsert)
      .select('id, slug, title')
    if (insErr) {
      console.error('insert courses failed', insErr)
      process.exit(1)
    }
    console.log(`inserted ${inserted.length} course(s):`)
    for (const c of inserted) console.log(`  ${c.slug} → ${c.id}`)
  } else {
    console.log('all target courses already exist')
  }

  // Step 2: re-fetch the full set of courses whose slugs are in NEW_COURSES
  // so we can create cohort rows for each at the two target dates.
  const { data: allNew } = await supabase
    .from('courses')
    .select('id, slug')
    .in(
      'slug',
      NEW_COURSES.map((c) => c.slug)
    )

  const { data: existingCohorts } = await supabase
    .from('course_cohorts')
    .select('course_id, meeting_at')
    .in('meeting_at', TARGET_DATES)

  const have = new Set(
    (existingCohorts ?? []).map(
      (c) => `${c.course_id}|${new Date(c.meeting_at).toISOString()}`
    )
  )

  const cohortRows = []
  for (const course of allNew ?? []) {
    for (const meetingAt of TARGET_DATES) {
      const key = `${course.id}|${new Date(meetingAt).toISOString()}`
      if (have.has(key)) continue
      cohortRows.push({
        course_id: course.id,
        meeting_at: meetingAt,
        meeting_link: null,
        seats_cap: 15,
        active: true,
      })
    }
  }

  if (cohortRows.length > 0) {
    const { error: cohortErr } = await supabase
      .from('course_cohorts')
      .insert(cohortRows)
    if (cohortErr) {
      console.error('insert cohorts failed', cohortErr)
      process.exit(1)
    }
    console.log(`inserted ${cohortRows.length} cohort row(s)`)
  } else {
    console.log('all cohort rows already exist for target dates')
  }

  // Step 3: final verification — full course + cohort state.
  const { data: finalCourses } = await supabase
    .from('courses')
    .select('slug, title, course_type')
    .order('title')
  console.log(`\ncourses (${finalCourses?.length ?? 0}):`)
  for (const c of finalCourses ?? []) {
    console.log(`  [${c.course_type}] ${c.slug} — ${c.title}`)
  }

  const { data: finalCohorts } = await supabase
    .from('course_cohorts')
    .select('course_id, meeting_at, courses(slug)')
    .order('meeting_at')
  console.log(`\ncohorts (${finalCohorts?.length ?? 0}):`)
  for (const c of finalCohorts ?? []) {
    console.log(`  ${c.meeting_at} — ${c.courses?.slug ?? c.course_id}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
