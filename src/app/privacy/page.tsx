import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#5B5B5B] mb-12">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-10 text-[#1a1a1a]">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Information We Collect</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              Skilled Visits Academy collects information you provide directly to us, including your name, email address,
              professional license information, and payment details when you create an account or purchase a course.
              We also collect information about your use of the platform, including courses completed, protocols saved,
              and lab analyses performed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. How We Use Your Information</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions,
              send communications, verify professional licensure, and personalize your experience. We do not sell
              your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. License Verification</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              SVA is a licensed healthcare provider platform. We collect license type, license number, and state
              of licensure to verify eligibility for enrollment. This information is stored securely and used only
              for verification purposes. We reserve the right to verify credentials with state licensing boards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Lab Data & HIPAA Considerations</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              Skilled Visits Academy is an educational platform. We strongly recommend de-identifying all patient
              data before uploading any lab results or documents. Do not upload documents containing patient names,
              dates of birth, social security numbers, or other protected health information (PHI). You are solely
              responsible for ensuring compliance with HIPAA and applicable regulations in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Data Security</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              We implement industry-standard security measures including encrypted connections (TLS), secure database
              storage, and role-based access controls. Uploaded lab files are stored in private storage buckets
              accessible only to you. Payment processing is handled by Square and we do not store full card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Third-Party Services</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              We use the following third-party services: Supabase (database and authentication), Square (payment
              processing), Mux (video delivery), and AI language models for lab analysis. Each service operates
              under its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Your Rights</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              You may request access to, correction of, or deletion of your personal data at any time by contacting
              us. We will respond within 30 days of receiving your request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Contact Us</h2>
            <p className="text-[#5B5B5B] leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@skilledvisitsacademy.com" className="text-[#9E50E5] hover:underline">
                privacy@skilledvisitsacademy.com
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
