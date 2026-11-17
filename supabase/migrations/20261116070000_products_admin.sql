-- Products admin: descriptions, SEO, inverter datasheet values, product
-- photos (from the media library), trash (soft delete) and edit tracking.
-- Additive. Down: 20261116070000_products_admin.down.sql

alter table public.products add column if not exists description text;
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
-- inverters: { "batteryV": 48, "maxPvV": 500, "mpptMinV": 120 } — datasheet values only
alter table public.products add column if not exists inverter_spec jsonb;
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists created_by uuid references auth.users (id) on delete set null;
alter table public.products add column if not exists updated_by uuid references auth.users (id) on delete set null;

-- Ordered photos per product; the first is the main image.
create table if not exists public.product_images (
  product_slug text not null references public.products (slug) on delete cascade on update cascade,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  sort_order int not null default 0,
  primary key (product_slug, media_id)
);
create index if not exists product_images_order_idx on public.product_images (product_slug, sort_order);

alter table public.product_images enable row level security;
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select using (true);
drop policy if exists product_images_manage on public.product_images;
create policy product_images_manage on public.product_images for all using (public.has_permission('products.manage')) with check (public.has_permission('products.manage'));

-- Visitors see only published products that aren't in the trash.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (published and deleted_at is null);
