import { NextResponse } from 'next/server'

// Square was replaced by JidoPay in commit 45b5498. This endpoint is kept
// at 410 Gone so any stale webhook subscriptions fail loudly instead of
// silently double-granting courses alongside /api/jidopay/webhook.
//
// If Square ever needs to come back, restore the handler from git history.

export async function POST() {
  return NextResponse.json(
    { error: 'Square integration has been retired. Use JidoPay.' },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'Square integration has been retired. Use JidoPay.' },
    { status: 410 }
  )
}
