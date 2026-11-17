-- Subcategories and duplicate-proof product listing.
--
--  * categories.parent_slug — one level of subcategories (Inverters → Hybrid
--    inverters). A subcategory can't have its own subcategories, and a
--    category that has subcategories can't be moved under another.
--  * products.sku / products.barcode — optional codes, unique when set.
--  * the same brand + model can't be listed twice (spacing, dashes and
--    letter case ignored; products in the trash count, so a trashed
--    duplicate is restored instead of re-created).
--  * media_assets.sha256 — fingerprint of each uploaded file, so the same
--    photo isn't stored twice.
--
-- Additive. Down: 20261117030000_subcategories_dedupe.down.sql

alter table public.categories add column if not exists parent_slug text
  references public.categories (slug) on update cascade on delete restrict;
alter table public.categories drop constraint if exists categories_parent_not_self;
alter table public.categories add constraint categories_parent_not_self check (parent_slug is null or parent_slug <> slug);
create index if not exists categories_parent_idx on public.categories (parent_slug);

create or replace function public.categories_one_level() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.parent_slug is not null then
    if exists (select 1 from categories where slug = new.parent_slug and parent_slug is not null) then
      raise exception 'subcategory_depth: a subcategory cannot have subcategories' using errcode = 'P0001';
    end if;
    if exists (select 1 from categories where parent_slug = new.slug) then
      raise exception 'subcategory_depth: this category has subcategories, so it cannot become a subcategory' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists categories_one_level on public.categories;
create trigger categories_one_level before insert or update of parent_slug on public.categories
  for each row execute function public.categories_one_level();

alter table public.products add column if not exists sku text check (sku is null or sku ~ '^[A-Za-z0-9._/-]{1,40}$');
alter table public.products add column if not exists barcode text check (barcode is null or barcode ~ '^[0-9]{6,14}$');
create unique index if not exists products_sku_key on public.products (lower(sku)) where sku is not null;
create unique index if not exists products_barcode_key on public.products (barcode) where barcode is not null;
create unique index if not exists products_brand_model_key on public.products (
  lower(regexp_replace(brand, '[^a-zA-Z0-9]', '', 'g')),
  lower(regexp_replace(model, '[^a-zA-Z0-9]', '', 'g'))
) where brand is not null and model is not null and model <> '';

alter table public.media_assets add column if not exists sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$');
create unique index if not exists media_assets_sha256_key on public.media_assets (sha256) where sha256 is not null and deleted_at is null;
