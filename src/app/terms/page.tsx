import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#5B5B5B] mb-12">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-10 text-[#1a1a1a]">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              By accessing or using Skilled Visits Academy, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Eligibility</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              SVA is exclusively for licensed healthcare professionals. By creating an account, you confirm that
              you hold a valid clinical license (RN, NP, PA, MD, DO, LPN, LVN, EMT, Paramedic, or equivalent)
              issued by a recognized licensing authority. Providing false licensure information will result in
              immediate account termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Educational Purpose Only</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              All content on Skilled Visits Academy — including courses, protocols, the vitamin library, mixing
              guide, dosage calculator, and AI lab analyzer — is provided for <strong>educational purposes only</strong>.
              Nothing on this platform constitutes medical advice or replaces clinical judgment, physician oversight,
              or applicable regulatory requirements in your jurisdiction.
            </p>
            <p className="text-[#5B5B5B] leading-relaxed mt-3">
              You are solely responsible for ensuring your clinical practice complies with applicable laws,
              licensing requirements, and standards of care. Always consult with a qualified physician or
              pharmacist before implementing any IV therapy protocol.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Course Purchases</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              Course purchases are one-time fees that grant lifetime access to the purchased course, including
              all future updates to that course. Courses are non-transferable and for individual use only.
              Refunds are available within 7 days of purchase if you have not completed more than 20% of the
              course content. Contact us to request a refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Acceptable Use</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              You agree not to share your account credentials, redistribute platform content, upload real patient
              PHI to the platform, post inappropriate content in the community forum, or use the platform in any
              manner that violates applicable laws or professional standards. Violations may result in immediate
              account termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Intellectual Property</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              All course content, protocols, and platform materials are the property of Skilled Visits Academy
              and are protected by copyright. You may not reproduce, distribute, or create derivative works
              without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Limitation of Liability</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              Skilled Visits Academy is not liable for any clinical outcomes, patient harm, or damages arising
              from the use of information provided on this platform. The AI lab analyzer and protocol tools
              are decision-support aids only and must not be used as a substitute for clinical evaluation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Changes to Terms</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes
              via email or a prominent notice on the platform. Continued use of SVA after changes constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Contact</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@skilledvisitsacademy.com" className="text-[#9E50E5] hover:underline">
                legal@skilledvisitsacademy.com
              </a>{' '}
              or visit our{' '}
              <a href="/contact" className="text-[#9E50E5] hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
