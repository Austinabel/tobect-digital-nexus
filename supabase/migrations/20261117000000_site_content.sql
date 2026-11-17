-- Phase 5: business details and page content edited in the admin.
--
--  * site_settings — one row (id = 1) holding the business's details as JSON
--    (validated by the app: src/lib/site.ts). Empty = launch defaults.
--  * page_content  — one row per editable page (About, FAQs, testimonials,
--    projects, policies), validated by src/lib/content.ts. No row = the
--    content the site shipped with.
--
-- Everyone can read (the public pages need it); only staff with the right
-- permission can write. Additive. Down: 20261117000000_site_content.down.sql

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
insert into public.site_settings (id) values (1) on conflict do nothing;

create table if not exists public.page_content (
  key text primary key check (key in ('about', 'faqs', 'testimonials', 'projects', 'warranty', 'terms', 'privacy', 'returns')),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_settings enable row level security;
alter table public.page_content enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
drop policy if exists site_settings_staff_write on public.site_settings;
create policy site_settings_staff_write on public.site_settings for all
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

drop policy if exists page_content_public_read on public.page_content;
create policy page_content_public_read on public.page_content for select using (true);
drop policy if exists page_content_staff_write on public.page_content;
create policy page_content_staff_write on public.page_content for all
  using (public.has_permission('content.manage')) with check (public.has_permission('content.manage'));
