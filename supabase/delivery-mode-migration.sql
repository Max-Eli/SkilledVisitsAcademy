-- Adds delivery_mode to course_purchases so we can distinguish Private 1:1
-- enrollments (where admin schedules a dedicated session with the learner)
-- from the standard group Zoom delivery.
--
-- Values:
--   'group'        — standard live Zoom cohort (default)
--   'private_1on1' — purchased one of the Private 1:1 SKUs; needs admin
--                    scheduling
--
-- Nullable with a default of 'group' so existing rows remain valid.

alter table course_purchases
  add column if not exists delivery_mode text
    not null default 'group'
    check (delivery_mode in ('group', 'private_1on1'));

create index if not exists course_purchases_delivery_mode_idx
  on course_purchases(delivery_mode)
  where delivery_mode = 'private_1on1';
