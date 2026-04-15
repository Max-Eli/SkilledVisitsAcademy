-- ============================================================
-- JidoPay payment tracking columns
-- Run in Supabase SQL Editor after deploying the JidoPay
-- webhook route. Safe to run multiple times.
-- ============================================================

-- Track which JidoPay checkout session granted each purchase.
-- These are additive columns — the legacy square_payment_id /
-- square_order_id columns remain for historical records and
-- any Square purchases still on file.
alter table course_purchases
  add column if not exists jidopay_session_id text,
  add column if not exists jidopay_payment_link_id text;

-- Index to support lookups by JidoPay session id (useful for
-- manual refunds / reconciliation from the JidoPay dashboard).
create index if not exists course_purchases_jidopay_session_idx
  on course_purchases(jidopay_session_id);
