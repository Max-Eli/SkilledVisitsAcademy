-- ============================================================
-- Course purchase model + license fields migration
-- Run in Supabase SQL Editor
-- ============================================================

-- Add license fields to profiles (required for all users)
alter table profiles
  add column if not exists license_type text,
  add column if not exists license_number text,
  add column if not exists license_state text;

-- Add pricing fields to courses table
alter table courses
  add column if not exists price integer default 0,          -- price in cents (e.g. 19900 = $199)
  add column if not exists price_label text,                 -- e.g. "$199"
  add column if not exists course_type text default 'core',  -- 'core' | 'addon' | 'aesthetics'
  add column if not exists is_featured boolean default false;

-- Course purchases table — tracks one-time course access grants
create table if not exists course_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  square_payment_id text,
  square_order_id text,
  amount_paid integer not null,  -- in cents
  created_at timestamptz default now() not null,
  unique(user_id, course_id)
);

-- RLS for course_purchases
alter table course_purchases enable row level security;

create policy "Users can view own purchases"
  on course_purchases for select
  using (auth.uid() = user_id);

create policy "Service role can manage purchases"
  on course_purchases for all
  using (true)
  with check (true);

-- Index for fast lookups
create index if not exists course_purchases_user_id_idx on course_purchases(user_id);
create index if not exists course_purchases_course_id_idx on course_purchases(course_id);
