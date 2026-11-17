delete from public.page_content where key = 'calculator';
alter table public.page_content drop constraint if exists page_content_key_check;
alter table public.page_content add constraint page_content_key_check
  check (key in ('about', 'faqs', 'testimonials', 'projects', 'warranty', 'terms', 'privacy', 'returns'));
