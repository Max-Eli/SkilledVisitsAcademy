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
    key: 'iv-therapy-foundation',
    category: 'iv',
    badge: 'Most Popular',
    badgeBg: 'bg-[#9E50E5] text-white',
    featured: true,
    title: 'IV Therapy Foundation',
    subtitle: 'Core Certification Course',
    price: '$199',
    priceInt: 19900,
    type: 'One-time · Lifetime access',
    description: 'The complete foundational certification for IV therapy providers. Everything you need to practice safely and confidently.',
    includes: [
      'Full video course library',
      'SVA-approved protocol library',
      'Vitamin & mixing reference tools',
      'Dosage calculator',
      'AI lab test analyzer',
      'Professional community access',
      'Completion certificate',
    ],
  },
  {
    key: 'complete-bundle',
    category: 'bundle',
    badge: 'Best Value',
    badgeBg: 'bg-emerald-500 text-white',
    featured: true,
    title: 'Complete IV Therapy Bundle',
    subtitle: 'Foundation + All IV Add-ons',
    price: '$349',
    priceInt: 34900,
    type: 'One-time · Save $128',
    description: 'Everything in Foundation plus Myers Cocktail Masterclass and NAD+ Therapy. The best investment for serious IV providers.',
    includes: [
      'Everything in IV Therapy Foundation',
      'Myers Cocktail Masterclass',
      'NAD+ Therapy Certification',
      'All future IV therapy updates',
      'Priority community support',
    ],
  },
  {
    key: 'myers-cocktail-masterclass',
    category: 'iv',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'Myers Cocktail Masterclass',
    subtitle: 'Advanced IV Add-on',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Foundation',
    description: 'Deep-dive into the gold standard IV protocol with clinical case studies and patient assessment modules.',
    includes: [
      'In-depth Myers Cocktail protocol',
      'Clinical case studies',
      'Patient assessment module',
      'Live Q&A recordings',
      'Printable reference card',
    ],
  },
  {
    key: 'nad-plus-therapy',
    category: 'iv',
    badge: 'Add-on',
    badgeBg: 'bg-[#FBF6FF] text-[#9E50E5] border border-[#9E50E5]/30',
    featured: false,
    title: 'NAD+ Therapy Certification',
    subtitle: 'Advanced IV Add-on',
    price: '$129',
    priceInt: 12900,
    type: 'One-time · Requires Foundation',
    description: 'Master NAD+ infusion protocols for addiction recovery, cognitive support, and anti-aging applications.',
    includes: [
      'Complete NAD+ infusion protocol',
      'Addiction recovery applications',
      'Anti-aging & cognitive protocols',
      'Patient screening forms',
      'Adverse reaction management',
    ],
  },
  {
    key: 'filler-fundamentals',
    category: 'aesthetics',
    badge: 'Aesthetics',
    badgeBg: 'bg-pink-100 text-pink-700',
    featured: false,
    title: 'Filler Fundamentals',
    subtitle: 'Aesthetics Certification',
    price: '$249',
    priceInt: 24900,
    type: 'One-time · Lifetime access',
    description: 'Comprehensive training in dermal filler techniques, facial anatomy, and safe injection practices.',
    includes: [
      'Facial anatomy deep dive',
      'Injection techniques',
      'Product selection guide',
      'Complication management',
      'Case review library',
      'Completion certificate',
    ],
  },
  {
    key: 'botox-neurotoxins',
    category: 'aesthetics',
    badge: 'Aesthetics',
    badgeBg: 'bg-pink-100 text-pink-700',
    featured: false,
    title: 'Botox & Neurotoxins',
    subtitle: 'Aesthetics Certification',
    price: '$249',
    priceInt: 24900,
    type: 'One-time · Lifetime access',
    description: 'Complete training in neurotoxin injections, patient consultation, and treatment protocols from beginner to advanced.',
    includes: [
      'Neurotoxin mechanisms & products',
      'Injection mapping & dosing',
      'Treatment area protocols',
      'Patient consultation framework',
      'Complication management',
      'Completion certificate',
    ],
  },
]

const FILTERS = [
  { key: 'all', label: 'All Courses' },
  { key: 'iv', label: 'IV Therapy' },
  { key: 'aesthetics', label: 'Aesthetics' },
  { key: 'bundle', label: 'Bundles' },
]

const FAQS = [
  {
    q: 'Who can enroll?',
    a: 'SVA courses are exclusively for licensed healthcare providers — RNs, NPs, PAs, MDs, DOs, LPNs, paramedics, and other licensed clinicians. License verification is required at enrollment.',
  },
  {
    q: 'Is access really lifetime?',
    a: 'Yes. One purchase gives you permanent access including all future updates to that course. No subscriptions, no renewals, no expiry.',
  },
  {
    q: 'Do I need Foundation before the add-ons?',
    a: 'The IV add-on courses assume foundational IV therapy knowledge. We strongly recommend Foundation first, or purchase the Complete Bundle to get everything at once.',
  },
  {
    q: 'Are aesthetics courses standalone?',
    a: 'Yes — Filler Fundamentals and Botox & Neurotoxins are fully standalone courses open to any licensed provider.',
  },
  {
    q: 'Are CEU credits available?',
    a: 'SVA is working toward accreditation. Completion certificates are issued for all courses and can be submitted to many state boards for continuing education.',
  },
  {
    q: 'Can my clinic purchase for multiple providers?',
    a: 'Yes. Group/clinic pricing is available for 3+ providers. Contact us for multi-seat rates.',
  },
]

export default function PricingPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { addItem, isInCart } = useCart()

  const filtered = activeFilter === 'all'
    ? COURSES
    : COURSES.filter((c) => c.category === activeFilter)

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#EEEEEE] py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <p className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Course Catalog</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4">
              Professional medical education
            </h1>
            <p className="text-lg text-[#5B5B5B] max-w-xl mx-auto leading-relaxed mb-8">
              One-time course purchases with lifetime access. No subscriptions — buy exactly what you need.
            </p>
            {/* Trust badges */}
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
            {FILTERS.map((f) => (
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
                  {f.key === 'all' ? COURSES.length : COURSES.filter((c) => c.category === f.key).length}
                </span>
              </button>
            ))}
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
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-5">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${course.badgeBg}`}>
                      {course.badge}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-[#1a1a1a]">{course.price}</div>
                      <div className={`text-[11px] font-medium mt-0.5 ${course.category === 'bundle' ? 'text-emerald-600' : 'text-[#5B5B5B]'}`}>
                        {course.type}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">{course.title}</h3>
                  <p className="text-xs font-semibold text-[#9E50E5] mb-3 uppercase tracking-wide">{course.subtitle}</p>
                  <p className="text-sm text-[#5B5B5B] leading-relaxed mb-5">{course.description}</p>

                  {/* Includes */}
                  <div className="space-y-2 mb-7 flex-1">
                    {course.includes.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-[#5B5B5B]">
                        <CheckCircle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${course.category === 'aesthetics' ? 'text-pink-500' : 'text-[#9E50E5]'}`} />
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
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
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[30px] font-semibold text-sm transition-colors ${
                        course.featured
                          ? 'bg-[#9E50E5] hover:bg-[#7B3DB8] text-white'
                          : 'bg-[#9E50E5] hover:bg-[#7B3DB8] text-white'
                      }`}
                    >
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-[#5B5B5B]">
              No courses found for this filter.
            </div>
          )}
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
