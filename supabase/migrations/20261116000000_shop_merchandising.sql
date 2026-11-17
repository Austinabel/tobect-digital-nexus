-- =====================================================================
-- Tobecat shop: catalogue, merchandising, kits, quotations, stock.
--
-- First schema for the Tobecat Supabase project. Apply with
-- `npm run db -- migrate`. The TypeScript types in src/lib mirror these
-- columns.
--
-- Safety: additive only. Every statement is CREATE ... IF NOT EXISTS (or
-- an idempotent policy/function replace). Nothing is dropped, altered or
-- deleted, so it can be re-run and it cannot touch existing data.
-- Rollback: 20261116000000_shop_merchandising.down.sql (only valid
-- before any production data is written).
-- =====================================================================

-- ---------- staff roles (admin access) ----------
create table if not exists public.staff_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'merchandiser', 'sales')),
  created_at timestamptz not null default now()
);

create or replace function public.has_staff_role(roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff_roles where user_id = auth.uid() and role = any (roles));
$$;

-- ---------- catalogue ----------
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  glyph text not null,
  image_url text,
  sort_order int not null default 0
);

create table if not exists public.products (
  slug text primary key,
  name text not null,
  brand text,
  model text,
  category_slug text not null references public.categories (slug),
  price_ngn bigint not null check (price_ngn >= 0),
  -- genuine previous price only; drives Sale & Deals
  compare_at_price_ngn bigint check (compare_at_price_ngn is null or compare_at_price_ngn > price_ngn),
  specs text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  image_url text,
  availability text check (availability in ('in-stock', 'pre-order', 'out-of-stock')),
  -- null = stock not tracked; confirmed by hand
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  featured boolean not null default false,
  published boolean not null default false,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_slug) where published;
create index if not exists products_brand_idx on public.products (brand) where published;
create index if not exists products_attributes_idx on public.products using gin (attributes);

-- ---------- promotional campaigns ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kicker text,
  description text,
  discount_label text,
  cta_text text not null,
  -- same-site path or https URL (also enforced in the app)
  cta_href text not null check (cta_href ~ '^(/[^/]|https://)'),
  desktop_image_url text,
  mobile_image_url text,
  image_alt text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  priority int not null default 0,
  position text not null check (position in ('shop-primary', 'shop-secondary', 'shop-tile')),
  theme text check (theme in ('blue', 'navy', 'red')),
  archived_at timestamptz,           -- soft delete: "delete with safeguards"
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index if not exists campaigns_live_idx on public.campaigns (position, priority desc) where active and archived_at is null;

-- ---------- solar installation kits ----------
create table if not exists public.solar_kits (
  slug text primary key,
  name text not null,
  capacity_label text not null,
  tag text,
  summary text not null,
  applications text[] not null default '{}',
  outline text[] not null default '{}',
  image_url text,
  image_alt text,
  purchasable boolean not null default false,
  accessories_price_ngn bigint check (accessories_price_ngn is null or accessories_price_ngn >= 0),
  installation_note text,
  published boolean not null default false,
  sort_order int not null default 0
);

-- swappable component positions (inverter / battery / panels)
create table if not exists public.kit_slots (
  kit_slug text not null references public.solar_kits (slug) on delete cascade,
  key text not null,
  label text not null,
  role text not null check (role in ('inverter', 'battery', 'panel')),
  qty_default int not null,
  qty_min int not null,
  qty_max int not null,
  sort_order int not null default 0,
  primary key (kit_slug, key),
  check (qty_min >= 1 and qty_min <= qty_default and qty_default <= qty_max)
);

create table if not exists public.kit_slot_choices (
  kit_slug text not null,
  slot_key text not null,
  product_slug text not null references public.products (slug),
  sort_order int not null default 0,          -- 0 = default choice
  primary key (kit_slug, slot_key, product_slug),
  foreign key (kit_slug, slot_key) references public.kit_slots (kit_slug, key) on delete cascade
);

create table if not exists public.kit_accessories (
  kit_slug text not null references public.solar_kits (slug) on delete cascade,
  name text not null,
  detail text,
  sort_order int not null default 0,
  primary key (kit_slug, name)
);

create table if not exists public.kit_addons (
  kit_slug text not null references public.solar_kits (slug) on delete cascade,
  key text not null,
  label text not null,
  description text,
  product_slug text references public.products (slug),
  price_ngn bigint check (price_ngn is null or price_ngn >= 0),
  primary key (kit_slug, key)
);

-- compatibility: when slot X = product A, slot Y must be one of [...]
create table if not exists public.kit_rules (
  id uuid primary key default gen_random_uuid(),
  kit_slug text not null references public.solar_kits (slug) on delete cascade,
  when_slot text not null,
  when_product text not null,
  require_slot text not null,
  require_products text[] not null,
  message text not null
);

-- ---------- collections (New Arrivals, Popular, Featured) ----------
create table if not exists public.collection_items (
  collection text not null check (collection in ('new-arrivals', 'popular', 'featured')),
  product_slug text not null references public.products (slug) on delete cascade,
  sort_order int not null default 0,
  primary key (collection, product_slug)
);

-- ---------- bulk / commercial quotations ----------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'bulk' check (kind in ('bulk', 'standard', 'kit')),
  name text not null,
  business_name text,
  customer_type text,
  phone text not null,
  email text,
  delivery_location text not null,
  project_description text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'won', 'lost', 'spam')),
  assigned_to uuid references auth.users (id),
  staff_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quote_requests_status_idx on public.quote_requests (status, created_at desc);

create table if not exists public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests (id) on delete cascade,
  product_slug text references public.products (slug),   -- null when typed freely
  description text not null,
  quantity int not null check (quantity between 1 and 100000)
);

create table if not exists public.quote_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests (id) on delete cascade,
  author uuid references auth.users (id),
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- stock reservations (no overselling, no double counting) ----------
-- A kit order reserves its COMPONENT products; kits never hold stock.
create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  product_slug text not null references public.products (slug),
  quantity int not null check (quantity > 0),
  status text not null default 'held' check (status in ('held', 'committed', 'released')),
  expires_at timestamptz not null default now() + interval '2 hours',
  created_at timestamptz not null default now()
);
create index if not exists stock_reservations_live_idx on public.stock_reservations (product_slug) where status = 'held';

-- Reserve a whole order atomically. `items` = [{"slug": "...", "qty": n}, ...]
-- already expanded from kits to components (see src/lib/shop/inventory.ts).
-- Locks the product rows, so two buyers can't both take the last unit.
create or replace function public.reserve_stock(order_ref text, items jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  it record;
  on_hand int;
  held int;
begin
  for it in select x->>'slug' as slug, (x->>'qty')::int as qty from jsonb_array_elements(items) x order by 1 loop
    select stock_quantity into on_hand from products where slug = it.slug for update;
    if on_hand is null then continue; end if;              -- untracked: confirmed by hand
    select coalesce(sum(quantity), 0) into held from stock_reservations
      where product_slug = it.slug and status = 'held' and expires_at > now();
    if on_hand - held < it.qty then
      raise exception 'insufficient_stock:%', it.slug using errcode = 'P0001';
    end if;
    insert into stock_reservations (order_ref, product_slug, quantity) values (order_ref, it.slug, it.qty);
  end loop;
end;
$$;
-- Server-only: never callable from the browser (anon / signed-in users).
revoke execute on function public.reserve_stock(text, jsonb) from public, anon, authenticated;

-- ---------- row-level security ----------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.campaigns enable row level security;
alter table public.solar_kits enable row level security;
alter table public.kit_slots enable row level security;
alter table public.kit_slot_choices enable row level security;
alter table public.kit_accessories enable row level security;
alter table public.kit_addons enable row level security;
alter table public.kit_rules enable row level security;
alter table public.collection_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;
alter table public.quote_responses enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.staff_roles enable row level security;

do $$
declare
  t text;
  -- what the public storefront may read; staff see everything through *_staff_write
  visible constant jsonb := jsonb_build_object(
    'products', 'published',
    'solar_kits', 'published',
    'campaigns', 'active and archived_at is null'
  );
begin
  foreach t in array array['categories','products','campaigns','solar_kits','kit_slots','kit_slot_choices','kit_accessories','kit_addons','kit_rules','collection_items'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format('create policy %1$s_public_read on public.%1$s for select using (%2$s)', t, coalesce(visible->>t, 'true'));
    execute format('drop policy if exists %1$s_staff_write on public.%1$s', t);
    execute format('create policy %1$s_staff_write on public.%1$s for all using (public.has_staff_role(array[''admin'',''merchandiser''])) with check (public.has_staff_role(array[''admin'',''merchandiser'']))', t);
  end loop;
end $$;

-- Quotations: submitted only through the website's server code (secret key,
-- with validation), so there is deliberately NO public insert policy —
-- browsers can't write to these tables directly. Staff (admin/sales) manage them.
drop policy if exists quote_requests_staff on public.quote_requests;
create policy quote_requests_staff on public.quote_requests for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists quote_items_staff on public.quote_request_items;
create policy quote_items_staff on public.quote_request_items for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists quote_responses_staff on public.quote_responses;
create policy quote_responses_staff on public.quote_responses for all using (public.has_staff_role(array['admin','sales']));

drop policy if exists stock_reservations_staff on public.stock_reservations;
create policy stock_reservations_staff on public.stock_reservations for all using (public.has_staff_role(array['admin']));
drop policy if exists staff_roles_admin on public.staff_roles;
create policy staff_roles_admin on public.staff_roles for all using (public.has_staff_role(array['admin']));
drop policy if exists staff_roles_self_read on public.staff_roles;
create policy staff_roles_self_read on public.staff_roles for select using (user_id = auth.uid());

-- Storage: create a PUBLIC bucket named 'shop-media' for product, kit and
-- campaign images (desktop + mobile), writable by staff only — done in the
-- Supabase dashboard or with the storage API when the project is created.
