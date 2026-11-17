-- =====================================================================
-- Admin foundation: roles & permissions, staff, activity log, media
-- library, and "sample" flags on starter content.
--
-- Permission-based access: every admin capability is a permission; roles
-- are named bundles of permissions (editable in this table, assigned by
-- the owner). Row-level security on every shop/content table now checks
-- the specific permission instead of the earlier coarse staff roles.
-- Additive: no data is removed. Down: 20261116060000_admin_foundation.down.sql
-- =====================================================================

-- ---------- roles ----------
create table if not exists public.admin_roles (
  key text primary key,
  label text not null,
  description text not null default '',
  permissions text[] not null default '{}',
  sort_order int not null default 0
);

insert into public.admin_roles (key, label, description, permissions, sort_order) values
  ('owner', 'Owner', 'Full control, including the team and site settings.',
   array['settings.manage','team.manage','content.manage','media.manage','products.manage','catalog.manage','orders.view','orders.manage','quotes.manage','customers.view','activity.view','calculator.manage'], 1),
  ('admin', 'Admin', 'Everything except managing the team.',
   array['settings.manage','content.manage','media.manage','products.manage','catalog.manage','orders.view','orders.manage','quotes.manage','customers.view','activity.view','calculator.manage'], 2),
  ('shop_manager', 'Shop manager', 'Products, categories, kits and collections; can see orders.',
   array['products.manage','catalog.manage','media.manage','orders.view'], 3),
  ('product_lister', 'Product lister', 'Adds and edits products (they go live directly).',
   array['products.manage','media.manage'], 4),
  ('sales', 'Sales / orders', 'Confirms orders, records payments, handles quotes.',
   array['orders.view','orders.manage','quotes.manage','customers.view'], 5),
  ('content_editor', 'Content editor', 'Pages, banners, menus and the media library.',
   array['content.manage','media.manage'], 6)
on conflict (key) do update set label = excluded.label, description = excluded.description, permissions = excluded.permissions, sort_order = excluded.sort_order;

-- ---------- staff ----------
create table if not exists public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role_key text not null references public.admin_roles (key),
  active boolean not null default true,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.has_permission(perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff_members s join public.admin_roles r on r.key = s.role_key
    where s.user_id = auth.uid() and s.active and perm = any (r.permissions)
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff_members where user_id = auth.uid() and active);
$$;

-- ---------- activity log (written by the server only) ----------
create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_activity_created_idx on public.admin_activity (created_at desc);

-- ---------- media library ----------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  filename text not null,
  mime_type text not null,
  size_bytes int not null,
  width int,
  height int,
  alt text not null default '',
  credit text,
  credit_url text,
  license text,
  -- where the site uses this file (e.g. "Homepage hero slide"); in-use files can't be deleted
  usage text[] not null default '{}',
  is_sample boolean not null default false,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists media_assets_live_idx on public.media_assets (created_at desc) where deleted_at is null;

-- ---------- sample flags on starter content ----------
alter table public.products add column if not exists is_sample boolean not null default false;
alter table public.solar_kits add column if not exists is_sample boolean not null default false;
alter table public.campaigns add column if not exists is_sample boolean not null default false;

update public.products set is_sample = true where slug in (
  'deye-10kva-hybrid-inverter', 'beve-15kwh-lithium-battery', 'jinko-550w-solar-panel',
  'cola-solar-3600w-generator', 'cctv-4-lens-camera-kit', 'solar-street-light-200w');
update public.solar_kits set is_sample = true where slug in (
  '3-6kva-complete-solar-kit', '5kva-complete-solar-kit', '10kva-complete-solar-kit', '15kva-complete-solar-kit');
update public.campaigns set is_sample = true where title = 'Cola Solar 3600W Solar Generator';

-- ---------- row-level security: new tables ----------
alter table public.admin_roles enable row level security;
alter table public.staff_members enable row level security;
alter table public.admin_activity enable row level security;
alter table public.media_assets enable row level security;
revoke all on public.admin_roles, public.staff_members, public.admin_activity from anon;

drop policy if exists admin_roles_staff_read on public.admin_roles;
create policy admin_roles_staff_read on public.admin_roles for select using (public.is_staff());

drop policy if exists staff_members_self_read on public.staff_members;
create policy staff_members_self_read on public.staff_members for select using (user_id = auth.uid() or public.has_permission('team.manage'));
drop policy if exists staff_members_team_manage on public.staff_members;
create policy staff_members_team_manage on public.staff_members for all using (public.has_permission('team.manage')) with check (public.has_permission('team.manage'));

drop policy if exists admin_activity_read on public.admin_activity;
create policy admin_activity_read on public.admin_activity for select using (public.has_permission('activity.view'));

drop policy if exists media_assets_public_read on public.media_assets;
create policy media_assets_public_read on public.media_assets for select using (deleted_at is null or public.has_permission('media.manage'));
drop policy if exists media_assets_manage on public.media_assets;
create policy media_assets_manage on public.media_assets for all using (public.has_permission('media.manage')) with check (public.has_permission('media.manage'));

-- ---------- row-level security: existing tables → specific permissions ----------
do $$
declare t text;
begin
  -- catalogue structure
  foreach t in array array['categories','solar_kits','kit_slots','kit_slot_choices','kit_accessories','kit_addons','kit_rules','collection_items'] loop
    execute format('drop policy if exists %1$s_staff_write on public.%1$s', t);
    execute format('create policy %1$s_staff_write on public.%1$s for all using (public.has_permission(''catalog.manage'')) with check (public.has_permission(''catalog.manage''))', t);
  end loop;
end $$;

drop policy if exists products_staff_write on public.products;
create policy products_staff_write on public.products for all using (public.has_permission('products.manage')) with check (public.has_permission('products.manage'));

drop policy if exists campaigns_staff_write on public.campaigns;
create policy campaigns_staff_write on public.campaigns for all using (public.has_permission('content.manage')) with check (public.has_permission('content.manage'));

drop policy if exists quote_requests_staff on public.quote_requests;
create policy quote_requests_staff on public.quote_requests for all using (public.has_permission('quotes.manage'));
drop policy if exists quote_items_staff on public.quote_request_items;
create policy quote_items_staff on public.quote_request_items for all using (public.has_permission('quotes.manage'));
drop policy if exists quote_responses_staff on public.quote_responses;
create policy quote_responses_staff on public.quote_responses for all using (public.has_permission('quotes.manage'));

drop policy if exists orders_staff on public.orders;
drop policy if exists orders_staff_read on public.orders;
create policy orders_staff_read on public.orders for select using (public.has_permission('orders.view'));
drop policy if exists orders_staff_manage on public.orders;
create policy orders_staff_manage on public.orders for update using (public.has_permission('orders.manage')) with check (public.has_permission('orders.manage'));
drop policy if exists order_items_staff on public.order_items;
create policy order_items_staff on public.order_items for select using (public.has_permission('orders.view'));

drop policy if exists customer_profiles_staff on public.customer_profiles;
create policy customer_profiles_staff on public.customer_profiles for select using (public.has_permission('customers.view') or public.has_permission('orders.view'));

drop policy if exists stock_reservations_staff on public.stock_reservations;
create policy stock_reservations_staff on public.stock_reservations for all using (public.has_permission('orders.manage'));
