'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard, LogOut, Loader2, CheckCircle2 } from 'lucide-react'
import type { Profile } from '@/types/database'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name ?? '')
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated!')
      setProfile((prev) => prev ? { ...prev, full_name: fullName.trim() } : prev)
    }
    setSavingProfile(false)
  }

  async function openBillingPortal() {
    setLoadingPortal(true)
    // Square doesn't have a customer portal — redirect to Square's buyer management
    window.open('https://squareup.com/dashboard', '_blank')
    setLoadingPortal(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
    active: 'success',
    trialing: 'warning',
    past_due: 'destructive',
    canceled: 'outline',
    inactive: 'outline',
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Account Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Manage your profile and subscription</p>
      </div>

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-[var(--accent)]" />
            Profile
          </CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-[var(--muted)]" />
              <p className="text-xs text-[var(--muted-foreground)]">
                Email cannot be changed
              </p>
            </div>
            <Button type="submit" disabled={savingProfile} className="gap-2">
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-[var(--accent)]" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your billing and subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Current Status</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {profile?.subscription_status === 'active'
                  ? 'Your subscription is active. Full access to all features.'
                  : profile?.subscription_status === 'trialing'
                  ? 'You are currently in your trial period.'
                  : profile?.subscription_status === 'past_due'
                  ? 'Payment is past due. Please update your payment method.'
                  : 'No active subscription. Subscribe to access all features.'}
              </p>
            </div>
            <Badge
              variant={STATUS_VARIANT[profile?.subscription_status ?? 'inactive'] ?? 'outline'}
              className="capitalize"
            >
              {profile?.subscription_status === 'active' ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              ) : (
                profile?.subscription_status ?? 'Inactive'
              )}
            </Badge>
          </div>

          {profile?.square_customer_id || profile?.subscription_status === 'active' ? (
            <Button
              variant="outline"
              onClick={openBillingPortal}
              disabled={loadingPortal}
              className="gap-2"
            >
              {loadingPortal && <Loader2 className="h-4 w-4 animate-spin" />}
              Manage Billing &amp; Payment
            </Button>
          ) : (
            <Button onClick={() => router.push('/pricing')} className="gap-2">
              Subscribe Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardContent className="p-5">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Sign out</p>
              <p className="text-xs text-[var(--muted-foreground)]">Sign out of your account</p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
