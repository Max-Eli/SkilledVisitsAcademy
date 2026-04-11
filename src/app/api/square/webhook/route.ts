import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { WebhooksHelper } from 'square'
import { createServiceClient } from '@/lib/supabase/server'
import { getSquare } from '@/lib/square'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { purchaseConfirmationHtml, purchaseConfirmationText } from '@/lib/emails/purchase-confirmation'

// Map course keys to course slugs in the DB
const COURSE_KEY_TO_SLUG: Record<string, string> = {
  'iv-therapy-foundation': 'iv-therapy-foundation',
  'myers-cocktail-masterclass': 'myers-cocktail-masterclass',
  'nad-plus-therapy': 'nad-plus-therapy',
  'filler-fundamentals': 'filler-fundamentals',
  'botox-neurotoxins': 'botox-neurotoxins',
  'complete-bundle': 'complete-bundle',
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('x-square-hmacsha256-signature') ?? ''

  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const webhookUrl = process.env.SQUARE_WEBHOOK_URL

  if (webhookSignatureKey && webhookUrl) {
    const valid = await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey: webhookSignatureKey,
      notificationUrl: webhookUrl,
    })
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  const event = JSON.parse(body)
  const supabase = await createServiceClient()

  switch (event.type) {
    // Payment completed — grant course access
    case 'payment.completed': {
      const payment = event.data?.object?.payment
      if (!payment) break

      const orderId = payment.order_id
      const customerId = payment.customer_id
      const amountPaid = payment.amount_money?.amount ?? 0

      if (!orderId) break

      try {
        const square = getSquare()
        const orderResponse = await square.orders.get(orderId)
        const order = orderResponse.order
        if (!order) break

        const userId = order.referenceId
        // Support both legacy course_key (single) and course_keys (comma-separated, from cart)
        const courseKeysRaw = order.metadata?.course_keys ?? order.metadata?.course_key ?? ''
        const courseKeys = courseKeysRaw.split(',').map((k: string) => k.trim()).filter(Boolean)

        if (!userId) break

        // Update Square customer ID on profile
        if (customerId) {
          await supabase
            .from('profiles')
            .update({ square_customer_id: customerId, role: 'subscriber' })
            .eq('id', userId)
        }

        // Grant access to each purchased course
        for (const courseKey of courseKeys) {
          const courseSlug = COURSE_KEY_TO_SLUG[courseKey]
          if (!courseSlug) continue

          if (courseSlug === 'complete-bundle') {
            // Bundle: grant access to all IV therapy courses
            const { data: courses } = await supabase
              .from('courses')
              .select('id')
              .in('course_type', ['core', 'addon'])

            if (courses) {
              for (const course of courses) {
                await supabase.from('course_purchases').upsert({
                  user_id: userId,
                  course_id: course.id,
                  square_payment_id: payment.id,
                  square_order_id: orderId,
                  amount_paid: Number(amountPaid),
                }, { onConflict: 'user_id,course_id' })
              }
            }
          } else {
            const { data: course } = await supabase
              .from('courses')
              .select('id')
              .eq('slug', courseSlug)
              .single()

            if (course) {
              await supabase.from('course_purchases').upsert({
                user_id: userId,
                course_id: course.id,
                square_payment_id: payment.id,
                square_order_id: orderId,
                amount_paid: Number(amountPaid),
              }, { onConflict: 'user_id,course_id' })
            }
          }
        }
        // Send purchase confirmation email
        try {
          const { data: userAuth } = await supabase.auth.admin.getUserById(userId)
          const userEmail = userAuth?.user?.email
          const { data: userProfile } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

          if (userEmail) {
            const COURSE_TITLES: Record<string, string> = {
              'iv-therapy-foundation': 'IV Therapy Foundation',
              'myers-cocktail-masterclass': 'Myers Cocktail Masterclass',
              'nad-plus-therapy': 'NAD+ Therapy Certification',
              'filler-fundamentals': 'Filler Fundamentals',
              'botox-neurotoxins': 'Botox & Neurotoxins',
              'complete-bundle': 'Complete IV Therapy Bundle',
            }
            const COURSE_PRICES: Record<string, string> = {
              'iv-therapy-foundation': '$199',
              'myers-cocktail-masterclass': '$149',
              'nad-plus-therapy': '$129',
              'filler-fundamentals': '$249',
              'botox-neurotoxins': '$249',
              'complete-bundle': '$349',
            }
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

            await resend.emails.send({
              from: FROM_EMAIL,
              to: userEmail,
              subject: 'Your enrollment is confirmed — Skilled Visits Academy',
              html: purchaseConfirmationHtml({
                studentName: userProfile?.full_name ?? 'Provider',
                studentEmail: userEmail,
                courses: courseKeys.map((k) => ({ title: COURSE_TITLES[k] ?? k, price: COURSE_PRICES[k] ?? '' })),
                totalPaid: `$${(Number(amountPaid) / 100).toFixed(0)}`,
                loginUrl: `${appUrl}/dashboard`,
              }),
              text: purchaseConfirmationText({
                studentName: userProfile?.full_name ?? 'Provider',
                studentEmail: userEmail,
                courses: courseKeys.map((k) => ({ title: COURSE_TITLES[k] ?? k, price: COURSE_PRICES[k] ?? '' })),
                totalPaid: `$${(Number(amountPaid) / 100).toFixed(0)}`,
                loginUrl: `${appUrl}/dashboard`,
              }),
            })
          }
        } catch (emailErr) {
          console.error('Square webhook: confirmation email failed', emailErr)
        }
      } catch (err) {
        console.error('Square webhook: failed to process payment.completed', err)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
