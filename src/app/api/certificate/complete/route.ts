import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { courseCompletionHtml, courseCompletionText } from '@/lib/emails/course-completion'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await request.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  // Verify enrollment
  const { data: purchase } = await supabase
    .from('course_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!purchase) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  // Fetch course + lessons
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug, lessons(id)')
    .eq('id', courseId)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Verify all lessons complete
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)

  const lessonIds = new Set((course.lessons as { id: string }[]).map((l) => l.id))
  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? [])
  const allComplete = lessonIds.size > 0 && [...lessonIds].every((id) => completedIds.has(id))

  if (!allComplete) return NextResponse.json({ error: 'Course not yet complete' }, { status: 400 })

  // Upsert certificate record (idempotent — safe to call multiple times)
  const { data: cert, error: certErr } = await supabase
    .from('certificates')
    .upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: 'user_id,course_id', ignoreDuplicates: false }
    )
    .select('id, issued_at')
    .single()

  if (certErr || !cert) {
    console.error('Certificate insert error:', certErr)
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const certificateUrl = `${appUrl}/certificate/${cert.id}`
  const certCode = `SVA-${cert.id.slice(0, 8).toUpperCase()}`

  // Fetch profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const studentName = profile?.full_name ?? 'Provider'
  const completedAt = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Send completion email (non-blocking)
  if (user.email) {
    resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `You've earned your ${course.title} certificate! 🏆`,
      html: courseCompletionHtml({
        studentName,
        courseTitle: course.title,
        completedAt,
        certificateUrl,
        certificateId: certCode,
      }),
      text: courseCompletionText({
        studentName,
        courseTitle: course.title,
        completedAt,
        certificateUrl,
        certificateId: certCode,
      }),
    }).catch((err: unknown) => console.error('Completion email failed:', err))
  }

  return NextResponse.json({ certificateUrl, certId: cert.id })
}
