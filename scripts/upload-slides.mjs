#!/usr/bin/env node
/**
 * Upload course slide PDFs to Supabase Storage and seed the IV Therapy Certification
 * course with 15 lessons. Idempotent — safe to re-run.
 *
 * Usage: node --env-file=.env.local scripts/upload-slides.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'course-slides'
const PDF_DIR = path.resolve('course-materials/pdfs')
const COURSE_SLUG = 'iv-therapy-certification'

const LESSONS = [
  { file: 'module-01.pdf', title: 'Module 1: Introduction to IV Therapy', description: 'Course overview, scope of practice, and an introduction to IV therapy fundamentals.' },
  { file: 'module-02.pdf', title: 'Module 2: History & Evolution of IV Therapy', description: 'The clinical history of IV therapy and how modern protocols evolved.' },
  { file: 'module-03.pdf', title: 'Module 3: Infection Prevention & Complications', description: 'Core infection-control principles and early recognition of IV complications.' },
  { file: 'module-04-vascular-anatomy.pdf', title: 'Module 4: Vascular Anatomy & Device Selection', description: 'Venous anatomy deep-dive and how to select the right catheter and device for each patient.' },
  { file: 'module-05-equipment-supplies.pdf', title: 'Module 5: IV Equipment & Supplies', description: 'A complete walkthrough of the equipment and supplies required for safe IV administration.' },
  { file: 'module-06.pdf', title: 'Module 6: IV Therapy Pharmacology & Solutions', description: 'IV fluid pharmacology — crystalloids, colloids, and the clinical rationale behind each choice.' },
  { file: 'module-07-patient-assessment.pdf', title: 'Module 7: Patient Assessment — Who Is a Candidate?', description: 'How to screen and assess patients to determine IV therapy candidacy.' },
  { file: 'module-08-insertion-technique.pdf', title: 'Module 8: IV Insertion Technique — Step by Step', description: 'A step-by-step walkthrough of peripheral IV insertion from site prep to securement.' },
  { file: 'module-09-complications.pdf', title: 'Module 9: Aseptic Technique & Infection Control', description: 'Aseptic technique deep-dive with practical infection-control protocols.' },
  { file: 'module-10.pdf', title: 'Module 10: Monitoring, Complications & Emergency Management', description: 'Ongoing patient monitoring, complication recognition, and emergency response.' },
  { file: 'module-11-emergency-medications.pdf', title: 'Module 11: Emergency Medications & Crash Cart Essentials', description: 'Emergency meds every IV provider should have on hand, plus crash cart fundamentals.' },
  { file: 'module-12.pdf', title: 'Module 12: Legal, Ethical & Regulatory Considerations', description: 'Scope of practice, documentation requirements, and the legal framework for IV therapy.' },
  { file: 'module-13.pdf', title: 'Module 13: Business Operations & Marketing for IV Therapy', description: 'Operating an IV therapy practice — business setup, pricing, and client acquisition.' },
  { file: 'module-14.pdf', title: 'Module 14: Client Education & Communication Skills', description: 'Building trust with clients through clear education and effective clinical communication.' },
  { file: 'module-15.pdf', title: 'Module 15: Integrative Approaches & Future of IV Therapy', description: 'Emerging protocols, integrative medicine, and where IV therapy is heading next.' },
]

async function getPageCount(filePath) {
  const buf = fs.readFileSync(filePath)
  const parser = new PDFParse({ data: buf })
  const result = await parser.getText()
  return result.total ?? result.numpages ?? 0
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.id === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false })
    if (error) throw error
    console.log(`✓ Created bucket: ${BUCKET}`)
  } else {
    console.log(`✓ Bucket exists: ${BUCKET}`)
  }
}

async function uploadPdf(filename) {
  const filePath = path.join(PDF_DIR, filename)
  const buf = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buf, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) throw error
  return filename
}

async function ensureCourse() {
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', COURSE_SLUG)
    .maybeSingle()

  if (existing) {
    console.log(`✓ Course already exists: ${COURSE_SLUG}`)
    return existing.id
  }

  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: 'IV Therapy Certification',
      slug: COURSE_SLUG,
      description: 'The foundational IV therapy certification for licensed healthcare professionals. 15 comprehensive modules covering everything you need to safely add IV services to your practice.',
      category: 'Core Course',
      published: true,
      created_by: admin?.id ?? null,
    })
    .select('id')
    .single()

  if (error) throw error
  console.log(`✓ Created course: ${COURSE_SLUG}`)
  return data.id
}

async function seedLesson(courseId, lesson, orderIndex) {
  const storagePath = lesson.file
  const pageCount = await getPageCount(path.join(PDF_DIR, lesson.file))

  const { data: existing } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('order_index', orderIndex)
    .maybeSingle()

  const payload = {
    course_id: courseId,
    title: lesson.title,
    description: lesson.description,
    order_index: orderIndex,
    published: true,
    slide_pdf_url: storagePath,
    slide_page_count: pageCount,
  }

  if (existing) {
    const { error } = await supabase.from('lessons').update(payload).eq('id', existing.id)
    if (error) throw error
    console.log(`  ↻ Updated lesson ${orderIndex}: ${lesson.title}`)
  } else {
    const { error } = await supabase.from('lessons').insert(payload)
    if (error) throw error
    console.log(`  + Created lesson ${orderIndex}: ${lesson.title}`)
  }
}

async function main() {
  console.log('🚀 Uploading IV Therapy Certification course materials\n')

  await ensureBucket()

  console.log('\nUploading PDFs to Supabase Storage...')
  for (const lesson of LESSONS) {
    await uploadPdf(lesson.file)
    console.log(`  ✓ ${lesson.file}`)
  }

  console.log('\nSeeding course and lessons...')
  const courseId = await ensureCourse()

  for (let i = 0; i < LESSONS.length; i++) {
    await seedLesson(courseId, LESSONS[i], i)
  }

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
