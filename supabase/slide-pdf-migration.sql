-- Add slide_pdf_url to lessons table for PDF slide deck support
alter table lessons
  add column if not exists slide_pdf_url text,
  add column if not exists slide_page_count integer;

-- Create private storage bucket for course slides
insert into storage.buckets (id, name, public)
  values ('course-slides', 'course-slides', false)
  on conflict (id) do nothing;

-- Bucket is private. All client access to slide PDFs goes through the
-- /api/lessons/slide-url route, which verifies course purchase then mints
-- a short-lived signed URL using the service role. No direct RLS policies
-- on storage.objects are needed for this bucket — the default "no access"
-- is exactly what we want.
