import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import {
  adminBookingRequestHtml,
  adminBookingRequestText,
  learnerBookingAckHtml,
  learnerBookingAckText,
  type BookingRequestEmailProps,
} from '@/lib/emails/booking-request'

// Request-to-Book intake.
//
// Public endpoint used by the course detail page modal. Records the learner's
// request into `booking_requests`, emails admin, and sends the learner a
// confirmation. Deliberately does NOT require authentication — learners
// often request a date before creating an SVA account.

export const runtime = 'nodejs'

const MAX_FIELD = 500
const MAX_NOTES = 2000

type Payload = {
  courseKey?: unknown
  courseTitle?: unknown
  deliveryMode?: unknown
  fullName?: unknown
  email?: unknown
  phone?: unknown
  licenseType?: unknown
  licenseState?: unknown
  preferredDates?: unknown
  notes?: unknown
}

function trimStr(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s) return null
  return s.slice(0, max)
}

export async function POST(request: Request) {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const courseKey = trimStr(body.courseKey, 120)
  const courseTitle = trimStr(body.courseTitle, 200)
  const deliveryMode =
    body.deliveryMode === 'in-person' || body.deliveryMode === 'private-1on1'
      ? body.deliveryMode
      : null
  const fullName = trimStr(body.fullName, MAX_FIELD)
  const email = trimStr(body.email, MAX_FIELD)?.toLowerCase() ?? null
  const phone = trimStr(body.phone, MAX_FIELD)
  const licenseType = trimStr(body.licenseType, 100)
  const licenseState = trimStr(body.licenseState, 10)
  const preferredDates = trimStr(body.preferredDates, MAX_FIELD)
  const notes = trimStr(body.notes, MAX_NOTES)

  if (
    !courseKey ||
    !courseTitle ||
    !deliveryMode ||
    !fullName ||
    !email ||
    !licenseType ||
    !licenseState ||
    !preferredDates
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Minimal sanity check on the email — the client already validates shape
  // with <input type="email">, so this is belt-and-suspenders.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: row, error } = await supabase
    .from('booking_requests')
    .insert({
      course_key: courseKey,
      course_title: courseTitle,
      delivery_mode: deliveryMode,
      full_name: fullName,
      email,
      phone,
      license_type: licenseType,
      license_state: licenseState.toUpperCase(),
      preferred_dates: preferredDates,
      notes,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('[request-to-book] insert failed', error)
    return NextResponse.json(
      { error: 'Could not record request. Please email info@skilledvisitsacademy.com.' },
      { status: 500 }
    )
  }

  const emailProps: BookingRequestEmailProps = {
    courseTitle,
    deliveryMode,
    fullName,
    email,
    phone: phone ?? undefined,
    licenseType,
    licenseState: licenseState.toUpperCase(),
    preferredDates,
    notes: notes ?? undefined,
  }

  const adminRecipient =
    process.env.SVA_ADMIN_NOTIFICATION_EMAIL ?? 'info@skilledvisitsacademy.com'

  // Fire both emails but don't fail the request if either bounces — the row
  // is the source of truth and admin can follow up from the dashboard.
  await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: adminRecipient,
      replyTo: email,
      subject: `Booking request — ${courseTitle}`,
      html: adminBookingRequestHtml(emailProps),
      text: adminBookingRequestText(emailProps),
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'We received your booking request — Skilled Visits Academy',
      html: learnerBookingAckHtml(emailProps),
      text: learnerBookingAckText(emailProps),
    }),
  ]).then((results) => {
    for (const r of results) {
      if (r.status === 'rejected') {
        console.error('[request-to-book] email send failed', r.reason)
      }
    }
  })

  return NextResponse.json({ id: row.id, ok: true })
}
