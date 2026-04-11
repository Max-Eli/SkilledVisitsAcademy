import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, MessageSquare, TestTube2, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: subscriberCount },
    { count: courseCount },
    { count: threadCount },
    { count: labCount },
    { data: recentSubs },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'trialing']),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('threads').select('*', { count: 'exact', head: true }),
    supabase.from('lab_analyses').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('full_name, email, subscription_status, created_at')
      .in('subscription_status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Active Subscribers', value: subscriberCount ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published Courses', value: courseCount ?? 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Community Posts', value: threadCount ?? 0, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Lab Analyses Run', value: labCount ?? 0, icon: TestTube2, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Skilled Visits Academy platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
            Recent Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubs && recentSubs.length > 0 ? (
            <div className="space-y-3">
              {recentSubs.map((sub, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {sub.full_name ?? 'User'}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">{sub.email}</p>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No subscribers yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
