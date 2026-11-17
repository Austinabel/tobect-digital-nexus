-- Rollback for 20261116060000_admin_foundation.sql.
-- DESTRUCTIVE for staff assignments, the activity log and media records
-- (files in Storage are NOT deleted). Restores the earlier coarse policies.
alter table public.products drop column if exists is_sample;
alter table public.solar_kits drop column if exists is_sample;
alter table public.campaigns drop column if exists is_sample;
drop table if exists public.media_assets;
drop table if exists public.admin_activity;

do $$
declare t text;
begin
  foreach t in array array['categories','solar_kits','kit_slots','kit_slot_choices','kit_accessories','kit_addons','kit_rules','collection_items','products','campaigns'] loop
    execute format('drop policy if exists %1$s_staff_write on public.%1$s', t);
    execute format('create policy %1$s_staff_write on public.%1$s for all using (public.has_staff_role(array[''admin'',''merchandiser''])) with check (public.has_staff_role(array[''admin'',''merchandiser'']))', t);
  end loop;
end $$;
drop policy if exists quote_requests_staff on public.quote_requests;
create policy quote_requests_staff on public.quote_requests for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists quote_items_staff on public.quote_request_items;
create policy quote_items_staff on public.quote_request_items for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists quote_responses_staff on public.quote_responses;
create policy quote_responses_staff on public.quote_responses for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists orders_staff_read on public.orders;
drop policy if exists orders_staff_manage on public.orders;
create policy orders_staff on public.orders for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists order_items_staff on public.order_items;
create policy order_items_staff on public.order_items for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists customer_profiles_staff on public.customer_profiles;
create policy customer_profiles_staff on public.customer_profiles for select using (public.has_staff_role(array['admin','sales']));
drop policy if exists stock_reservations_staff on public.stock_reservations;
create policy stock_reservations_staff on public.stock_reservations for all using (public.has_staff_role(array['admin']));

drop function if exists public.is_staff();
drop function if exists public.has_permission(text);
drop table if exists public.staff_members;
drop table if exists public.admin_roles;
