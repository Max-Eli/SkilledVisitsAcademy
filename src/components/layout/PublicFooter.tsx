import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white/60">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/SkilledVisitsAcademyNEW.png"
              alt="Skilled Visits Academy"
              width={160}
              height={44}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm text-white/45 leading-relaxed mb-4">
              Professional IV therapy and aesthetics education for licensed healthcare providers.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              Licensed providers only
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Platform</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/checkout?course=iv-therapy-training" className="hover:text-white transition-colors">Enroll Now</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Courses</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/course/iv-therapy-training" className="hover:text-white transition-colors">Comprehensive IV Therapy Training</Link></li>
              <li><Link href="/course/aesthetic-injector-bundle" className="hover:text-white transition-colors">Complete Aesthetic Injector Bundle</Link></li>
              <li><Link href="/course/botox-basic" className="hover:text-white transition-colors">Basic Botox Training</Link></li>
              <li><Link href="/course/filler-basic" className="hover:text-white transition-colors">Basic Dermal Filler Training</Link></li>
              <li><Link href="/course/bbl-russian-lip-inperson" className="hover:text-white transition-colors">BBL &amp; Russian Lip — In-Person</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Skilled Visits Academy. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            SVA is an educational platform for licensed healthcare professionals only.
          </p>
        </div>
      </div>
    </footer>
  )
}
