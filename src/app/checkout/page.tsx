'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Eye, EyeOff, Loader2, ShieldCheck, Lock, CheckCircle,
  CalendarDays, Users, Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart'
import type { SvaCourseKey } from '@/lib/jidopay'

// window.JidoPay is injected by the embed script loaded from jidopay.com.
// The script attaches a global with open/close methods — we call open() here
// to launch the checkout modal after the student creates their account.
declare global {
  interface Window {
    JidoPay?: {
      open: (
        linkId: string,
        opts?: {
          theme?: string
          autoload?: boolean
          email?: string
          clientRef?: string
        }
      ) => void
      close: () => void
    }
  }
}

// Pull NEXT_PUBLIC_JIDOPAY_LINK_* values at bundle time so we can map
// course keys to payment-link ids on the client. Any missing env var is
// surfaced as an error on submit so the operator knows exactly which course
// needs a JidoPay payment link configured.
const JIDOPAY_LINK_IDS: Record<SvaCourseKey, string | undefined> = {
  'iv-therapy-certification': process.env.NEXT_PUBLIC_JIDOPAY_LINK_IV_CERT,
  'complete-mastery-bundle': process.env.NEXT_PUBLIC_JIDOPAY_LINK_BUNDLE,
  'iv-complications-emergency': process.env.NEXT_PUBLIC_JIDOPAY_LINK_COMPLICATIONS,
  'vitamin-nutrient-therapy': process.env.NEXT_PUBLIC_JIDOPAY_LINK_VITAMIN,
  'nad-plus-masterclass': process.env.NEXT_PUBLIC_JIDOPAY_LINK_NAD,
  'iv-push-administration': process.env.NEXT_PUBLIC_JIDOPAY_LINK_IV_PUSH,
}

type CohortOption = {
  id: string
  meetingAt: string
  hasMeetingLink: boolean
  seatsLeft: number
}

// JidoPay processing fee: 3.5% + $0.30. We gross-up the displayed total so
// the merchant nets the advertised course price and the shopper sees the
// fee as a line item — this is the same approach Shopify, Square Online, etc.
// use when a merchant opts to pass the fee through.
//
// Math: net = gross - (0.035 * gross + 0.30)
//       gross = (net + 0.30) / 0.965
// Example: $299 net → $310.16 gross → $11.16 fee
const FEE_PERCENT = 0.035
const FEE_FIXED_CENTS = 30

function grossUpCents(netCents: number): number {
  const gross = (netCents + FEE_FIXED_CENTS) / (1 - FEE_PERCENT)
  return Math.round(gross)
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

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
  'iv-therapy-certification': {
    title: 'IV Therapy Certification',
    subtitle: 'Core Certification — 12 Modules',
    price: '$299',
    priceInt: 29900,
    type: 'One-time · Lifetime access',
    includes: [
      'IV therapy fundamentals',
      'Anatomy & physiology of veins',
      'Patient assessment & screening',
      'IV equipment, supplies & insertion techniques',
      'Hydration therapy protocols',
      'Infection control & safety standards',
      'Legal considerations & scope of practice',
      'Documentation & consent forms',
      'Certificate of completion',
    ],
    squarePlanEnv: 'SQUARE_IV_CERTIFICATION_PLAN_ID',
  },
  'complete-mastery-bundle': {
    title: 'Complete IV Therapy Mastery Bundle',
    subtitle: 'Core Course + All 4 Masterclasses',
    price: '$499',
    priceInt: 49900,
    type: 'One-time · Save $396',
    includes: [
      'IV Therapy Certification (Core)',
      'Advanced IV Complications & Emergency Mgmt',
      'Vitamin & Nutrient Therapy Masterclass',
      'NAD+ Therapy Masterclass',
      'IV Push Administration Masterclass',
      'All future course updates included',
      'Priority community support',
    ],
    squarePlanEnv: 'SQUARE_BUNDLE_PLAN_ID',
  },
  'iv-complications-emergency': {
    title: 'Advanced IV Complications & Emergency Management',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    includes: [
      'Identifying IV complications',
      'Infiltration & extravasation management',
      'Phlebitis prevention & treatment',
      'Allergic reactions & anaphylaxis protocols',
      'Air embolism awareness',
      'Emergency management & documentation',
    ],
    squarePlanEnv: 'SQUARE_COMPLICATIONS_PLAN_ID',
  },
  'vitamin-nutrient-therapy': {
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    includes: [
      'Vitamin pharmacology fundamentals',
      'Vitamin C & B complex protocols',
      'Magnesium, zinc & trace elements',
      'Glutathione therapy',
      'Amino acids & nutrient combinations',
      'Mixing compatibility & dosing strategies',
    ],
    squarePlanEnv: 'SQUARE_VITAMIN_PLAN_ID',
  },
  'nad-plus-masterclass': {
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    includes: [
      'Science behind NAD+ therapy',
      'Anti-aging & cellular repair benefits',
      'Infusion protocols & dosing',
      'Infusion rates & monitoring',
      'Managing common side effects',
      'Patient selection & contraindications',
    ],
    squarePlanEnv: 'SQUARE_NAD_PLAN_ID',
  },
  'iv-push-administration': {
    title: 'IV Push Administration Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    includes: [
      'IV push vs infusion techniques',
      'Step-by-step IV push administration',
      'Safe medication administration rates',
      'Glutathione IV push protocols',
      'Vitamin push techniques',
      'Safety considerations & monitoring',
    ],
    squarePlanEnv: 'SQUARE_IV_PUSH_PLAN_ID',
  },
}

function CheckoutForm() {
  const searchParams = useSearchParams()
  const cartMode = searchParams.get('from') === 'cart'
  const courseKey = !cartMode ? (searchParams.get('course') ?? 'iv-therapy-certification') : null
  const course = courseKey ? (COURSE_CATALOG[courseKey] ?? COURSE_CATALOG['iv-therapy-certification']) : null

  const { items: cartItems, clearCart } = useCart()
  const checkoutItems = cartMode ? cartItems : course ? [{ key: courseKey!, ...course }] : []
  const subtotalCents = cartMode
    ? cartItems.reduce((sum, i) => sum + i.priceInt, 0)
    : course?.priceInt ?? 0
  // Gross-up the sticker price so the shopper covers the JidoPay processing
  // fee and the merchant nets the advertised amount.
  const grossCents = subtotalCents > 0 ? grossUpCents(subtotalCents) : 0
  const feeCents = grossCents - subtotalCents
  const totalDisplay = formatCents(grossCents)

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

  const [cohorts, setCohorts] = useState<CohortOption[]>([])
  const [cohortsLoading, setCohortsLoading] = useState(true)
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        setLoggedInEmail(user.email ?? '')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load upcoming cohorts for the selected course. The core IV Therapy Cert
  // cohort is used for the Complete Mastery Bundle too — the client's ops
  // flow is that everyone in a given week attends the same live session.
  useEffect(() => {
    async function loadCohorts() {
      const slug = cartMode
        ? cartItems[0]?.key ?? null
        : courseKey
      if (!slug) {
        setCohorts([])
        setCohortsLoading(false)
        return
      }
      const cohortSlug =
        slug === 'complete-mastery-bundle' ? 'iv-therapy-certification' : slug
      setCohortsLoading(true)
      try {
        const res = await fetch(
          `/api/cohorts?courseSlug=${encodeURIComponent(cohortSlug)}`
        )
        const data = await res.json()
        setCohorts(data.cohorts ?? [])
        if ((data.cohorts ?? []).length > 0) {
          setSelectedCohortId(data.cohorts[0].id)
        } else {
          setSelectedCohortId(null)
        }
      } catch {
        setCohorts([])
      } finally {
        setCohortsLoading(false)
      }
    }
    loadCohorts()
  }, [courseKey, cartMode, cartItems])

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

    // JidoPay payment links are per-product, so a multi-item cart would have
    // to chain multiple checkouts. For now we steer cart-mode shoppers to
    // buy courses individually — which is also the default flow from any
    // course landing page.
    if (cartMode && cartItems.length > 1) {
      toast.error(
        'Please purchase courses individually. The Complete Mastery Bundle is the best value for multi-course access.'
      )
      return
    }

    // Single-item checkout: resolve the JidoPay payment link for this course.
    const targetCourseKey = (
      cartMode ? cartItems[0]?.key : courseKey
    ) as SvaCourseKey | undefined
    if (!targetCourseKey) {
      toast.error('No course selected')
      return
    }
    const linkId = JIDOPAY_LINK_IDS[targetCourseKey]
    if (!linkId) {
      toast.error(
        'This course is not yet available for checkout. Please contact support.'
      )
      console.error(
        '[checkout] missing NEXT_PUBLIC_JIDOPAY_LINK_* env var for',
        targetCourseKey
      )
      return
    }

    if (!selectedCohortId) {
      toast.error('Please pick a cohort date before continuing.')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create the Supabase account (if not logged in) so we have a
      // user to attach the purchase to when the webhook fires.
      let studentEmail = loggedInEmail
      let studentUserId: string | null = null
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

        if (data.user) {
          studentUserId = data.user.id
          studentEmail = email
          await supabase
            .from('profiles')
            .update({
              license_type: licenseType,
              license_number: licenseNumber.trim().toUpperCase(),
              license_state: licenseState,
            })
            .eq('id', data.user.id)
        }
      } else {
        const { data: userData } = await supabase.auth.getUser()
        studentUserId = userData.user?.id ?? null
      }

      // Step 1b: Stamp the checkout intent so the webhook knows which cohort
      // this student picked. We use the course slug (not the bundle) as the
      // intent key so the webhook's simple "most recent for user+course"
      // lookup does the right thing for both single-course and bundle buys.
      const intentRes = await fetch('/api/checkout-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: targetCourseKey,
          cohortId: selectedCohortId,
        }),
      })
      if (!intentRes.ok) {
        toast.error('Could not save your cohort selection. Please try again.')
        setLoading(false)
        return
      }

      // Step 2: Launch JidoPay checkout. The embed iframe escapes to the
      // top window, sends the shopper to Stripe Checkout with their email
      // pre-filled, and (on success) JidoPay fires the webhook that grants
      // access. clientRef = Supabase uid gives the webhook an authoritative
      // identifier in case the student types a different email in Stripe.
      if (typeof window === 'undefined' || !window.JidoPay) {
        toast.error('Checkout failed to load. Please refresh and try again.')
        setLoading(false)
        return
      }

      if (cartMode) clearCart()

      window.JidoPay.open(linkId, {
        autoload: true,
        email: studentEmail || undefined,
        clientRef: studentUserId ?? undefined,
      })

      // The embed takes over the window, so we don't clear loading state
      // — if the shopper closes the modal and comes back, the page will
      // have reloaded.
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
            <Image src="/SkilledVisitsAcademyNEW.png" alt="Skilled Visits Academy" width={320} height={86} className="h-20 w-auto" />
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

                {/* Cohort picker */}
                <div className={!isLoggedIn ? 'border-t border-[#D9D9D9] pt-5' : ''}>
                  <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-1">
                    Choose your live session
                  </p>
                  <p className="text-xs text-[#5B5B5B] mb-4">
                    Pick a virtual meeting date. Course materials unlock 48 hours before your session so you can prep.
                  </p>
                  <CohortPicker
                    cohorts={cohorts}
                    loading={cohortsLoading}
                    selectedId={selectedCohortId}
                    onSelect={setSelectedCohortId}
                  />
                </div>

                {/* Submit */}
                <div className="border-t border-[#D9D9D9] pt-5">
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
                      Secure payment via JidoPay
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#5B5B5B]">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      Access unlocks 48h before your session
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

                <div className="border-t border-[#D9D9D9] pt-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5B5B5B]">Subtotal</span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">{formatCents(subtotalCents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5B5B5B]">Processing fee</span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">{formatCents(feeCents)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-[#5B5B5B]">Access</span>
                    <span className="text-sm font-semibold text-emerald-600">Lifetime</span>
                  </div>
                  <div className="border-t border-[#D9D9D9] mt-3 pt-3 flex items-center justify-between">
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

function CohortPicker({
  cohorts,
  loading,
  selectedId,
  onSelect,
}: {
  cohorts: CohortOption[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#D9D9D9] bg-[#FAFAFA] p-6 text-sm text-[#5B5B5B]">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading available sessions…
      </div>
    )
  }

  if (cohorts.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">No upcoming sessions scheduled.</p>
        <p className="mt-1 text-xs">
          Please contact{' '}
          <a href="mailto:support@skilledvisitsacademy.com" className="underline">
            support@skilledvisitsacademy.com
          </a>{' '}
          — new cohort dates are added regularly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {cohorts.map((cohort) => {
        const meetingDate = new Date(cohort.meetingAt)
        const dateStr = meetingDate.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        const timeStr = meetingDate.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })
        const tzAbbr =
          meetingDate
            .toLocaleDateString(undefined, { timeZoneName: 'short' })
            .split(' ')
            .pop() ?? ''
        const unlockDate = new Date(meetingDate.getTime() - 48 * 60 * 60 * 1000)
        const unlockStr = unlockDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
        const isSelected = cohort.id === selectedId
        const scarce = cohort.seatsLeft <= 5

        return (
          <button
            key={cohort.id}
            type="button"
            onClick={() => onSelect(cohort.id)}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
              isSelected
                ? 'border-[#9E50E5] bg-[#FBF6FF] ring-2 ring-[#9E50E5]/20'
                : 'border-[#D9D9D9] bg-white hover:border-[#9E50E5]/50 hover:bg-[#FBF6FF]/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-[#9E50E5] text-white' : 'bg-[#FBF6FF] text-[#9E50E5]'
                }`}
              >
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {dateStr} · {timeStr} {tzAbbr}
                  </p>
                  {scarce && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      <Users className="h-2.5 w-2.5" />
                      Only {cohort.seatsLeft} seat{cohort.seatsLeft === 1 ? '' : 's'} left
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#5B5B5B]">
                  Access unlocks {unlockStr} (48h before)
                </p>
              </div>
              <div
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? 'border-[#9E50E5] bg-[#9E50E5]'
                    : 'border-[#D9D9D9] bg-white'
                }`}
              >
                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
              </div>
            </div>
          </button>
        )
      })}
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
