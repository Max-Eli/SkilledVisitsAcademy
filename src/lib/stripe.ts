import Stripe from 'stripe'

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 49,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? '',
    interval: 'month' as const,
  },
  annual: {
    name: 'Annual',
    price: 399,
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID ?? '',
    interval: 'year' as const,
    savingsPercent: 32,
  },
}

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local')
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Named export for backwards compat — but accessed lazily
export { getStripe as stripe }
