-- Rollback for 20261116040000_campaign_wide_banner.sql. Fails (safely) while any campaign uses 'shop-wide'.
alter table public.campaigns drop constraint if exists campaigns_position_check;
alter table public.campaigns
  add constraint campaigns_position_check
  check (position in ('shop-hero', 'shop-primary', 'shop-secondary', 'shop-tile'));
