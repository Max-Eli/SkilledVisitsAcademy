// One-off: seed the 4 new aesthetic injection courses as draft rows.
//
// published=false so they stay hidden from the public library until prices,
// dates, and lesson content land. course_type='aesthetic' so they are NOT
// swept into the IV Therapy bundle expansion in the JidoPay webhook.
//
// Update titles/descriptions via the admin panel once the user confirms
// the exact marketing copy.

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

const NEW_COURSES = [
  {
    slug: 'dermal-fillers',
    title: 'Dermal Fillers Masterclass',
    description:
      'Comprehensive training on hyaluronic acid dermal filler injections — facial anatomy, product selection, injection technique, and complication management.',
    category: 'Aesthetic Injection',
    course_type: 'aesthetic',
  },
  {
    slug: 'botox',
    title: 'Botox (Neurotoxin) Masterclass',
    description:
      'Master neurotoxin administration for aesthetic and therapeutic indications — facial muscle anatomy, dosing, injection mapping, and adverse-event recognition.',
    category: 'Aesthetic Injection',
    course_type: 'aesthetic',
  },
  {
    slug: 'prf-therapy',
    title: 'PRF Therapy Masterclass',
    description:
      'Platelet-Rich Fibrin (PRF) injections for skin rejuvenation and hair restoration — blood draw, centrifugation protocols, injection techniques, and patient selection.',
    category: 'Aesthetic Injection',
    course_type: 'aesthetic',
  },
  {
    slug: 'prf-ezgel',
    title: 'PRF EZGel Masterclass',
    description:
      'Advanced PRF EZGel injectable technique — thermal processing, volumization strategy, combination with other biostimulators, and aftercare protocols.',
    category: 'Aesthetic Injection',
    course_type: 'aesthetic',
  },
]

async function main() {
  const { data: existing } = await supabase
    .from('courses')
    .select('slug')
    .in(
      'slug',
      NEW_COURSES.map((c) => c.slug)
    )
  const have = new Set((existing ?? []).map((c) => c.slug))

  const toInsert = NEW_COURSES.filter((c) => !have.has(c.slug)).map((c) => ({
    ...c,
    published: false,
    is_featured: false,
    price: 0,
  }))

  if (toInsert.length === 0) {
    console.log('all target courses already exist')
  } else {
    const { data, error } = await supabase
      .from('courses')
      .insert(toInsert)
      .select('id, slug, title')
    if (error) {
      console.error('insert failed', error)
      process.exit(1)
    }
    console.log(`inserted ${data.length} course(s):`)
    for (const c of data) console.log(`  ${c.slug} → ${c.id}`)
  }

  const { data: final } = await supabase
    .from('courses')
    .select('slug, title, course_type, published')
    .order('course_type')
    .order('title')
  console.log(`\nall courses (${final?.length ?? 0}):`)
  for (const c of final ?? []) {
    console.log(
      `  [${c.course_type}] published=${c.published} — ${c.slug} — ${c.title}`
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
