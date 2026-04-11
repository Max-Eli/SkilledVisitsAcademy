'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import {
  CheckCircle, ShoppingCart, ArrowRight, Lock, Shield,
  Zap, Star, Clock, Users, Award, BookOpen, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { useState } from 'react'

const COURSES: Record<string, {
  key: string
  title: string
  subtitle: string
  category: string
  price: string
  priceInt: number
  originalPrice?: string
  type: string
  badge?: string
  tagline: string
  description: string
  longDescription: string
  duration: string
  lessons: number
  students: string
  level: string
  includes: string[]
  curriculum: { section: string; lessons: string[] }[]
  faqs: { q: string; a: string }[]
  instructorNote: string
  relatedCourses: string[]
}> = {
  'iv-therapy-foundation': {
    key: 'iv-therapy-foundation',
    title: 'IV Therapy Foundation',
    subtitle: 'Core Certification Course',
    category: 'IV Therapy',
    price: '$199',
    priceInt: 19900,
    type: 'One-time · Lifetime access',
    badge: 'Most Popular',
    tagline: 'The definitive IV therapy certification for licensed healthcare providers.',
    description: 'The complete foundational certification for IV therapy providers. Everything you need to practice safely and confidently — from vascular access and sterile technique to fluid selection and adverse event management.',
    longDescription: 'SVA\'s IV Therapy Foundation course is the most comprehensive IV therapy certification available for licensed healthcare providers. Built by experienced IV therapy clinicians, this course covers everything from patient assessment and vein selection to safe mixing protocols and managing complications. Upon completion, you\'ll receive your SVA certification and have lifetime access to all course materials, including future updates.',
    duration: '8–10 hours',
    lessons: 24,
    students: '500+',
    level: 'Beginner to Intermediate',
    includes: [
      'Full video course library (24 lessons)',
      'SVA-approved protocol library',
      'Vitamin & additive reference database',
      'Interactive mixing compatibility guide',
      'Weight-based dosage calculator',
      'AI-powered lab test analyzer',
      'Professional community access',
      'SVA completion certificate',
      'Lifetime access + all future updates',
    ],
    curriculum: [
      {
        section: 'Module 1: Foundations of IV Therapy',
        lessons: [
          'Introduction to IV therapy & scope of practice',
          'Anatomy of the venous system',
          'Patient assessment & contraindications',
          'Infection control & sterile technique',
        ],
      },
      {
        section: 'Module 2: Vascular Access & Equipment',
        lessons: [
          'Catheter selection & gauge guide',
          'Peripheral IV insertion technique',
          'Securing & maintaining access',
          'Troubleshooting infiltration & phlebitis',
        ],
      },
      {
        section: 'Module 3: IV Fluids & Solutions',
        lessons: [
          'Crystalloids vs colloids overview',
          'Normal saline, LR, D5W — clinical applications',
          'Fluid rate calculation',
          'Additive compatibility essentials',
        ],
      },
      {
        section: 'Module 4: Common IV Additives',
        lessons: [
          'B-vitamins: B1, B2, B3, B5, B6, B12',
          'Vitamin C (ascorbic acid) — high-dose protocols',
          'Magnesium, zinc, and trace elements',
          'Glutathione administration',
          'Amino acids & NAD+ basics',
        ],
      },
      {
        section: 'Module 5: Safety, Complications & Documentation',
        lessons: [
          'Adverse reactions: recognition & management',
          'Anaphylaxis protocol',
          'Documentation & consent requirements',
          'Regulatory compliance & state scope of practice',
          'Course review & certification exam',
        ],
      },
    ],
    faqs: [
      { q: 'What license types are eligible?', a: 'RNs, NPs, PAs, MDs, DOs, LPNs, LVNs, paramedics, and other licensed clinicians. License verification is required at enrollment.' },
      { q: 'How long do I have access?', a: 'Lifetime access. One purchase — no subscriptions, no renewals. All future updates to this course are included.' },
      { q: 'Is this CME/CEU accredited?', a: 'SVA is working toward full accreditation. A completion certificate is issued and accepted by many state boards for CE credit.' },
      { q: 'Can I access this on mobile?', a: 'Yes. The platform is fully responsive and works on phones, tablets, and desktop.' },
      { q: 'What if I need a refund?', a: 'We offer a 7-day refund if you\'ve completed less than 20% of the course. Contact us at hello@skilledvisitsacademy.com.' },
    ],
    instructorNote: 'This course was developed by SVA\'s clinical team — active IV therapy practitioners with 10+ years of mobile and clinical IV experience. Every protocol is evidence-based and reviewed annually.',
    relatedCourses: ['complete-bundle', 'myers-cocktail-masterclass', 'nad-plus-therapy'],
  },
  'complete-bundle': {
    key: 'complete-bundle',
    title: 'Complete IV Therapy Bundle',
    subtitle: 'Foundation + All IV Add-ons',
    category: 'Bundle',
    price: '$349',
    priceInt: 34900,
    originalPrice: '$477',
    type: 'One-time · Save $128',
    badge: 'Best Value',
    tagline: 'Everything you need to master IV therapy — at the best price.',
    description: 'The complete IV therapy package: Foundation certification plus Myers Cocktail Masterclass and NAD+ Therapy Certification. Save $128 versus buying separately.',
    longDescription: 'The Complete IV Therapy Bundle gives you everything in the Foundation course plus our two most popular advanced modules. If you\'re serious about building or growing an IV therapy practice, this is the most efficient and cost-effective way to get fully trained and certified.',
    duration: '20–24 hours total',
    lessons: 52,
    students: '200+',
    level: 'Beginner to Advanced',
    includes: [
      'Everything in IV Therapy Foundation (24 lessons)',
      'Myers Cocktail Masterclass (14 lessons)',
      'NAD+ Therapy Certification (14 lessons)',
      'All future IV therapy course updates',
      'Priority community support',
      'All reference tools & calculators',
      'All SVA completion certificates',
      'Save $128 vs. buying separately',
    ],
    curriculum: [
      { section: 'IV Therapy Foundation', lessons: ['All 24 Foundation lessons — see Foundation course for full curriculum'] },
      { section: 'Myers Cocktail Masterclass', lessons: ['Myers Cocktail history & formulation', 'Clinical indications & patient selection', 'Protocol walkthrough & dosing', 'Case studies & live Q&A recordings'] },
      { section: 'NAD+ Therapy Certification', lessons: ['NAD+ mechanism & clinical evidence', 'Infusion protocols & rates', 'Addiction recovery applications', 'Anti-aging & cognitive protocols', 'Adverse reaction management'] },
    ],
    faqs: [
      { q: 'What\'s included in this bundle?', a: 'IV Therapy Foundation + Myers Cocktail Masterclass + NAD+ Therapy Certification. All three courses with lifetime access.' },
      { q: 'Can I buy the add-ons separately later?', a: 'Yes, but the bundle saves you $128. Add-ons require Foundation as a prerequisite.' },
      { q: 'How long does this take to complete?', a: 'The full bundle is approximately 20–24 hours of video content. Most providers complete it over 2–4 weeks.' },
    ],
    instructorNote: 'The bundle is our most popular option for providers launching or scaling an IV therapy practice. Getting certified across all three programs sets you apart significantly.',
    relatedCourses: ['iv-therapy-foundation', 'filler-fundamentals', 'botox-neurotoxins'],
  },
  'myers-cocktail-masterclass': {
    key: 'myers-cocktail-masterclass',
    title: 'Myers Cocktail Masterclass',
    subtitle: 'Advanced IV Add-on',
    category: 'IV Therapy',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Foundation',
    tagline: 'Master the most requested IV protocol in wellness medicine.',
    description: 'Deep-dive into the gold standard IV protocol with clinical case studies, formulation variations, and advanced patient assessment modules.',
    longDescription: 'The Myers Cocktail is the most widely administered IV protocol in the wellness space. This advanced module goes beyond the basics — covering formulation science, patient phenotyping, clinical case reviews, and protocol optimization for maximum outcomes.',
    duration: '5–6 hours',
    lessons: 14,
    students: '300+',
    level: 'Intermediate (Foundation required)',
    includes: [
      'In-depth Myers Cocktail formulation guide',
      'Clinical case studies (6 patient profiles)',
      'Formulation variations & customization',
      'Patient assessment & phenotyping module',
      'Live Q&A recording library',
      'Printable clinical reference card',
      'Completion certificate',
    ],
    curriculum: [
      { section: 'Module 1: Myers Cocktail Deep Dive', lessons: ['History & clinical evidence', 'Standard formulation & ingredient roles', 'Formulation variations (high-dose C, magnesium push)', 'Contraindications & drug interactions'] },
      { section: 'Module 2: Patient Assessment & Selection', lessons: ['Identifying ideal candidates', 'Pre-infusion screening checklist', 'Setting patient expectations', 'Frequency & maintenance protocols'] },
      { section: 'Module 3: Clinical Case Studies', lessons: ['Case 1: Chronic fatigue & fibromyalgia', 'Case 2: Athletic recovery', 'Case 3: Immune support & seasonal illness', 'Case 4: Migraine management', 'Live Q&A recordings — top clinical questions'] },
    ],
    faqs: [
      { q: 'Do I need the Foundation course first?', a: 'Yes. This course assumes foundational IV therapy knowledge. Purchase the Complete Bundle to get both at a discount.' },
      { q: 'Is this just a repeat of what\'s in Foundation?', a: 'No. The Masterclass goes significantly deeper into formulation science, patient phenotyping, and clinical case management.' },
    ],
    instructorNote: 'The Myers Cocktail remains the gateway protocol for most IV therapy practices. This module will help you administer it with precision and adapt it to your specific patient population.',
    relatedCourses: ['complete-bundle', 'iv-therapy-foundation', 'nad-plus-therapy'],
  },
  'nad-plus-therapy': {
    key: 'nad-plus-therapy',
    title: 'NAD+ Therapy Certification',
    subtitle: 'Advanced IV Add-on',
    category: 'IV Therapy',
    price: '$129',
    priceInt: 12900,
    type: 'One-time · Requires Foundation',
    tagline: 'The emerging frontier of IV therapy — certified training for NAD+ infusions.',
    description: 'Master NAD+ infusion protocols for addiction recovery, cognitive support, and anti-aging applications with clinical confidence.',
    longDescription: 'NAD+ therapy is one of the fastest-growing segments of IV wellness medicine. This certification gives you a comprehensive clinical foundation — covering the science behind NAD+, infusion protocols, rate titration, patient selection, and managing common reactions like the niacin flush.',
    duration: '5–6 hours',
    lessons: 14,
    students: '150+',
    level: 'Intermediate (Foundation required)',
    includes: [
      'Complete NAD+ infusion protocol',
      'Rate titration & infusion management guide',
      'Addiction recovery application module',
      'Anti-aging & cognitive enhancement protocols',
      'Patient screening & consent forms',
      'Adverse reaction management (niacin flush, etc.)',
      'Completion certificate',
    ],
    curriculum: [
      { section: 'Module 1: NAD+ Science & Clinical Evidence', lessons: ['What is NAD+ and why it matters', 'Clinical evidence review', 'Patient selection criteria', 'Sourcing & product quality considerations'] },
      { section: 'Module 2: Infusion Protocols & Management', lessons: ['Standard infusion protocol & rates', 'Rate titration & patient tolerance', 'Managing the niacin flush', 'High-dose protocols for addiction recovery'] },
      { section: 'Module 3: Clinical Applications', lessons: ['Addiction recovery & detox support', 'Cognitive enhancement & brain health', 'Anti-aging & cellular energy', 'Combination protocols', 'Consent, documentation & follow-up'] },
    ],
    faqs: [
      { q: 'Is NAD+ legal to administer?', a: 'Yes, for licensed healthcare providers. State regulations vary — always confirm scope of practice in your state.' },
      { q: 'Why does NAD+ cause side effects?', a: 'NAD+ infusions commonly cause a flush reaction if given too fast. This course covers rate management to minimize discomfort.' },
    ],
    instructorNote: 'NAD+ is becoming a flagship offering for IV wellness practices. Providers who offer it with proper protocols and patient education see exceptional repeat clients.',
    relatedCourses: ['complete-bundle', 'iv-therapy-foundation', 'myers-cocktail-masterclass'],
  },
  'filler-fundamentals': {
    key: 'filler-fundamentals',
    title: 'Filler Fundamentals',
    subtitle: 'Aesthetics Certification',
    category: 'Aesthetics',
    price: '$249',
    priceInt: 24900,
    type: 'One-time · Lifetime access',
    badge: 'Aesthetics',
    tagline: 'Comprehensive dermal filler training for licensed providers.',
    description: 'Comprehensive training in dermal filler techniques, facial anatomy, and safe injection practices for licensed providers entering aesthetics.',
    longDescription: 'Filler Fundamentals is a complete introduction to dermal filler injection for licensed healthcare providers. The course covers foundational facial anatomy, safe injection techniques across the most common treatment areas, product selection, and managing complications.',
    duration: '10–12 hours',
    lessons: 28,
    students: '100+',
    level: 'Beginner to Intermediate',
    includes: [
      'Facial anatomy deep dive (with 3D illustrations)',
      'Injection technique masterclass',
      'Product selection guide (Juvederm, Restylane, etc.)',
      'Before & after case review library',
      'Complication avoidance & emergency management',
      'Patient consultation framework',
      'Consent form templates',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Module 1: Facial Anatomy for Injectors', lessons: ['Surface landmarks & fat compartments', 'Danger zones & neurovascular anatomy', 'Aging face analysis', 'Patient consultation & goal-setting'] },
      { section: 'Module 2: Product Selection & Technique', lessons: ['HA filler properties & product comparison', 'Cannula vs needle technique', 'Injection depth & approach by zone', 'Lip augmentation protocols', 'Cheek & midface enhancement'] },
      { section: 'Module 3: Complications & Safety', lessons: ['Bruising, swelling & asymmetry management', 'Vascular occlusion: recognition & emergency protocol', 'Hyaluronidase reversal technique', 'Documentation & post-treatment care', 'Building a safe injector practice'] },
    ],
    faqs: [
      { q: 'Is this course standalone?', a: 'Yes — Filler Fundamentals is fully standalone and open to any licensed provider. No prerequisite courses required.' },
      { q: 'Does this cover lip fillers?', a: 'Yes. Lip augmentation is covered in detail including injection mapping, volume guidance, and managing common complications.' },
    ],
    instructorNote: 'Aesthetics is one of the fastest-growing revenue streams for healthcare providers. This course gives you a safe, evidence-based foundation to start your injector journey.',
    relatedCourses: ['botox-neurotoxins', 'iv-therapy-foundation', 'complete-bundle'],
  },
  'botox-neurotoxins': {
    key: 'botox-neurotoxins',
    title: 'Botox & Neurotoxins',
    subtitle: 'Aesthetics Certification',
    category: 'Aesthetics',
    price: '$249',
    priceInt: 24900,
    type: 'One-time · Lifetime access',
    badge: 'Aesthetics',
    tagline: 'Complete neurotoxin training from first injection to advanced techniques.',
    description: 'Complete training in neurotoxin injections, patient consultation, and treatment protocols from beginner to advanced level.',
    longDescription: 'Botox & Neurotoxins is a comprehensive certification covering everything from neurotoxin mechanism of action to advanced injection mapping. Whether you\'re just starting out or looking to formalize your training, this course provides the clinical depth you need to practice safely and achieve excellent results.',
    duration: '10–12 hours',
    lessons: 26,
    students: '120+',
    level: 'Beginner to Advanced',
    includes: [
      'Neurotoxin mechanism & product comparison (Botox, Dysport, Xeomin)',
      'Injection mapping for all major treatment areas',
      'Dosing guide & dilution reference',
      'Patient consultation framework',
      'Managing complications (ptosis, asymmetry)',
      'Combination treatment planning',
      'Consent & documentation templates',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Module 1: Neurotoxin Science & Products', lessons: ['Mechanism of action — how neurotoxins work', 'Product comparison: Botox vs Dysport vs Xeomin', 'Dilution & reconstitution guide', 'Storage, handling & expiration'] },
      { section: 'Module 2: Patient Assessment & Planning', lessons: ['Facial analysis & dynamic wrinkle assessment', 'Patient consultation & expectation management', 'Contraindications & precautions', 'Photography & documentation standards'] },
      { section: 'Module 3: Treatment Protocols by Area', lessons: ['Forehead & frontalis', 'Glabella (11 lines)', 'Crow\'s feet (orbicularis)', 'Brow lift technique', 'Bunny lines, lip flip & masseter', 'Combination planning'] },
      { section: 'Module 4: Complications & Advanced Topics', lessons: ['Ptosis recognition & management', 'Asymmetry correction', 'Touch-up protocols', 'Building a neurotoxin practice'] },
    ],
    faqs: [
      { q: 'Is this course standalone?', a: 'Yes. Fully standalone and open to any licensed provider.' },
      { q: 'Does this cover Dysport and Xeomin too?', a: 'Yes. All major neurotoxin products are covered with specific dosing conversions.' },
    ],
    instructorNote: 'Neurotoxin injections are the most in-demand aesthetic service. This course gives you the clinical foundation and confidence to offer safe, high-quality treatments from day one.',
    relatedCourses: ['filler-fundamentals', 'iv-therapy-foundation', 'complete-bundle'],
  },
}

const RELATED_TITLES: Record<string, { title: string; price: string; subtitle: string }> = {
  'iv-therapy-foundation': { title: 'IV Therapy Foundation', price: '$199', subtitle: 'Core Certification' },
  'complete-bundle': { title: 'Complete IV Bundle', price: '$349', subtitle: 'Best Value' },
  'myers-cocktail-masterclass': { title: 'Myers Cocktail Masterclass', price: '$149', subtitle: 'Add-on' },
  'nad-plus-therapy': { title: 'NAD+ Therapy', price: '$129', subtitle: 'Add-on' },
  'filler-fundamentals': { title: 'Filler Fundamentals', price: '$249', subtitle: 'Aesthetics' },
  'botox-neurotoxins': { title: 'Botox & Neurotoxins', price: '$249', subtitle: 'Aesthetics' },
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#D9D9D9] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FBF6FF] transition-colors"
      >
        <span className="text-sm font-semibold text-[#1a1a1a] pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 text-[#5B5B5B] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#5B5B5B] leading-relaxed border-t border-[#EEEEEE]">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = COURSES[slug]
  if (!course) notFound()

  const { addItem, isInCart } = useCart()

  const inCart = isInCart(course.key)

  function handleAddToCart() {
    addItem({ key: course.key, title: course.title, price: course.price, priceInt: course.priceInt, subtitle: course.subtitle })
    toast.success(`${course.title} added to cart`)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#EEEEEE] py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Left: course info */}
            <div className="flex-1">
              <AnimateOnScroll>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest">{course.category}</span>
                  {course.badge && (
                    <>
                      <span className="text-[#D9D9D9]">·</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#9E50E5] text-white text-xs font-bold">{course.badge}</span>
                    </>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-3 leading-tight">{course.title}</h1>
                <p className="text-lg text-[#9E50E5] font-semibold mb-4">{course.tagline}</p>
                <p className="text-[#5B5B5B] leading-relaxed text-base mb-6 max-w-2xl">{course.description}</p>

                {/* Meta stats */}
                <div className="flex flex-wrap gap-5">
                  {[
                    { icon: Clock, text: course.duration },
                    { icon: BookOpen, text: `${course.lessons} lessons` },
                    { icon: Users, text: `${course.students} enrolled` },
                    { icon: Award, text: course.level },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5 text-sm text-[#5B5B5B]">
                      <item.icon className="h-4 w-4 text-[#9E50E5]" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: purchase card */}
            <AnimateOnScroll delay={100} className="w-full lg:w-[340px] shrink-0">
              <div className="bg-white rounded-2xl border-2 border-[#9E50E5] p-7 shadow-lg">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-[#1a1a1a]">{course.price}</span>
                  {course.originalPrice && (
                    <span className="text-lg text-[#5B5B5B] line-through">{course.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-emerald-600 mb-6">{course.type}</p>

                <div className="space-y-2.5 mb-6">
                  {course.includes.slice(0, 5).map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-[#5B5B5B]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#9E50E5] mt-0.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                  {course.includes.length > 5 && (
                    <p className="text-xs text-[#9E50E5] pl-5 font-medium">+{course.includes.length - 5} more included</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Link
                    href={`/checkout?course=${course.key}`}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-bold text-sm transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Enroll Now — {course.price}
                  </Link>
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[30px] font-semibold text-sm transition-colors ${
                      inCart
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'border border-[#9E50E5] text-[#9E50E5] hover:bg-[#FBF6FF]'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {inCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#5B5B5B]">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  7-day money-back guarantee
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-[#9E50E5] py-4">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-wrap gap-6 justify-center">
            {[
              { icon: Shield, text: 'Licensed providers only' },
              { icon: Zap, text: 'Instant access after payment' },
              { icon: Star, text: 'SVA-certified content' },
              { icon: Award, text: 'Completion certificate included' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-white">
                <item.icon className="h-4 w-4 text-white/70" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* What you'll learn */}
            <AnimateOnScroll>
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">What&apos;s included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.includes.map((item) => (
                    <div key={item} className="flex items-start gap-3 p-4 bg-[#FBF6FF] rounded-xl border border-[#D9D9D9]">
                      <CheckCircle className="h-4 w-4 text-[#9E50E5] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#5B5B5B]">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </AnimateOnScroll>

            {/* About */}
            <AnimateOnScroll>
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">About this course</h2>
                <p className="text-[#5B5B5B] leading-relaxed mb-4">{course.longDescription}</p>
                <div className="bg-[#FBF6FF] border border-[#9E50E5]/20 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#9E50E5] mb-1">A note from our clinical team</p>
                  <p className="text-sm text-[#5B5B5B] leading-relaxed italic">&ldquo;{course.instructorNote}&rdquo;</p>
                </div>
              </section>
            </AnimateOnScroll>

            {/* Curriculum */}
            <AnimateOnScroll>
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Course curriculum</h2>
                <div className="space-y-4">
                  {course.curriculum.map((section, i) => (
                    <div key={i} className="border border-[#D9D9D9] rounded-xl overflow-hidden">
                      <div className="bg-[#EEEEEE] px-5 py-3.5">
                        <p className="text-sm font-bold text-[#1a1a1a]">{section.section}</p>
                        <p className="text-xs text-[#5B5B5B] mt-0.5">{section.lessons.length} lessons</p>
                      </div>
                      <div className="divide-y divide-[#EEEEEE]">
                        {section.lessons.map((lesson, j) => (
                          <div key={j} className="flex items-center gap-3 px-5 py-3">
                            <div className="h-5 w-5 rounded-full border border-[#D9D9D9] flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-[#5B5B5B] font-bold">{j + 1}</span>
                            </div>
                            <span className="text-sm text-[#5B5B5B]">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </AnimateOnScroll>

            {/* FAQs */}
            <AnimateOnScroll>
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Frequently asked questions</h2>
                <div className="space-y-3">
                  {course.faqs.map((faq) => (
                    <FAQ key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </section>
            </AnimateOnScroll>

          </div>

          {/* Sticky sidebar */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="sticky top-28 space-y-4">
              {/* Mini purchase card */}
              <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 hidden lg:block">
                <div className="text-2xl font-extrabold text-[#1a1a1a] mb-0.5">{course.price}</div>
                <p className="text-xs text-emerald-600 font-semibold mb-5">{course.type}</p>
                <div className="space-y-2">
                  <Link
                    href={`/checkout?course=${course.key}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-bold text-sm transition-colors"
                  >
                    Enroll Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-[30px] font-semibold text-sm transition-colors ${
                      inCart
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'border border-[#9E50E5] text-[#9E50E5] hover:bg-[#FBF6FF]'
                    }`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>

              {/* Related courses */}
              {course.relatedCourses.length > 0 && (
                <div className="bg-white border border-[#D9D9D9] rounded-2xl p-5">
                  <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-3">Related Courses</p>
                  <div className="space-y-2">
                    {course.relatedCourses.map((key) => {
                      const related = RELATED_TITLES[key]
                      if (!related) return null
                      return (
                        <Link
                          key={key}
                          href={`/course/${key}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FBF6FF] transition-colors group"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9E50E5]">{related.subtitle}</p>
                            <p className="text-sm text-[#1a1a1a] group-hover:text-[#9E50E5] transition-colors font-medium leading-snug">{related.title}</p>
                          </div>
                          <span className="text-sm font-bold text-[#1a1a1a] shrink-0 ml-2">{related.price}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <section className="bg-[#9E50E5] py-14">
        <AnimateOnScroll className="mx-auto max-w-[700px] px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to enroll in {course.title}?
          </h2>
          <p className="text-white/75 mb-8">
            One-time purchase · Lifetime access · Completion certificate included
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/checkout?course=${course.key}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[30px] bg-white text-[#9E50E5] hover:bg-[#FBF6FF] font-bold text-sm transition-colors"
            >
              Enroll Now — {course.price}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[30px] font-bold text-sm border-2 transition-colors ${
                inCart
                  ? 'bg-white/20 text-white border-white/40'
                  : 'border-white text-white hover:bg-white hover:text-[#9E50E5]'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {inCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </AnimateOnScroll>
      </section>

      <PublicFooter />
    </div>
  )
}
