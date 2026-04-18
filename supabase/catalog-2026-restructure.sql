-- 2026 catalog restructure.
--
-- Replaces the legacy 12-SKU catalog (IV Therapy Certification + masterclasses
-- plus the aesthetic placeholder rows) with the new 19-SKU catalog of live
-- Zoom, in-person, and private 1:1 programs. Private 1:1 SKUs do NOT get
-- their own rows — the webhook grants access to the standard course_id and
-- stamps delivery_mode='private_1on1' on course_purchases. Bundles likewise
-- are pseudo-SKUs expanded at grant time.
--
-- This migration is idempotent: rename uses WHERE slug = old, and INSERTs
-- use ON CONFLICT (slug) DO UPDATE so reruns converge on the canonical state.
--
-- Run in Supabase SQL Editor after:
--   - course-purchase-migration.sql (adds price, course_type, is_featured)
--   - delivery-mode-migration.sql   (adds course_purchases.delivery_mode)

-- ────────────────────────────────────────────────────────────────────────
-- Step 1 — rename the flagship and reprice
-- ────────────────────────────────────────────────────────────────────────
-- iv-therapy-certification → iv-therapy-training
--   - Was $299, now $399 (rebranded as "Comprehensive IV Therapy Training")
--   - We preserve course_id so existing course_purchases stay valid.
--   - Guard against the rare case where both slugs already exist (dev envs
--     that hand-seeded the new slug); in that case we skip the rename.
do $$
begin
  if exists (select 1 from courses where slug = 'iv-therapy-certification')
     and not exists (select 1 from courses where slug = 'iv-therapy-training') then
    update courses
    set slug        = 'iv-therapy-training',
        title       = 'Comprehensive IV Therapy Training',
        description = 'Live 4-hour instructor-led Zoom training covering patient assessment, insertion technique, hydration and nutrient protocols, and complication management. Built for licensed clinicians adding IV services to their practice.',
        category    = 'IV Training',
        price       = 39900,
        price_label = '$399',
        course_type = 'core',
        is_featured = true,
        published   = true
    where slug = 'iv-therapy-certification';
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────────────
-- Step 2 — reprice kept IV masterclasses (14900 → 19900)
-- ────────────────────────────────────────────────────────────────────────
update courses
set price       = 19900,
    price_label = '$199',
    published   = true,
    course_type = 'addon'
where slug in (
  'iv-complications-emergency',
  'vitamin-nutrient-therapy',
  'nad-plus-masterclass',
  'iv-push-administration'
);

-- ────────────────────────────────────────────────────────────────────────
-- Step 3 — unpublish deprecated aesthetic placeholder rows
--           (can't delete without breaking course_purchases FK)
-- ────────────────────────────────────────────────────────────────────────
update courses
set published   = false,
    is_featured = false
where slug in (
  'complete-mastery-bundle',
  'aesthetic-injections-certification',
  'aesthetic-mastery-bundle',
  'dermal-fillers',
  'botox',
  'prf-therapy',
  'prf-ezgel'
);

-- ────────────────────────────────────────────────────────────────────────
-- Step 4 — upsert new aesthetic live-Zoom rows + in-person row
-- ────────────────────────────────────────────────────────────────────────
insert into courses (slug, title, description, category, published, price, price_label, course_type, is_featured)
values
  (
    'botox-basic',
    'Basic Botox Training',
    'Live 4-hour instructor-led Zoom covering neurotoxin pharmacology, upper-face injection patterns (glabella, forehead, crow''s feet), consultation and treatment planning, and asymmetry troubleshooting.',
    'Aesthetic Training',
    true, 39900, '$399', 'aesthetics', true
  ),
  (
    'botox-advanced',
    'Advanced Botox Training',
    'Live 4-hour advanced neurotoxin training — masseter reduction, lip flip, lower-face artistry, Nefertiti lift and difficult-case troubleshooting.',
    'Aesthetic Masterclass',
    true, 49900, '$499', 'aesthetics', false
  ),
  (
    'filler-basic',
    'Basic Dermal Filler Training',
    'Live 4-hour instructor-led Zoom covering HA filler rheology and product selection, lip and midface technique, needle vs cannula decision-making, and the vascular occlusion / hyaluronidase protocol.',
    'Aesthetic Training',
    true, 39900, '$399', 'aesthetics', true
  ),
  (
    'filler-advanced',
    'Advanced Dermal Filler Training',
    'Live 4-hour advanced filler training — full-face design, jawline and chin contouring, non-surgical rhinoplasty, tear trough with cannula, and complete complication-management workflow.',
    'Aesthetic Masterclass',
    true, 49900, '$499', 'aesthetics', false
  ),
  (
    'prp-prf-ezgel',
    'PRP, PRF & EZ Gel Training',
    'Live 4-hour masterclass on platelet-rich biologics — clinical differences between PRP, PRF and EZ Gel; draw and centrifuge protocols; EZ Gel thermal activation; facial rejuvenation injection technique.',
    'Regenerative Aesthetics',
    true, 49900, '$499', 'aesthetics', false
  ),
  (
    'bbl-russian-lip-inperson',
    'Non-Surgical BBL & Russian Lip Technique',
    'One-day in-person hands-on intensive with live models covering non-surgical BBL and the Russian lip technique. Includes pre-reading, supplies, professional portfolio photos, and SVA certificate.',
    'In-Person Training',
    true, 250000, '$2,500', 'aesthetics', true
  )
on conflict (slug) do update set
  title       = excluded.title,
  description = excluded.description,
  category    = excluded.category,
  published   = excluded.published,
  price       = excluded.price,
  price_label = excluded.price_label,
  course_type = excluded.course_type,
  is_featured = excluded.is_featured;

-- ────────────────────────────────────────────────────────────────────────
-- Step 5 — verification view (optional)
-- ────────────────────────────────────────────────────────────────────────
-- Run this after the migration to confirm the published catalog matches
-- the 12 expected rows (19-SKU catalog minus 7 pseudo-SKUs: the bundle and
-- the 6 private 1:1 variants that grant access via their standard course):
--
--   select slug, title, price_label, course_type, published, is_featured
--   from courses
--   where published = true
--   order by course_type desc, is_featured desc, slug;
