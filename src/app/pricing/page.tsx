'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, ArrowRight, Star, Zap, Shield, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { useCart } from '@/lib/cart'

const COURSES = [
  {
    key: 'iv-therapy-certification',
    category: 'core',
    badge: 'Core Course',
    badgeBg: 'bg-[#9E50E5] text-white',
    featured: true,
    title: 'IV Therapy Certification',
    subtitle: 'Core Certification — 12 Modules',
    price: '$299',
    priceInt: 29900,
    type: 'One-time · Lifetime access',
    description: 'The foundational IV therapy certification for healthcare professionals. 12 comprehensive modules covering everything you need to safely add IV services to your practice.',
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
  },
  {
    key: 'complete-mastery-bundle',
    category: 'bundle',
    badge: 'Best Value',
    badgeBg: 'bg-emerald-500 text-white',
    featured: true,
    title: 'Complete IV Therapy Mastery Bundle',
    subtitle: 'Core Course + All 4 Masterclasses',
    price: '$499',
    priceInt: 49900,
    originalPrice: '$895',
    type: 'One-time · Save $396',
    description: 'Everything you need to master IV therapy. The Core Certification plus all four Advanced Masterclasses — the most complete IV therapy education available.',
    includes: [
      'IV Therapy Certification (Core)',
      'Advanced IV Complications & Emergency Mgmt',
      'Vitamin & Nutrient Therapy Masterclass',
      'NAD+ Therapy Masterclass',
      'IV Push Administration Masterclass',
      'All future course updates included',
      'Priority community support',
    ],
  },
  {
    key: 'iv-complications-emergency',
    category: 'addon',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'Advanced IV Complications & Emergency Management',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    description: 'Master the recognition and management of IV complications and emergency situations to keep your patients safe.',
    includes: [
      'Identifying IV complications',
      'Infiltration & extravasation management',
      'Phlebitis prevention & treatment',
      'Allergic reactions & anaphylaxis protocols',
      'Air embolism awareness',
      'Emergency management & documentation',
    ],
  },
  {
    key: 'vitamin-nutrient-therapy',
    category: 'addon',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    description: 'Deep-dive into vitamin pharmacology, advanced nutrient protocols, and safe mixing and dosing strategies.',
    includes: [
      'Vitamin pharmacology fundamentals',
      'Vitamin C & B complex protocols',
      'Magnesium, zinc & trace elements',
      'Glutathione therapy',
      'Amino acids & nutrient combinations',
      'Mixing compatibility & dosing strategies',
    ],
  },
  {
    key: 'nad-plus-masterclass',
    category: 'addon',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    description: 'Master NAD+ infusion protocols for anti-aging, cellular repair, and addiction recovery applications.',
    includes: [
      'Science behind NAD+ therapy',
      'Anti-aging & cellular repair benefits',
      'Infusion protocols & dosing',
      'Infusion rates & monitoring',
      'Managing common side effects',
      'Patient selection & contraindications',
    ],
  },
  {
    key: 'iv-push-administration',
    category: 'addon',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'IV Push Administration Masterclass',
    subtitle: 'Advanced Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    description: 'Learn safe and effective IV push techniques including glutathione, vitamin push protocols, and safe administration rates.',
    includes: [
      'IV push vs infusion techniques',
      'Step-by-step IV push administration',
      'Safe medication administration rates',
      'Glutathione IV push protocols',
      'Vitamin push techniques',
      'Safety considerations & monitoring',
    ],
  },
]

const FILTERS = [
  { key: 'all', label: 'All Courses' },
  { key: 'core', label: 'Core Course' },
  { key: 'addon', label: 'Masterclasses' },
  { key: 'bundle', label: 'Bundle' },
]

const FAQS = [
  {
    q: 'Who can enroll?',
    a: 'SVA courses are exclusively for licensed healthcare providers — RNs, NPs, PAs, MDs, DOs, LPNs, LVNs, paramedics, and other licensed clinicians. License verification is required at enrollment.',
  },
  {
    q: 'Is access really lifetime?',
    a: 'Yes. One purchase gives you permanent access including all future updates to that course. No subscriptions, no renewals, no expiry.',
  },
  {
    q: 'Do I need the Core Course before the masterclasses?',
    a: 'Yes — the Advanced Masterclasses build on foundational IV therapy knowledge. We strongly recommend completing the Core Course first, or purchase the Complete Bundle to get everything at once.',
  },
  {
    q: 'What does the bundle include?',
    a: 'The Complete IV Therapy Mastery Bundle includes the Core Course ($299) plus all four Advanced Masterclasses ($149 each) — a total value of $895, bundled at $499.',
  },
  {
    q: 'Are CEU credits available?',
    a: 'SVA is working toward accreditation. Completion certificates are issued for all courses and can be submitted to many state boards for continuing education credit.',
  },
  {
    q: 'Can my clinic purchase for multiple providers?',
    a: 'Yes. Group and clinic pricing is available for 3 or more providers. Contact us for multi-seat rates.',
  },
]

export default function PricingPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { addItem, isInCart } = useCart()

  const filtered = activeFilter === 'all' ? COURSES : COURSES.filter((c) => c.category === activeFilter)

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#EEEEEE] py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <p className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Course Catalog</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4">
              IV Therapy Certification Courses
            </h1>
            <p className="text-lg text-[#5B5B5B] max-w-2xl mx-auto leading-relaxed mb-8">
              Start with the Core Course, then expand your expertise with Advanced Masterclasses.
              Or save $396 with the Complete Bundle.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              {[
                { icon: Shield, text: 'Licensed providers only' },
                { icon: Zap, text: 'Instant access after payment' },
                { icon: Star, text: 'Lifetime access included' },
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
              const count = f.key === 'all' ? COURSES.length : COURSES.filter((c) => c.category === f.key).length
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
            {filtered.map((course, i) => (
              <AnimateOnScroll key={course.key} delay={i * 60}>
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
                      <div className={`text-[11px] font-medium mt-0.5 ${course.category === 'bundle' ? 'text-emerald-600' : 'text-[#5B5B5B]'}`}>
                        {course.type}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1 leading-snug">{course.title}</h3>
                  <p className="text-xs font-semibold text-[#9E50E5] mb-3 uppercase tracking-wide">{course.subtitle}</p>
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
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
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
