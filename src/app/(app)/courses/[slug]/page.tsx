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

  const [{ data: course }, { data: progress }] = await Promise.all([
    supabase
      .from('courses')
      .select('*, lessons(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
  ])

  if (!course) notFound()

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
