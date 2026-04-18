'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { use, useState } from 'react'
import {
  CheckCircle, ShoppingCart, ArrowRight, Lock, Shield,
  Zap, Star, Clock, Users, Award, BookOpen, ChevronDown,
  CalendarClock, MapPin, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

// Delivery modes drive UI differences on the course page:
//   live-zoom    — standard 4-hour small-group live Zoom cohort
//   in-person    — physical hands-on event (scheduled separately by admin)
//   private-1on1 — dedicated session scheduled with the learner
type DeliveryMode = 'live-zoom' | 'in-person' | 'private-1on1'

type Course = {
  key: string
  title: string
  subtitle: string
  category: string
  price: string
  priceInt: number
  originalPrice?: string
  type: string
  badge?: string
  deliveryMode: DeliveryMode
  tagline: string
  description: string
  longDescription: string
  duration: string
  lessons: number
  level: string
  includes: string[]
  curriculum: { section: string; lessons: string[] }[]
  faqs: { q: string; a: string }[]
  instructorNote: string
  relatedCourses: string[]
}

// ---------------------------------------------------------------------------
// Shared curriculum/FAQ content — private variants reuse the standard
// course's body so we keep a single source of truth per topic.
// ---------------------------------------------------------------------------

const IV_TRAINING_CURRICULUM = [
  { section: 'Hour 1: IV Therapy Foundations', lessons: ['Scope of practice & state regulations', 'Anatomy of the venous system and site selection'] },
  { section: 'Hour 2: Patient Assessment & Safety', lessons: ['Patient screening, contraindications & consent', 'Infection control and sterile technique'] },
  { section: 'Hour 3: Insertion & Protocols', lessons: ['Peripheral IV insertion — live demo and walkthrough', 'Hydration protocols and rate management'] },
  { section: 'Hour 4: Real-World Practice & Q&A', lessons: ['Troubleshooting difficult veins and infiltrations', 'Documentation, charting and live Q&A with the clinical team'] },
]

const BOTOX_BASIC_CURRICULUM = [
  { section: 'Hour 1: Neurotoxin Foundations', lessons: ['Pharmacology and brand comparison (Botox, Dysport, Xeomin, Jeuveau)', 'Dosing strategy and reconstitution'] },
  { section: 'Hour 2: Facial Anatomy for Injectors', lessons: ['Upper-face muscles and danger zones', 'Consultation, photography and treatment planning'] },
  { section: 'Hour 3: Upper-Face Injection Patterns', lessons: ['Glabella and forehead pattern', 'Crow\'s feet and periorbital considerations'] },
  { section: 'Hour 4: Safety & Q&A', lessons: ['Managing asymmetry, ptosis and touch-up timing', 'Adverse events, documentation and live Q&A'] },
]

const BOTOX_ADVANCED_CURRICULUM = [
  { section: 'Hour 1: Advanced Dosing Strategies', lessons: ['High-unit protocols and maintenance schedules', 'Dosing by skin thickness, age and ethnicity'] },
  { section: 'Hour 2: Lower-Face & Neck', lessons: ['Masseter reduction and facial slimming', 'Lip flip, DAOs and mentalis technique'] },
  { section: 'Hour 3: Full-Face Artistry', lessons: ['Nefertiti lift and platysmal banding', 'Gummy smile, bunny lines and advanced touch-ups'] },
  { section: 'Hour 4: Troubleshooting & Q&A', lessons: ['Managing difficult cases and patient retention strategies', 'Live case reviews and Q&A'] },
]

const FILLER_BASIC_CURRICULUM = [
  { section: 'Hour 1: Filler Foundations', lessons: ['HA filler rheology, G-prime and product families', 'Needle vs cannula decision framework'] },
  { section: 'Hour 2: Consultation & Anatomy', lessons: ['Facial assessment and treatment planning', 'Vascular anatomy and danger zones'] },
  { section: 'Hour 3: Lip & Cheek Technique', lessons: ['Lip injection — anatomy, technique and balance', 'Midface and cheek volumization'] },
  { section: 'Hour 4: Safety & Q&A', lessons: ['Vascular occlusion recognition and hyaluronidase protocol', 'Documentation, consent and live Q&A'] },
]

const FILLER_ADVANCED_CURRICULUM = [
  { section: 'Hour 1: Advanced Product Selection', lessons: ['Deep-plane vs superficial products', 'Full-face treatment design and sequencing'] },
  { section: 'Hour 2: Jawline & Chin Contouring', lessons: ['Jawline architecture for female and male patients', 'Chin projection and pre-jowl sulcus'] },
  { section: 'Hour 3: Nose & Tear Trough', lessons: ['Non-surgical rhinoplasty technique and safety', 'Tear trough and undereye technique with cannula'] },
  { section: 'Hour 4: Complication Mastery & Q&A', lessons: ['Full vascular occlusion workflow with live decision tree', 'Managing nodules, migration and patient dissatisfaction'] },
]

const PRP_PRF_EZGEL_CURRICULUM = [
  { section: 'Hour 1: Science & Biology', lessons: ['PRP vs PRF vs EZ Gel — clinical differences', 'Growth factor biology and evidence base'] },
  { section: 'Hour 2: Draw & Spin Protocols', lessons: ['Blood draw technique and tube selection', 'Centrifuge protocols for clinical-grade PRF'] },
  { section: 'Hour 3: EZ Gel & Facial Rejuvenation', lessons: ['EZ Gel thermal activation and volumizing applications', 'Facial injection technique — undereye, cheeks, jawline'] },
  { section: 'Hour 4: Combinations & Q&A', lessons: ['Combining with microneedling and fillers', 'Result timelines, patient education and live Q&A'] },
]

const BBL_RUSSIAN_LIP_CURRICULUM = [
  { section: 'Module 1: Pre-Reading (online)', lessons: ['Non-surgical BBL overview — patient selection and anatomy', 'Russian lip technique primer and facial aesthetics'] },
  { section: 'Module 2: Hands-On Day — Morning', lessons: ['Live demo: non-surgical BBL injection technique', 'Supervised practice on live models — BBL'] },
  { section: 'Module 3: Hands-On Day — Afternoon', lessons: ['Live demo: Russian lip technique with live model', 'Supervised practice on live models — Russian lip'] },
  { section: 'Module 4: Complications & Debrief', lessons: ['Complication management and aftercare protocols', 'Case review, portfolio photography and certification'] },
]

const IV_FAQS_BASE = [
  { q: 'What license types are eligible?', a: 'RNs, NPs, PAs, MDs, DOs, LPNs, LVNs, paramedics and other licensed clinicians under their state scope. License verification is required at enrollment.' },
  { q: 'Is this live or pre-recorded?', a: 'Live. You join a small-group Zoom cohort with the clinical instructor for 4 hours of interactive teaching, live demo and Q&A.' },
  { q: 'What do I receive on completion?', a: 'An SVA completion certificate, full slide deck and protocols, and access to the private alumni Q&A channel for follow-up questions.' },
  { q: 'What if I need a refund?', a: 'Full refund up to 7 days before your cohort date, provided you have not started the pre-reading. Contact info@skilledvisitsacademy.com.' },
]

const AESTHETIC_FAQS_BASE = [
  { q: 'Who can enroll?', a: 'Licensed aesthetic injectors: RNs, NPs, PAs, MDs, DOs and Dentists under their state scope. License verification is required at enrollment.' },
  { q: 'Is this live or pre-recorded?', a: 'Live. 4-hour small-group Zoom with real-time demo, case reviews and instructor Q&A.' },
  { q: 'Do I need to bring a model?', a: 'Live Zoom courses are didactic and demo-based — no model required. Our in-person BBL & Russian Lip intensive includes live models.' },
  { q: 'What do I receive on completion?', a: 'An SVA completion certificate, full slide deck and protocols, and access to the private alumni Q&A channel.' },
]

const PRIVATE_FAQ: { q: string; a: string } = {
  q: 'How does Private 1:1 scheduling work?',
  a: 'After checkout our clinical team contacts you within 1 business day to schedule a dedicated session at a time that works for you. Sessions are delivered 1:1 over Zoom with the lead instructor and cover the same material as the group program.',
}

// ---------------------------------------------------------------------------
// Course catalog. 19 SKUs across three delivery modes.
// ---------------------------------------------------------------------------

const COURSES: Record<string, Course> = {

  // ───────────── IV Lane — online live Zoom ─────────────

  'iv-therapy-training': {
    key: 'iv-therapy-training',
    title: 'Comprehensive IV Therapy Training',
    subtitle: 'Live 4-hour Zoom cohort',
    category: 'IV Training',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    badge: 'Flagship',
    deliveryMode: 'live-zoom',
    tagline: 'The foundational live IV therapy training for licensed providers.',
    description: 'Four hours of live, small-group instruction covering patient assessment, insertion technique, hydration protocols and complication management.',
    longDescription: "The Comprehensive IV Therapy Training is SVA's flagship live program for licensed clinicians adding IV services to their practice. Over one focused four-hour Zoom session you'll work through patient assessment, vein selection, safe insertion technique, fluid and nutrient protocols, and the complication management you need to practice confidently. Delivered by active IV clinicians — not recorded lectures — with live demo and direct Q&A throughout.",
    duration: '4 hours live',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Pre-session reading and equipment list',
      'Full protocols and slide deck',
      'Step-by-step insertion technique demo',
      'Hydration and nutrient protocol library',
      'Complication management workflow',
      'Documentation and consent templates',
      'SVA completion certificate',
      'Private alumni Q&A channel',
    ],
    curriculum: IV_TRAINING_CURRICULUM,
    faqs: IV_FAQS_BASE,
    instructorNote: 'This course is built and led by clinicians who run active IV practices. Every protocol is what we actually use day-to-day — evidence-based, reviewed annually, and taught with the practicality you need to operate safely from day one.',
    relatedCourses: ['iv-complications-emergency', 'vitamin-nutrient-therapy', 'nad-plus-masterclass'],
  },

  'iv-complications-emergency': {
    key: 'iv-complications-emergency',
    title: 'IV Complications & Emergency Management',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Recognize and manage IV complications with confidence.',
    description: 'Deep clinical workshop on infiltration, phlebitis, anaphylaxis and the full emergency workflow every IV provider should have ready.',
    longDescription: 'Complications happen — even to experienced providers. This four-hour live masterclass takes you through the full spectrum of IV adverse events, from subtle infiltration to full anaphylaxis. You\'ll leave with a practical emergency workflow, the documentation that protects you legally, and the confidence that you can respond correctly under pressure.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Infiltration and extravasation grading',
      'Phlebitis prevention and management',
      'Anaphylaxis protocol and epinephrine dosing',
      'Air embolism and fluid overload response',
      'Emergency documentation templates',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Hour 1: Recognizing Complications', lessons: ['Spectrum of IV adverse events and risk factors', 'Infiltration vs extravasation — grading and early recognition'] },
      { section: 'Hour 2: Vascular & Inflammatory', lessons: ['Phlebitis and thrombophlebitis — prevention and treatment', 'Vessel assessment and when to stop'] },
      { section: 'Hour 3: Emergency Response', lessons: ['Anaphylaxis: full protocol and epinephrine dosing', 'Air embolism, fluid overload and rapid response workflow'] },
      { section: 'Hour 4: Documentation & Q&A', lessons: ['Legal-grade event documentation and reporting', 'Case reviews and live Q&A'] },
    ],
    faqs: IV_FAQS_BASE,
    instructorNote: 'Every IV provider needs this course. The difference between a safe practice and a career-ending event often comes down to the first 60 seconds of a reaction — and that is exactly what we drill here.',
    relatedCourses: ['iv-therapy-training', 'vitamin-nutrient-therapy', 'nad-plus-masterclass'],
  },

  'vitamin-nutrient-therapy': {
    key: 'vitamin-nutrient-therapy',
    title: 'Vitamin & Nutrient Therapy Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Build effective, personalized nutrient IV protocols.',
    description: 'Vitamin pharmacology, compatibility, and advanced protocols — the deep dive that transforms how you build personalized IV menus.',
    longDescription: 'Vitamins and nutrients are the foundation of most IV wellness offerings. This masterclass goes deep into the pharmacology of each major nutrient, clinical evidence, therapeutic dosing and mixing compatibility so you can design protocols that actually deliver clinical value to your patients — not just checkboxes on a menu.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'High-dose vitamin C protocols',
      'B-complex pharmacology and Myers Cocktail',
      'Magnesium, zinc and trace elements',
      'Glutathione administration and combinations',
      'Mixing compatibility chart',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Hour 1: Pharmacology Foundations', lessons: ['High-dose vitamin C — evidence and protocols', 'B-complex individual vitamins and Myers Cocktail'] },
      { section: 'Hour 2: Minerals & Antioxidants', lessons: ['Magnesium, zinc and trace element protocols', 'Glutathione — routes, dosing and evidence'] },
      { section: 'Hour 3: Combinations & Compatibility', lessons: ['Amino acids and nutrient synergy', 'Stability, compatibility and safe mixing'] },
      { section: 'Hour 4: Building Protocols & Q&A', lessons: ['Designing menus for common indications', 'Case reviews and live Q&A'] },
    ],
    faqs: IV_FAQS_BASE,
    instructorNote: 'Understanding nutrient pharmacology is what separates competent IV providers from great ones. This class will change the way you design protocols for the rest of your career.',
    relatedCourses: ['iv-therapy-training', 'nad-plus-masterclass', 'iv-push-administration'],
  },

  'nad-plus-masterclass': {
    key: 'nad-plus-masterclass',
    title: 'NAD+ Therapy Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Master NAD+ infusion protocols for anti-aging and recovery.',
    description: 'Clinical foundation in NAD+ infusion — protocols, rate titration, side-effect management and patient selection.',
    longDescription: 'NAD+ is one of the fastest-growing offerings in IV wellness. This masterclass gives you the clinical backbone: the science behind NAD+, infusion protocols for anti-aging and recovery, how to titrate to manage the niacin flush, and patient selection that maximizes outcomes while minimizing drop-offs.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'NAD+ science and clinical evidence',
      'Standard and high-dose infusion protocols',
      'Rate titration and flush management',
      'Anti-aging, cognition and recovery applications',
      'Patient selection framework',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Hour 1: NAD+ Science', lessons: ['What NAD+ does clinically and why it matters', 'Evidence base — anti-aging, cognition and recovery'] },
      { section: 'Hour 2: Infusion Protocols', lessons: ['Standard and high-dose protocols', 'Concurrent nutrient combinations'] },
      { section: 'Hour 3: Rate & Side-Effect Management', lessons: ['Managing the niacin flush and titration', 'Patient comfort strategies and session structure'] },
      { section: 'Hour 4: Patient Selection & Q&A', lessons: ['Contraindications and informed consent', 'Case reviews and live Q&A'] },
    ],
    faqs: IV_FAQS_BASE,
    instructorNote: 'NAD+ can be a flagship offering — or a patient-experience nightmare — and the difference comes down to rate management and patient education. We teach both in detail.',
    relatedCourses: ['iv-therapy-training', 'vitamin-nutrient-therapy', 'iv-push-administration'],
  },

  'iv-push-administration': {
    key: 'iv-push-administration',
    title: 'IV Push Administration Masterclass',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'IV Masterclass',
    price: '$199',
    priceInt: 19900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Safe, efficient IV push technique for the most-requested services.',
    description: 'IV push vs infusion, safe administration rates, and step-by-step protocols for the most common pushed nutrients in IV wellness.',
    longDescription: 'IV push is a distinct skill set — and a major productivity multiplier when done correctly. This masterclass covers the clinical distinctions, safe rates, and the specific protocols for glutathione, vitamin and common nutrient pushes so you can deliver faster services without sacrificing safety.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'IV push vs infusion clinical distinctions',
      'Safe administration rates by medication',
      'Glutathione push protocol',
      'Vitamin C and B-complex push protocols',
      'Monitoring and adverse-event response',
      'SVA completion certificate',
    ],
    curriculum: [
      { section: 'Hour 1: Push Fundamentals', lessons: ['Clinical distinctions and when push beats infusion', 'Equipment, technique and safe rate guidelines'] },
      { section: 'Hour 2: Glutathione', lessons: ['Glutathione pharmacology and benefits', 'Step-by-step push protocol with live demo'] },
      { section: 'Hour 3: Vitamins & Nutrients', lessons: ['Vitamin C and B-complex push protocols', 'Combination pushes and sequencing'] },
      { section: 'Hour 4: Safety & Q&A', lessons: ['Monitoring, adverse events and documentation', 'Case reviews and live Q&A'] },
    ],
    faqs: IV_FAQS_BASE,
    instructorNote: 'Push administration unlocks a faster service model and expanded menu. It only works if your rate management is precise — which is what we drill here.',
    relatedCourses: ['iv-therapy-training', 'vitamin-nutrient-therapy', 'nad-plus-masterclass'],
  },

  // ───────────── Aesthetic Lane — online live Zoom ─────────────

  'botox-basic': {
    key: 'botox-basic',
    title: 'Basic Botox Training',
    subtitle: 'Live 4-hour Zoom cohort',
    category: 'Aesthetic Training',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    badge: 'Popular',
    deliveryMode: 'live-zoom',
    tagline: 'Foundational neurotoxin training for new aesthetic injectors.',
    description: 'Four hours of live instruction in upper-face neurotoxin injection — pharmacology, anatomy, dosing and patient management.',
    longDescription: 'Basic Botox Training is the starting point for licensed clinicians moving into aesthetic injection. You\'ll cover pharmacology across the major brands, upper-face anatomy with an injector\'s eye, the core injection patterns patients request most, and how to manage touch-ups and asymmetry like a seasoned provider.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Neurotoxin pharmacology and reconstitution',
      'Facial anatomy for injectors',
      'Upper-face injection patterns',
      'Consultation and treatment planning',
      'Asymmetry troubleshooting',
      'SVA completion certificate',
    ],
    curriculum: BOTOX_BASIC_CURRICULUM,
    faqs: AESTHETIC_FAQS_BASE,
    instructorNote: 'The first year of injection is where habits form — good and bad. This course is designed to wire in the right habits from day one so you build a safe, repeatable technique.',
    relatedCourses: ['botox-advanced', 'filler-basic', 'aesthetic-injector-bundle'],
  },

  'botox-advanced': {
    key: 'botox-advanced',
    title: 'Advanced Botox Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'Aesthetic Masterclass',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Lower-face artistry, masseter, and full-face neurotoxin strategy.',
    description: 'Advanced dosing, lower-face and neck applications, masseter reduction and the troubleshooting toolkit experienced injectors need.',
    longDescription: 'Advanced Botox Training is for injectors ready to move beyond upper-face patterns. You\'ll cover masseter reduction for facial slimming, the lip flip and lower-face artistry, neck lifting techniques, and the patient-retention strategies that turn one-off visits into long-term practices.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Advanced (Basic Botox recommended)',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'High-unit dosing strategies',
      'Masseter reduction and facial slimming',
      'Lip flip, DAOs and mentalis',
      'Nefertiti lift and platysmal banding',
      'Difficult-case troubleshooting',
      'SVA completion certificate',
    ],
    curriculum: BOTOX_ADVANCED_CURRICULUM,
    faqs: AESTHETIC_FAQS_BASE,
    instructorNote: 'Advanced neurotoxin is where you differentiate — the lower face, neck and masseter are what retain patients long-term. We drill each region with live case reviews.',
    relatedCourses: ['botox-basic', 'filler-advanced', 'aesthetic-injector-bundle'],
  },

  'filler-basic': {
    key: 'filler-basic',
    title: 'Basic Dermal Filler Training',
    subtitle: 'Live 4-hour Zoom cohort',
    category: 'Aesthetic Training',
    price: '$399',
    priceInt: 39900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    badge: 'Popular',
    deliveryMode: 'live-zoom',
    tagline: 'Foundational HA filler training with a safety-first approach.',
    description: 'Lip and cheek technique, product selection, and the vascular occlusion protocol every filler injector needs ready.',
    longDescription: 'Basic Dermal Filler Training gives you the clinical foundation to inject HA fillers safely and predictably. We cover rheology and product families, lip and midface technique, the needle-vs-cannula decision framework, and — most importantly — the vascular occlusion recognition and hyaluronidase workflow that protects your patients and your practice.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'HA filler rheology and product selection',
      'Lip injection technique',
      'Midface and cheek volumization',
      'Needle vs cannula decision framework',
      'Vascular occlusion and hyaluronidase protocol',
      'SVA completion certificate',
    ],
    curriculum: FILLER_BASIC_CURRICULUM,
    faqs: AESTHETIC_FAQS_BASE,
    instructorNote: 'Filler is the highest-volume aesthetic procedure and the one where complications can be most serious. This course treats safety with the seriousness it deserves.',
    relatedCourses: ['filler-advanced', 'botox-basic', 'aesthetic-injector-bundle'],
  },

  'filler-advanced': {
    key: 'filler-advanced',
    title: 'Advanced Dermal Filler Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'Aesthetic Masterclass',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Jawline, chin, nose and tear-trough technique with complication mastery.',
    description: 'Full-face treatment design — jawline, chin projection, non-surgical rhinoplasty, tear trough — and the complete vascular occlusion workflow.',
    longDescription: 'Advanced Dermal Filler Training is for injectors moving into full-face artistry. You\'ll cover jawline architecture, chin projection, non-surgical nose, and the tear trough — the four regions that separate experienced providers from beginners — along with the complete complication management workflow you need when things go sideways.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Advanced (Basic Filler recommended)',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'Full-face treatment design',
      'Jawline and chin contouring',
      'Non-surgical rhinoplasty technique',
      'Tear trough with cannula',
      'Full vascular occlusion decision tree',
      'SVA completion certificate',
    ],
    curriculum: FILLER_ADVANCED_CURRICULUM,
    faqs: AESTHETIC_FAQS_BASE,
    instructorNote: 'Advanced filler is where artistry meets risk. The regions we cover here — nose, tear trough, jawline — are the ones with the highest complication rates and the highest patient demand. Train them seriously.',
    relatedCourses: ['filler-basic', 'botox-advanced', 'aesthetic-injector-bundle'],
  },

  'aesthetic-injector-bundle': {
    key: 'aesthetic-injector-bundle',
    title: 'Complete Aesthetic Injector Bundle',
    subtitle: 'All four core aesthetic programs',
    category: 'Aesthetic Bundle',
    price: '$1,000',
    priceInt: 100000,
    originalPrice: '$1,796',
    type: 'Bundle · Save $796 · Completion certificates',
    badge: 'Best Value',
    deliveryMode: 'live-zoom',
    tagline: 'Basic and Advanced Botox plus Basic and Advanced Filler — the full injector pathway.',
    description: 'The complete aesthetic injector path: Basic Botox, Advanced Botox, Basic Filler and Advanced Filler — four live 4-hour Zoom programs, bundled.',
    longDescription: 'The Complete Aesthetic Injector Bundle is the most efficient way to go from new injector to full-service aesthetic provider. You get all four live programs — Basic Botox, Advanced Botox, Basic Filler, Advanced Filler — at a bundle price that saves you $796 versus buying them individually. Each cohort is scheduled independently so you can pace the programs over a few weeks as your comfort grows.',
    duration: '16 hours live (4 × 4 hours)',
    lessons: 16,
    level: 'Beginner to Advanced',
    includes: [
      'Basic Botox Training (4-hour live)',
      'Advanced Botox Training (4-hour live)',
      'Basic Dermal Filler Training (4-hour live)',
      'Advanced Dermal Filler Training (4-hour live)',
      'All slide decks, protocols and templates',
      'Four SVA completion certificates',
      'Priority alumni Q&A support',
    ],
    curriculum: [
      { section: 'Basic Botox Training', lessons: ['Neurotoxin pharmacology and upper-face patterns', 'Consultation, anatomy and troubleshooting'] },
      { section: 'Advanced Botox Training', lessons: ['Masseter, lip flip and lower-face artistry', 'Nefertiti lift, platysmal banding and advanced cases'] },
      { section: 'Basic Dermal Filler Training', lessons: ['HA rheology, lip and cheek technique', 'Vascular occlusion and hyaluronidase protocol'] },
      { section: 'Advanced Dermal Filler Training', lessons: ['Jawline, chin and non-surgical rhinoplasty', 'Tear trough and complication mastery'] },
    ],
    faqs: [
      { q: "What's included in the bundle?", a: 'All four programs — Basic Botox, Advanced Botox, Basic Filler, Advanced Filler — each a live 4-hour Zoom cohort with its own SVA completion certificate. Total value $1,796, bundle price $1,000.' },
      { q: 'Do I have to take them all in one week?', a: 'No. You schedule each cohort separately — most providers space them over 3–6 weeks to give hands-on practice time between programs.' },
      ...AESTHETIC_FAQS_BASE.slice(1),
    ],
    instructorNote: 'The bundle is our recommended pathway for providers serious about building an aesthetic practice. Learn the full toolkit in a structured sequence — and keep the savings in your launch budget.',
    relatedCourses: ['botox-basic', 'filler-basic', 'prp-prf-ezgel'],
  },

  'prp-prf-ezgel': {
    key: 'prp-prf-ezgel',
    title: 'PRP, PRF & EZ Gel Training',
    subtitle: 'Live 4-hour Zoom masterclass',
    category: 'Regenerative Aesthetics',
    price: '$499',
    priceInt: 49900,
    type: 'Live Zoom · 4 hours · Completion certificate',
    deliveryMode: 'live-zoom',
    tagline: 'Platelet-rich biologics from draw through injection.',
    description: 'Combined training on PRP, PRF and EZ Gel — draw protocols, spin technique, and facial rejuvenation injection.',
    longDescription: 'Platelet-rich biologics have become a flagship offering for aesthetic practices focused on natural-looking results. This combined masterclass covers the full family — PRP, PRF and EZ Gel — from the science and draw technique to the centrifuge protocols that actually produce clinical-grade material, and the facial rejuvenation injection technique that pairs beautifully with microneedling and fillers.',
    duration: '4 hours live',
    lessons: 4,
    level: 'Intermediate',
    includes: [
      'Live 4-hour instructor-led Zoom',
      'PRP, PRF and EZ Gel clinical differences',
      'Blood draw and tube selection',
      'Centrifuge spin protocols',
      'EZ Gel thermal activation',
      'Facial injection technique by region',
      'Combination with microneedling and fillers',
      'SVA completion certificate',
    ],
    curriculum: PRP_PRF_EZGEL_CURRICULUM,
    faqs: AESTHETIC_FAQS_BASE,
    instructorNote: 'Biologics are where safety, artistry and natural results converge. Providers who master this category build some of the most loyal patient bases in aesthetics.',
    relatedCourses: ['filler-basic', 'botox-basic', 'aesthetic-injector-bundle'],
  },

  // ───────────── In-person hands-on ─────────────

  'bbl-russian-lip-inperson': {
    key: 'bbl-russian-lip-inperson',
    title: 'Non-Surgical BBL & Russian Lip Technique',
    subtitle: 'In-person hands-on intensive',
    category: 'In-Person Training',
    price: '$2,500',
    priceInt: 250000,
    type: 'In-person · 1-day intensive · Live models',
    badge: 'Hands-on',
    deliveryMode: 'in-person',
    tagline: 'One-day in-person intensive on two of the most-requested aesthetic procedures.',
    description: 'Hands-on training with live models on non-surgical BBL injection and the Russian lip technique — everything you need to start offering both.',
    longDescription: 'Some techniques can only be taught hands-on. The Non-Surgical BBL & Russian Lip Intensive is a full-day in-person workshop at our training facility, combining live demonstrations with supervised practice on live models. You\'ll leave the day with actual injection experience on both procedures, professional photos of your work, and a completion certificate. Seats are limited to preserve an intimate, high-ratio learning environment.',
    duration: '8–10 hours in-person',
    lessons: 4,
    level: 'Intermediate to Advanced (prior injection experience required)',
    includes: [
      'Full-day in-person hands-on workshop',
      'Live model practice — BBL and Russian lip',
      'Pre-reading and protocols delivered ahead of the day',
      'All product and supplies for the day',
      'Professional portfolio photos of your work',
      'Lunch and refreshments provided',
      'SVA completion certificate',
    ],
    curriculum: BBL_RUSSIAN_LIP_CURRICULUM,
    faqs: [
      { q: 'How is the hands-on portion supervised?', a: 'Small cohorts with a 4:1 student-to-instructor ratio. Every injection on a live model is supervised, and the instructor stays beside you during your first passes.' },
      { q: 'Where does the training take place?', a: 'At our partner training facility. Full venue details, travel tips and accommodation recommendations are sent once you enroll.' },
      { q: 'Prerequisites?', a: 'Prior aesthetic injection experience is strongly recommended. Completion of Basic Filler Training (or equivalent) is expected.' },
      { q: 'Can I request a specific date?', a: 'Yes. Use the "Request a Date" option to tell us your preferred dates and we\'ll confirm availability. Enrolling locks in your seat for the next available cohort otherwise.' },
      { q: 'What if I need to reschedule?', a: 'We allow one free reschedule up to 14 days before your event. Contact us at info@skilledvisitsacademy.com.' },
    ],
    instructorNote: 'You cannot learn BBL or Russian lip technique over Zoom — the micro-adjustments only transfer in person. Every seat in this intensive is a serious investment in skills that command serious fees.',
    relatedCourses: ['filler-advanced', 'prp-prf-ezgel', 'aesthetic-injector-bundle'],
  },

  // ───────────── Private 1:1 — dedicated sessions ─────────────

  'private-iv-therapy-training': {
    key: 'private-iv-therapy-training',
    title: 'Private Comprehensive IV Therapy Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$798',
    priceInt: 79800,
    originalPrice: '$1,200',
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Comprehensive IV Therapy Training delivered 1:1 on your schedule.',
    description: 'The same flagship IV training content, delivered as a private session with the lead instructor — scheduled at a time that works for you.',
    longDescription: 'The Private edition of our Comprehensive IV Therapy Training covers the identical curriculum as the group cohort, but delivered 1:1 on a schedule you set. You get the instructor\'s full attention, custom case discussions, and the flexibility to tailor the emphasis to the part of your practice you want to grow fastest.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: IV_TRAINING_CURRICULUM,
    faqs: [
      PRIVATE_FAQ,
      { q: 'Is this the same content as the group course?', a: 'Yes. Identical curriculum, delivered 1:1 with room to customize the emphasis and spend more time on areas where you want extra depth.' },
      ...IV_FAQS_BASE.slice(2),
    ],
    instructorNote: 'Private sessions are for clinicians who value flexibility and direct access. The material is identical to the group course — the difference is pace, depth of case discussion and scheduling on your terms.',
    relatedCourses: ['iv-therapy-training', 'private-botox-basic', 'private-filler-basic'],
  },

  'private-botox-basic': {
    key: 'private-botox-basic',
    title: 'Private Basic Botox Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$798',
    priceInt: 79800,
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Basic Botox Training delivered 1:1 on your schedule.',
    description: 'The same foundational neurotoxin curriculum as the group cohort — delivered 1:1 with the lead instructor at a time that works for you.',
    longDescription: 'The Private edition of our Basic Botox Training covers the identical curriculum as the group cohort, with the added flexibility of private scheduling and tailored case discussion. Ideal for clinicians who want maximum instructor attention and the ability to work through their specific patient scenarios in depth.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: BOTOX_BASIC_CURRICULUM,
    faqs: [PRIVATE_FAQ, ...AESTHETIC_FAQS_BASE.slice(2)],
    instructorNote: 'Going private is the right call when you have a specific patient population in mind and want the class tailored to it from the start.',
    relatedCourses: ['botox-basic', 'private-botox-advanced', 'private-filler-basic'],
  },

  'private-botox-advanced': {
    key: 'private-botox-advanced',
    title: 'Private Advanced Botox Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Advanced Botox Training delivered 1:1 on your schedule.',
    description: 'The same advanced neurotoxin curriculum — masseter, lower-face, full-face artistry — delivered 1:1 with the lead instructor.',
    longDescription: 'The Private edition of Advanced Botox Training is the same curriculum as the group cohort, delivered 1:1 with the lead instructor. Perfect for experienced injectors who want to work through their specific case library, troubleshoot difficult patients, and refine lower-face artistry with focused attention.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Advanced',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Bring-your-own case review',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: BOTOX_ADVANCED_CURRICULUM,
    faqs: [PRIVATE_FAQ, ...AESTHETIC_FAQS_BASE.slice(2)],
    instructorNote: 'Advanced private sessions are the highest-return format for experienced injectors — bring your difficult cases and leave with a sharpened toolkit.',
    relatedCourses: ['botox-advanced', 'private-botox-basic', 'private-filler-advanced'],
  },

  'private-filler-basic': {
    key: 'private-filler-basic',
    title: 'Private Basic Dermal Filler Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$798',
    priceInt: 79800,
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Basic Dermal Filler Training delivered 1:1 on your schedule.',
    description: 'The foundational filler curriculum — product selection, lip and cheek technique, vascular occlusion workflow — delivered 1:1.',
    longDescription: 'The Private edition of our Basic Dermal Filler Training gives you the same foundational curriculum as the group cohort — rheology, lip and cheek technique, vascular occlusion protocol — with the flexibility of private scheduling and tailored case discussion.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Beginner to Intermediate',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Tailored emphasis and case discussion',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: FILLER_BASIC_CURRICULUM,
    faqs: [PRIVATE_FAQ, ...AESTHETIC_FAQS_BASE.slice(2)],
    instructorNote: 'Private filler training lets us walk through your specific patient population and build a product framework that fits what you\'ll actually be injecting.',
    relatedCourses: ['filler-basic', 'private-filler-advanced', 'private-botox-basic'],
  },

  'private-filler-advanced': {
    key: 'private-filler-advanced',
    title: 'Private Advanced Dermal Filler Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Advanced Dermal Filler Training delivered 1:1 on your schedule.',
    description: 'Full-face artistry, jawline, chin, non-surgical rhinoplasty and tear trough — delivered 1:1 with the lead instructor.',
    longDescription: 'The Private edition of Advanced Dermal Filler Training is tailored for experienced injectors moving into full-face artistry. Bring your real cases, work through jawline, chin and nose technique in depth, and leave with a sharpened complication-management workflow for the highest-risk regions.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Advanced',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Bring-your-own case review',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: FILLER_ADVANCED_CURRICULUM,
    faqs: [PRIVATE_FAQ, ...AESTHETIC_FAQS_BASE.slice(2)],
    instructorNote: 'Advanced filler in a private format is the fastest way to elevate your jawline, chin and nose technique — we spend whatever time the material deserves, not what a group cohort allows.',
    relatedCourses: ['filler-advanced', 'private-botox-advanced', 'private-prp-prf-ezgel'],
  },

  'private-prp-prf-ezgel': {
    key: 'private-prp-prf-ezgel',
    title: 'Private PRP, PRF & EZ Gel Training',
    subtitle: 'Dedicated 1:1 session',
    category: 'Private 1:1',
    price: '$998',
    priceInt: 99800,
    type: 'Private 1:1 · Scheduled to your calendar',
    badge: 'Private 1:1',
    deliveryMode: 'private-1on1',
    tagline: 'Full regenerative aesthetics curriculum delivered 1:1.',
    description: 'PRP, PRF and EZ Gel — draw through injection — delivered 1:1 with the lead instructor on your schedule.',
    longDescription: 'The Private edition of our PRP, PRF & EZ Gel Training gives you the full regenerative aesthetics curriculum in a private session. Ideal for clinicians who want to integrate biologics into an existing aesthetic or wellness practice and need the instructor walk-through tailored to their equipment and patient base.',
    duration: '4 hours live — scheduled 1:1',
    lessons: 4,
    level: 'Intermediate to Advanced',
    includes: [
      '1:1 dedicated 4-hour live session',
      'Flexible scheduling around your calendar',
      'All materials from the standard course',
      'Equipment recommendations tailored to you',
      'Private alumni Q&A channel access',
      'SVA completion certificate',
    ],
    curriculum: PRP_PRF_EZGEL_CURRICULUM,
    faqs: [PRIVATE_FAQ, ...AESTHETIC_FAQS_BASE.slice(2)],
    instructorNote: 'Biologics succeed or fail on equipment and workflow as much as technique. Private training lets us match the program to what you\'ll actually use.',
    relatedCourses: ['prp-prf-ezgel', 'private-filler-advanced', 'private-bbl-russian-lip'],
  },

  'private-bbl-russian-lip': {
    key: 'private-bbl-russian-lip',
    title: 'Private Non-Surgical BBL & Russian Lip Technique',
    subtitle: 'Dedicated 1:1 in-person intensive',
    category: 'Private 1:1',
    price: '$5,000',
    priceInt: 500000,
    type: 'Private 1:1 · In-person hands-on',
    badge: 'Premium Private',
    deliveryMode: 'private-1on1',
    tagline: 'Private, dedicated hands-on day — your pace, your models.',
    description: 'Full in-person hands-on intensive on non-surgical BBL and Russian lip technique — 1:1 with the lead instructor on a date that works for you.',
    longDescription: 'The Premium Private edition of our BBL & Russian Lip Intensive is the highest-value training we offer. You get a full dedicated day with our lead instructor — hands-on, in-person, with live models sourced for your session. Every injection is directly supervised. You set the pace and we tailor the emphasis to the exact technique you want to master.',
    duration: '8–10 hours in-person · 1:1',
    lessons: 4,
    level: 'Intermediate to Advanced',
    includes: [
      'Dedicated 1:1 in-person hands-on day',
      'Live models sourced for your session',
      'Pre-reading and protocols ahead of the day',
      'All product and supplies',
      'Professional portfolio photos',
      'One free follow-up 1:1 Zoom consult post-training',
      'SVA completion certificate',
    ],
    curriculum: BBL_RUSSIAN_LIP_CURRICULUM,
    faqs: [
      PRIVATE_FAQ,
      { q: 'Where does the session take place?', a: 'At our partner training facility. Full venue details, travel tips and accommodation recommendations are sent once your session is confirmed.' },
      { q: 'Can I bring my own model?', a: 'Yes. If you have a specific model you want to train on we can accommodate — otherwise we source for you.' },
      { q: 'Prerequisites?', a: 'Prior aesthetic injection experience is required. Completion of Advanced Filler Training (or equivalent) is expected.' },
    ],
    instructorNote: 'This is the most personalized hands-on training in our catalog. For providers launching a dedicated BBL or lip service — or refining an existing one — nothing transfers skill faster than a full day 1:1 with live models.',
    relatedCourses: ['bbl-russian-lip-inperson', 'private-filler-advanced', 'private-prp-prf-ezgel'],
  },

}

// Compact lookup for related-course cards.
const RELATED_TITLES: Record<string, { title: string; price: string; subtitle: string }> = Object.fromEntries(
  Object.entries(COURSES).map(([k, c]) => [k, { title: c.title, price: c.price, subtitle: c.subtitle }])
)

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

// Request-a-Date modal. Posts to /api/request-to-book so our team can confirm
// availability or suggest dates before the learner commits to a seat. Only
// shown on in-person and private-1on1 courses where scheduling is flexible.
function RequestToBookModal({
  course,
  onClose,
}: {
  course: Course
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [preferredDates, setPreferredDates] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/request-to-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseKey: course.key,
          courseTitle: course.title,
          deliveryMode: course.deliveryMode,
          fullName,
          email,
          phone,
          licenseType,
          licenseState,
          preferredDates,
          notes,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      toast.success('Request received — we will be in touch within 1 business day.')
      onClose()
    } catch {
      toast.error('Could not submit request. Please email info@skilledvisitsacademy.com.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl my-auto">
        <div className="px-6 py-5 border-b border-[#EEEEEE] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a]">Request a date</h3>
            <p className="text-sm text-[#5B5B5B] mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5B5B5B] hover:text-[#1a1a1a] text-xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-[#1a1a1a]">Full name *</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#1a1a1a]">Email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-[#1a1a1a]">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-[#1a1a1a]">License type *</span>
              <input
                required
                placeholder="RN, NP, PA, MD, DO..."
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#1a1a1a]">License state *</span>
              <input
                required
                placeholder="CA"
                maxLength={2}
                value={licenseState}
                onChange={(e) => setLicenseState(e.target.value.toUpperCase())}
                className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none uppercase"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-[#1a1a1a]">Preferred dates *</span>
            <input
              required
              placeholder="e.g. Saturdays in June, or May 15 / May 22"
              value={preferredDates}
              onChange={(e) => setPreferredDates(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#1a1a1a]">Anything we should know?</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Experience level, specific techniques to focus on, travel constraints..."
              className="mt-1 w-full px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:border-[#9E50E5] focus:ring-1 focus:ring-[#9E50E5] outline-none"
            />
          </label>
          <p className="text-xs text-[#5B5B5B] leading-relaxed">
            We will be in touch within 1 business day to confirm availability. Submitting this request does not charge your card.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-[30px] border border-[#D9D9D9] text-[#1a1a1a] font-semibold text-sm hover:bg-[#EEEEEE] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-bold text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = COURSES[slug]
  if (!course) notFound()

  const { addItem, isInCart } = useCart()
  const [showRequestModal, setShowRequestModal] = useState(false)

  const inCart = isInCart(course.key)
  const showRequestToBook =
    course.deliveryMode === 'in-person' || course.deliveryMode === 'private-1on1'

  function handleAddToCart() {
    addItem({
      key: course.key,
      title: course.title,
      price: course.price,
      priceInt: course.priceInt,
      subtitle: course.subtitle,
    })
    toast.success(`${course.title} added to cart`)
  }

  const deliveryBadge = (() => {
    if (course.deliveryMode === 'in-person') {
      return { icon: MapPin, label: 'In-person · Hands-on' }
    }
    if (course.deliveryMode === 'private-1on1') {
      return { icon: UserCheck, label: 'Private 1:1' }
    }
    return { icon: CalendarClock, label: 'Live Zoom cohort' }
  })()

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
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest">{course.category}</span>
                  {course.badge && (
                    <>
                      <span className="text-[#D9D9D9]">·</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#9E50E5] text-white text-xs font-bold">{course.badge}</span>
                    </>
                  )}
                  <span className="text-[#D9D9D9]">·</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5B5B]">
                    <deliveryBadge.icon className="h-3.5 w-3.5" />
                    {deliveryBadge.label}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-3 leading-tight">{course.title}</h1>
                <p className="text-lg text-[#9E50E5] font-semibold mb-4">{course.tagline}</p>
                <p className="text-[#5B5B5B] leading-relaxed text-base mb-6 max-w-2xl">{course.description}</p>

                {/* Meta stats */}
                <div className="flex flex-wrap gap-5">
                  {[
                    { icon: Clock, text: course.duration },
                    { icon: BookOpen, text: `${course.lessons} modules` },
                    { icon: Users, text: 'Small cohorts' },
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
                  {showRequestToBook && (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[30px] text-[#5B5B5B] hover:text-[#9E50E5] font-semibold text-sm transition-colors border border-transparent hover:border-[#9E50E5]/30"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Or request a date
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#5B5B5B]">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Licensed clinicians only · Verified at enrollment
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
              { icon: Zap, text: 'Live instructor-led training' },
              { icon: Star, text: 'Clinician-built curriculum' },
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
                        <p className="text-xs text-[#5B5B5B] mt-0.5">{section.lessons.length} topics</p>
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
                  {showRequestToBook && (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[30px] text-[#5B5B5B] hover:text-[#9E50E5] font-semibold text-xs transition-colors"
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      Request a date
                    </button>
                  )}
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
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FBF6FF] transition-colors group gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#9E50E5] truncate">{related.subtitle}</p>
                            <p className="text-sm text-[#1a1a1a] group-hover:text-[#9E50E5] transition-colors font-medium leading-snug">{related.title}</p>
                          </div>
                          <span className="text-sm font-bold text-[#1a1a1a] shrink-0">{related.price}</span>
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
            {course.type}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/checkout?course=${course.key}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[30px] bg-white text-[#9E50E5] hover:bg-[#FBF6FF] font-bold text-sm transition-colors"
            >
              Enroll Now — {course.price}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {showRequestToBook ? (
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[30px] font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-[#9E50E5] transition-colors"
              >
                <CalendarClock className="h-4 w-4" />
                Request a date
              </button>
            ) : (
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
            )}
          </div>
        </AnimateOnScroll>
      </section>

      <PublicFooter />

      {showRequestModal && (
        <RequestToBookModal
          course={course}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  )
}
