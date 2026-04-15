// One-off: bulk-create cohorts for every course on the two launch dates.
// Mirrors the admin panel's "Schedule all courses" action but runnable
// from the CLI so it works when you don't have an admin profile yet.
//
// Dates: May 7 2026 10:00 AM Eastern, May 28 2026 10:00 AM Eastern.
// Eastern in May is EDT (UTC-4), so 10:00 EDT == 14:00 UTC. (In May the
// US is on DST; "EST" is colloquial for "Eastern time" in most contexts.)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const eq = line.indexOf('=')
      return [line.slice(0, eq).trim(), line.slice(eq + 1).trim()]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

// Canonical target times (10:00 AM EDT / 14:00 UTC).
const TARGET_DATES = [
  '2026-05-07T14:00:00.000Z',
  '2026-05-28T14:00:00.000Z',
]

// Any previously scripted cohorts at the old 18:00 EDT / 22:00 UTC times,
// so we can migrate them in place without duplicating.
const OLD_DATES = [
  '2026-05-07T22:00:00.000Z',
  '2026-05-28T22:00:00.000Z',
]

async function main() {
  const { data: courses, error: coursesErr } = await supabase
    .from('courses')
    .select('id, title, slug')
    .order('title')
  if (coursesErr) {
    console.error('Failed to load courses', coursesErr)
    process.exit(1)
  }
  if (!courses || courses.length === 0) {
    console.error('No courses in the database')
    process.exit(1)
  }
  console.log(`Found ${courses.length} courses`)

  // Step 1: migrate any old-time cohorts to the new target times so we
  // don't duplicate rows. Match by index so May 7 → May 7, May 28 → May 28.
  for (let i = 0; i < OLD_DATES.length; i++) {
    const oldAt = OLD_DATES[i]
    const newAt = TARGET_DATES[i]
    const { data: moved, error: moveErr } = await supabase
      .from('course_cohorts')
      .update({ meeting_at: newAt, updated_at: new Date().toISOString() })
      .eq('meeting_at', oldAt)
      .select('id, course_id')
    if (moveErr) {
      console.error('Failed to migrate old cohort time', oldAt, moveErr)
      process.exit(1)
    }
    if (moved && moved.length > 0) {
      console.log(`  migrated ${moved.length} cohort(s) ${oldAt} → ${newAt}`)
    }
  }

  // Step 2: fill in anything still missing at the target times so every
  // course has a row at both dates.
  const { data: existing } = await supabase
    .from('course_cohorts')
    .select('course_id, meeting_at')
    .in('meeting_at', TARGET_DATES)

  const existingKey = new Set(
    (existing ?? []).map((c) => `${c.course_id}|${c.meeting_at}`)
  )

  const rows = []
  for (const meetingAt of TARGET_DATES) {
    for (const course of courses) {
      const key = `${course.id}|${meetingAt}`
      if (existingKey.has(key)) {
        continue
      }
      rows.push({
        course_id: course.id,
        meeting_at: meetingAt,
        meeting_link: null,
        seats_cap: 15,
        active: true,
      })
    }
  }

  if (rows.length === 0) {
    console.log('All target cohorts already exist. Nothing to insert.')
    return
  }

  const { error: insertErr } = await supabase
    .from('course_cohorts')
    .insert(rows)
  if (insertErr) {
    console.error('Insert failed', insertErr)
    process.exit(1)
  }
  console.log(`Created ${rows.length} new cohort(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
