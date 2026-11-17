-- Rollback for 20261116080000_orders_quotes_admin.sql. DESTRUCTIVE: drops the order timeline.
alter table public.quote_requests drop column if exists services;
alter table public.quote_requests drop column if exists reference;
drop sequence if exists public.quote_reference_seq;
drop function if exists public.release_order_stock(text);
drop function if exists public.commit_order_stock(text);
drop table if exists public.order_events;
