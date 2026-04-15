import { NextResponse } from 'next/server'

// Square was replaced by JidoPay in commit 45b5498. This endpoint is kept
// at 410 Gone so any cached client code that still POSTs here fails loudly
// instead of creating half-broken Square orders alongside the JidoPay flow.
//
// If Square ever needs to come back, restore the handler from git history.

export async function POST() {
  return NextResponse.json(
    { error: 'Square integration has been retired. Use /api/checkout/create.' },
    { status: 410 }
  )
}
