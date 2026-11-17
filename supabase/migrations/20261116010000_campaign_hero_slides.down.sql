-- Rollback for 20261116010000_campaign_hero_slides.sql.
-- Fails (safely) if any campaign still uses position 'shop-hero' — move or
-- archive those first.
alter table public.campaigns drop column if exists designed_banner;
alter table public.campaigns drop constraint if exists campaigns_position_check;
alter table public.campaigns
  add constraint campaigns_position_check
  check (position in ('shop-primary', 'shop-secondary', 'shop-tile'));
