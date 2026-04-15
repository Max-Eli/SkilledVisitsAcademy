import { createHmac, timingSafeEqual } from 'crypto'

// Skilled Visits Academy ↔ JidoPay integration helpers.
//
// The JidoPay payment-link IDs below come from env vars so each environment
// (preview / production) can point at its own test vs. live payment links
// without a code change. Set these in Vercel → Project → Settings → Env Vars.

export type SvaCourseKey =
  | 'iv-therapy-certification'
  | 'complete-mastery-bundle'
  | 'iv-complications-emergency'
  | 'vitamin-nutrient-therapy'
  | 'nad-plus-masterclass'
  | 'iv-push-administration'

// Public (client-side readable) — used by the checkout page to pick the
// right payment link for the course the student chose.
export const COURSE_TO_LINK_ENV: Record<SvaCourseKey, string> = {
  'iv-therapy-certification': 'NEXT_PUBLIC_JIDOPAY_LINK_IV_CERT',
  'complete-mastery-bundle': 'NEXT_PUBLIC_JIDOPAY_LINK_BUNDLE',
  'iv-complications-emergency': 'NEXT_PUBLIC_JIDOPAY_LINK_COMPLICATIONS',
  'vitamin-nutrient-therapy': 'NEXT_PUBLIC_JIDOPAY_LINK_VITAMIN',
  'nad-plus-masterclass': 'NEXT_PUBLIC_JIDOPAY_LINK_NAD',
  'iv-push-administration': 'NEXT_PUBLIC_JIDOPAY_LINK_IV_PUSH',
}

// Server-side reverse map — resolves an incoming webhook's paymentLinkId back
// to the SVA course key. Same env vars, read on the server.
export function linkIdToCourseKey(linkId: string | null): SvaCourseKey | null {
  if (!linkId) return null
  const pairs: Array<[SvaCourseKey, string | undefined]> = [
    ['iv-therapy-certification', process.env.NEXT_PUBLIC_JIDOPAY_LINK_IV_CERT],
    ['complete-mastery-bundle', process.env.NEXT_PUBLIC_JIDOPAY_LINK_BUNDLE],
    ['iv-complications-emergency', process.env.NEXT_PUBLIC_JIDOPAY_LINK_COMPLICATIONS],
    ['vitamin-nutrient-therapy', process.env.NEXT_PUBLIC_JIDOPAY_LINK_VITAMIN],
    ['nad-plus-masterclass', process.env.NEXT_PUBLIC_JIDOPAY_LINK_NAD],
    ['iv-push-administration', process.env.NEXT_PUBLIC_JIDOPAY_LINK_IV_PUSH],
  ]
  for (const [key, val] of pairs) {
    if (val && val === linkId) return key
  }
  return null
}

export const COURSE_TITLES: Record<SvaCourseKey, string> = {
  'iv-therapy-certification': 'IV Therapy Certification',
  'complete-mastery-bundle': 'Complete IV Therapy Mastery Bundle',
  'iv-complications-emergency': 'Advanced IV Complications & Emergency Management',
  'vitamin-nutrient-therapy': 'Vitamin & Nutrient Therapy Masterclass',
  'nad-plus-masterclass': 'NAD+ Therapy Masterclass',
  'iv-push-administration': 'IV Push Administration Masterclass',
}

export const COURSE_PRICES: Record<SvaCourseKey, string> = {
  'iv-therapy-certification': '$299',
  'complete-mastery-bundle': '$499',
  'iv-complications-emergency': '$149',
  'vitamin-nutrient-therapy': '$149',
  'nad-plus-masterclass': '$149',
  'iv-push-administration': '$149',
}

// Server-authoritative course prices in cents. The checkout create route
// reads these (never the client-supplied amount) so a tampered cart can't
// lower the price paid.
export const COURSE_PRICES_CENTS: Record<SvaCourseKey, number> = {
  'iv-therapy-certification': 29900,
  'complete-mastery-bundle': 49900,
  'iv-complications-emergency': 14900,
  'vitamin-nutrient-therapy': 14900,
  'nad-plus-masterclass': 14900,
  'iv-push-administration': 14900,
}

// JidoPay processing fee that the shopper covers on top of the sticker
// price: 3.5% + $0.30. We gross up the SVA cart subtotal so the merchant
// nets the advertised course price.
const FEE_PERCENT = 0.035
const FEE_FIXED_CENTS = 30

export function grossUpCents(netCents: number): number {
  if (netCents <= 0) return 0
  const gross = (netCents + FEE_FIXED_CENTS) / (1 - FEE_PERCENT)
  return Math.round(gross)
}

// ---------------------------------------------------------------------------
// Signature verification
//
// JidoPay signs outbound webhooks with HMAC-SHA256 using the same format
// Stripe uses for its own webhooks, so if you already know Stripe signatures,
// nothing new to learn:
//
//     Jidopay-Signature: t=1713000000,v1=<hex(hmac(secret, "<ts>.<rawBody>"))>
//
// We enforce a 5-minute freshness window to prevent replay attacks.

const SIGNATURE_TOLERANCE_SECONDS = 300

export function verifyJidopaySignature({
  payload,
  header,
  secret,
  now = Date.now(),
}: {
  payload: string
  header: string | null
  secret: string
  now?: number
}): { ok: true } | { ok: false; reason: string } {
  if (!header) return { ok: false, reason: 'missing_header' }
  if (!secret) return { ok: false, reason: 'missing_secret' }

  let timestamp: number | null = null
  let signature: string | null = null
  for (const part of header.split(',')) {
    const [k, v] = part.split('=')
    if (k === 't') timestamp = Number(v)
    else if (k === 'v1') signature = v
  }

  if (!timestamp || !signature) return { ok: false, reason: 'malformed_header' }

  const ageSeconds = Math.abs(Math.floor(now / 1000) - timestamp)
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) {
    return { ok: false, reason: 'stale' }
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')

  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length) return { ok: false, reason: 'length_mismatch' }
  if (!timingSafeEqual(a, b)) return { ok: false, reason: 'mismatch' }

  return { ok: true }
}
