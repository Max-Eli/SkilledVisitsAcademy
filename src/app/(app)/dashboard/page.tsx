import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Users,
  FlaskConical,
  ArrowRight,
  Activity,
  Syringe,
  Calculator,
  TestTube2,
  Beaker,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import type { Profile, Course } from '@/types/database'

const resourceCards = [
  {
    href: '/resources/vitamins',
    icon: FlaskConical,
    title: 'Vitamin Library',
    description: 'Browse all IV-compatible vitamins and minerals',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    href: '/resources/mixing-guide',
    icon: Beaker,
    title: 'Mixing Guide',
    description: 'Interactive compatibility matrix',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    href: '/resources/protocol-builder',
    icon: Layers,
    title: 'Protocol Builder',
    description: 'Build and save custom IV protocols',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    href: '/resources/cocktails',
    icon: Syringe,
    title: 'Cocktail Finder',
    description: 'Symptom-based cocktail recommendations',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    href: '/resources/dosage-calculator',
    icon: Calculator,
    title: 'Dosage Calculator',
    description: 'Weight-based dosage calculations',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    href: '/resources/lab-analyzer',
    icon: TestTube2,
    title: 'Lab Analyzer',
    description: 'AI-powered lab test interpretation',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string; enrolled?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams

  const [{ data: profile }, { data: courses }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('courses')
      .select('*, lessons(id)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id),
  ])

  const completedLessonIds = new Set(progress?.map((p) => p.lesson_id) ?? [])

  const p = profile as Profile

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      {(params.subscription === 'success' || params.enrolled === 'success') && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm text-emerald-800 font-semibold">
              🎉 Enrollment confirmed! Welcome to Skilled Visits Academy.
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              A confirmation email has been sent to your inbox. Your courses are ready below.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome back, {p?.full_name?.split(' ')[0] ?? 'Provider'}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Your professional IV therapy education hub
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{courses?.length ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Available Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{completedLessonIds.size}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">6</p>
                <p className="text-xs text-[var(--muted-foreground)]">Clinical Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <Badge variant={p?.subscription_status === 'active' ? 'success' : 'outline'} className="text-xs">
                  {p?.subscription_status === 'active' ? 'Active' : p?.subscription_status ?? 'Free'}
                </Badge>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Subscription</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Continue Learning</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {courses && courses.length > 0 ? (
              courses.map((course: Course & { lessons: { id: string }[] }) => {
                const totalLessons = course.lessons?.length ?? 0
                const completedCount = course.lessons?.filter((l) =>
                  completedLessonIds.has(l.id)
                ).length ?? 0
                const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

                return (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-[var(--foreground)] truncate">{course.title}</h3>
                              <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
                              {course.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                                {completedCount}/{totalLessons} lessons
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                  <p className="text-[var(--muted-foreground)]">No courses available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Resource Hub Quick Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Clinical Tools</h2>
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="gap-1">
                All tools <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {resourceCards.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-4.5 w-4.5 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
