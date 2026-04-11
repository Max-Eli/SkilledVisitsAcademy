import { SquareClient, SquareEnvironment } from 'square'

let _square: SquareClient | null = null

export function getSquare(): SquareClient {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Square is not configured. Set SQUARE_ACCESS_TOKEN in .env.local')
  }
  if (!_square) {
    _square = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    })
  }
  return _square
}

export const PLANS = {
  monthly: {
    price: 49,
    label: 'Monthly',
    catalogObjectId: process.env.SQUARE_MONTHLY_PLAN_ID ?? '',
  },
  annual: {
    price: 399,
    label: 'Annual',
    catalogObjectId: process.env.SQUARE_ANNUAL_PLAN_ID ?? '',
  },
}
