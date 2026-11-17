-- Rollback for 20261116070000_products_admin.sql. DESTRUCTIVE: drops product photos links and the new product fields.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (published);
drop table if exists public.product_images;
alter table public.products drop column if exists updated_by;
alter table public.products drop column if exists created_by;
alter table public.products drop column if exists deleted_at;
alter table public.products drop column if exists inverter_spec;
alter table public.products drop column if exists seo_description;
alter table public.products drop column if exists seo_title;
alter table public.products drop column if exists description;
