import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/community', label: 'Community', icon: Users },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Image src="/SkilledVisitsAcademyNEW.png" alt="Skilled Visits Academy" width={140} height={36} className="h-8 w-auto brightness-0 invert" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield className="h-3 w-3 text-[#9E50E5]" />
            <span className="text-xs text-white/60 font-medium">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Back to App
          </Link>
          <div className="px-3 py-2.5">
            <p className="text-xs text-white/50 truncate">{profile?.full_name ?? profile?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
