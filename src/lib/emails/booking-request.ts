// Emails for the Request-to-Book flow:
//   - adminBookingRequestHtml:    admin notification when a learner requests a date
//   - learnerBookingAckHtml:      confirmation sent back to the learner

export type BookingRequestEmailProps = {
  courseTitle: string
  deliveryMode: 'in-person' | 'private-1on1'
  fullName: string
  email: string
  phone?: string
  licenseType: string
  licenseState: string
  preferredDates: string
  notes?: string
}

const wrap = (inner: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Skilled Visits Academy</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#EEEEEE;color:#1a1a1a;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
  <div style="background:#ffffff;border-radius:16px;padding:32px;">
    ${inner}
  </div>
  <p style="font-size:12px;color:#5B5B5B;margin-top:24px;text-align:center;">Skilled Visits Academy · info@skilledvisitsacademy.com</p>
</div>
</body>
</html>`

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:6px 0;color:#5B5B5B;font-size:13px;">${label}</td>
    <td style="padding:6px 0;color:#1a1a1a;font-size:13px;font-weight:600;">${value}</td>
  </tr>`

export function adminBookingRequestHtml(p: BookingRequestEmailProps): string {
  const modeLabel = p.deliveryMode === 'in-person' ? 'In-Person Hands-On' : 'Private 1:1'
  return wrap(`
    <p style="font-size:12px;color:#9E50E5;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px 0;">New booking request</p>
    <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 4px 0;">${p.courseTitle}</h1>
    <p style="color:#5B5B5B;margin:0 0 20px 0;">${modeLabel}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', p.fullName)}
      ${row('Email', p.email)}
      ${p.phone ? row('Phone', p.phone) : ''}
      ${row('License', `${p.licenseType} · ${p.licenseState}`)}
      ${row('Preferred dates', p.preferredDates)}
    </table>
    ${p.notes ? `<div style="margin-top:20px;padding:16px;background:#FBF6FF;border-left:3px solid #9E50E5;border-radius:8px;"><p style="font-size:12px;color:#9E50E5;font-weight:700;margin:0 0 4px 0;">Notes</p><p style="margin:0;color:#1a1a1a;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.notes)}</p></div>` : ''}
    <p style="margin-top:24px;font-size:12px;color:#5B5B5B;">Review and confirm a date from the admin dashboard.</p>
  `)
}

export function adminBookingRequestText(p: BookingRequestEmailProps): string {
  const modeLabel = p.deliveryMode === 'in-person' ? 'In-Person Hands-On' : 'Private 1:1'
  return [
    `NEW BOOKING REQUEST — ${p.courseTitle} (${modeLabel})`,
    '',
    `Name:            ${p.fullName}`,
    `Email:           ${p.email}`,
    p.phone ? `Phone:           ${p.phone}` : null,
    `License:         ${p.licenseType} · ${p.licenseState}`,
    `Preferred dates: ${p.preferredDates}`,
    p.notes ? `\nNotes:\n${p.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export function learnerBookingAckHtml(p: BookingRequestEmailProps): string {
  return wrap(`
    <p style="font-size:12px;color:#9E50E5;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px 0;">Request received</p>
    <h1 style="font-size:22px;color:#1a1a1a;margin:0 0 8px 0;">We'll be in touch soon</h1>
    <p style="color:#5B5B5B;line-height:1.6;margin:0 0 20px 0;">Hi ${escapeHtml(p.fullName)}, thanks for your interest in <strong>${escapeHtml(p.courseTitle)}</strong>. Our clinical team will review your request and confirm availability within 1 business day.</p>
    <p style="color:#5B5B5B;line-height:1.6;margin:0 0 20px 0;">For your records, here's what you sent us:</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Course', p.courseTitle)}
      ${row('Preferred dates', p.preferredDates)}
      ${row('License', `${p.licenseType} · ${p.licenseState}`)}
    </table>
    <p style="margin-top:24px;color:#5B5B5B;line-height:1.6;">If anything changes on your end, just reply to this email and we'll adjust.</p>
    <p style="margin-top:8px;color:#5B5B5B;line-height:1.6;">— The Skilled Visits Academy team</p>
  `)
}

export function learnerBookingAckText(p: BookingRequestEmailProps): string {
  return [
    `Hi ${p.fullName},`,
    '',
    `Thanks for your interest in ${p.courseTitle}. Our clinical team will review your request and confirm availability within 1 business day.`,
    '',
    `For your records:`,
    `  Course:          ${p.courseTitle}`,
    `  Preferred dates: ${p.preferredDates}`,
    `  License:         ${p.licenseType} · ${p.licenseState}`,
    '',
    `If anything changes on your end, just reply to this email and we'll adjust.`,
    '',
    `— The Skilled Visits Academy team`,
  ].join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
