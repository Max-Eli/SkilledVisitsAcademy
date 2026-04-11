import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrintButton } from './print-button'

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>
}) {
  const { certId } = await params
  const supabase = await createClient()

  // Public lookup — no auth required
  const { data: cert } = await supabase
    .from('certificates')
    .select('id, issued_at, user_id, course_id')
    .eq('id', certId)
    .single()

  if (!cert) notFound()

  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from('profiles').select('full_name, license_type').eq('id', cert.user_id).single(),
    supabase.from('courses').select('title, description').eq('id', cert.course_id).single(),
  ])

  if (!course) notFound()

  const studentName = profile?.full_name ?? 'Healthcare Provider'
  const licenseType = profile?.license_type ?? ''
  const completedAt = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const certCode = `SVA-${cert.id.slice(0, 8).toUpperCase()}`

  return (
    <>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-white/60 hover:text-white transition-colors">
            Skilled Visits Academy
          </a>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/50">Certificate of Completion</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="px-4 py-2 rounded-[30px] border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Browse Courses
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Background */}
      <div className="min-h-screen bg-[#f4f0fb] flex items-center justify-center p-6 print:p-0 print:bg-white print:min-h-0">

        {/* Certificate card */}
        <div
          className="w-full max-w-[860px] bg-white relative print:shadow-none"
          style={{
            border: '3px solid #9E50E5',
            borderRadius: '16px',
            boxShadow: '0 24px 80px rgba(158,80,229,0.18)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-5 left-5 w-9 h-9 border-t-2 border-l-2 border-[#9E50E5]/40 rounded-tl" />
          <div className="absolute top-5 right-5 w-9 h-9 border-t-2 border-r-2 border-[#9E50E5]/40 rounded-tr" />
          <div className="absolute bottom-5 left-5 w-9 h-9 border-b-2 border-l-2 border-[#9E50E5]/40 rounded-bl" />
          <div className="absolute bottom-5 right-5 w-9 h-9 border-b-2 border-r-2 border-[#9E50E5]/40 rounded-br" />

          <div className="px-14 py-12 text-center">

            {/* Brand */}
            <div className="mb-7">
              <p className="text-[#9E50E5] text-2xl font-extrabold tracking-tight">Skilled Visits Academy</p>
              <p className="text-[#9b9b9b] text-[11px] tracking-[0.25em] uppercase mt-1">Professional Medical Education</p>
            </div>

            {/* Decorative rule */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#9E50E5]/25 to-transparent" />
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]/40" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#9E50E5]/25 to-transparent" />
            </div>

            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#9E50E5] mb-2">Certificate of Completion</p>
            <p className="text-[#5b5b5b] text-sm mb-8">This is to certify that</p>

            {/* Name */}
            <p
              className="text-5xl font-extrabold text-[#1a1a1a] mb-2 leading-tight"
              style={{ fontStyle: 'italic', letterSpacing: '-1px' }}
            >
              {studentName}
            </p>
            {licenseType && (
              <p className="text-sm font-bold text-[#9E50E5] tracking-widest uppercase mb-8">{licenseType}</p>
            )}

            <p className="text-[#5b5b5b] text-sm mb-3">has successfully completed</p>
            <p className="text-[26px] font-extrabold text-[#1a1a1a] mb-2 leading-snug">{course.title}</p>
            {course.description && (
              <p className="text-sm text-[#5b5b5b] max-w-lg mx-auto leading-relaxed mb-8">{course.description}</p>
            )}

            {/* Decorative rule */}
            <div className="flex items-center gap-3 mb-9">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#9E50E5]/25 to-transparent" />
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#9E50E5]/40" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#9E50E5]/25 to-transparent" />
            </div>

            {/* Footer row */}
            <div className="flex items-end justify-between">
              <div className="text-left">
                <p className="text-[10px] text-[#9b9b9b] uppercase tracking-[0.2em] mb-1">Date Completed</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{completedAt}</p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center">
                <div
                  className="h-20 w-20 rounded-full flex flex-col items-center justify-center"
                  style={{
                    border: '3px solid #9E50E5',
                    background: 'linear-gradient(135deg, #FBF6FF, #ede3fa)',
                  }}
                >
                  <p className="text-[#9E50E5] text-[9px] font-black tracking-widest uppercase">SVA</p>
                  <p className="text-[#9E50E5] text-[7px] font-bold tracking-wide mt-0.5">Certified</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-[#9b9b9b] uppercase tracking-[0.2em] mb-1">Certificate ID</p>
                <p className="text-sm font-semibold text-[#1a1a1a] font-mono">{certCode}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0.4in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  )
}
