-- Initial data, copied from the site's original TypeScript catalogue
-- (src/lib/data/*.ts). Insert-only: `on conflict do nothing`, so re-running
-- never overwrites changes made later in the admin dashboard.
--
-- NOTE: the products and kit contents are the same PLACEHOLDER catalogue
-- the site launched with (indicative prices). Replace them with verified
-- products through the admin dashboard.

insert into public.categories (slug, name, glyph, sort_order) values
  ('solar-panels', 'Solar Panels', 'panel', 1),
  ('inverters', 'Inverters', 'inverter', 2),
  ('lithium-batteries', 'Lithium Batteries', 'battery', 3),
  ('solar-generators', 'Solar Generators', 'generator', 4),
  ('cctv-security', 'CCTV & Security', 'camera', 5),
  ('solar-lights', 'Solar Lights', 'light', 6),
  ('solar-fans', 'Solar Fans', 'fan', 7),
  ('solar-freezers', 'Solar Freezers', 'freezer', 8),
  ('solar-pumps', 'Solar Pumps', 'pump', 9)
on conflict (slug) do nothing;

insert into public.products (slug, name, brand, category_slug, price_ngn, specs, attributes, featured, published) values
  ('deye-10kva-hybrid-inverter', 'Deye 10kVA Hybrid Inverter', 'Deye', 'inverters', 985000, '{"10 kVA","Hybrid"}', '{"capacity":"10 kVA","inverterType":"Hybrid"}', true, true),
  ('beve-15kwh-lithium-battery', 'BEVE 15kWh Lithium Battery', 'BEVE', 'lithium-batteries', 2280000, '{"15 kWh","Lithium"}', '{"capacity":"15 kWh","chemistry":"Lithium"}', true, true),
  ('jinko-550w-solar-panel', 'Jinko 550W Solar Panel', 'Jinko Solar', 'solar-panels', 142000, '{"550 W"}', '{"wattage":"550 W"}', true, true),
  ('cola-solar-3600w-generator', 'Cola Solar 3600W Generator', 'Cola Solar', 'solar-generators', 1450000, '{"3600 W"}', '{"output":"3600 W"}', true, true),
  ('cctv-4-lens-camera-kit', 'CCTV 4-Lens Camera', null, 'cctv-security', 95000, '{"4 lenses"}', '{}', true, true),
  ('solar-street-light-200w', 'Solar Street Light 200W', null, 'solar-lights', 75000, '{"200 W"}', '{"wattage":"200 W"}', true, true)
on conflict (slug) do nothing;

-- ---------- kits ----------
insert into public.solar_kits (slug, name, capacity_label, tag, summary, applications, outline, purchasable, installation_note, published, sort_order) values
  ('3-6kva-complete-solar-kit', '3.6KVA Complete Solar Kit', '3.6KVA', 'Home Kit',
   'An entry-level home system for lighting, fans, TV and small appliances.',
   '{"Apartments and small homes","Small shops"}',
   '{"3.6kVA hybrid inverter","Lithium battery","Solar panels","Cables, breakers & accessories"}', false, null, true, 1),
  ('5kva-complete-solar-kit', '5KVA Complete Solar Kit', '5KVA', 'Home Kit',
   'A whole-home system for family homes with fridges, freezers and pumping.',
   '{"Family homes","Small offices"}',
   '{"5kVA hybrid inverter","Lithium battery","Solar panels","Full installation accessories"}', false, null, true, 2),
  ('10kva-complete-solar-kit', '10KVA Complete Solar Kit', '10KVA', 'Business Kit',
   'A high-capacity hybrid system for large homes, offices and businesses.',
   '{"Large homes","Offices","Shops and small businesses"}', '{}', true,
   'Our engineers survey the site, confirm cable sizes and protection, install, commission and show you how to monitor the system.', true, 3),
  ('15kva-complete-solar-kit', '15KVA Complete Solar Kit', '15KVA', 'Commercial Kit',
   'A commercial-scale system for businesses, schools, clinics and estates.',
   '{"Businesses","Schools and clinics","Estates"}',
   '{"15kVA hybrid inverter","Lithium battery bank","Solar panels","Full installation & commissioning"}', false, null, true, 4)
on conflict (slug) do nothing;

-- CONFIRM with Tobecat engineers: component choices and quantity ranges.
insert into public.kit_slots (kit_slug, key, label, role, qty_default, qty_min, qty_max, sort_order) values
  ('10kva-complete-solar-kit', 'inverter', 'Hybrid inverter', 'inverter', 1, 1, 1, 1),
  ('10kva-complete-solar-kit', 'battery', 'Lithium battery', 'battery', 1, 1, 2, 2),
  ('10kva-complete-solar-kit', 'panels', 'Solar panels', 'panel', 12, 8, 16, 3)
on conflict do nothing;

insert into public.kit_slot_choices (kit_slug, slot_key, product_slug, sort_order) values
  ('10kva-complete-solar-kit', 'inverter', 'deye-10kva-hybrid-inverter', 0),
  ('10kva-complete-solar-kit', 'battery', 'beve-15kwh-lithium-battery', 0),
  ('10kva-complete-solar-kit', 'panels', 'jinko-550w-solar-panel', 0)
on conflict do nothing;

insert into public.kit_accessories (kit_slug, name, sort_order)
select k.slug, a.name, a.ord
from public.solar_kits k
cross join (values ('DC cables', 1), ('AC cables', 2), ('DC breakers', 3), ('AC breakers', 4), ('Surge protection', 5), ('Panel mounting accessories', 6)) as a(name, ord)
on conflict do nothing;

insert into public.kit_addons (kit_slug, key, label, description)
select slug, 'installation', 'Professional installation & commissioning',
       'Quoted after a site survey — it depends on your location, roof and cable runs.'
from public.solar_kits
on conflict do nothing;

-- ---------- campaigns ----------
-- Example from the shop brief — INACTIVE until Tobecat confirms the offer and dates.
insert into public.campaigns (title, kicker, description, discount_label, cta_text, cta_href, image_alt, active, priority, position, theme)
select 'Cola Solar 3600W Solar Generator', 'Limited Offer',
       E'+ 3 pcs 650W Jinko Solar Panels\n+ FREE Itel 20,000mAh Power Bank', 'FREE Power Bank',
       'Shop the Promo', '/product/cola-solar-3600w-generator',
       'Cola Solar 3600W solar generator with Jinko solar panels', false, 10, 'shop-primary', 'navy'
where not exists (select 1 from public.campaigns where title = 'Cola Solar 3600W Solar Generator');

-- ---------- starter banners, homepage slides and kit photos ----------
-- Point at the starter photos in the media library, so run this AFTER
-- `npm run media:migrate` on a fresh install. Each insert only runs while
-- its table has none of these rows, so re-running never duplicates them.
insert into public.hero_slides (image_url, alt, image_position, credit_name, credit_url, sort_order, is_sample)
select m.public_url, s.alt, s.pos, s.credit, s.credit_url, s.ord, true
from (values
  ('starter/hero/solar-farm.jpg', 'Solar farm stretching across a landscape in golden evening light', '65% 50%', 'Vlad Burac', 'https://unsplash.com/photos/CVjxkBW22fU', 1),
  ('starter/hero/home-rooftop.jpg', 'Solar panels installed on the roof of a family home', '60% 40%', 'Watt A Lot', 'https://unsplash.com/photos/gqpuuF3a2tY', 2),
  ('starter/hero/tracker-array.jpg', 'Rows of solar panels on tracking mounts under a bright blue sky', '50% 70%', 'American Public Power Association', 'https://unsplash.com/photos/XGAZzyLzn18', 3),
  ('starter/hero/homes-sunset.jpg', 'Homes with rooftop solar panels at sunset', '60% 80%', 'Vivint Solar', 'https://unsplash.com/photos/_ciUqT1HEuY', 4),
  ('starter/hero/utility-install.jpg', 'Aerial view of a large solar installation with an installer walking between panel rows', null, 'Priamo Mendez', 'https://unsplash.com/photos/E4XEBPEkgUs', 5)
) as s (path, alt, pos, credit, credit_url, ord)
join public.media_assets m on m.deleted_at is null and m.storage_path = s.path
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
join public.media_assets m on m.deleted_at is null and m.storage_path = c.path
where not exists (select 1 from public.campaigns where evergreen and position in ('shop-hero', 'shop-wide'));

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
join public.media_assets m on m.deleted_at is null and m.storage_path = s.path
where k.slug = s.slug and k.image_url is null;
