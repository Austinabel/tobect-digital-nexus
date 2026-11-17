-- Tighten table grants on orders (defence in depth on top of RLS).
-- Supabase grants table-wide SELECT to anon/authenticated by default, which a
-- column-level REVOKE cannot narrow. So:
--  * anon: no access to orders / order_items at all (guests are served by the server)
--  * authenticated: may read every orders column except access_token
-- Down: 20261116030000_orders_column_grants.down.sql

revoke all on public.orders from anon;
revoke all on public.order_items from anon;
revoke all on public.customer_profiles from anon;

revoke select on public.orders from authenticated;
grant select (
  id, order_number, customer_id, full_name, email, phone, delivery_address, city, state, notes,
  subtotal_ngn, has_unpriced_parts, payment_method, payment_status, payment_reference, paid_at,
  status, created_at, updated_at
) on public.orders to authenticated;
