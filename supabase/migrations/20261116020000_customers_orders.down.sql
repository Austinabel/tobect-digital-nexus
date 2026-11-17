-- Rollback for 20261116020000_customers_orders.sql.
-- DESTRUCTIVE: drops orders and customer profiles with their data. Staging only.
drop table if exists public.order_items;
drop table if exists public.orders;
drop sequence if exists public.order_number_seq;
drop table if exists public.customer_profiles;
