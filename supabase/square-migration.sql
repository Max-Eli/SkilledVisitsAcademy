-- Square payment provider columns
-- Run this in Supabase SQL Editor

alter table profiles
  add column if not exists square_customer_id text,
  add column if not exists square_subscription_id text;
