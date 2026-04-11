import Image from 'next/image'
import Link from 'next/link'
import {
  FlaskConical,
  BookOpen,
  Users,
  Syringe,
  Calculator,
  TestTube2,
  Beaker,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

const features = [
  {
    icon: BookOpen,
    title: 'Expert Video Courses',
    description:
      'Professionally produced IV therapy courses covering technique, protocols, and clinical application.',
  },
  {
    icon: Users,
    title: 'Professional Community',
    description:
      'Connect with fellow providers. Ask clinical questions and get answers directly from SVA experts.',
  },
  {
    icon: Syringe,
    title: 'Protocol Library',
    description:
      'Access SVA-approved IV cocktail protocols organized by patient symptoms and treatment goals.',
  },
  {
    icon: FlaskConical,
    title: 'Vitamin Reference',
    description:
      'Complete IV-compatible vitamin, mineral, and amino acid database with dosing and contraindications.',
  },
  {
    icon: Beaker,
    title: 'Mixing Guide',
    description:
      'Interactive compatibility matrix. Instantly see which IV additives are safe to combine.',
  },
  {
    icon: Calculator,
    title: 'Dosage Calculator',
    description:
      'Weight-based dosing with clinical safety ranges. Fast and accurate at the point of care.',
  },
  {
    icon: Layers,
    title: 'Protocol Builder',
    description:
      'Build, save, and reuse custom IV protocols tailored to your patient population and practice.',
  },
  {
    icon: TestTube2,
    title: 'AI Lab Analyzer',
    description:
      'Upload patient labs and receive AI-powered clinical interpretation with IV therapy recommendations.',
  },
]

const testimonials = [
  {
    quote:
      'SVA has completely changed how I approach IV therapy. The protocol tools alone save me 30 minutes every shift.',
    name: 'Sarah M.',
    credential: 'RN · Mobile IV Nurse, 8 years',
    initials: 'SM',
  },
  {
    quote:
      'The lab analyzer is incredible. It flags what matters and connects the dots to IV support options I might not have considered.',
    name: 'Dr. James L.',
    credential: 'NP · Functional Medicine',
    initials: 'JL',
  },
  {
    quote:
      'The community forum is where real learning happens. I got a clinical answer from an SVA provider within the hour.',
    name: 'Michelle T.',
    credential: 'PA-C · Aesthetic & Wellness Clinic',
    initials: 'MT',
  },
]

const stats = [
  { value: '50+', label: 'IV Protocols' },
  { value: '8', label: 'Clinical Tools' },
  { value: 'AI', label: 'Lab Analysis' },
  { value: '24/7', label: 'Community' },
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
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#FBF6FF] border border-[#9E50E5]/25 text-[#9E50E5] text-sm font-medium mb-7">
                  Built for IV Therapy Professionals
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={80}>
                <h1 className="text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem] font-extrabold leading-[1.1] tracking-tight text-[#1a1a1a] mb-6">
                  Master IV Therapy.<br />
                  <span className="text-[#9E50E5]">Practice With Confidence.</span>
                </h1>
              </AnimateOnScroll>

              <AnimateOnScroll delay={160}>
                <p className="text-lg text-[#5B5B5B] leading-relaxed mb-9 max-w-lg mx-auto lg:mx-0">
                  Expert video courses, AI-powered lab analysis, clinical decision tools, and a professional community — everything a mobile IV provider needs, in one platform.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={220}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-8 py-[17px] rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-semibold text-[15px] transition-colors"
                  >
                    View Courses & Pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/checkout?course=iv-therapy-foundation"
                    className="inline-flex items-center justify-center gap-2 px-8 py-[17px] rounded-[30px] border border-[#9E50E5] text-[#9E50E5] hover:bg-[#9E50E5] hover:text-white font-semibold text-[15px] transition-colors"
                  >
                    Enroll Now — $199
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={280}>
                <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                  {['Cancel anytime', 'HIPAA-conscious design', 'SVA-approved protocols', 'Instant access'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[#5B5B5B]">
                      <CheckCircle className="h-4 w-4 text-[#9E50E5] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: image */}
            <AnimateOnScroll delay={150} direction="right" className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=85&auto=format&fit=crop"
                  alt="IV therapy medical professional"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-5 left-5 bg-white rounded-xl px-5 py-3.5 shadow-lg">
                  <p className="text-[#9E50E5] text-2xl font-extrabold">50+</p>
                  <p className="text-[#5B5B5B] text-xs font-medium">SVA-Approved Protocols</p>
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
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-sm text-white/70 font-medium">{s.label}</div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="bg-white py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">The Full Toolkit</p>
            <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-[#1a1a1a] mb-4">
              Everything you need to practice at the highest level
            </h2>
            <p className="text-lg text-[#5B5B5B] max-w-2xl mx-auto leading-relaxed">
              From foundational education to advanced clinical decision support — built specifically for IV therapy practitioners.
            </p>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <AnimateOnScroll key={feature.title} delay={i * 60}>
                  <div className="bg-[#FBF6FF] rounded-[10px] p-7 hover:shadow-md transition-shadow border border-[#D9D9D9]/50 h-full">
                    <div className="h-12 w-12 rounded-xl bg-[#9E50E5]/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-[#9E50E5]" />
                    </div>
                    <h3 className="font-bold text-[#1a1a1a] mb-2 text-[15px]">{feature.title}</h3>
                    <p className="text-sm text-[#5B5B5B] leading-relaxed">{feature.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Image break ─── */}
      <section className="bg-[#EEEEEE]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14 py-[90px]">

            <AnimateOnScroll direction="left" className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: '16/10' }}>
                <Image
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80&auto=format&fit=crop"
                  alt="IV therapy clinical environment"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" className="flex-1">
              <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-4">Why SVA</p>
              <h2 className="text-[2rem] md:text-[2.4rem] font-bold text-[#1a1a1a] mb-5 leading-tight">
                Continuing education built around how providers actually work
              </h2>
              <p className="text-[17px] text-[#5B5B5B] leading-relaxed mb-7">
                Not just another video library. SVA combines clinical decision tools with expert education so you can apply what you learn immediately — at the bedside, in the clinic, or in the field.
              </p>
              <ul className="space-y-3">
                {[
                  'AI-powered lab interpretation with IV recommendations',
                  'Interactive mixing guide and dosage calculator',
                  'SVA-provider Q&A in the professional community',
                ].map((item) => (
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

      {/* ─── Testimonials ─── */}
      <section className="bg-white py-[90px]">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-sm font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Member Stories</p>
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

      {/* ─── CTA ─── */}
      <section className="bg-[#9E50E5] py-[90px]">
        <AnimateOnScroll className="mx-auto max-w-[800px] px-4 sm:px-6 text-center">
          <h2 className="text-[2rem] md:text-[2.8rem] font-bold text-white mb-5">
            Ready to elevate your IV practice?
          </h2>
          <p className="text-lg text-white/75 mb-10 leading-relaxed">
            Join hundreds of IV therapy professionals learning smarter, practicing confidently, and staying ahead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout?course=iv-therapy-foundation"
              className="inline-flex items-center justify-center gap-2 px-9 py-[17px] rounded-[30px] bg-white text-[#9E50E5] hover:bg-[#FBF6FF] font-bold text-[15px] transition-colors"
            >
              Enroll Now — $199
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-9 py-[17px] rounded-[30px] border-2 border-white text-white hover:bg-white hover:text-[#9E50E5] font-bold text-[15px] transition-colors"
            >
              View all courses
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      <PublicFooter />

    </div>
  )
}
