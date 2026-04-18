export interface PurchaseConfirmationData {
  studentName: string
  studentEmail: string
  courses: { title: string; price: string }[]
  totalPaid: string
  loginUrl: string
  meeting?: {
    meetingAt: string // ISO
    meetingLink: string | null
    accessUnlocksAt: string // ISO
  }
  // Set for in-person and private 1:1 purchases where the learner did not
  // pre-select a date. Renders a "we'll reach out to schedule" block instead
  // of the standard live-session block.
  pendingSchedule?: boolean
}

function formatMeetingDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMeetingTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export function purchaseConfirmationHtml(data: PurchaseConfirmationData): string {
  const { studentName, courses, totalPaid, loginUrl, meeting, pendingSchedule } = data
  const firstName = studentName.split(' ')[0] || 'Provider'
  const courseList = courses
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${c.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;font-weight:600;">${c.price}</td>
      </tr>`
    )
    .join('')

  const meetingBlock = pendingSchedule
    ? `
              <!-- Pending-schedule block (in-person / private 1:1) -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;">We&rsquo;ll be in touch to schedule</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#FBF6FF;border-radius:10px;border:1px solid #E9D8FB;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">Our clinical team will reach out within 1 business day to confirm your session date.</p>
                    <p style="margin:10px 0 0;font-size:13px;color:#5b5b5b;line-height:1.6;">
                      Once your date is confirmed, your course materials unlock <strong>48 hours before your scheduled session</strong> so you can prep.
                    </p>
                  </td>
                </tr>
              </table>
              `
    : meeting
      ? `
              <!-- Live session block -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;">Your live session</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#FBF6FF;border-radius:10px;border:1px solid #E9D8FB;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">${formatMeetingDate(meeting.meetingAt)}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#5b5b5b;">${formatMeetingTime(meeting.meetingAt)}</p>
                    ${
                      meeting.meetingLink
                        ? `<p style="margin:12px 0 0;"><a href="${meeting.meetingLink}" style="display:inline-block;background:#ffffff;border:1px solid #9E50E5;color:#9E50E5;text-decoration:none;font-weight:600;font-size:13px;padding:8px 16px;border-radius:20px;">Join the meeting →</a></p>`
                        : `<p style="margin:12px 0 0;font-size:12px;color:#7b5aa3;font-style:italic;">We&rsquo;ll email you the Zoom/Google Meet link before your session.</p>`
                    }
                    <p style="margin:14px 0 0;font-size:13px;color:#7b5aa3;">
                      📖 Course materials unlock on <strong>${formatMeetingDate(meeting.accessUnlocksAt)}</strong> (48 hours before your session) so you can prep.
                    </p>
                  </td>
                </tr>
              </table>
              `
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enrollment Confirmed — Skilled Visits Academy</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:#9E50E5;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <p style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Skilled Visits Academy</p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Professional IV Therapy Education</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;">You&rsquo;re enrolled, ${firstName}! 🎉</p>
              <p style="margin:0 0 28px;font-size:15px;color:#5b5b5b;line-height:1.6;">
                Your enrollment is confirmed. You now have lifetime access to your course(s). Head to your dashboard to start learning.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background:#9E50E5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:30px;">
                      Start Learning →
                    </a>
                  </td>
                </tr>
              </table>

              ${meetingBlock}

              <!-- Order summary -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                ${courseList}
                <tr>
                  <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;">Total charged</td>
                  <td style="padding:14px 0 0;font-size:18px;font-weight:800;color:#9E50E5;text-align:right;">${totalPaid}</td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;" />

              <!-- What's included -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;">What&rsquo;s included</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  'Lifetime access to all purchased courses',
                  'SVA-approved protocol library & clinical tools',
                  'Dosage calculator, mixing guide & vitamin library',
                  'AI lab analyzer (50 analyses/month)',
                  'Professional community access',
                  'Completion certificate upon finishing each course',
                ]
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding:5px 0;font-size:14px;color:#5b5b5b;">
                      <span style="color:#9E50E5;margin-right:8px;">✓</span>${item}
                    </td>
                  </tr>`
                  )
                  .join('')}
              </table>

              <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;" />

              <!-- Support -->
              <p style="margin:0;font-size:13px;color:#9b9b9b;line-height:1.6;text-align:center;">
                Questions? Reply to this email or contact us at
                <a href="mailto:hello@skilledvisitsacademy.com" style="color:#9E50E5;text-decoration:none;">hello@skilledvisitsacademy.com</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0b0b0;">
                © ${new Date().getFullYear()} Skilled Visits Academy · Licensed providers only<br />
                <a href="${loginUrl}/settings" style="color:#b0b0b0;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function purchaseConfirmationText(data: PurchaseConfirmationData): string {
  const { studentName, courses, totalPaid, loginUrl, meeting, pendingSchedule } = data
  const meetingLines = pendingSchedule
    ? `

WE'LL BE IN TOUCH TO SCHEDULE
Our clinical team will reach out within 1 business day to confirm your session date.
Course materials unlock 48 hours before your scheduled session.
`
    : meeting
      ? `

YOUR LIVE SESSION
${formatMeetingDate(meeting.meetingAt)} at ${formatMeetingTime(meeting.meetingAt)}
${meeting.meetingLink ? `Join: ${meeting.meetingLink}` : 'We will email you the meeting link before your session.'}

Course materials unlock on ${formatMeetingDate(meeting.accessUnlocksAt)} (48 hours before your session).
`
      : ''

  return `Hi ${studentName},

Your enrollment is confirmed! You now have lifetime access to:

${courses.map((c) => `• ${c.title} — ${c.price}`).join('\n')}

Total charged: ${totalPaid}
${meetingLines}
Start learning now: ${loginUrl}

Your access includes the full course library, SVA protocol tools, dosage calculator, AI lab analyzer, and professional community.

Questions? Email hello@skilledvisitsacademy.com

— The SVA Team`
}
