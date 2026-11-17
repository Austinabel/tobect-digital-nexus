-- Rollback for 20261116030000_orders_column_grants.sql (restores Supabase defaults).
grant select on public.orders to authenticated;
grant all on public.orders to anon;
grant all on public.order_items to anon;
grant all on public.customer_profiles to anon;
