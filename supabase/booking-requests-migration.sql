-- Request-to-Book queue.
--
-- Records a learner's interest in an in-person or private 1:1 course
-- before they check out. Admin reviews the queue from the dashboard and
-- either confirms a date (and points the learner at enrollment) or
-- emails back with alternative options.
--
-- This table is operator-only: no RLS policy exposes it to the public
-- anon/authenticated roles — the API route writes via the service key.

create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),

  course_key        text not null,
  course_title      text not null,
  delivery_mode     text not null
    check (delivery_mode in ('in-person', 'private-1on1')),

  full_name         text not null,
  email             text not null,
  phone             text,
  license_type      text not null,
  license_state     text not null,
  preferred_dates   text not null,
  notes             text,

  status            text not null default 'pending'
    check (status in ('pending', 'scheduled', 'declined', 'cancelled')),
  scheduled_at      timestamptz,
  admin_notes       text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists booking_requests_status_idx
  on booking_requests(status, created_at desc)
  where status = 'pending';

create index if not exists booking_requests_email_idx
  on booking_requests(lower(email));

alter table booking_requests enable row level security;

-- No policies created: the service-role client (used by the API route and
-- admin pages) bypasses RLS. Public roles have zero access.
