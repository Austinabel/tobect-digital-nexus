-- Full-width promotional banner on the shop page: campaign position 'shop-wide'.
-- Additive: widens the position check. Down: 20261116040000_campaign_wide_banner.down.sql
alter table public.campaigns drop constraint if exists campaigns_position_check;
alter table public.campaigns
  add constraint campaigns_position_check
  check (position in ('shop-hero', 'shop-primary', 'shop-secondary', 'shop-tile', 'shop-wide'));
