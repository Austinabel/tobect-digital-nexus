-- Shop hero parallelogram slideshow.
--  * new campaign position 'shop-hero'
--  * designed_banner: the image is a finished banner design (text baked in),
--    shown as-is instead of having the title and button drawn over it.
-- Additive: widens a check constraint and adds a column with a default.
-- Down: 20261116010000_campaign_hero_slides.down.sql

alter table public.campaigns drop constraint if exists campaigns_position_check;
alter table public.campaigns
  add constraint campaigns_position_check
  check (position in ('shop-hero', 'shop-primary', 'shop-secondary', 'shop-tile'));

alter table public.campaigns add column if not exists designed_banner boolean not null default false;
