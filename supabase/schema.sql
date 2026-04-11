-- ============================================================
-- Skilled Visits Academy — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'free' check (role in ('admin', 'subscriber', 'free')),
  subscription_status text not null default 'inactive' check (
    subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')
  ),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  thumbnail_url text,
  category text not null default 'General',
  published boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  mux_asset_id text,
  mux_playback_id text,
  duration_seconds integer,
  order_index integer not null default 0,
  published boolean not null default false,
  created_at timestamptz default now()
);

create table lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- ============================================================
-- COMMUNITY
-- ============================================================
create table threads (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  body text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  category text not null default 'general' check (
    category in ('general', 'clinical-questions', 'protocol-discussions', 'ask-sva-providers')
  ),
  is_pinned boolean not null default false,
  upvotes integer not null default 0,
  created_at timestamptz default now()
);

create table replies (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references threads(id) on delete cascade not null,
  body text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  upvotes integer not null default 0,
  created_at timestamptz default now()
);

create table thread_upvotes (
  user_id uuid references profiles(id) on delete cascade,
  thread_id uuid references threads(id) on delete cascade,
  primary key (user_id, thread_id)
);

create table reply_upvotes (
  user_id uuid references profiles(id) on delete cascade,
  reply_id uuid references replies(id) on delete cascade,
  primary key (user_id, reply_id)
);

-- ============================================================
-- RESOURCE HUB
-- ============================================================

-- Vitamin Library
create table vitamins (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  category text not null,
  description text not null,
  therapeutic_uses text[] not null default '{}',
  dosing_range text not null,
  contraindications text[] not null default '{}',
  interactions text[] not null default '{}',
  created_at timestamptz default now()
);

-- Mixing Compatibility
create table mixing_compatibility (
  id uuid default uuid_generate_v4() primary key,
  additive_a text not null,
  additive_b text not null,
  status text not null check (status in ('compatible', 'incompatible', 'caution')),
  notes text,
  unique(additive_a, additive_b)
);

-- SVA Protocols (curated)
create table protocols (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  symptoms text[] not null default '{}',
  ingredients jsonb not null default '[]',
  rationale text not null,
  is_sva_approved boolean not null default false,
  created_at timestamptz default now()
);

-- User-saved Protocols
create table user_protocols (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  bag_type text not null default '500mL NS',
  ingredients jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Dosage Rules
create table dosage_rules (
  id uuid default uuid_generate_v4() primary key,
  additive_name text not null unique,
  per_kg_dose numeric,
  min_dose numeric not null,
  max_dose numeric not null,
  unit text not null,
  notes text
);

-- Lab Analyses
create table lab_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  file_path text not null,
  file_name text not null,
  extracted_text text,
  ai_result jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table threads enable row level security;
alter table replies enable row level security;
alter table thread_upvotes enable row level security;
alter table reply_upvotes enable row level security;
alter table vitamins enable row level security;
alter table mixing_compatibility enable row level security;
alter table protocols enable row level security;
alter table user_protocols enable row level security;
alter table dosage_rules enable row level security;
alter table lab_analyses enable row level security;

-- Profiles: users can read all, update own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Courses: published courses readable by authenticated, admin manages all
create policy "courses_select_published" on courses for select
  using (published = true or (select role from profiles where id = auth.uid()) = 'admin');
create policy "courses_admin_all" on courses for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Lessons: same as courses
create policy "lessons_select_published" on lessons for select
  using (published = true or (select role from profiles where id = auth.uid()) = 'admin');
create policy "lessons_admin_all" on lessons for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Lesson progress: own records only
create policy "lesson_progress_own" on lesson_progress for all using (auth.uid() = user_id);

-- Threads: authenticated users can read, subscribers/admins can write
create policy "threads_select" on threads for select using (auth.uid() is not null);
create policy "threads_insert" on threads for insert
  with check (auth.uid() = author_id and (
    select role from profiles where id = auth.uid()
  ) in ('admin', 'subscriber'));
create policy "threads_update_own" on threads for update using (auth.uid() = author_id);
create policy "threads_admin_all" on threads for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Replies: same pattern
create policy "replies_select" on replies for select using (auth.uid() is not null);
create policy "replies_insert" on replies for insert
  with check (auth.uid() = author_id and (
    select role from profiles where id = auth.uid()
  ) in ('admin', 'subscriber'));
create policy "replies_update_own" on replies for update using (auth.uid() = author_id);

-- Upvotes
create policy "thread_upvotes_own" on thread_upvotes for all using (auth.uid() = user_id);
create policy "reply_upvotes_own" on reply_upvotes for all using (auth.uid() = user_id);

-- Resource tables: authenticated read, admin write
create policy "vitamins_select" on vitamins for select using (auth.uid() is not null);
create policy "vitamins_admin" on vitamins for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "mixing_select" on mixing_compatibility for select using (auth.uid() is not null);
create policy "mixing_admin" on mixing_compatibility for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "protocols_select" on protocols for select using (auth.uid() is not null);
create policy "protocols_admin" on protocols for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "dosage_rules_select" on dosage_rules for select using (auth.uid() is not null);
create policy "dosage_rules_admin" on dosage_rules for all
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- User protocols: own records only
create policy "user_protocols_own" on user_protocols for all using (auth.uid() = user_id);

-- Lab analyses: own records only
create policy "lab_analyses_own" on lab_analyses for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index courses_slug_idx on courses(slug);
create index courses_published_idx on courses(published);
create index lessons_course_id_idx on lessons(course_id);
create index lessons_order_idx on lessons(course_id, order_index);
create index lesson_progress_user_idx on lesson_progress(user_id);
create index threads_category_idx on threads(category);
create index threads_created_idx on threads(created_at desc);
create index replies_thread_id_idx on replies(thread_id);
create index lab_analyses_user_idx on lab_analyses(user_id);

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- ============================================================
-- Create bucket: "lab-uploads" (private, 10MB max, PDF only)
-- Create bucket: "thumbnails" (public, 5MB max, images)
-- Create bucket: "avatars" (public, 2MB max, images)
