-- Certificates table
-- One record per user per course, created when all lessons are completed.
-- The certificate ID is the public shareable identifier (no auth required to view).

create table if not exists certificates (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  course_id     uuid not null references courses(id) on delete cascade,
  issued_at     timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Allow public read (no auth needed to view a certificate by ID)
alter table certificates enable row level security;

create policy "Public can view certificates by id"
  on certificates for select
  using (true);

create policy "Authenticated users can insert their own certificates"
  on certificates for insert
  with check (auth.uid() = user_id);

-- Service role can do everything (for API routes using service client)
create policy "Service role full access"
  on certificates for all
  using (true);
