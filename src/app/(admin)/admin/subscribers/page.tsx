import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'

export default async function AdminSubscribersPage() {
  const supabase = await createClient()

  const { data: subscribers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const active = (subscribers ?? []).filter((s: Profile) => s.subscription_status === 'active').length
  const trialing = (subscribers ?? []).filter((s: Profile) => s.subscription_status === 'trialing').length
  const free = (subscribers ?? []).filter((s: Profile) => s.subscription_status === 'inactive' || s.subscription_status === 'canceled').length

  const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
    active: 'success',
    trialing: 'warning',
    past_due: 'destructive',
    canceled: 'outline',
    inactive: 'outline',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Subscribers</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Manage all platform users and subscriptions</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', value: active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Trialing', value: trialing, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Free / Inactive', value: free, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Users className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users ({subscribers?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(subscribers ?? []).map((user: Profile) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {user.full_name ?? 'User'}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <Badge variant={STATUS_VARIANT[user.subscription_status] ?? 'outline'} className="text-xs">
                    {user.subscription_status}
                  </Badge>
                  <Badge variant={user.role === 'admin' ? 'sva' : 'secondary'} className="text-xs">
                    {user.role}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
