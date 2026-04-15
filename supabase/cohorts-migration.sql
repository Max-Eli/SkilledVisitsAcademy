-- ============================================================
-- Live cohort scheduling + 48h access unlock window
-- Run after jidopay-migration.sql in Supabase SQL Editor
-- ============================================================

-- Each course has one or more admin-scheduled live Zoom/Google Meet sessions.
-- Students pick a cohort at checkout, and course access unlocks 48h BEFORE
-- the meeting so they can prep. seats_cap is display-only scarcity — we
-- never actually refuse an enrollment.
create table if not exists course_cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  meeting_at timestamptz not null,
  meeting_link text,
  seats_cap integer default 15 not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists course_cohorts_course_idx
  on course_cohorts(course_id);
create index if not exists course_cohorts_meeting_idx
  on course_cohorts(meeting_at);

alter table course_cohorts enable row level security;

-- Anyone signed in can read active cohorts (used by the checkout picker).
create policy "Anyone can view active cohorts"
  on course_cohorts for select
  using (active = true);

-- Admins manage cohorts.
create policy "Admins can manage cohorts"
  on course_cohorts for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- checkout_intents bridges the client-side cohort pick to the async JidoPay
-- webhook. The page inserts a row right before opening the embed, and the
-- webhook reads the most recent unconsumed intent for this user+course to
-- learn which cohort they chose. We don't ship cohort_id through the payment
-- link because JidoPay links are fixed; the intent table is the side-channel.
create table if not exists checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  course_slug text not null,
  cohort_id uuid references course_cohorts(id) on delete set null,
  consumed_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists checkout_intents_user_course_idx
  on checkout_intents(user_id, course_slug, created_at desc);

alter table checkout_intents enable row level security;

-- Users insert/read their own intents. Service role (webhook) bypasses RLS.
create policy "Users manage own intents"
  on checkout_intents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- course_purchases: track the chosen cohort + the exact moment access opens.
-- access_unlocks_at = cohort.meeting_at - 48h, denormalized so the gating
-- check stays a single indexed column read.
alter table course_purchases
  add column if not exists cohort_id uuid references course_cohorts(id) on delete set null,
  add column if not exists access_unlocks_at timestamptz;

create index if not exists course_purchases_access_unlocks_idx
  on course_purchases(access_unlocks_at);
