'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Eye, EyeOff, Loader2, ShieldCheck, Lock, CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart'

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

// Course catalog — maps to Square catalog object IDs and descriptions
const COURSE_CATALOG: Record<string, {
  title: string
  subtitle: string
  price: string
  priceInt: number
  type: string
  includes: string[]
  squarePlanEnv: string
}> = {
  'iv-therapy-foundation': {
    title: 'IV Therapy Foundation',
    subtitle: 'Core certification course',
    price: '$199',
    priceInt: 19900,
    type: 'One-time purchase · Lifetime access',
    includes: [
      'Full video course library',
      'SVA-approved protocol library',
      'Vitamin & mixing reference tools',
      'Dosage calculator',
      'AI lab analyzer (50 analyses/mo)',
      'Professional community access',
      'Completion certificate',
    ],
    squarePlanEnv: 'SQUARE_IV_FOUNDATION_PLAN_ID',
  },
  'myers-cocktail-masterclass': {
    title: 'Myers Cocktail Masterclass',
    subtitle: 'Advanced add-on course',
    price: '$149',
    priceInt: 14900,
    type: 'One-time purchase · Lifetime access',
    includes: [
      'In-depth Myers Cocktail protocol',
      'Clinical case studies',
      'Patient assessment module',
      'Live Q&A recording library',
      'Printable clinical reference card',
    ],
    squarePlanEnv: 'SQUARE_MYERS_PLAN_ID',
  },
  'nad-plus-therapy': {
    title: 'NAD+ Therapy Certification',
    subtitle: 'Advanced add-on course',
    price: '$129',
    priceInt: 12900,
    type: 'One-time purchase · Lifetime access',
    includes: [
      'Complete NAD+ infusion protocol',
      'Addiction recovery applications',
      'Anti-aging & cognitive protocols',
      'Patient screening & consent forms',
      'Adverse reaction management',
    ],
    squarePlanEnv: 'SQUARE_NAD_PLAN_ID',
  },
  'filler-fundamentals': {
    title: 'Filler Fundamentals',
    subtitle: 'Aesthetics certification',
    price: '$249',
    priceInt: 24900,
    type: 'One-time purchase · Lifetime access',
    includes: [
      'Facial anatomy deep dive',
      'Dermal filler injection techniques',
      'Product selection guide',
      'Complication avoidance & management',
      'Before & after case review library',
      'Completion certificate',
    ],
    squarePlanEnv: 'SQUARE_FILLER_PLAN_ID',
  },
  'botox-neurotoxins': {
    title: 'Botox & Neurotoxins',
    subtitle: 'Aesthetics certification',
    price: '$249',
    priceInt: 24900,
    type: 'One-time purchase · Lifetime access',
    includes: [
      'Neurotoxin mechanism & products',
      'Injection mapping & dosing',
      'Treatment area protocols',
      'Patient consultation framework',
      'Managing complications',
      'Completion certificate',
    ],
    squarePlanEnv: 'SQUARE_BOTOX_PLAN_ID',
  },
  'complete-bundle': {
    title: 'Complete IV Therapy Bundle',
    subtitle: 'Foundation + All IV Add-ons',
    price: '$349',
    priceInt: 34900,
    type: 'One-time purchase · Best value',
    includes: [
      'Everything in IV Therapy Foundation',
      'Myers Cocktail Masterclass',
      'NAD+ Therapy Certification',
      'All future IV therapy updates',
      'Priority community support',
      'Save $128 vs. buying separately',
    ],
    squarePlanEnv: 'SQUARE_BUNDLE_PLAN_ID',
  },
}

function CheckoutForm() {
  const searchParams = useSearchParams()
  const cartMode = searchParams.get('from') === 'cart'
  const courseKey = !cartMode ? (searchParams.get('course') ?? 'iv-therapy-foundation') : null
  const course = courseKey ? (COURSE_CATALOG[courseKey] ?? COURSE_CATALOG['iv-therapy-foundation']) : null

  const { items: cartItems, clearCart } = useCart()
  const checkoutItems = cartMode ? cartItems : course ? [{ key: courseKey!, ...course }] : []
  const totalInt = cartMode
    ? cartItems.reduce((sum, i) => sum + i.priceInt, 0)
    : course?.priceInt ?? 0
  const totalDisplay = cartMode ? `$${(totalInt / 100).toFixed(0)}` : (course?.price ?? '$0')

  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [licenseType, setLicenseType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        setLoggedInEmail(user.email ?? '')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()

    if (!isLoggedIn) {
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
    }

    setLoading(true)

    try {
      // Step 1: Create account if not logged in
      if (!isLoggedIn) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth-callback`,
          },
        })

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            toast.error('This email is already registered. Please sign in first.')
          } else {
            toast.error(error.message)
          }
          setLoading(false)
          return
        }

        // Save license info
        if (data.user) {
          await supabase.from('profiles').update({
            license_type: licenseType,
            license_number: licenseNumber.trim().toUpperCase(),
            license_state: licenseState,
          }).eq('id', data.user.id)
        }
      }

      // Step 2: Create Square checkout
      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          cartMode
            ? { items: cartItems.map((i) => ({ key: i.key })) }
            : { course: courseKey }
        ),
      })

      const data = await res.json()

      if (data.url) {
        if (cartMode) clearCart()
        window.location.href = data.url
      } else {
        toast.error(data.error ?? 'Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D9D9] px-6 py-3">
        <div className="mx-auto max-w-[1140px] flex items-center justify-between">
          <Link href="/">
            <Image src="/SkilledVisitsAcademy.png" alt="Skilled Visits Academy" width={320} height={86} className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#5B5B5B]">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Form */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[#D9D9D9] p-8">

              {isLoggedIn ? (
                <div className="mb-7">
                  <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Complete Your Purchase</h1>
                  <p className="text-sm text-[#5B5B5B]">
                    Signed in as <span className="font-semibold text-[#9E50E5]">{loggedInEmail}</span>
                  </p>
                </div>
              ) : (
                <div className="mb-7">
                  <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Create Account & Enroll</h1>
                  <p className="text-sm text-[#5B5B5B]">
                    Already have an account?{' '}
                    <Link href={`/login?next=/checkout?course=${courseKey}`} className="text-[#9E50E5] font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-5">
                {!isLoggedIn && (
                  <>
                    {/* Account info */}
                    <div>
                      <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-4">Account Information</p>
                      <div className="space-y-4">
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
                            className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                          />
                        </div>
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
                            className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                          />
                        </div>
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
                              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B5B5B]">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* License info */}
                    <div className="border-t border-[#D9D9D9] pt-5">
                      <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-4">License Verification</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                            License Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={licenseType}
                            onChange={(e) => setLicenseType(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors appearance-none bg-white"
                          >
                            <option value="" disabled>Select your license type</option>
                            {LICENSE_TYPES.map((lt) => (
                              <option key={lt.value} value={lt.value}>{lt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
                              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                              License State <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={licenseState}
                              onChange={(e) => setLicenseState(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors appearance-none bg-white"
                            >
                              <option value="" disabled>State</option>
                              {US_STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit */}
                <div className={!isLoggedIn ? 'border-t border-[#D9D9D9] pt-5' : ''}>
                  <p className="text-xs text-[#5B5B5B] mb-4">
                    By completing your purchase, you agree to our{' '}
                    <Link href="/terms" className="text-[#9E50E5] hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#9E50E5] hover:underline">Privacy Policy</Link>.
                    SVA is restricted to licensed healthcare providers only.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-bold text-base transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                      : <><Lock className="h-4 w-4" /> Proceed to Payment — {totalDisplay}</>
                    }
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#5B5B5B]">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Secure payment via Square
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#5B5B5B]">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      Instant access after payment
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Order summary + Other courses */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-[#D9D9D9] p-7">
                <h2 className="text-sm font-semibold text-[#5B5B5B] uppercase tracking-wider mb-5">Order Summary</h2>

                {cartMode ? (
                  /* Cart mode: list all items */
                  <div className="space-y-3 mb-6">
                    {checkoutItems.map((item) => (
                      <div key={item.key} className="flex items-start gap-3 pb-3 border-b border-[#EEEEEE] last:border-0">
                        <CheckCircle className="h-4 w-4 text-[#9E50E5] mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{item.title}</p>
                          <p className="text-xs text-[#5B5B5B]">{item.subtitle}</p>
                        </div>
                        <span className="text-sm font-bold text-[#1a1a1a] shrink-0">{item.price}</span>
                      </div>
                    ))}
                  </div>
                ) : course ? (
                  /* Single course mode */
                  <>
                    <div className="mb-6">
                      <div className="inline-block px-3 py-1 rounded-full bg-[#FBF6FF] text-[#9E50E5] text-xs font-semibold mb-3">
                        {course.type}
                      </div>
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">{course.title}</h3>
                      <p className="text-sm text-[#5B5B5B]">{course.subtitle}</p>
                    </div>
                    <div className="space-y-2.5 mb-6">
                      {course.includes.map((item) => (
                        <div key={item} className="flex items-start gap-2.5 text-sm text-[#5B5B5B]">
                          <CheckCircle className="h-4 w-4 text-[#9E50E5] mt-0.5 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                <div className="border-t border-[#D9D9D9] pt-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#5B5B5B]">Access</span>
                    <span className="text-sm font-semibold text-emerald-600">Lifetime</span>
                  </div>
                  <div className="border-t border-[#D9D9D9] mt-4 pt-4 flex items-center justify-between">
                    <span className="text-base font-bold text-[#1a1a1a]">Total today</span>
                    <span className="text-xl font-extrabold text-[#9E50E5]">{totalDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Other courses — only in single-course mode */}
              {!cartMode && (
                <div className="bg-white rounded-2xl border border-[#D9D9D9] p-5">
                  <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-3">Other Courses</p>
                  <div className="space-y-2">
                    {Object.entries(COURSE_CATALOG)
                      .filter(([key]) => key !== courseKey)
                      .slice(0, 3)
                      .map(([key, c]) => (
                        <Link
                          key={key}
                          href={`/course/${key}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FBF6FF] transition-colors group"
                        >
                          <span className="text-sm text-[#5B5B5B] group-hover:text-[#1a1a1a]">{c.title}</span>
                          <span className="text-sm font-semibold text-[#9E50E5]">{c.price}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  )
}
