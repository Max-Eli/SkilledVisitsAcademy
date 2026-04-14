'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import MuxPlayer from '@mux/mux-player-react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  ArrowLeft,
  BookOpen,
  Award,
  Loader2,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Lesson } from '@/types/database'

const SlideViewer = dynamic(
  () => import('@/components/slide-viewer/SlideViewer').then((m) => m.SlideViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-[#1a1a1a] via-[#2a1a3a] to-[#1a1a1a] rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-[#9E50E5]" />
      </div>
    ),
  }
)

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const lessonId = params.lessonId as string

  const supabase = createClient()

  const [course, setCourse] = useState<{ id: string; title: string; lessons: Lesson[] } | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [markingComplete, setMarkingComplete] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [slideUrl, setSlideUrl] = useState<string | null>(null)
  const [slideLoading, setSlideLoading] = useState(false)
  const [slideError, setSlideError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: courseData }, { data: progressData }] = await Promise.all([
        supabase.from('courses').select('id, title, lessons(*)').eq('slug', slug).single(),
        supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
      ])

      if (!courseData) { router.push('/courses'); return }

      const sortedLessons = (courseData.lessons ?? []).sort(
        (a: Lesson, b: Lesson) => a.order_index - b.order_index
      )
      setCourse({ id: courseData.id, title: courseData.title, lessons: sortedLessons })
      setLesson(sortedLessons.find((l: Lesson) => l.id === lessonId) ?? null)
      setCompletedIds(new Set(progressData?.map((p) => p.lesson_id) ?? []))
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lessonId])

  useEffect(() => {
    if (!lesson?.slide_pdf_url) {
      setSlideUrl(null)
      setSlideError(null)
      return
    }
    let cancelled = false
    setSlideLoading(true)
    setSlideError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/lessons/slide-url?lessonId=${lesson.id}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setSlideError(data.error ?? 'Failed to load slides')
          setSlideUrl(null)
        } else {
          setSlideUrl(data.url)
        }
      } catch {
        if (!cancelled) setSlideError('Failed to load slides')
      } finally {
        if (!cancelled) setSlideLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [lesson?.id, lesson?.slide_pdf_url])

  const checkAndIssueCertificate = useCallback(async (newCompletedIds: Set<string>) => {
    if (!course) return
    const allDone = course.lessons.length > 0 && course.lessons.every((l) => newCompletedIds.has(l.id))
    if (!allDone) return

    try {
      const res = await fetch('/api/certificate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (data.certId) {
        setCertificateUrl(`/certificate/${data.certId}`)
        setShowCelebration(true)
      }
    } catch {
      // non-critical
    }
  }, [course])

  const markComplete = useCallback(async () => {
    if (markingComplete || completedIds.has(lessonId)) return
    setMarkingComplete(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('lesson_progress').upsert({ user_id: user.id, lesson_id: lessonId })

    const next = new Set([...completedIds, lessonId])
    setCompletedIds(next)
    setMarkingComplete(false)
    toast.success('Lesson marked complete')

    await checkAndIssueCertificate(next)
  }, [lessonId, markingComplete, completedIds, supabase, checkAndIssueCertificate])

  if (!course || !lesson) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-7 w-7 animate-spin text-[#9E50E5]" />
      </div>
    )
  }

  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null
  const isCompleted = completedIds.has(lessonId)
  const progressPct = course.lessons.length > 0
    ? Math.round((completedIds.size / course.lessons.length) * 100)
    : 0

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-[#D9D9D9] bg-white overflow-hidden shrink-0">
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-[#D9D9D9]">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-xs text-[#5B5B5B] hover:text-[#9E50E5] transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to course
          </Link>
          <h2 className="font-bold text-sm text-[#1a1a1a] leading-snug mb-3 line-clamp-2">{course.title}</h2>
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#EEEEEE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9E50E5] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#9E50E5] shrink-0">{progressPct}%</span>
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto p-2">
          {course.lessons.map((l, idx) => {
            const active = l.id === lessonId
            const done = completedIds.has(l.id)
            return (
              <Link key={l.id} href={`/courses/${slug}/${l.id}`}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 cursor-pointer',
                    active
                      ? 'bg-[#9E50E5] text-white'
                      : 'text-[#5B5B5B] hover:bg-[#FBF6FF] hover:text-[#1a1a1a]'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-emerald-500')} />
                  ) : l.slide_pdf_url ? (
                    <Presentation className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-[#9E50E5]')} />
                  ) : l.mux_playback_id ? (
                    <PlayCircle className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-[#9E50E5]')} />
                  ) : (
                    <BookOpen className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-[#D9D9D9]')} />
                  )}
                  <span className={cn('truncate text-sm', done && !active && 'line-through opacity-60')}>
                    {idx + 1}. {l.title}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Certificate link if earned */}
        {(certificateUrl || progressPct === 100) && (
          <div className="border-t border-[#D9D9D9] p-3">
            <Link
              href={certificateUrl ?? '#'}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#FBF6FF] text-[#9E50E5] text-sm font-semibold hover:bg-[#9E50E5] hover:text-white transition-colors"
            >
              <Award className="h-4 w-4 shrink-0" />
              View Certificate
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* Course completion celebration banner */}
        {showCelebration && certificateUrl && (
          <div className="bg-gradient-to-r from-[#9E50E5] to-[#7B3DB8] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-yellow-300 shrink-0" />
              <p className="text-white font-semibold text-sm">
                🎉 Congratulations! You&rsquo;ve completed the course. Your certificate is ready.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setShowCelebration(false)} className="text-white/60 hover:text-white text-xs">Dismiss</button>
              <Link
                href={certificateUrl}
                className="px-4 py-1.5 rounded-[30px] bg-white text-[#9E50E5] text-sm font-bold hover:bg-[#FBF6FF] transition-colors"
              >
                Get Certificate
              </Link>
            </div>
          </div>
        )}

        {/* Player — slides take priority over video */}
        {lesson.slide_pdf_url ? (
          <div className="bg-[#0a0a0a] shrink-0 p-4 sm:p-6">
            {slideLoading && (
              <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-[#1a1a1a] via-[#2a1a3a] to-[#1a1a1a] rounded-2xl">
                <div className="flex items-center gap-3 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin text-[#9E50E5]" />
                  <span className="text-sm">Preparing slides...</span>
                </div>
              </div>
            )}
            {slideError && !slideLoading && (
              <div className="flex items-center justify-center h-[600px] bg-[#1a1a1a] rounded-2xl">
                <div className="text-center text-white/60">
                  <Presentation className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{slideError}</p>
                </div>
              </div>
            )}
            {slideUrl && !slideLoading && !slideError && (
              <SlideViewer
                pdfUrl={slideUrl}
                title={lesson.title}
                onLastSlide={markComplete}
              />
            )}
          </div>
        ) : (
          <div className="bg-black shrink-0">
            {lesson.mux_playback_id ? (
              <div style={{ maxHeight: '62vh' }} className="overflow-hidden">
                <MuxPlayer
                  playbackId={lesson.mux_playback_id}
                  streamType="on-demand"
                  className="w-full"
                  onEnded={markComplete}
                  accentColor="#9E50E5"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-[#1a1a1a]">
                <div className="text-center text-white/40">
                  <BookOpen className="h-12 w-12 mx-auto mb-3" />
                  <p className="text-sm">Content not yet available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lesson info */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-[#9E50E5] font-semibold uppercase tracking-wide mb-1">
                Lesson {lessonIndex + 1} of {course.lessons.length}
              </p>
              <h1 className="text-xl font-bold text-[#1a1a1a]">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-[#5B5B5B] mt-2 leading-relaxed text-sm">{lesson.description}</p>
              )}
            </div>

            <div className="shrink-0">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-[30px] bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </div>
              ) : (
                <button
                  onClick={markComplete}
                  disabled={markingComplete}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[30px] border border-[#9E50E5] text-[#9E50E5] text-sm font-semibold hover:bg-[#9E50E5] hover:text-white transition-colors disabled:opacity-50"
                >
                  {markingComplete
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />
                  }
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between pt-5 border-t border-[#D9D9D9]">
            {prevLesson ? (
              <Link
                href={`/courses/${slug}/${prevLesson.id}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-[30px] border border-[#D9D9D9] text-[#5B5B5B] text-sm font-medium hover:border-[#9E50E5] hover:text-[#9E50E5] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                href={`/courses/${slug}/${nextLesson.id}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white text-sm font-semibold transition-colors"
              >
                Next Lesson
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              certificateUrl ? (
                <Link
                  href={certificateUrl}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white text-sm font-semibold transition-colors"
                >
                  <Award className="h-4 w-4" />
                  Get Certificate
                </Link>
              ) : (
                <Link
                  href={`/courses/${slug}`}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white text-sm font-semibold transition-colors"
                >
                  Finish Course
                  <CheckCircle2 className="h-4 w-4" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
