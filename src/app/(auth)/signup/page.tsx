'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const LICENSE_TYPES = [
  { value: 'RN', label: 'RN — Registered Nurse' },
  { value: 'NP', label: 'NP — Nurse Practitioner' },
  { value: 'PA', label: 'PA — Physician Assistant' },
  { value: 'MD', label: 'MD — Medical Doctor' },
  { value: 'DO', label: 'DO — Doctor of Osteopathic Medicine' },
  { value: 'LPN', label: 'LPN — Licensed Practical Nurse' },
  { value: 'LVN', label: 'LVN — Licensed Vocational Nurse' },
  { value: 'EMT', label: 'EMT — Emergency Medical Technician' },
  { value: 'Paramedic', label: 'Paramedic' },
  { value: 'Other', label: 'Other Licensed Healthcare Provider' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [licenseType, setLicenseType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!licenseType) {
      toast.error('Please select your license type')
      return
    }
    if (!licenseNumber.trim()) {
      toast.error('License number is required')
      return
    }
    if (!licenseState) {
      toast.error('Please select your license state')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth-callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Save license info to profile
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          license_type: licenseType,
          license_number: licenseNumber.trim().toUpperCase(),
          license_state: licenseState,
        })
        .eq('id', data.user.id)
    }

    toast.success('Account created! Check your email to verify your address.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D9D9] px-6 py-4">
        <Link href="/">
          <Image src="/SkilledVisitsAcademy.png" alt="Skilled Visits Academy" width={160} height={44} className="h-10 w-auto" />
        </Link>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-[#D9D9D9] shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Create your account</h1>
              <p className="text-sm text-[#5B5B5B]">
                Join Skilled Visits Academy — professional IV therapy education for licensed providers.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="provider@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B5B5B] hover:text-[#1a1a1a]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#D9D9D9] pt-4">
                <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-4">
                  License Information
                </p>

                {/* License type */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                    License Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors appearance-none"
                  >
                    <option value="" disabled>Select your license type</option>
                    {LICENSE_TYPES.map((lt) => (
                      <option key={lt.value} value={lt.value}>{lt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* License number */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RN1234567"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                    />
                  </div>

                  {/* License state */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                      License State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors appearance-none"
                    >
                      <option value="" disabled>State</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-[#5B5B5B] mt-3">
                  SVA is a licensed healthcare provider platform. A valid clinical license is required for enrollment.
                </p>
              </div>

              <p className="text-xs text-[#5B5B5B]">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-[#9E50E5] hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#9E50E5] hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>

            <p className="text-center text-sm text-[#5B5B5B] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#9E50E5] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
