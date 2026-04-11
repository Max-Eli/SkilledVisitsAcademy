export interface CourseCompletionData {
  studentName: string
  courseTitle: string
  completedAt: string
  certificateUrl: string
  certificateId: string
}

export function courseCompletionHtml(data: CourseCompletionData): string {
  const { studentName, courseTitle, completedAt, certificateUrl, certificateId } = data
  const firstName = studentName.split(' ')[0] || 'Provider'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate Earned — Skilled Visits Academy</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#9E50E5,#7B3DB8);padding:40px;border-radius:12px 12px 0 0;text-align:center;">
              <p style="margin:0 0 12px;font-size:36px;">🏆</p>
              <p style="margin:0;color:#fff;font-size:22px;font-weight:800;">Certificate Earned!</p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Skilled Visits Academy</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">Congratulations, ${firstName}!</p>
              <p style="margin:0 0 28px;font-size:15px;color:#5b5b5b;line-height:1.6;">
                You&rsquo;ve successfully completed <strong style="color:#1a1a1a;">${courseTitle}</strong> and earned your SVA certification.
                This is a significant achievement — your commitment to clinical excellence sets you apart.
              </p>

              <!-- Certificate card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#FBF6FF;border:2px solid #9E50E5;border-radius:12px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9E50E5;">SVA Certificate of Completion</p>
                    <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a1a;">${courseTitle}</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#5b5b5b;">Completed ${completedAt}</p>
                    <p style="margin:0;font-size:11px;color:#9b9b9b;">Certificate ID: ${certificateId}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${certificateUrl}" style="display:inline-block;background:#9E50E5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:30px;">
                      View &amp; Download Certificate
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 28px;" />

              <!-- What's next -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;">What&rsquo;s next?</p>
              <p style="margin:0 0 20px;font-size:14px;color:#5b5b5b;line-height:1.6;">
                Keep building your expertise. Check out our other courses to expand your clinical capabilities and grow your practice.
              </p>

              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 28px;" />

              <p style="margin:0;font-size:13px;color:#9b9b9b;text-align:center;">
                Questions? <a href="mailto:hello@skilledvisitsacademy.com" style="color:#9E50E5;text-decoration:none;">hello@skilledvisitsacademy.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0b0b0;">
                © ${new Date().getFullYear()} Skilled Visits Academy · Licensed providers only
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

export function courseCompletionText(data: CourseCompletionData): string {
  const { studentName, courseTitle, completedAt, certificateUrl, certificateId } = data
  return `Congratulations, ${studentName}!

You've completed ${courseTitle} and earned your SVA certificate.

Completed: ${completedAt}
Certificate ID: ${certificateId}

View and download your certificate: ${certificateUrl}

— The SVA Team`
}
