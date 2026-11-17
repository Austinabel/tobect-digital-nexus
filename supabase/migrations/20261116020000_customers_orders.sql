-- Customer accounts and orders (registered + guest checkout).
--
-- * customer_profiles: one row per registered customer (auth.users).
-- * orders / order_items: written ONLY by the website's server code with
--   the secret key, after it re-prices every line from the catalogue —
--   so a tampered cart can never change a price. Customers may read their
--   own orders; guests reach theirs through an unguessable access token.
-- Additive only. Down: 20261116020000_customers_orders.down.sql

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  delivery_address text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TBC-' || nextval('public.order_number_seq')),
  -- null for guest checkout
  customer_id uuid references auth.users (id) on delete set null,
  -- lets a guest open their confirmation page; never shown to anyone else
  access_token uuid not null default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text not null,
  delivery_address text not null,
  city text not null,
  state text not null,
  notes text,
  subtotal_ngn bigint not null check (subtotal_ngn >= 0),
  -- true when some kit accessories / quoted extras still need pricing
  has_unpriced_parts boolean not null default false,
  payment_method text not null check (payment_method in ('paystack', 'pay-on-confirmation')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  payment_reference text unique,
  paid_at timestamptz,
  status text not null default 'new' check (status in ('new', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_customer_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('product', 'kit')),
  -- product slug or kit slug (kits are validated in code)
  item_slug text not null,
  name text not null,
  quantity int not null check (quantity between 1 and 99),
  unit_price_ngn bigint not null check (unit_price_ngn >= 0),
  line_total_ngn bigint not null check (line_total_ngn >= 0),
  -- kit configuration + human-readable parts, snapshotted at order time
  kit_config jsonb,
  kit_parts text[]
);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- customers: read and update their own profile (created by the server at sign-up)
drop policy if exists customer_profiles_own_read on public.customer_profiles;
create policy customer_profiles_own_read on public.customer_profiles for select using (id = auth.uid());
drop policy if exists customer_profiles_own_update on public.customer_profiles;
create policy customer_profiles_own_update on public.customer_profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists customer_profiles_staff on public.customer_profiles;
create policy customer_profiles_staff on public.customer_profiles for select using (public.has_staff_role(array['admin','sales']));

-- orders: customers read their own; staff (admin/sales) manage all. No public insert.
drop policy if exists orders_own_read on public.orders;
create policy orders_own_read on public.orders for select using (customer_id = auth.uid());
drop policy if exists orders_staff on public.orders;
create policy orders_staff on public.orders for all using (public.has_staff_role(array['admin','sales']));
drop policy if exists order_items_own_read on public.order_items;
create policy order_items_own_read on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
drop policy if exists order_items_staff on public.order_items;
create policy order_items_staff on public.order_items for all using (public.has_staff_role(array['admin','sales']));

-- the access token is for the server only; signed-in customers don't need it
revoke select (access_token) on public.orders from anon, authenticated;
