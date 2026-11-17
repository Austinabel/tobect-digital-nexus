-- Reverts 20261116090000_merchandising_admin.sql.
-- Removes the evergreen banners and homepage slides added by the up migration
-- (and any edited since). Media usage labels are not restored; the site code
-- of that version no longer reads them for those places.
delete from public.campaigns where evergreen;
drop table if exists public.hero_slides;
alter table public.solar_kits drop constraint if exists solar_kits_image_position_check;
alter table public.solar_kits drop column if exists updated_by;
alter table public.solar_kits drop column if exists updated_at;
alter table public.solar_kits drop column if exists image_position;
alter table public.campaigns drop constraint if exists campaigns_image_position_check;
alter table public.campaigns drop column if exists updated_by;
alter table public.campaigns drop column if exists image_position;
alter table public.campaigns drop column if exists evergreen;
