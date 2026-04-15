import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Lock,
  ArrowLeft,
  ChevronRight,
  CalendarDays,
  Video,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Lesson } from '@/types/database'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: course }, { data: progress }, { data: profile }] = await Promise.all([
    supabase
      .from('courses')
      .select('*, lessons(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ])

  if (!course) notFound()

  // Access gating: unless the user is an admin, check the purchase row for a
  // cohort-based unlock time. Course materials open 48h before the live session
  // so students can prep. No purchase = treat as locked (redirect to checkout).
  const isAdmin = profile?.role === 'admin'
  let lockedUntil: string | null = null
  let cohortMeetingAt: string | null = null
  let cohortMeetingLink: string | null = null

  if (!isAdmin) {
    const { data: purchase } = await supabase
      .from('course_purchases')
      .select('access_unlocks_at, cohort_id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()

    const unlocksAt = purchase?.access_unlocks_at
    if (unlocksAt && new Date(unlocksAt).getTime() > Date.now()) {
      lockedUntil = unlocksAt
      if (purchase?.cohort_id) {
        const { data: cohort } = await supabase
          .from('course_cohorts')
          .select('meeting_at, meeting_link')
          .eq('id', purchase.cohort_id)
          .maybeSingle()
        if (cohort) {
          cohortMeetingAt = cohort.meeting_at
          cohortMeetingLink = cohort.meeting_link
        }
      }
    }
  }

  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? [])
  const lessons: Lesson[] = (course.lessons ?? []).sort(
    (a: Lesson, b: Lesson) => a.order_index - b.order_index
  )
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  const totalSeconds = lessons.reduce((s, l) => s + (l.duration_seconds ?? 0), 0)

  const firstIncomplete = lessons.find((l) => !completedIds.has(l.id))
  const startHref = firstIncomplete
    ? `/courses/${slug}/${firstIncomplete.id}`
    : lessons.length > 0
    ? `/courses/${slug}/${lessons[0].id}`
    : null

  if (lockedUntil) {
    const unlockDate = new Date(lockedUntil)
    const meetingDate = cohortMeetingAt ? new Date(cohortMeetingAt) : null
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    const fmtTime = (d: Date) =>
      d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })

    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FBF6FF]">
              <Lock className="h-6 w-6 text-[#9E50E5]" />
            </div>
            <Badge variant="secondary" className="mb-3">{course.category}</Badge>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">{course.title}</h1>
            <p className="text-sm text-[#5B5B5B] mb-6">
              Your course materials unlock <strong>{fmtDate(unlockDate)}</strong> — 48 hours
              before your live session so you can prep.
            </p>

            {meetingDate && (
              <div className="rounded-xl border border-[#E9D8FB] bg-[#FBF6FF] p-5 mb-6 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9b9b9b] mb-2">
                  Your live session
                </p>
                <div className="flex items-center gap-2 text-[#1a1a1a] font-semibold">
                  <CalendarDays className="h-4 w-4 text-[#9E50E5]" />
                  {fmtDate(meetingDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5B5B5B] mt-1 ml-6">
                  <Clock className="h-3.5 w-3.5" />
                  {fmtTime(meetingDate)}
                </div>
                {cohortMeetingLink ? (
                  <a
                    href={cohortMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#9E50E5] bg-white px-4 py-2 text-sm font-semibold text-[#9E50E5] hover:bg-[#9E50E5] hover:text-white transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join meeting
                  </a>
                ) : (
                  <p className="mt-3 text-xs italic text-[#7b5aa3]">
                    We&rsquo;ll email you the meeting link before your session.
                  </p>
                )}
              </div>
            )}

            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Course header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{course.category}</Badge>
              {pct === 100 && <Badge variant="success">Completed</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">{course.title}</h1>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {lessons.length} lessons
              </div>
              {totalSeconds > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(totalSeconds)}
                </div>
              )}
            </div>
          </div>

          {/* Lesson list */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Course Content</h2>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedIds.has(lesson.id)
                return (
                  <Link key={lesson.id} href={`/courses/${slug}/${lesson.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : lesson.mux_playback_id ? (
                              <PlayCircle className="h-5 w-5 text-[var(--accent)]" />
                            ) : (
                              <Lock className="h-5 w-5 text-[var(--muted-foreground)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--muted-foreground)] w-5 shrink-0">
                                {idx + 1}
                              </span>
                              <span
                                className={`text-sm font-medium truncate ${
                                  isCompleted
                                    ? 'text-[var(--muted-foreground)] line-through'
                                    : 'text-[var(--foreground)]'
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                            {lesson.description && (
                              <p className="text-xs text-[var(--muted-foreground)] truncate ml-7 mt-0.5">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          {lesson.duration_seconds && (
                            <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                              {formatDuration(lesson.duration_seconds)}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              {/* Thumbnail */}
              <div className="aspect-video rounded-lg bg-gradient-to-br from-[var(--primary)] to-blue-600 flex items-center justify-center mb-5">
                {course.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-white/60" />
                )}
              </div>

              {/* Progress */}
              {lessons.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--muted-foreground)]">Progress</span>
                    <span className="font-medium text-[var(--foreground)]">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                    {completedCount} of {lessons.length} lessons completed
                  </p>
                </div>
              )}

              {startHref && (
                <Link href={startHref}>
                  <Button className="w-full gap-2">
                    <PlayCircle className="h-4 w-4" />
                    {pct === 0
                      ? 'Start Course'
                      : pct === 100
                      ? 'Review Course'
                      : 'Continue Learning'}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
