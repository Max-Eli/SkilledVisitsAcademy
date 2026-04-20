import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  UserCheck,
  Video,
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

const trainingTopics = [
  {
    icon: Syringe,
    title: 'IV Therapy Administration',
    description: 'Insertion technique, line management, and safe delivery across clinical settings.',
  },
  {
    icon: ClipboardCheck,
    title: 'Patient Screening & Evaluation',
    description: 'Thorough assessment so each provider treats the right patient with the right therapy.',
  },
  {
    icon: FlaskConical,
    title: 'Vitamin & Nutrient Dosing',
    description: 'Protocol-driven dosing for hydration, wellness, and targeted nutrient therapy.',
  },
  {
    icon: Sparkles,
    title: 'Aesthetic Treatment Fundamentals',
    description: 'Core concepts for integrating neurotoxins, fillers, and biologics into practice.',
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Safety & Protocols',
    description: 'Complication management, emergency response, and SVA-approved safety protocols.',
  },
  {
    icon: Target,
    title: 'Treatment Planning',
    description: 'Translating patient goals into evidence-based, individualized treatment plans.',
  },
]

const confidenceOutcomes = [
  'Starting IVs safely',
  'Selecting appropriate IV protocols',
  'Understanding vitamin dosing and patient needs',
  'Evaluating patients for treatment',
  'Integrating wellness therapies into practice',
]

const whyChoose = [
  {
    icon: UserCheck,
    title: 'Personalized Training & Mentorship',
    description:
      'Because we are intentionally not a large training academy, our programs allow for a more personalized learning experience. Students receive direct guidance from a provider who understands the real challenges of implementing IV therapy and aesthetic treatments.',
    points: [
      'Meaningful interaction during training',
      'Real clinical insight',
      'Direct mentorship and guidance',
      'Continued support after completing the course',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Ongoing Clinical Support',
    description:
      'Learning does not end when the course is complete. Providers who train with SVA have access to continued mentorship and guidance as they begin offering treatments in their own practice.',
    points: [],
  },
  {
    icon: Video,
    title: 'Flexible Learning for Busy Providers',
    description:
      'Most courses are conducted live via Zoom, allowing medical professionals across the country to receive high-quality education without needing to travel.',
    points: [],
  },
]

const audience = [
  { icon: Stethoscope, label: 'Registered Nurses', short: 'RN' },
  { icon: Award, label: 'Nurse Practitioners', short: 'NP' },
  { icon: BookOpen, label: 'Physician Assistants', short: 'PA' },
  { icon: GraduationCap, label: 'Physicians', short: 'MD / DO' },
]

const testimonials = [
  {
    quote:
      'The mentorship is what sets SVA apart. I left training with real confidence starting IVs and building my own protocols.',
    name: 'Sarah M.',
    credential: 'RN · Mobile IV Nurse, 8 years',
    initials: 'SM',
  },
  {
    quote:
      'Hands-on, practical, and grounded in real patient care. Exactly what I needed to add wellness therapies to my practice.',
    name: 'Dr. James L.',
    credential: 'NP · Functional Medicine',
    initials: 'JL',
  },
  {
    quote:
      'I had direct access to my instructor before, during, and after the course. That continued support has been invaluable.',
    name: 'Michelle T.',
    credential: 'PA-C · Aesthetic & Wellness Clinic',
    initials: 'MT',
  },
]

const stats = [
  { value: 'NP-Led', label: 'Clinical Instruction' },
  { value: 'Live', label: 'Zoom & In-Person' },
  { value: '1:1', label: 'Mentorship Available' },
  { value: 'Nationwide', label: 'Provider Access' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      <PublicNav />

      {/* ─── Hero ─── */}
      <section className="bg-[#EEEEEE] overflow-hidden">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-20 lg:py-28">

            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <AnimateOnScroll delay={0}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBF6FF] border border-[#9E50E5]/25 text-[#9E50E5] text-sm font-medium mb-7">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Taught by a practicing Nurse Practitioner
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={80}>
                <h1 className="text-[2.4rem] sm:text-[2.9rem] lg:text-[3.3rem] font-extrabold leading-[1.1] tracking-tight text-[#1a1a1a] mb-6">
                  Learn IV Therapy &amp; Aesthetic Treatments<br />
                  <span className="text-[#9E50E5]">From a Practicing Nurse Practitioner</span>
                </h1>
              </AnimateOnScroll>

              <AnimateOnScroll delay={160}>
                <p className="text-lg text-[#5B5B5B] leading-relaxed mb-9 max-w-xl mx-auto lg:mx-0">
                  Hands-on education and mentorship designed for medical professionals who want to confidently offer IV therapy, wellness treatments, and aesthetic services in their practice. Our training is built from real clinical experience, real patient care, and practical treatment protocols used in everyday medical practice.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={220}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-8 py-[17px] rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-semibold text-[15px] transition-colors"
                  >
                    Enroll in Training
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-[17px] rounded-[30px] border border-[#9E50E5] text-[#9E50E5] hover:bg-[#9E50E5] hover:text-white font-semibold text-[15px] transition-colors"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={260}>
                <p className="text-sm italic text-[#5B5B5B] max-w-lg mx-auto lg:mx-0">
                  Training spots are limited to maintain a personalized learning experience.
                </p>
              </AnimateOnScroll>
            </div>

            {/* Right: image */}
            <AnimateOnScroll delay={150} direction="right" className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=85&auto=format&fit=crop"
                  alt="Nurse Practitioner providing IV therapy training"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-5 left-5 bg-white rounded-xl px-5 py-3.5 shadow-lg">
                  <p className="text-[#9E50E5] text-sm font-bold uppercase tracking-wider">NP-Led</p>
                  <p className="text-[#5B5B5B] text-xs font-medium mt-0.5">Real clinical experience</p>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-[#9E50E5] py-12">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <AnimateOnScroll key={s.label} delay={i * 80} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-sm text-white/75 font-medium">{s.label}</div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Professional Certification Training ─── */}
      <section className="bg-white py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">What You&rsquo;ll Learn</p>
            <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-[#1a1a1a] mb-4">
              Professional Certification Training
            </h2>
            <p className="text-lg text-[#5B5B5B] max-w-2xl mx-auto leading-relaxed">
              Our programs are designed for medical professionals who want to safely and confidently integrate IV therapy and aesthetic treatments into their practice. Our training focuses on real-world clinical application so providers can confidently implement what they learn.
            </p>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-12">
            {trainingTopics.map((topic, i) => {
              const Icon = topic.icon
              return (
                <AnimateOnScroll key={topic.title} delay={i * 60}>
                  <div className="bg-[#FBF6FF] rounded-[10px] p-7 hover:shadow-md transition-shadow border border-[#D9D9D9]/50 h-full">
                    <div className="h-12 w-12 rounded-xl bg-[#9E50E5]/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-[#9E50E5]" />
                    </div>
                    <h3 className="font-bold text-[#1a1a1a] mb-2 text-[17px]">{topic.title}</h3>
                    <p className="text-sm text-[#5B5B5B] leading-relaxed">{topic.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>

          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-2 text-sm text-[#5B5B5B] bg-[#FBF6FF] rounded-full px-5 py-3 max-w-2xl mx-auto">
              <Video className="h-4 w-4 text-[#9E50E5] flex-shrink-0" />
              <span>Most courses are conducted live via Zoom, accessible to providers nationwide.</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Walk Away With Real Clinical Confidence ─── */}
      <section className="bg-[#EEEEEE]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14 py-[90px]">

            <AnimateOnScroll direction="left" className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: '16/10' }}>
                <Image
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80&auto=format&fit=crop"
                  alt="Clinical training environment"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" className="flex-1">
              <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-4">Outcomes</p>
              <h2 className="text-[2rem] md:text-[2.4rem] font-bold text-[#1a1a1a] mb-5 leading-tight">
                Walk away with real clinical confidence
              </h2>
              <p className="text-[17px] text-[#5B5B5B] leading-relaxed mb-7">
                Our goal is not just to teach information but to help providers develop the confidence and clinical understanding needed to safely perform treatments.
              </p>
              <ul className="space-y-3">
                {confidenceOutcomes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-[#5B5B5B]">
                    <CheckCircle className="h-5 w-5 text-[#9E50E5] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ─── Why Choose SVA ─── */}
      <section className="bg-white py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14 max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Why Skilled Visits Academy</p>
            <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-[#1a1a1a] mb-4">
              Built from real clinical experience
            </h2>
            <p className="text-lg text-[#5B5B5B] leading-relaxed">
              Skilled Visits Academy was founded by a practicing Nurse Practitioner with real-world experience in IV therapy, wellness medicine, and aesthetic treatments. Our programs are built from hands-on clinical experience and real patient care — giving providers practical knowledge they can confidently apply in their own practice.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-[30px]">
            {whyChoose.map((card, i) => {
              const Icon = card.icon
              return (
                <AnimateOnScroll key={card.title} delay={i * 80}>
                  <div className="bg-[#FBF6FF] rounded-[10px] p-7 border border-[#D9D9D9]/50 h-full flex flex-col">
                    <div className="h-12 w-12 rounded-xl bg-[#9E50E5] flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1a1a1a] mb-3 text-[17px]">{card.title}</h3>
                    <p className="text-sm text-[#5B5B5B] leading-relaxed mb-4">{card.description}</p>
                    {card.points.length > 0 && (
                      <ul className="space-y-2 mt-auto pt-2 border-t border-[#9E50E5]/10">
                        {card.points.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-[13px] text-[#5B5B5B]">
                            <CheckCircle className="h-4 w-4 text-[#9E50E5] mt-0.5 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Who This Training Is For ─── */}
      <section className="bg-[#EEEEEE] py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">For Licensed Providers</p>
            <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-[#1a1a1a] mb-4">
              Who this training is for
            </h2>
            <p className="text-lg text-[#5B5B5B] max-w-2xl mx-auto leading-relaxed">
              Our programs are designed for licensed healthcare professionals looking to expand their clinical offerings with confidence.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {audience.map((role, i) => {
              const Icon = role.icon
              return (
                <AnimateOnScroll key={role.label} delay={i * 70}>
                  <div className="bg-white rounded-[10px] p-7 border border-[#D9D9D9]/50 h-full text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-[#9E50E5]/10 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-[#9E50E5]" />
                    </div>
                    <p className="text-xs font-bold text-[#9E50E5] uppercase tracking-widest mb-1">{role.short}</p>
                    <p className="text-[15px] font-semibold text-[#1a1a1a]">{role.label}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-white py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Provider Stories</p>
            <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-[#1a1a1a]">
              What providers are saying
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-[30px]">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={t.name} delay={i * 100}>
                <div className="bg-[#FBF6FF] rounded-[10px] p-8 border border-[#D9D9D9]/50 h-full">
                  <p className="text-[15px] text-[#5B5B5B] leading-relaxed mb-7">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#9E50E5] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1a1a] text-sm">{t.name}</p>
                      <p className="text-xs text-[#5B5B5B]">{t.credential}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="bg-[#9E50E5] py-[90px]">
        <AnimateOnScroll className="mx-auto max-w-[800px] px-4 sm:px-6 text-center">
          <h2 className="text-[2rem] md:text-[2.8rem] font-bold text-white mb-5">
            Start your training today
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Whether you are looking to add IV therapy, wellness treatments, or aesthetic services to your practice, our programs are designed to give you the knowledge and confidence to begin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-9 py-[17px] rounded-[30px] bg-white text-[#9E50E5] hover:bg-[#FBF6FF] font-bold text-[15px] transition-colors"
            >
              Enroll in Training
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-9 py-[17px] rounded-[30px] border-2 border-white text-white hover:bg-white hover:text-[#9E50E5] font-bold text-[15px] transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      <PublicFooter />

    </div>
  )
}
