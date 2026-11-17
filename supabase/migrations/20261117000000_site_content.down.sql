-- Reverts 20261117000000_site_content.sql. Saved settings and page edits are lost
-- (the site falls back to the content in the code).
drop table if exists public.page_content;
drop table if exists public.site_settings;
