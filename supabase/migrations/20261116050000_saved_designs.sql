-- Saved solar-calculator designs, per customer account.
-- The design itself is the calculator's share code (the same string as a
-- share link), so a saved design reopens exactly as it was saved.
-- Additive. Down: 20261116050000_saved_designs.down.sql

create table if not exists public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  share_code text not null check (char_length(share_code) between 1 and 8000),
  -- small summary for the list view: inverter kVA, battery kWh, panels…
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists saved_designs_customer_idx on public.saved_designs (customer_id, created_at desc);

alter table public.saved_designs enable row level security;
revoke all on public.saved_designs from anon;

drop policy if exists saved_designs_own_select on public.saved_designs;
create policy saved_designs_own_select on public.saved_designs for select using (customer_id = auth.uid());
drop policy if exists saved_designs_own_insert on public.saved_designs;
create policy saved_designs_own_insert on public.saved_designs for insert with check (customer_id = auth.uid());
drop policy if exists saved_designs_own_delete on public.saved_designs;
create policy saved_designs_own_delete on public.saved_designs for delete using (customer_id = auth.uid());
