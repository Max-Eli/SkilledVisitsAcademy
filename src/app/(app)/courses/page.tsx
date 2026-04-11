import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Clock, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import type { Course } from '@/types/database'
import { formatDuration } from '@/lib/utils'

export default async function CoursesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase
      .from('courses')
      .select('*, lessons(id, duration_seconds)')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    user
      ? supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
      : { data: [] },
  ])

  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? [])

  const categories = [
    'All',
    ...Array.from(
      new Set((courses ?? []).map((c: Course) => c.category))
    ),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Course Library</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Professional IV therapy education from Skilled Visits Academy
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={cat === 'All' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-[var(--muted)]"
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {courses && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course & { lessons: { id: string; duration_seconds: number | null }[] }) => {
            const totalLessons = course.lessons?.length ?? 0
            const completedCount = course.lessons?.filter((l) => completedIds.has(l.id)).length ?? 0
            const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
            const totalSeconds = course.lessons?.reduce(
              (sum, l) => sum + (l.duration_seconds ?? 0), 0
            ) ?? 0

            return (
              <Link key={course.id} href={`/courses/${course.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-[var(--primary)] to-[#2563eb] flex items-center justify-center">
                    {course.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-white/60" />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      {pct === 100 && (
                        <Badge variant="success" className="text-xs">Completed</Badge>
                      )}
                      {pct > 0 && pct < 100 && (
                        <Badge variant="outline" className="text-xs">In Progress</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1.5 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-3">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {totalLessons} lessons
                      </div>
                      {totalSeconds > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(totalSeconds)}
                        </div>
                      )}
                    </div>
                    {totalLessons > 0 && (
                      <div className="space-y-1">
                        <Progress value={pct} className="h-1.5" />
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {completedCount}/{totalLessons} completed
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No courses yet</h3>
          <p className="text-[var(--muted-foreground)]">
            New courses are being added regularly. Check back soon.
          </p>
        </div>
      )}
    </div>
  )
}
