alter table public.campaigns drop constraint if exists campaigns_created_by_fkey,
  add constraint campaigns_created_by_fkey foreign key (created_by) references auth.users (id);
alter table public.campaigns drop constraint if exists campaigns_updated_by_fkey,
  add constraint campaigns_updated_by_fkey foreign key (updated_by) references auth.users (id);
alter table public.solar_kits drop constraint if exists solar_kits_updated_by_fkey,
  add constraint solar_kits_updated_by_fkey foreign key (updated_by) references auth.users (id);
alter table public.hero_slides drop constraint if exists hero_slides_updated_by_fkey,
  add constraint hero_slides_updated_by_fkey foreign key (updated_by) references auth.users (id);
alter table public.quote_requests drop constraint if exists quote_requests_assigned_to_fkey,
  add constraint quote_requests_assigned_to_fkey foreign key (assigned_to) references auth.users (id);
alter table public.quote_responses drop constraint if exists quote_responses_author_fkey,
  add constraint quote_responses_author_fkey foreign key (author) references auth.users (id);
