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
import {
  grossUpCents,
  isInPersonKey,
  isPrivateKey,
  type SvaCourseKey,
} from '@/lib/jidopay'

// window.JidoPay is injected by the embed script loaded from jidopay.com.
// openCheckout accepts a dynamic buy.stripe.com url that the server just
// minted via POST /api/v1/checkout — that's how we support multi-item carts
// without pre-creating a payment link for every possible combo.
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
      openCheckout: (opts: { url: string }) => void
      close: () => void
    }
  }
}

type CohortOption = {
  id: string
  meetingAt: string
  hasMeetingLink: boolean
  seatsLeft: number
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// IV lane defaults to the flagship course's cohort list; aesthetic cart
// items route to the basic Botox cohort list. Admin bulk-creates cohorts
// across every course on the same date, so the picked meeting_at is used
// by the webhook to find each course's own cohort row.
const AESTHETIC_KEYS = new Set<string>([
  'botox-basic',
  'botox-advanced',
  'filler-basic',
  'filler-advanced',
  'aesthetic-injector-bundle',
  'prp-prf-ezgel',
])

// Courses that require admin to schedule the session manually: in-person
// hands-on events and private 1:1 sessions. These skip the cohort picker
// on checkout and go straight into the admin queue after payment.
function isManuallyScheduled(key: string): boolean {
  return isInPersonKey(key) || isPrivateKey(key)
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

// Course catalog — keep in sync with src/lib/jidopay.ts (server-authoritative)
// and the /pricing and /course/[slug] pages. The display values here only
// render the order summary; the actual amount charged always comes from
// COURSE_PRICES_CENTS in jidopay.ts.
const COURSE_CATALOG: Record<string, {
  title: string
  subtitle: string
  price: string
  priceInt: number
  type: string
  includes: string[]
}> = {

  // ─── IV lane — online live Zoom ───
  'iv-therapy-training': {
    title: 'Comprehensive IV Therapy Training',
    subtitle: 'Live 4-hour Zoom cohort',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Pre-session reading and equipment list',
      'Step-by-step insertion technique demo',
      'Hydration and nutrient protocol library',
      'Complication management workflow',
      'Documentation and consent templates',
      'SVA completion certificate',
    ],
  },
  'iv-complications-emergency': {
    title: 'IV Complications & Emergency Management',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Infiltration and extravasation grading',
      'Anaphylaxis protocol and epinephrine dosing',
      'Air embolism and fluid overload response',
      'Emergency documentation templates',
      'SVA completion certificate',
    ],
  },
  'vitamin-nutrient-therapy': {
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'High-dose vitamin C protocols',
      'B-complex and Myers Cocktail',
      'Glutathione, amino acids and combinations',
      'Mixing compatibility chart',
      'SVA completion certificate',
    ],
  },
  'nad-plus-masterclass': {
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Standard and high-dose infusion protocols',
      'Rate titration and flush management',
      'Anti-aging and recovery applications',
      'Patient selection framework',
      'SVA completion certificate',
    ],
  },
  'iv-push-administration': {
    title: 'IV Push Administration Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'IV push vs infusion clinical distinctions',
      'Safe administration rates by medication',
      'Glutathione, vitamin C and B-complex push protocols',
      'Monitoring and adverse-event response',
      'SVA completion certificate',
    ],
  },

  // ─── Aesthetic lane — online live Zoom ───
  'botox-basic': {
    title: 'Basic Botox Training',
    subtitle: 'Live 4-hour Zoom cohort',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Neurotoxin pharmacology and reconstitution',
      'Upper-face injection patterns',
      'Consultation and treatment planning',
      'Asymmetry troubleshooting',
      'SVA completion certificate',
    ],
  },
  'botox-advanced': {
    title: 'Advanced Botox Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Masseter reduction and facial slimming',
      'Lip flip, DAOs and mentalis',
      'Nefertiti lift and platysmal banding',
      'Difficult-case troubleshooting',
      'SVA completion certificate',
    ],
  },
  'filler-basic': {
    title: 'Basic Dermal Filler Training',
    subtitle: 'Live 4-hour Zoom cohort',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'HA filler rheology and product selection',
      'Lip injection technique',
      'Midface and cheek volumization',
      'Vascular occlusion and hyaluronidase protocol',
      'SVA completion certificate',
    ],
  },
  'filler-advanced': {
    title: 'Advanced Dermal Filler Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Full-face treatment design',
      'Jawline and chin contouring',
      'Non-surgical rhinoplasty technique',
      'Tear trough with cannula',
      'SVA completion certificate',
    ],
  },
  'aesthetic-injector-bundle': {
    title: 'Complete Aesthetic Injector Bundle',
    subtitle: 'Basic + Advanced Botox + Basic + Advanced Filler',
    price: '$1,000',
    priceInt: 100000,
    type: 'Bundle · Save $796 · 4 certificates',
    includes: [
      'Basic Botox Training (4-hour live)',
      'Advanced Botox Training (4-hour live)',
      'Basic Dermal Filler Training (4-hour live)',
      'Advanced Dermal Filler Training (4-hour live)',
      'All slide decks, protocols and templates',
      'Four SVA completion certificates',
      'Priority alumni Q&A support',
    ],
  },
  'prp-prf-ezgel': {
    title: 'PRP, PRF & EZ Gel Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Certificate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'PRP, PRF and EZ Gel clinical differences',
      'Blood draw and centrifuge protocols',
      'EZ Gel thermal activation',
      'Facial injection technique by region',
      'SVA completion certificate',
    ],
  },

  // ─── In-person hands-on ───
  'bbl-russian-lip-inperson': {
    title: 'Non-Surgical BBL & Russian Lip Technique',
    subtitle: 'In-person hands-on intensive',
    price: '$2,500',
    priceInt: 250000,
    type: 'In-person · 1-day · Live models',
    includes: [
      'Full-day in-person hands-on workshop',
      'Live model practice — BBL and Russian lip',
      'Pre-reading and protocols',
      'All product and supplies for the day',
      'Professional portfolio photos',
      'Lunch and refreshments provided',
      'SVA completion certificate',
    ],
  },

  // ─── Private 1:1 ───
  'private-iv-therapy-training': {
    title: 'Private Comprehensive IV Therapy Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$798',
    priceInt: 79800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'SVA completion certificate',
    ],
  },
  'private-botox-basic': {
    title: 'Private Basic Botox Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$798',
    priceInt: 79800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'SVA completion certificate',
    ],
  },
  'private-botox-advanced': {
    title: 'Private Advanced Botox Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Bring-your-own case review',
      'SVA completion certificate',
    ],
  },
  'private-filler-basic': {
    title: 'Private Basic Dermal Filler Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$798',
    priceInt: 79800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'SVA completion certificate',
    ],
  },
  'private-filler-advanced': {
    title: 'Private Advanced Dermal Filler Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Bring-your-own case review',
      'SVA completion certificate',
    ],
  },
  'private-prp-prf-ezgel': {
    title: 'Private PRP, PRF & EZ Gel Training',
    subtitle: 'Dedicated 1:1 session',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled with you',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Equipment recommendations tailored to you',
      'SVA completion certificate',
    ],
  },
  'private-bbl-russian-lip': {
    title: 'Private Non-Surgical BBL & Russian Lip Technique',
    subtitle: 'Dedicated 1:1 in-person intensive',
    price: '$5,000',
    priceInt: 500000,
    type: 'Private 1:1 · In-person hands-on',
    includes: [
      'Dedicated 1:1 in-person hands-on day',
      'Live models sourced for your session',
      'Pre-reading and protocols',
      'All product and supplies',
      'Professional portfolio photos',
      'One free follow-up 1:1 Zoom consult',
      'SVA completion certificate',
    ],
  },
}

function CheckoutForm() {
  const searchParams = useSearchParams()
  const cartMode = searchParams.get('from') === 'cart'
  const courseKey = !cartMode ? (searchParams.get('course') ?? 'iv-therapy-training') : null
  const course = courseKey ? (COURSE_CATALOG[courseKey] ?? COURSE_CATALOG['iv-therapy-training']) : null

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

  // Determine the scheduling mode for the current cart. Live-Zoom items need
  // a cohort picker; manually-scheduled items (in-person / private 1:1)
  // skip the picker because admin schedules with the learner after payment.
  const keysForCart: string[] = cartMode
    ? cartItems.map((i) => i.key)
    : courseKey
      ? [courseKey]
      : []
  const anyManual = keysForCart.some(isManuallyScheduled)
  const allManual = keysForCart.length > 0 && keysForCart.every(isManuallyScheduled)
  const mixedScheduling = anyManual && !allManual

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        setLoggedInEmail(user.email ?? '')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load upcoming cohorts for live-Zoom carts. Admin bulk-creates cohorts
  // for every course on the same date/time so we fetch a canonical per-lane
  // slug to get the candidate dates — the webhook then resolves each
  // purchased course's own cohort row by matching meeting_at.
  //
  // Lane resolution:
  //  - All aesthetic → botox-basic cohort list
  //  - Anything else (IV, bundle, mixed IV+aesthetic) → iv-therapy-training
  //  - All manually-scheduled (in-person / private) → skip entirely
  useEffect(() => {
    async function loadCohorts() {
      if (keysForCart.length === 0 || allManual) {
        setCohorts([])
        setCohortsLoading(false)
        setSelectedCohortId(null)
        return
      }
      const liveZoomKeys = keysForCart.filter((k) => !isManuallyScheduled(k))
      const allAesthetic = liveZoomKeys.every((k) => AESTHETIC_KEYS.has(k))
      const cohortSlug = allAesthetic ? 'botox-basic' : 'iv-therapy-training'
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
  }, [courseKey, cartMode, cartItems, allManual]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Build the list of course keys to purchase. Cart mode honors every item
    // in the user's cart; single-course mode is a one-item list.
    const targetCourseKeys = (
      cartMode
        ? cartItems.map((i) => i.key)
        : courseKey
          ? [courseKey]
          : []
    ) as SvaCourseKey[]
    if (targetCourseKeys.length === 0) {
      toast.error('No course selected')
      return
    }

    if (mixedScheduling) {
      toast.error(
        'In-person and private 1:1 courses must be purchased separately from live-Zoom courses.'
      )
      return
    }

    if (!allManual && !selectedCohortId) {
      toast.error('Please pick a cohort date before continuing.')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create the Supabase account (if not logged in) so we have a
      // user to attach the purchase to when the webhook fires. The Supabase
      // browser client writes the session cookie before signUp() resolves,
      // which means our server route can read auth.getUser() from cookies
      // on the very next request.
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
          await supabase
            .from('profiles')
            .update({
              license_type: licenseType,
              license_number: licenseNumber.trim().toUpperCase(),
              license_state: licenseState,
            })
            .eq('id', data.user.id)
        }
      }

      // Step 2: Mint a dynamic JidoPay checkout session on the server. The
      // route validates the user, looks up authoritative prices, calls
      // jidopay.com/api/v1/checkout with a Bearer key we hold server-side,
      // and returns a buy.stripe.com URL we can iframe in the embed modal.
      const createRes = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseKeys: targetCourseKeys,
          // cohortId omitted for manually-scheduled carts — admin schedules
          // each session directly with the learner after payment.
          cohortId: allManual ? null : selectedCohortId,
        }),
      })
      const createJson = await createRes.json().catch(() => ({}))
      if (!createRes.ok || !createJson.url) {
        toast.error(
          createJson.error ??
            'Could not start checkout. Please try again in a moment.'
        )
        setLoading(false)
        return
      }

      if (typeof window === 'undefined' || !window.JidoPay) {
        toast.error('Checkout failed to load. Please refresh and try again.')
        setLoading(false)
        return
      }

      if (cartMode) clearCart()

      window.JidoPay.openCheckout({ url: createJson.url })

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

                {/* Scheduling: cohort picker for live-Zoom, "admin schedules"
                    notice for in-person and private 1:1 purchases. */}
                <div className={!isLoggedIn ? 'border-t border-[#D9D9D9] pt-5' : ''}>
                  {mixedScheduling ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Please check out separately</p>
                      <p className="mt-1 text-xs">
                        In-person and Private 1:1 courses must be purchased separately from standard live-Zoom courses so we can schedule each correctly.
                      </p>
                    </div>
                  ) : allManual ? (
                    <>
                      <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-1">
                        Scheduling
                      </p>
                      <p className="text-xs text-[#5B5B5B] mb-4">
                        Our team will contact you within 1 business day to schedule your session at a time that works for you.
                      </p>
                      <div className="rounded-xl border border-[#9E50E5]/30 bg-[#FBF6FF] p-4 text-sm text-[#1a1a1a]">
                        <p className="font-semibold flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#9E50E5]" />
                          Flexible scheduling
                        </p>
                        <p className="mt-1 text-xs text-[#5B5B5B]">
                          After payment you&apos;ll receive a confirmation email and our clinical team will reach out directly to set the date. Course materials unlock 48 hours before your scheduled session so you can prep.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      {allManual
                        ? 'Admin will schedule with you after payment'
                        : 'Access unlocks 48h before your session'}
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
                    <span className="text-sm text-[#5B5B5B]">Format</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {allManual ? 'Scheduled with you' : 'Live instructor-led'}
                    </span>
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
