-- Delivery policy page (key 'delivery'). Widens the key check only.
-- Down: 20261117020000_delivery_policy.down.sql
alter table public.page_content drop constraint if exists page_content_key_check;
alter table public.page_content add constraint page_content_key_check
  check (key in ('about', 'faqs', 'testimonials', 'projects', 'warranty', 'terms', 'privacy', 'returns', 'delivery', 'calculator'));
