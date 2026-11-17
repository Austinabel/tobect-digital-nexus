-- Rollback for 20261116000000_shop_merchandising.sql.
-- DESTRUCTIVE: drops the shop tables and their data. Only for undoing the
-- migration on a fresh / staging database before real data exists.
-- Never run against production without an approved backup.

drop function if exists public.reserve_stock(text, jsonb);
drop table if exists public.stock_reservations;
drop table if exists public.quote_responses;
drop table if exists public.quote_request_items;
drop table if exists public.quote_requests;
drop table if exists public.collection_items;
drop table if exists public.kit_rules;
drop table if exists public.kit_addons;
drop table if exists public.kit_accessories;
drop table if exists public.kit_slot_choices;
drop table if exists public.kit_slots;
drop table if exists public.solar_kits;
drop table if exists public.campaigns;
drop table if exists public.products;
drop table if exists public.categories;
drop function if exists public.has_staff_role(text[]);
drop table if exists public.staff_roles;
