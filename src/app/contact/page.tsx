'use client'

import { useState } from 'react'
import { Mail, Phone, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

const SUBJECTS = [
  'General inquiry',
  'Course question',
  'Technical support',
  'Billing & payments',
  'Group / clinic pricing',
  'Partnership inquiry',
  'Other',
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Simulate submission — replace with actual API call
    await new Promise((r) => setTimeout(r, 1000))

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="bg-[#EEEEEE] py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 text-center">
          <AnimateOnScroll>
            <p className="text-xs font-semibold text-[#9E50E5] uppercase tracking-widest mb-3">Get In Touch</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4">
              Contact us
            </h1>
            <p className="text-lg text-[#5B5B5B] max-w-xl mx-auto leading-relaxed">
              Questions about courses, group pricing, or technical support — our team typically responds within one business day.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Contact info */}
            <AnimateOnScroll className="space-y-6">
              <div className="bg-[#FBF6FF] rounded-2xl border border-[#D9D9D9] p-7">
                <div className="h-10 w-10 rounded-xl bg-[#9E50E5]/10 flex items-center justify-center mb-4">
                  <Mail className="h-5 w-5 text-[#9E50E5]" />
                </div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Email</h3>
                <a
                  href="mailto:hello@skilledvisitsacademy.com"
                  className="text-sm text-[#9E50E5] hover:underline"
                >
                  hello@skilledvisitsacademy.com
                </a>
              </div>

              <div className="bg-[#FBF6FF] rounded-2xl border border-[#D9D9D9] p-7">
                <div className="h-10 w-10 rounded-xl bg-[#9E50E5]/10 flex items-center justify-center mb-4">
                  <Clock className="h-5 w-5 text-[#9E50E5]" />
                </div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Response time</h3>
                <p className="text-sm text-[#5B5B5B]">Within 1 business day</p>
                <p className="text-xs text-[#5B5B5B]/70 mt-1">Mon – Fri, 9am – 5pm CT</p>
              </div>

              <div className="bg-[#FBF6FF] rounded-2xl border border-[#D9D9D9] p-7">
                <div className="h-10 w-10 rounded-xl bg-[#9E50E5]/10 flex items-center justify-center mb-4">
                  <Phone className="h-5 w-5 text-[#9E50E5]" />
                </div>
                <h3 className="font-bold text-[#1a1a1a] mb-2">Group pricing</h3>
                <p className="text-sm text-[#5B5B5B] leading-relaxed">
                  Enrolling 3+ providers? Contact us for multi-seat rates and clinic packages.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Form */}
            <AnimateOnScroll delay={80} className="lg:col-span-2">
              {sent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Message sent!</h2>
                  <p className="text-[#5B5B5B]">
                    Thanks for reaching out. We&apos;ll get back to you within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-[#D9D9D9] rounded-2xl p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a subject</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Tell us how we can help..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-[#D9D9D9] bg-white text-[#1a1a1a] text-sm placeholder:text-[#5B5B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#9E50E5]/30 focus:border-[#9E50E5] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Message
                  </button>
                </form>
              )}
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
