'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, ArrowRight, Star, Zap, Shield, ShoppingCart, Clock, Users, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { useCart } from '@/lib/cart'

// Catalog mirror — must stay in sync with src/lib/jidopay.ts COURSE_PRICES
// and COURSE_TITLES. Those are the server-authoritative source; this array
// carries the marketing copy the pricing page renders.

type Lane = 'iv' | 'aesthetic'
type Delivery = 'live-zoom' | 'in-person' | 'private-1on1'
type Tier = 'flagship' | 'masterclass' | 'bundle' | 'hands-on'

type Course = {
  key: string
  lane: Lane
  delivery: Delivery
  tier: Tier
  badge: string
  badgeBg: string
  featured: boolean
  title: string
  subtitle: string
  price: string
  priceInt: number
  originalPrice?: string
  type: string
  description: string
  includes: string[]
}

const CORE_BADGE = 'bg-[#9E50E5] text-white'
const BUNDLE_BADGE = 'bg-emerald-500 text-white'
const ADDON_BADGE = 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30'
const IN_PERSON_BADGE = 'bg-amber-500 text-white'
const PRIVATE_BADGE = 'bg-[#1a1a1a] text-white'

const COURSES: Course[] = [
  // ───────── IV Lane — Online Live Zoom ─────────
  {
    key: 'iv-therapy-training',
    lane: 'iv',
    delivery: 'live-zoom',
    tier: 'flagship',
    badge: 'Flagship Course',
    badgeBg: CORE_BADGE,
    featured: true,
    title: 'Comprehensive IV Therapy Training',
    subtitle: 'Live Zoom · 4 hours',
    price: '$399',
    priceInt: 39900,
    type: 'Live 4-hour Zoom session',
    description:
      'The complete foundational certification for IV therapy providers. Everything you need to safely add IV services to your practice — taught live over Zoom.',
    includes: [
      'IV therapy fundamentals',
      'Venous anatomy & patient assessment',
      'Equipment, supplies & insertion technique',
      'Hydration & electrolyte protocols',
      'Infection control & safety standards',
      'Scope of practice & documentation',
      'Certificate of completion',
    ],
  },
  {
    key: 'iv-complications-emergency',
    lane: 'iv',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Masterclass',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'IV Complications & Emergency Management',
    subtitle: 'Live Zoom · IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live 4-hour Zoom session',
    description:
      'Recognize and manage IV complications confidently — from infiltration to anaphylaxis, with the emergency protocols every IV provider needs.',
    includes: [
      'Identifying IV complications',
      'Infiltration & extravasation management',
      'Phlebitis prevention & treatment',
      'Anaphylaxis protocols & epinephrine dosing',
      'Air embolism & fluid overload',
      'Emergency documentation',
    ],
  },
  {
    key: 'vitamin-nutrient-therapy',
    lane: 'iv',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Masterclass',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Live Zoom · IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live 4-hour Zoom session',
    description:
      'Deep-dive into vitamin pharmacology, advanced nutrient protocols, and safe mixing and dosing strategies for IV wellness practices.',
    includes: [
      'Vitamin pharmacology fundamentals',
      'Vitamin C & B-complex protocols',
      'Magnesium, zinc & trace elements',
      'Glutathione therapy',
      'Amino acids & nutrient combinations',
      'Mixing compatibility & dosing',
    ],
  },
  {
    key: 'nad-plus-masterclass',
    lane: 'iv',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Masterclass',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Live Zoom · IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live 4-hour Zoom session',
    description:
      'Master NAD+ infusion protocols for anti-aging, cellular repair, and recovery — including rate titration and managing the niacin flush.',
    includes: [
      'Science behind NAD+ therapy',
      'Standard & high-dose protocols',
      'Rate titration & side-effect management',
      'Anti-aging & cellular repair applications',
      'Patient selection & contraindications',
      'Documentation & billing considerations',
    ],
  },
  {
    key: 'iv-push-administration',
    lane: 'iv',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Masterclass',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'IV Push Administration Masterclass',
    subtitle: 'Live Zoom · IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live 4-hour Zoom session',
    description:
      'Safe and effective IV push techniques including glutathione and vitamin pushes — with the rate management and monitoring that keep it safe.',
    includes: [
      'IV push vs infusion — clinical distinctions',
      'Step-by-step push administration',
      'Safe administration rates',
      'Glutathione IV push protocols',
      'Vitamin push techniques',
      'Monitoring & safety considerations',
    ],
  },

  // ───────── Aesthetic Lane — Online Live Zoom ─────────
  {
    key: 'aesthetic-injector-bundle',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'bundle',
    badge: 'Best Value',
    badgeBg: BUNDLE_BADGE,
    featured: true,
    title: 'Complete Aesthetic Injector Bundle',
    subtitle: 'All 4 Botox + Dermal Filler Trainings',
    price: '$1,000',
    priceInt: 100000,
    originalPrice: '$1,796',
    type: 'Save $796',
    description:
      'The complete aesthetic injector starter pack — Basic Botox, Advanced Botox, Basic Dermal Fillers, and Advanced Dermal Fillers. Everything you need to start offering aesthetic services.',
    includes: [
      'Basic Botox Training',
      'Advanced Botox Training',
      'Basic Dermal Filler Training',
      'Advanced Dermal Filler Training',
      'Four live Zoom sessions (16 hours total)',
      'Certificates of completion',
    ],
  },
  {
    key: 'botox-basic',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'flagship',
    badge: 'Foundational',
    badgeBg: CORE_BADGE,
    featured: false,
    title: 'Basic Botox Training',
    subtitle: 'Live Zoom · 4 hours',
    price: '$399',
    priceInt: 39900,
    type: 'Live 4-hour Zoom session',
    description:
      'The foundational neurotoxin training for aesthetic injectors. Pharmacology, facial anatomy, and the upper-face injection patterns patients request most.',
    includes: [
      'Neurotoxin pharmacology & brand comparison',
      'Facial muscle anatomy for injectors',
      'Consultation & patient assessment',
      'Glabella, forehead & crow\u2019s feet patterns',
      'Reconstitution & dosing fundamentals',
      'Consent & documentation',
    ],
  },
  {
    key: 'botox-advanced',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Advanced',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'Advanced Botox Training',
    subtitle: 'Live Zoom · 4 hours',
    price: '$499',
    priceInt: 49900,
    type: 'Live 4-hour Zoom session',
    description:
      'Advanced neurotoxin technique — masseter, lip flip, chin dimpling, and the troubleshooting that separates competent injectors from great ones.',
    includes: [
      'Masseter reduction & lower-face applications',
      'Lip flip & gummy-smile correction',
      'Advanced upper-face refinements',
      'Asymmetry & ptosis troubleshooting',
      'Managing suboptimal results',
      'Prereq: Basic Botox or equivalent',
    ],
  },
  {
    key: 'filler-basic',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'flagship',
    badge: 'Foundational',
    badgeBg: CORE_BADGE,
    featured: false,
    title: 'Basic Dermal Filler Training',
    subtitle: 'Live Zoom · 4 hours',
    price: '$399',
    priceInt: 39900,
    type: 'Live 4-hour Zoom session',
    description:
      'The foundational dermal filler training — HA product selection, lip technique, and the complication-management skills every injector needs from day one.',
    includes: [
      'HA filler rheology & product selection',
      'Facial anatomy & danger zones',
      'Lip injection technique',
      'Needle vs cannula decision-making',
      'Vascular occlusion recognition',
      'Hyaluronidase emergency protocol',
    ],
  },
  {
    key: 'filler-advanced',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Advanced',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'Advanced Dermal Filler Training',
    subtitle: 'Live Zoom · 4 hours',
    price: '$499',
    priceInt: 49900,
    type: 'Live 4-hour Zoom session',
    description:
      'Advanced filler technique for the mid-face and beyond — cheek and jawline contouring, full-face assessment, and the revision techniques for complex cases.',
    includes: [
      'Cheek & midface volumization',
      'Jawline contouring',
      'Chin & pre-jowl sulcus',
      'Full-face assessment & treatment planning',
      'Revision techniques for complex cases',
      'Prereq: Basic Filler or equivalent',
    ],
  },
  {
    key: 'prp-prf-ezgel',
    lane: 'aesthetic',
    delivery: 'live-zoom',
    tier: 'masterclass',
    badge: 'Regenerative',
    badgeBg: ADDON_BADGE,
    featured: false,
    title: 'PRP, PRF & EZ Gel Training',
    subtitle: 'Live Zoom · Regenerative Aesthetics',
    price: '$499',
    priceInt: 49900,
    type: 'Live 4-hour Zoom session',
    description:
      'The complete regenerative aesthetic training — PRP, PRF, and EZ Gel. Draw, spin, and injection technique for natural-looking facial rejuvenation.',
    includes: [
      'PRP vs PRF vs EZ Gel — when to use each',
      'Blood draw & centrifuge protocols',
      'Facial rejuvenation injection technique',
      'Volumizing applications with EZ Gel',
      'Combination with microneedling & fillers',
      'Result longevity & retreatment timing',
    ],
  },

  // ───────── In-Person Hands-On ─────────
  {
    key: 'bbl-russian-lip-inperson',
    lane: 'aesthetic',
    delivery: 'in-person',
    tier: 'hands-on',
    badge: 'In-Person Hands-On',
    badgeBg: IN_PERSON_BADGE,
    featured: true,
    title: 'Non-Surgical BBL & Russian Lip Technique',
    subtitle: 'In-Person · 8\u201310 hours',
    price: '$2,500',
    priceInt: 250000,
    type: 'Live hands-on training',
    description:
      'Live, in-person hands-on training in two of the most-requested advanced aesthetic techniques. Small-group instruction with live models and direct mentorship.',
    includes: [
      '8\u201310 hours of live hands-on training',
      'Non-Surgical BBL injection technique',
      'Russian lip technique',
      'Live models provided',
      'Small-group instruction',
      'Certificate of completion',
    ],
  },

  // ───────── Private 1:1 In-Person ─────────
  {
    key: 'private-iv-therapy-training',
    lane: 'iv',
    delivery: 'private-1on1',
    tier: 'flagship',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private Comprehensive IV Therapy Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$798',
    priceInt: 79800,
    type: 'Dedicated 1:1 session',
    description:
      'The Comprehensive IV Therapy Training delivered as a dedicated one-on-one session, scheduled around you. Same curriculum, individualized pace, full attention of your instructor.',
    includes: [
      'Comprehensive IV Therapy curriculum',
      'Dedicated 1:1 instruction',
      'Scheduling flexibility',
      'Personalized Q&A',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-botox-basic',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'flagship',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private Basic Botox Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$798',
    priceInt: 79800,
    type: 'Dedicated 1:1 session',
    description:
      'Basic Botox Training as a one-on-one private session — the same curriculum with individualized instruction and scheduling.',
    includes: [
      'Basic Botox curriculum',
      'Dedicated 1:1 instruction',
      'Scheduling flexibility',
      'Personalized technique feedback',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-botox-advanced',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'masterclass',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private Advanced Botox Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$998',
    priceInt: 99800,
    type: 'Dedicated 1:1 session',
    description:
      'Advanced Botox Training as a one-on-one private session — masseter, lip flip, and advanced technique with individualized mentorship.',
    includes: [
      'Advanced Botox curriculum',
      'Dedicated 1:1 instruction',
      'Scheduling flexibility',
      'Personalized case review',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-filler-basic',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'flagship',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private Basic Dermal Filler Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$798',
    priceInt: 79800,
    type: 'Dedicated 1:1 session',
    description:
      'Basic Dermal Filler Training as a one-on-one private session — the foundational filler curriculum with individualized technique feedback.',
    includes: [
      'Basic Dermal Filler curriculum',
      'Dedicated 1:1 instruction',
      'Scheduling flexibility',
      'Personalized technique feedback',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-filler-advanced',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'masterclass',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private Advanced Dermal Filler Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$998',
    priceInt: 99800,
    type: 'Dedicated 1:1 session',
    description:
      'Advanced Dermal Filler Training as a one-on-one private session — mid-face, jawline, and full-face work with individualized mentorship.',
    includes: [
      'Advanced Dermal Filler curriculum',
      'Dedicated 1:1 instruction',
      'Scheduling flexibility',
      'Personalized case review',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-prp-prf-ezgel',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'masterclass',
    badge: 'Private 1:1',
    badgeBg: PRIVATE_BADGE,
    featured: false,
    title: 'Private PRP, PRF & EZ Gel Training',
    subtitle: '1:1 In-Person · 4 hours',
    price: '$998',
    priceInt: 99800,
    type: 'Dedicated 1:1 session',
    description:
      'PRP, PRF & EZ Gel Training as a one-on-one private session — the complete regenerative aesthetic curriculum with individualized draw and injection technique.',
    includes: [
      'PRP, PRF & EZ Gel curriculum',
      'Dedicated 1:1 instruction',
      'Hands-on draw & spin practice',
      'Personalized injection feedback',
      'Certificate of completion',
    ],
  },
  {
    key: 'private-bbl-russian-lip',
    lane: 'aesthetic',
    delivery: 'private-1on1',
    tier: 'hands-on',
    badge: 'Premium Private',
    badgeBg: PRIVATE_BADGE,
    featured: true,
    title: 'Private Non-Surgical BBL & Russian Lip Technique',
    subtitle: '1:1 In-Person · 8\u201310 hours',
    price: '$5,000',
    priceInt: 500000,
    type: 'Premium 1:1 hands-on',
    description:
      '8\u201310 hours of personalized hands-on instruction in Non-Surgical BBL and Russian Lip technique — the most in-demand advanced procedures, taught one-on-one.',
    includes: [
      '8\u201310 hours of personalized hands-on training',
      'Non-Surgical BBL & Russian Lip technique',
      'Live models provided',
      'Dedicated 1:1 mentorship',
      'Scheduling flexibility',
      'Certificate of completion',
    ],
  },
]

const FILTERS = [
  { key: 'all', label: 'All Courses' },
  { key: 'iv', label: 'IV Therapy' },
  { key: 'aesthetic', label: 'Aesthetics' },
  { key: 'bundle', label: 'Bundles' },
  { key: 'in-person', label: 'In-Person' },
  { key: 'private-1on1', label: 'Private 1:1' },
]

const FAQS = [
  {
    q: 'Who can enroll?',
    a: 'SVA courses are exclusively for licensed healthcare providers — RNs, NPs, PAs, MDs, DOs, LPNs, LVNs, paramedics, and dentists. License verification is required at enrollment.',
  },
  {
    q: 'What is the live Zoom format?',
    a: 'Each online course is a single 4-hour live Zoom session. You\u2019ll see your instructor and fellow learners, ask questions in real time, and receive a certificate of completion.',
  },
  {
    q: 'What\u2019s the difference between group and Private 1:1?',
    a: 'The content is the same. Private 1:1 is delivered as a dedicated session scheduled around your calendar, with the undivided attention of your instructor. Priced at 2\u00d7 the group rate.',
  },
  {
    q: 'How do in-person hands-on trainings work?',
    a: 'Live, 8\u201310 hour training at our location with live models and direct mentorship. Small-group (max 4 learners) for the standard rate, or 1:1 private for Premium Private.',
  },
  {
    q: 'What\u2019s included in the Aesthetic Injector Bundle?',
    a: 'Basic Botox, Advanced Botox, Basic Dermal Fillers, and Advanced Dermal Fillers \u2014 four live Zoom sessions at $1,000 total (save $796 vs. individual purchase).',
  },
  {
    q: 'Can my clinic purchase for multiple providers?',
    a: 'Yes. Group and clinic pricing is available for 3 or more providers. Contact us for multi-seat rates.',
  },
]

export default function PricingPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { addItem, isInCart } = useCart()

  const filtered = COURSES.filter((c) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'iv') return c.lane === 'iv'
    if (activeFilter === 'aesthetic') return c.lane === 'aesthetic'
    if (activeFilter === 'bundle') return c.tier === 'bundle'
    if (activeFilter === 'in-person') return c.delivery === 'in-person'
    if (activeFilter === 'private-1on1') return c.delivery === 'private-1on1'
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#EEEEEE] py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <p className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Course Catalog</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4">
              Clinical Training for Licensed Providers
            </h1>
            <p className="text-lg text-[#5B5B5B] max-w-2xl mx-auto leading-relaxed mb-8">
              Live Zoom certifications in IV therapy and aesthetic injections, plus in-person hands-on training and 1:1 private instruction.
              Taught by experienced clinicians, priced to make advanced training accessible.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              {[
                { icon: Shield, text: 'Licensed providers only' },
                { icon: Zap, text: 'Live interactive instruction' },
                { icon: Users, text: 'Small-group format' },
                { icon: CheckCircle, text: 'Completion certificates' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-[#5B5B5B]">
                  <item.icon className="h-4 w-4 text-[#9E50E5] shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Filter tabs + Grid */}
      <section className="py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {FILTERS.map((f) => {
              const count =
                f.key === 'all'
                  ? COURSES.length
                  : f.key === 'iv' || f.key === 'aesthetic'
                    ? COURSES.filter((c) => c.lane === f.key).length
                    : f.key === 'bundle'
                      ? COURSES.filter((c) => c.tier === 'bundle').length
                      : COURSES.filter((c) => c.delivery === f.key).length
              if (f.key !== 'all' && count === 0) return null
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-6 py-2.5 rounded-[30px] text-sm font-semibold transition-colors ${
                    activeFilter === f.key
                      ? 'bg-[#9E50E5] text-white'
                      : 'bg-[#EEEEEE] text-[#5B5B5B] hover:bg-[#E0E0E0]'
                  }`}
                >
                  {f.label}
                  <span className={`ml-2 text-xs ${activeFilter === f.key ? 'text-white/70' : 'text-[#5B5B5B]/60'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Course grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => {
              const isBookingOnly = course.delivery === 'in-person' || course.delivery === 'private-1on1'
              return (
                <AnimateOnScroll key={course.key} delay={i * 40}>
                  <div className={`rounded-2xl p-7 h-full flex flex-col transition-shadow hover:shadow-lg ${
                    course.featured
                      ? 'border-2 border-[#9E50E5] bg-white'
                      : 'border border-[#D9D9D9] bg-[#FBF6FF]'
                  }`}>
                    <div className="flex items-start justify-between mb-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${course.badgeBg}`}>
                        {course.badge}
                      </span>
                      <div className="text-right">
                        {course.originalPrice && (
                          <div className="text-xs text-[#5B5B5B] line-through">{course.originalPrice}</div>
                        )}
                        <div className="text-2xl font-extrabold text-[#1a1a1a]">{course.price}</div>
                        <div className={`text-[11px] font-medium mt-0.5 ${course.tier === 'bundle' ? 'text-emerald-600' : 'text-[#5B5B5B]'}`}>
                          {course.type}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1 leading-snug">{course.title}</h3>
                    <p className="text-xs font-semibold text-[#9E50E5] mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      {course.delivery === 'in-person' || course.delivery === 'private-1on1' ? (
                        <MapPin className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {course.subtitle}
                    </p>
                    <p className="text-sm text-[#5B5B5B] leading-relaxed mb-5">{course.description}</p>

                    <div className="space-y-2 mb-7 flex-1">
                      {course.includes.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-[#5B5B5B]">
                          <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#9E50E5]" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addItem({ key: course.key, title: course.title, price: course.price, priceInt: course.priceInt, subtitle: course.subtitle })
                          toast.success(`${course.title} added to cart`)
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[30px] font-semibold text-sm transition-colors ${
                          isInCart(course.key)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                            : 'border border-[#9E50E5] text-[#9E50E5] hover:bg-[#FBF6FF]'
                        }`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {isInCart(course.key) ? 'In Cart' : 'Add to Cart'}
                      </button>
                      <Link
                        href={`/course/${course.key}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[30px] font-semibold text-sm bg-[#9E50E5] hover:bg-[#7B3DB8] text-white transition-colors"
                      >
                        {isBookingOnly ? 'Details' : 'View'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#EEEEEE] py-16">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Frequently asked questions</h2>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => (
              <AnimateOnScroll key={faq.q} delay={i * 50}>
                <div className="bg-white rounded-xl border border-[#D9D9D9] p-6 h-full">
                  <h3 className="font-semibold text-[#1a1a1a] mb-2 text-sm flex items-start gap-2">
                    <Star className="h-4 w-4 text-[#9E50E5] mt-0.5 shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-sm text-[#5B5B5B] leading-relaxed pl-6">{faq.a}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll className="mt-10 text-center">
            <p className="text-[#5B5B5B] text-sm mb-4">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-[30px] border border-[#9E50E5] text-[#9E50E5] hover:bg-[#9E50E5] hover:text-white font-semibold text-sm transition-colors"
            >
              Contact us
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
