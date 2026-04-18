import { createHmac, timingSafeEqual } from 'crypto'

// Skilled Visits Academy ↔ JidoPay integration helpers.
//
// This file is the server-authoritative catalog — prices and titles live
// here (not in the client bundle) so a tampered cart can never lower the
// amount actually charged. The /api/checkout/create route reads from this
// catalog and builds line items; the webhook reads titles for the receipt
// email and resolves bundles → child courses at grant time.

// ---------------------------------------------------------------------------
// SKU catalog
// ---------------------------------------------------------------------------
//
// Three delivery modes:
//   - Online live Zoom (4 hours) — the primary delivery for everything
//     except the in-person and private 1:1 SKUs.
//   - In-person hands-on — physical event, scheduled separately.
//   - Private 1:1 in-person — same content as standard courses but
//     delivered to one learner at a custom time, priced 2× standard.
//
// Private 1:1 SKUs grant access to the same LMS content as their standard
// counterpart. Admin receives a notification on purchase and schedules the
// session manually (see README of /admin/subscribers).

export type SvaCourseKey =
  // IV lane — online live Zoom
  | 'iv-therapy-training'
  | 'iv-complications-emergency'
  | 'vitamin-nutrient-therapy'
  | 'nad-plus-masterclass'
  | 'iv-push-administration'
  // Aesthetic lane — online live Zoom
  | 'botox-basic'
  | 'botox-advanced'
  | 'filler-basic'
  | 'filler-advanced'
  | 'aesthetic-injector-bundle'
  // Regenerative aesthetics — online live Zoom
  | 'prp-prf-ezgel'
  // In-person hands-on
  | 'bbl-russian-lip-inperson'
  // Private 1:1 (in-person / dedicated Zoom)
  | 'private-iv-therapy-training'
  | 'private-botox-basic'
  | 'private-botox-advanced'
  | 'private-filler-basic'
  | 'private-filler-advanced'
  | 'private-prp-prf-ezgel'
  | 'private-bbl-russian-lip'

// Bundles are pseudo-SKUs — they have no `courses` row. The webhook
// expands each bundle key into the explicit child course slugs below.
export const AESTHETIC_INJECTOR_BUNDLE_KEY = 'aesthetic-injector-bundle' as const
export const BUNDLE_KEYS: readonly SvaCourseKey[] = [
  AESTHETIC_INJECTOR_BUNDLE_KEY,
]

// Explicit child-slug map — the client's bundle definition, encoded once.
// Webhook iterates and grants each child course. Kept flat (slug list
// instead of course_type filter) so bundle membership is obvious at a
// glance.
export const BUNDLE_EXPANSION: Record<string, SvaCourseKey[]> = {
  [AESTHETIC_INJECTOR_BUNDLE_KEY]: [
    'botox-basic',
    'botox-advanced',
    'filler-basic',
    'filler-advanced',
  ],
}

// Private 1:1 → standard course slug map. Purchasing a private SKU grants
// access to the standard course's LMS content and marks the purchase with
// `delivery_mode: 'private_1on1'` (see course_purchases.delivery_mode).
// Admin schedules the private session manually.
export const PRIVATE_TO_STANDARD: Record<string, SvaCourseKey> = {
  'private-iv-therapy-training': 'iv-therapy-training',
  'private-botox-basic': 'botox-basic',
  'private-botox-advanced': 'botox-advanced',
  'private-filler-basic': 'filler-basic',
  'private-filler-advanced': 'filler-advanced',
  'private-prp-prf-ezgel': 'prp-prf-ezgel',
  'private-bbl-russian-lip': 'bbl-russian-lip-inperson',
}

export function isPrivateKey(key: string): boolean {
  return key in PRIVATE_TO_STANDARD
}

// In-person SKUs don't use the 48h-before-Zoom access unlock model — they
// grant immediate access to pre-reading materials and a scheduled event.
export const IN_PERSON_KEYS: readonly SvaCourseKey[] = [
  'bbl-russian-lip-inperson',
  'private-bbl-russian-lip',
]

export function isInPersonKey(key: string): boolean {
  return (IN_PERSON_KEYS as readonly string[]).includes(key)
}

// Sentinel stamped on course_purchases.access_unlocks_at for manually-scheduled
// purchases (in-person, private 1:1) that the learner bought without picking a
// date. Admin later schedules the session and overwrites this with
// `scheduled_at - 48h`. The sentinel is far enough in the future that the
// standard `access_unlocks_at > now` lock check keeps materials locked, while
// still being detectable so we can render pending-schedule copy instead of a
// countdown.
export const UNSCHEDULED_ACCESS_SENTINEL = '9999-12-31T23:59:59.000Z'

export function isUnscheduledSentinel(iso: string | null | undefined): boolean {
  return iso === UNSCHEDULED_ACCESS_SENTINEL
}

export const COURSE_TITLES: Record<SvaCourseKey, string> = {
  'iv-therapy-training': 'Comprehensive IV Therapy Training',
  'iv-complications-emergency': 'IV Complications & Emergency Management',
  'vitamin-nutrient-therapy': 'Vitamin & Nutrient Therapy Masterclass',
  'nad-plus-masterclass': 'NAD+ Therapy Masterclass',
  'iv-push-administration': 'IV Push Administration Masterclass',
  'botox-basic': 'Basic Botox Training',
  'botox-advanced': 'Advanced Botox Training',
  'filler-basic': 'Basic Dermal Filler Training',
  'filler-advanced': 'Advanced Dermal Filler Training',
  'aesthetic-injector-bundle': 'Complete Aesthetic Injector Bundle',
  'prp-prf-ezgel': 'PRP, PRF & EZ Gel Training',
  'bbl-russian-lip-inperson': 'Non-Surgical BBL & Russian Lip Technique',
  'private-iv-therapy-training': 'Private Comprehensive IV Therapy Training',
  'private-botox-basic': 'Private Basic Botox Training',
  'private-botox-advanced': 'Private Advanced Botox Training',
  'private-filler-basic': 'Private Basic Dermal Filler Training',
  'private-filler-advanced': 'Private Advanced Dermal Filler Training',
  'private-prp-prf-ezgel': 'Private PRP, PRF & EZ Gel Training',
  'private-bbl-russian-lip': 'Private Non-Surgical BBL & Russian Lip Technique',
}

// Display prices for UI / receipts.
export const COURSE_PRICES: Record<SvaCourseKey, string> = {
  'iv-therapy-training': '$399',
  'iv-complications-emergency': '$199',
  'vitamin-nutrient-therapy': '$199',
  'nad-plus-masterclass': '$199',
  'iv-push-administration': '$199',
  'botox-basic': '$399',
  'botox-advanced': '$499',
  'filler-basic': '$399',
  'filler-advanced': '$499',
  'aesthetic-injector-bundle': '$1,000',
  'prp-prf-ezgel': '$499',
  'bbl-russian-lip-inperson': '$2,500',
  'private-iv-therapy-training': '$798',
  'private-botox-basic': '$798',
  'private-botox-advanced': '$998',
  'private-filler-basic': '$798',
  'private-filler-advanced': '$998',
  'private-prp-prf-ezgel': '$998',
  'private-bbl-russian-lip': '$5,000',
}

// Server-authoritative prices in cents. The checkout-create route reads
// these (never the client-supplied amount) so a tampered cart can't lower
// the price paid.
export const COURSE_PRICES_CENTS: Record<SvaCourseKey, number> = {
  'iv-therapy-training': 39900,
  'iv-complications-emergency': 19900,
  'vitamin-nutrient-therapy': 19900,
  'nad-plus-masterclass': 19900,
  'iv-push-administration': 19900,
  'botox-basic': 39900,
  'botox-advanced': 49900,
  'filler-basic': 39900,
  'filler-advanced': 49900,
  'aesthetic-injector-bundle': 100000,
  'prp-prf-ezgel': 49900,
  'bbl-russian-lip-inperson': 250000,
  'private-iv-therapy-training': 79800,
  'private-botox-basic': 79800,
  'private-botox-advanced': 99800,
  'private-filler-basic': 79800,
  'private-filler-advanced': 99800,
  'private-prp-prf-ezgel': 99800,
  'private-bbl-russian-lip': 500000,
}

export const ALL_COURSE_KEYS: readonly SvaCourseKey[] = Object.keys(
  COURSE_PRICES_CENTS
) as SvaCourseKey[]

export function isValidCourseKey(key: unknown): key is SvaCourseKey {
  return typeof key === 'string' && key in COURSE_PRICES_CENTS
}

// ---------------------------------------------------------------------------
// Legacy pre-created payment-link map.
//
// Before the dynamic-checkout switchover we had pre-created JidoPay payment
// links for each IV course, keyed off env vars. Those env vars still exist
// in Vercel, so any in-flight checkout from the old flow can still map its
// paymentLinkId back to a course key. New purchases go through
// /api/checkout/create and never consult this map.
//
// Only the 4 legacy IV masterclasses + old IV cert are still resolvable.
// The old course keys (`iv-therapy-certification`, `complete-mastery-bundle`)
// map into the new slug scheme so enrollments survive.
export function linkIdToCourseKey(linkId: string | null): SvaCourseKey | null {
  if (!linkId) return null
  const pairs: Array<[SvaCourseKey, string | undefined]> = [
    ['iv-therapy-training', process.env.NEXT_PUBLIC_JIDOPAY_LINK_IV_CERT],
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

// ---------------------------------------------------------------------------
// Processing-fee gross-up
//
// JidoPay charges 3.5% + $0.30 per transaction. We gross up the shopper's
// subtotal so the merchant nets the sticker price we advertised.

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
