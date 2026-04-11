'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  FlaskConical,
  LayoutDashboard,
  BookOpen,
  Users,
  Beaker,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Syringe,
  Calculator,
  TestTube2,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/community', label: 'Community', icon: Users },
]

const resourceNav = [
  { href: '/resources/vitamins', label: 'Vitamin Library', icon: FlaskConical },
  { href: '/resources/mixing-guide', label: 'Mixing Guide', icon: Beaker },
  { href: '/resources/protocol-builder', label: 'Protocol Builder', icon: Layers },
  { href: '/resources/cocktails', label: 'Cocktail Finder', icon: Syringe },
  { href: '/resources/dosage-calculator', label: 'Dosage Calculator', icon: Calculator },
  { href: '/resources/lab-analyzer', label: 'Lab Analyzer', icon: TestTube2 },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [resourcesOpen, setResourcesOpen] = useState(
    pathname.startsWith('/resources')
  )

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() ?? 'SV'

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-white border-r border-[#D9D9D9] sticky top-0">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-[#D9D9D9]">
        <Link href="/dashboard">
          <Image src="/SkilledVisitsAcademy.png" alt="Skilled Visits Academy" width={150} height={40} className="h-9 w-auto" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Main links */}
        {mainNav.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-500 transition-colors',
                  active
                    ? 'bg-[#FBF6FF] text-[#9E50E5]'
                    : 'text-[#5B5B5B] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#9E50E5]' : 'text-[#5B5B5B]')} />
                {item.label}
              </div>
            </Link>
          )
        })}

        {/* Resources section */}
        <div className="pt-4">
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-xs font-600 uppercase tracking-wider text-[#5B5B5B] hover:text-[#9E50E5] transition-colors"
          >
            <span>Clinical Tools</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                resourcesOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>

          {resourcesOpen && (
            <div className="mt-1 space-y-0.5">
              {resourceNav.map((item) => {
                const Icon = item.icon
                const active = pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                        active
                          ? 'bg-[#FBF6FF] text-[#9E50E5] font-500'
                          : 'text-[#5B5B5B] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
                      )}
                    >
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#9E50E5]' : 'text-[#5B5B5B]')} />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Admin link */}
        {profile?.role === 'admin' && (
          <div className="pt-4">
            <p className="px-3 pb-1.5 text-xs font-600 uppercase tracking-wider text-[#5B5B5B]">
              Admin
            </p>
            <Link href="/admin">
              <div
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-[#FBF6FF] text-[#9E50E5] font-500'
                    : 'text-[#5B5B5B] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
                )}
              >
                <Shield className={cn('h-4 w-4 shrink-0', pathname.startsWith('/admin') ? 'text-[#9E50E5]' : 'text-[#5B5B5B]')} />
                Admin Panel
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#D9D9D9]" />
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom — user profile */}
      <div className="border-t border-[#D9D9D9] p-3">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#f5f5f5] transition-colors group cursor-pointer">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback className="bg-[#9E50E5] text-white text-xs font-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-500 text-[#1a1a1a] truncate leading-tight">
                {profile?.full_name ?? 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={profile?.subscription_status === 'active' ? 'success' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {profile?.subscription_status === 'active' ? 'Active' : 'Free'}
                </Badge>
              </div>
            </div>
            <Settings className="h-3.5 w-3.5 text-[#D9D9D9] group-hover:text-[#5B5B5B] transition-colors shrink-0" />
          </div>
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 px-4 py-2 rounded-lg text-sm text-[#5B5B5B] hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
