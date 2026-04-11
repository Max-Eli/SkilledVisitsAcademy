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
  'iv-therapy-certification': {
    key: 'iv-therapy-certification',
    title: 'IV Therapy Certification',
    subtitle: 'Core Certification — 12 Modules',
    category: 'Core Course',
    price: '$299',
    priceInt: 29900,
    type: 'One-time · Lifetime access',
    badge: 'Core Course',
    tagline: 'The foundational IV therapy certification for licensed healthcare professionals.',
    description: 'The complete foundational certification for IV therapy providers. 12 comprehensive modules covering everything you need to safely add IV services to your practice.',
    longDescription: "SVA's IV Therapy Certification is the most comprehensive foundational IV therapy course available for licensed healthcare providers. Built by experienced IV therapy clinicians, this course covers everything from patient assessment and vein selection to safe mixing protocols and managing complications. Upon completion, you'll receive your SVA certification and have lifetime access to all course materials, including future updates.",
    duration: '10–12 hours',
    lessons: 12,
    students: '500+',
    level: 'Beginner to Intermediate',
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
    curriculum: [
      { section: 'Module 1–2: IV Therapy Fundamentals', lessons: ['Introduction to IV therapy & scope of practice', 'Anatomy & physiology of the venous system'] },
      { section: 'Module 3–4: Patient Care & Assessment', lessons: ['Patient assessment & screening protocols', 'Contraindications & risk stratification'] },
      { section: 'Module 5–6: Equipment & Insertion', lessons: ['IV equipment & supplies overview', 'Peripheral IV insertion technique step-by-step'] },
      { section: 'Module 7–8: Fluids & Protocols', lessons: ['Hydration therapy protocols', 'Fluid selection & rate calculation'] },
      { section: 'Module 9–10: Safety & Compliance', lessons: ['Infection control & sterile technique', 'Legal considerations & state scope of practice'] },
      { section: 'Module 11–12: Documentation & Certification', lessons: ['Documentation requirements & consent forms', 'Course review & certification exam'] },
    ],
    faqs: [
      { q: 'What license types are eligible?', a: 'RNs, NPs, PAs, MDs, DOs, LPNs, LVNs, paramedics, and other licensed clinicians. License verification is required at enrollment.' },
      { q: 'How long do I have access?', a: 'Lifetime access. One purchase — no subscriptions, no renewals. All future updates to this course are included.' },
      { q: 'Is this CME/CEU accredited?', a: 'SVA is working toward full accreditation. A completion certificate is issued and accepted by many state boards for CE credit.' },
      { q: 'Do I need this before the Masterclasses?', a: 'Yes. The Advanced Masterclasses build on foundational knowledge. We strongly recommend completing this Core Course first.' },
      { q: 'What if I need a refund?', a: "We offer a 7-day refund if you've completed less than 20% of the course. Contact us at info@skilledvisitsacademy.com." },
    ],
    instructorNote: "This course was developed by SVA's clinical team — active IV therapy practitioners with 10+ years of mobile and clinical IV experience. Every protocol is evidence-based and reviewed annually.",
    relatedCourses: ['complete-mastery-bundle', 'nad-plus-masterclass', 'vitamin-nutrient-therapy'],
  },
  'complete-mastery-bundle': {
    key: 'complete-mastery-bundle',
    title: 'Complete IV Therapy Mastery Bundle',
    subtitle: 'Core Course + All 4 Masterclasses',
    category: 'Bundle',
    price: '$499',
    priceInt: 49900,
    originalPrice: '$895',
    type: 'One-time · Save $396',
    badge: 'Best Value',
    tagline: 'Everything you need to master IV therapy — the most complete education available.',
    description: 'The Core Certification plus all four Advanced Masterclasses — the most complete IV therapy education available. Save $396 versus buying separately.',
    longDescription: "The Complete IV Therapy Mastery Bundle gives you everything in the Core Certification plus all four Advanced Masterclasses. If you're serious about building or growing an IV therapy practice, this is the most efficient and cost-effective way to get fully trained and certified.",
    duration: '25–30 hours total',
    lessons: 52,
    students: '200+',
    level: 'Beginner to Advanced',
    includes: [
      'IV Therapy Certification (Core)',
      'Advanced IV Complications & Emergency Mgmt',
      'Vitamin & Nutrient Therapy Masterclass',
      'NAD+ Therapy Masterclass',
      'IV Push Administration Masterclass',
      'All future course updates included',
      'Priority community support',
    ],
    curriculum: [
      { section: 'IV Therapy Certification (Core)', lessons: ['All 12 Core modules — see Core Course for full curriculum'] },
      { section: 'Advanced IV Complications & Emergency Mgmt', lessons: ['Identifying & managing IV complications', 'Anaphylaxis & allergic reaction protocols', 'Emergency documentation & reporting'] },
      { section: 'Vitamin & Nutrient Therapy Masterclass', lessons: ['Vitamin pharmacology & protocols', 'Glutathione, amino acids & combinations', 'Mixing compatibility & dosing strategies'] },
      { section: 'NAD+ Therapy Masterclass', lessons: ['NAD+ science & infusion protocols', 'Rate titration & side effect management', 'Anti-aging & cellular repair applications'] },
      { section: 'IV Push Administration Masterclass', lessons: ['IV push vs infusion techniques', 'Glutathione & vitamin push protocols', 'Safety considerations & monitoring'] },
    ],
    faqs: [
      { q: "What's included in this bundle?", a: 'The IV Therapy Certification (Core Course) plus all four Advanced Masterclasses — a total value of $895.' },
      { q: 'Can I buy the add-ons separately later?', a: 'Yes, but the bundle saves you $396. Each Masterclass requires the Core Course as a prerequisite.' },
      { q: 'How long does this take to complete?', a: 'The full bundle is approximately 25–30 hours of video content. Most providers complete it over 3–5 weeks.' },
    ],
    instructorNote: 'The bundle is our most popular option for providers launching or scaling an IV therapy practice. Getting certified across all five programs sets you apart significantly.',
    relatedCourses: ['iv-therapy-certification', 'nad-plus-masterclass', 'iv-push-administration'],
  },
  'iv-complications-emergency': {
    key: 'iv-complications-emergency',
    title: 'Advanced IV Complications & Emergency Management',
    subtitle: 'Advanced Masterclass',
    category: 'Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    tagline: 'Master IV complications and emergency response to keep your patients safe.',
    description: 'Master the recognition and management of IV complications and emergency situations to keep your patients safe.',
    longDescription: 'Complications happen — even to experienced providers. This advanced masterclass prepares you to recognize the early signs of IV complications, respond quickly and effectively, and document accurately. From infiltration to anaphylaxis, this course covers the full spectrum of potential IV adverse events.',
    duration: '4–5 hours',
    lessons: 6,
    students: '300+',
    level: 'Intermediate (Core Course required)',
    includes: [
      'Identifying IV complications',
      'Infiltration & extravasation management',
      'Phlebitis prevention & treatment',
      'Allergic reactions & anaphylaxis protocols',
      'Air embolism awareness',
      'Emergency management & documentation',
    ],
    curriculum: [
      { section: 'Module 1–2: Recognizing Complications', lessons: ['Overview of IV complications & risk factors', 'Infiltration vs extravasation — identification & grading'] },
      { section: 'Module 3–4: Vascular & Inflammatory Complications', lessons: ['Phlebitis: causes, prevention & treatment', 'Thrombophlebitis & vessel assessment'] },
      { section: 'Module 5–6: Emergency Management', lessons: ['Allergic reactions & anaphylaxis — full protocol', 'Air embolism, fluid overload & emergency documentation'] },
    ],
    faqs: [
      { q: 'Do I need the Core Course first?', a: 'Yes. This masterclass builds on foundational IV therapy knowledge. Purchase the Complete Bundle to get everything at once.' },
      { q: 'Does this cover anaphylaxis in detail?', a: 'Yes. Full anaphylaxis protocol is covered including epinephrine dosing, patient positioning, and post-event documentation.' },
    ],
    instructorNote: 'Every IV therapy provider needs to be prepared for complications. This course is essential for anyone who wants to practice safely and confidently.',
    relatedCourses: ['iv-therapy-certification', 'complete-mastery-bundle', 'vitamin-nutrient-therapy'],
  },
  'vitamin-nutrient-therapy': {
    key: 'vitamin-nutrient-therapy',
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    category: 'Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    tagline: 'Deep-dive into vitamin pharmacology and advanced nutrient IV protocols.',
    description: 'Deep-dive into vitamin pharmacology, advanced nutrient protocols, and safe mixing and dosing strategies.',
    longDescription: 'Vitamins and nutrients are the foundation of most IV wellness protocols. This masterclass goes deep into the pharmacology of each major IV nutrient, covering clinical evidence, therapeutic dosing, mixing compatibility, and safe administration. Build the knowledge to create effective, personalized protocols for your patients.',
    duration: '5–6 hours',
    lessons: 6,
    students: '250+',
    level: 'Intermediate (Core Course required)',
    includes: [
      'Vitamin pharmacology fundamentals',
      'Vitamin C & B complex protocols',
      'Magnesium, zinc & trace elements',
      'Glutathione therapy',
      'Amino acids & nutrient combinations',
      'Mixing compatibility & dosing strategies',
    ],
    curriculum: [
      { section: 'Module 1–2: Vitamin Pharmacology', lessons: ['Vitamin C: high-dose protocols & evidence', 'B-complex: B1, B2, B3, B5, B6, B12 — roles & dosing'] },
      { section: 'Module 3–4: Minerals & Antioxidants', lessons: ['Magnesium, zinc & trace element protocols', 'Glutathione: administration, benefits & evidence'] },
      { section: 'Module 5–6: Advanced Combinations & Compatibility', lessons: ['Amino acids & nutrient synergy', 'Mixing compatibility, stability & dosing strategies'] },
    ],
    faqs: [
      { q: 'Does this cover the Myers Cocktail?', a: 'Yes. The Myers Cocktail formulation and variations are covered as part of the B-complex and magnesium modules.' },
      { q: 'Will I learn how to mix custom IV bags?', a: 'Yes. Mixing compatibility and safe preparation techniques are covered in detail.' },
    ],
    instructorNote: 'Understanding nutrient pharmacology separates good IV providers from great ones. This course will transform how you build and personalize protocols for your patients.',
    relatedCourses: ['iv-therapy-certification', 'complete-mastery-bundle', 'nad-plus-masterclass'],
  },
  'nad-plus-masterclass': {
    key: 'nad-plus-masterclass',
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Advanced Masterclass',
    category: 'Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    tagline: 'Master NAD+ infusion protocols for anti-aging, cellular repair, and recovery.',
    description: 'Master NAD+ infusion protocols for anti-aging, cellular repair, and addiction recovery applications.',
    longDescription: 'NAD+ therapy is one of the fastest-growing segments of IV wellness medicine. This masterclass gives you a comprehensive clinical foundation — covering the science behind NAD+, infusion protocols, rate titration, patient selection, and managing common reactions including the niacin flush.',
    duration: '5–6 hours',
    lessons: 6,
    students: '200+',
    level: 'Intermediate (Core Course required)',
    includes: [
      'Science behind NAD+ therapy',
      'Anti-aging & cellular repair benefits',
      'Infusion protocols & dosing',
      'Infusion rates & monitoring',
      'Managing common side effects',
      'Patient selection & contraindications',
    ],
    curriculum: [
      { section: 'Module 1–2: NAD+ Science & Evidence', lessons: ['What is NAD+ and why it matters clinically', 'Clinical evidence: anti-aging, energy & cognition'] },
      { section: 'Module 3–4: Infusion Protocols & Rate Management', lessons: ['Standard & high-dose infusion protocols', 'Rate titration & managing the niacin flush'] },
      { section: 'Module 5–6: Clinical Applications', lessons: ['Anti-aging, cellular repair & addiction recovery', 'Patient selection, contraindications & documentation'] },
    ],
    faqs: [
      { q: 'Is NAD+ legal to administer?', a: 'Yes, for licensed healthcare providers. State regulations vary — always confirm scope of practice in your state.' },
      { q: 'Why does NAD+ cause side effects?', a: 'NAD+ infusions commonly cause a flush reaction if given too fast. This course covers rate management to minimize discomfort.' },
    ],
    instructorNote: 'NAD+ is becoming a flagship offering for IV wellness practices. Providers who offer it with proper protocols and patient education see exceptional repeat clients.',
    relatedCourses: ['iv-therapy-certification', 'complete-mastery-bundle', 'iv-push-administration'],
  },
  'iv-push-administration': {
    key: 'iv-push-administration',
    title: 'IV Push Administration Masterclass',
    subtitle: 'Advanced Masterclass',
    category: 'Masterclass',
    price: '$149',
    priceInt: 14900,
    type: 'One-time · Requires Core Course',
    tagline: 'Learn safe and effective IV push techniques for glutathione, vitamins, and more.',
    description: 'Learn safe and effective IV push techniques including glutathione, vitamin push protocols, and safe administration rates.',
    longDescription: 'IV push administration is a distinct skill set from standard IV infusion. This masterclass covers the clinical distinctions, safe administration rates, and specific protocols for the most commonly pushed medications and nutrients in IV wellness — including glutathione and vitamin pushes.',
    duration: '4–5 hours',
    lessons: 6,
    students: '180+',
    level: 'Intermediate (Core Course required)',
    includes: [
      'IV push vs infusion techniques',
      'Step-by-step IV push administration',
      'Safe medication administration rates',
      'Glutathione IV push protocols',
      'Vitamin push techniques',
      'Safety considerations & monitoring',
    ],
    curriculum: [
      { section: 'Module 1–2: IV Push Fundamentals', lessons: ['IV push vs infusion — clinical distinctions', 'Equipment, technique & safe rate guidelines'] },
      { section: 'Module 3–4: Glutathione Protocols', lessons: ['Glutathione pharmacology & benefits', 'Step-by-step glutathione IV push protocol'] },
      { section: 'Module 5–6: Vitamin Push & Safety', lessons: ['Vitamin C, B-complex & other nutrient push protocols', 'Monitoring, adverse events & documentation'] },
    ],
    faqs: [
      { q: 'Is IV push different from a regular IV infusion?', a: 'Yes. IV push requires specific technique and rate management. This course covers the full clinical distinction and how to do it safely.' },
      { q: 'Is glutathione safe for IV push?', a: 'Yes, when administered at the correct rate. This course covers proper protocols to minimize risk and maximize results.' },
    ],
    instructorNote: 'IV push administration opens up a faster, more efficient service model. Mastering this technique expands your menu and improves client throughput.',
    relatedCourses: ['iv-therapy-certification', 'complete-mastery-bundle', 'nad-plus-masterclass'],
  },
}

const RELATED_TITLES: Record<string, { title: string; price: string; subtitle: string }> = {
  'iv-therapy-certification': { title: 'IV Therapy Certification', price: '$299', subtitle: 'Core Course' },
  'complete-mastery-bundle': { title: 'Complete Mastery Bundle', price: '$499', subtitle: 'Best Value — Save $396' },
  'iv-complications-emergency': { title: 'IV Complications & Emergency Mgmt', price: '$149', subtitle: 'Masterclass' },
  'vitamin-nutrient-therapy': { title: 'Vitamin & Nutrient Therapy', price: '$149', subtitle: 'Masterclass' },
  'nad-plus-masterclass': { title: 'NAD+ Therapy Masterclass', price: '$149', subtitle: 'Masterclass' },
  'iv-push-administration': { title: 'IV Push Administration', price: '$149', subtitle: 'Masterclass' },
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
