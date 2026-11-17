-- Calculator appliance list is stored as page content (key 'calculator').
-- Widens the key check only. Down: 20261117010000_calculator_content.down.sql
alter table public.page_content drop constraint if exists page_content_key_check;
alter table public.page_content add constraint page_content_key_check
  check (key in ('about', 'faqs', 'testimonials', 'projects', 'warranty', 'terms', 'privacy', 'returns', 'calculator'));
