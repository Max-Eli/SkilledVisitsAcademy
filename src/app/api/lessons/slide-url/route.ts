import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lessonId = searchParams.get('lessonId')

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, course_id, slide_pdf_url')
    .eq('id', lessonId)
    .maybeSingle()

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  if (!lesson.slide_pdf_url) {
    return NextResponse.json({ error: 'No slides for this lesson' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    const { data: purchase } = await supabase
      .from('course_purchases')
      .select('id, access_unlocks_at')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .maybeSingle()

    if (!purchase) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    if (
      purchase.access_unlocks_at &&
      new Date(purchase.access_unlocks_at).getTime() > Date.now()
    ) {
      return NextResponse.json(
        { error: 'Course materials unlock 48 hours before your live session' },
        { status: 403 }
      )
    }
  }

  const admin = await createServiceClient()
  const { data: signed, error: signErr } = await admin
    .storage
    .from('course-slides')
    .createSignedUrl(lesson.slide_pdf_url, SIGNED_URL_TTL_SECONDS)

  if (signErr || !signed) {
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
  }

  return NextResponse.json({ url: signed.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS })
}
