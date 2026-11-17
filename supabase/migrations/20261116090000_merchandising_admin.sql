-- Phase 4: banners, slides, kits and collections are edited in the admin.
--
--  * campaigns.evergreen  — "house" banners that fill a slot when no dated
--    promotion is running (previously hard-coded in src/lib/data/campaigns.ts)
--  * campaigns.image_position / solar_kits.image_position — focal point
--  * hero_slides          — homepage background slideshow (was src/lib/data/hero-slides.ts)
--  * copies the hard-coded banners, slides and kit photos into the database,
--    pointing at the starter photos already in the media library, so the
--    site looks exactly the same afterwards.
--
-- Additive: new columns with defaults, one new table, inserts guarded by
-- NOT EXISTS, and updates that only fill empty kit images.
-- Down: 20261116090000_merchandising_admin.down.sql

alter table public.campaigns add column if not exists evergreen boolean not null default false;
alter table public.campaigns add column if not exists image_position text;
alter table public.campaigns add column if not exists updated_by uuid references auth.users (id);
alter table public.campaigns drop constraint if exists campaigns_image_position_check;
alter table public.campaigns add constraint campaigns_image_position_check
  check (image_position is null or image_position ~ '^(100|[1-9]?[0-9])% (100|[1-9]?[0-9])%$');

alter table public.solar_kits add column if not exists image_position text;
alter table public.solar_kits add column if not exists updated_at timestamptz not null default now();
alter table public.solar_kits add column if not exists updated_by uuid references auth.users (id);
alter table public.solar_kits drop constraint if exists solar_kits_image_position_check;
alter table public.solar_kits add constraint solar_kits_image_position_check
  check (image_position is null or image_position ~ '^(100|[1-9]?[0-9])% (100|[1-9]?[0-9])%$');

-- ---------- homepage background slideshow ----------
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (image_url ~ '^https://'),
  alt text not null default '',
  image_position text check (image_position is null or image_position ~ '^(100|[1-9]?[0-9])% (100|[1-9]?[0-9])%$'),
  credit_name text,
  credit_url text check (credit_url is null or credit_url ~ '^https://'),
  sort_order int not null default 0,
  active boolean not null default true,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);
alter table public.hero_slides enable row level security;
drop policy if exists hero_slides_public_read on public.hero_slides;
create policy hero_slides_public_read on public.hero_slides for select using (active);
drop policy if exists hero_slides_staff_write on public.hero_slides;
create policy hero_slides_staff_write on public.hero_slides for all
  using (public.has_permission('content.manage')) with check (public.has_permission('content.manage'));

-- ---------- copy the hard-coded content in ----------
create temporary table _media on commit drop as
  select storage_path, public_url from public.media_assets where deleted_at is null;

insert into public.hero_slides (image_url, alt, image_position, credit_name, credit_url, sort_order, is_sample)
select m.public_url, s.alt, s.pos, s.credit, s.credit_url, s.ord, true
from (values
  ('starter/hero/solar-farm.jpg', 'Solar farm stretching across a landscape in golden evening light', '65% 50%', 'Vlad Burac', 'https://unsplash.com/photos/CVjxkBW22fU', 1),
  ('starter/hero/home-rooftop.jpg', 'Solar panels installed on the roof of a family home', '60% 40%', 'Watt A Lot', 'https://unsplash.com/photos/gqpuuF3a2tY', 2),
  ('starter/hero/tracker-array.jpg', 'Rows of solar panels on tracking mounts under a bright blue sky', '50% 70%', 'American Public Power Association', 'https://unsplash.com/photos/XGAZzyLzn18', 3),
  ('starter/hero/homes-sunset.jpg', 'Homes with rooftop solar panels at sunset', '60% 80%', 'Vivint Solar', 'https://unsplash.com/photos/_ciUqT1HEuY', 4),
  ('starter/hero/utility-install.jpg', 'Aerial view of a large solar installation with an installer walking between panel rows', '50% 50%', 'Priamo Mendez', 'https://unsplash.com/photos/E4XEBPEkgUs', 5)
) as s (path, alt, pos, credit, credit_url, ord)
join _media m on m.storage_path = s.path
where not exists (select 1 from public.hero_slides);

insert into public.campaigns (title, kicker, description, cta_text, cta_href, desktop_image_url, image_alt, image_position, active, evergreen, priority, position, theme)
select c.title, c.kicker, c.description, c.cta_text, c.cta_href, m.public_url, c.image_alt, c.pos, true, true, c.priority, c.position, c.theme
from (values
  ('All-in-One Solar Installation Kits', 'Complete Solar Packages', 'Inverter, lithium battery, solar panels, cables and protection — one complete system.', 'Shop Kits', '/shop/installation-kits', 'starter/sections/commercial-rooftop.jpg', 'Solar panels across a commercial rooftop', null, 0, 'shop-hero', null),
  ('Customise a 10KVA Solar Kit', 'Build Your System', 'Choose your battery capacity and panel count — the price updates as you build.', 'Configure Kit', '/shop/installation-kits/10kva-complete-solar-kit', 'starter/hero/home-rooftop.jpg', 'Family home with solar panels on the roof', null, -1, 'shop-hero', null),
  ('Special Pricing for Installers & Dealers', 'Bulk & Commercial Orders', 'Request one quotation for all the products and quantities your project needs.', 'Request Bulk Quote', '/bulk-quote', 'starter/sections/installer-panels.jpg', 'Installer working on a solar panel', null, -2, 'shop-hero', null),
  ('Size Your Solar System in Minutes', 'Not Sure What Size?', 'Pick your appliances and get a recommended inverter, battery and panel size.', 'Use the Calculator', '/solar-calculator', 'starter/hero/homes-sunset.jpg', 'Homes with rooftop solar at sunset', null, -3, 'shop-hero', null),
  ('Complete Solar Kits for Homes & Businesses', 'Day & Night Power', 'Hybrid inverter, lithium battery, solar panels and installation accessories — choose a package or customise your own.', 'Shop Solar Kits', '/shop/installation-kits', 'starter/hero/homes-sunset.jpg', 'Homes with rooftop solar at sunset', '50% 78%', 0, 'shop-wide', null)
) as c (title, kicker, description, cta_text, cta_href, path, image_alt, pos, priority, position, theme)
join _media m on m.storage_path = c.path
where not exists (select 1 from public.campaigns where evergreen);

insert into public.campaigns (title, kicker, description, cta_text, cta_href, active, evergreen, priority, position, theme)
select c.title, c.kicker, c.description, c.cta_text, c.cta_href, true, true, c.priority, c.position, c.theme
from (values
  ('Solar Installation Kits, Ready to Install', 'Complete Solar Packages', 'Inverter, lithium battery, solar panels, cables and protection — one complete system, configured for you.', 'Shop Kits', '/shop/installation-kits', 0, 'shop-primary', 'navy'),
  ('Everything in One Package', 'Complete Installation Kits', E'Inverter + Battery + Solar Panels\nCables + Breakers + Accessories\nReady for Home or Office', 'Shop Kits', '/shop/installation-kits', 0, 'shop-secondary', 'blue'),
  ('Size Your Solar System', 'Not sure what size?', 'Pick your appliances and get a recommended inverter, battery and panel size.', 'Use the Calculator', '/solar-calculator', -1, 'shop-secondary', 'blue')
) as c (title, kicker, description, cta_text, cta_href, priority, position, theme)
where not exists (select 1 from public.campaigns where evergreen and position in ('shop-primary', 'shop-secondary'));

update public.solar_kits k
set image_url = m.public_url, image_position = s.pos, image_alt = coalesce(k.image_alt, s.alt)
from (values
  ('3-6kva-complete-solar-kit', 'starter/hero/home-rooftop.jpg', '55% 35%', 'Family home with rooftop solar panels'),
  ('5kva-complete-solar-kit', 'starter/hero/homes-sunset.jpg', '50% 40%', 'Homes with rooftop solar at sunset'),
  ('10kva-complete-solar-kit', 'starter/sections/commercial-rooftop.jpg', null, 'Solar panels across a commercial rooftop'),
  ('15kva-complete-solar-kit', 'starter/sections/installer-panels.jpg', '50% 45%', 'Installer working on a solar panel')
) as s (slug, path, pos, alt)
join _media m on m.storage_path = s.path
where k.slug = s.slug and k.image_url is null;

-- These places now point at images through the database, so the media
-- library checks them directly; drop the hand-written labels for them.
update public.media_assets
set usage = array(
  select u from unnest(usage) u
  where u not in ('Homepage hero slideshow', 'Shop hero slide', 'Shop wide banner') and u not like 'Kit:%'
)
where usage && array['Homepage hero slideshow', 'Shop hero slide', 'Shop wide banner']
   or exists (select 1 from unnest(usage) u where u like 'Kit:%');
