-- Orders & quotes admin: order timeline, stock commit/release on
-- confirm/cancel, quote references.
-- Additive. Down: 20261116080000_orders_quotes_admin.down.sql

-- ---------- order timeline (status changes, payments, staff notes) ----------
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  kind text not null check (kind in ('status', 'payment', 'note', 'stock')),
  from_value text,
  to_value text,
  message text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;
revoke all on public.order_events from anon;
drop policy if exists order_events_staff_read on public.order_events;
create policy order_events_staff_read on public.order_events for select using (public.has_permission('orders.view'));

-- ---------- stock: confirm deducts, cancel/return puts back ----------
-- Checkout places 'held' reservations (2 h) for tracked products. Confirming
-- the order deducts the stock for real ('committed'); cancelling releases
-- held rows or returns committed stock. Server-only (secret key).
create or replace function public.commit_order_stock(p_order_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  on_hand int;
  n int := 0;
begin
  for r in select id, product_slug, quantity from stock_reservations where order_ref = p_order_ref and status = 'held' order by product_slug for update loop
    select stock_quantity into on_hand from products where slug = r.product_slug for update;
    if on_hand is not null then
      if on_hand < r.quantity then
        raise exception 'insufficient_stock:%', r.product_slug using errcode = 'P0001';
      end if;
      update products set stock_quantity = stock_quantity - r.quantity, updated_at = now() where slug = r.product_slug;
    end if;
    update stock_reservations set status = 'committed' where id = r.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

create or replace function public.release_order_stock(p_order_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare
  r record;
  n int := 0;
begin
  for r in select id, product_slug, quantity, status from stock_reservations where order_ref = p_order_ref and status in ('held', 'committed') for update loop
    if r.status = 'committed' then
      update products set stock_quantity = stock_quantity + r.quantity, updated_at = now() where slug = r.product_slug and stock_quantity is not null;
    end if;
    update stock_reservations set status = 'released' where id = r.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke execute on function public.commit_order_stock(text) from public, anon, authenticated;
revoke execute on function public.release_order_stock(text) from public, anon, authenticated;

-- ---------- quotes: human-friendly reference ----------
create sequence if not exists public.quote_reference_seq start 1001;
alter table public.quote_requests add column if not exists reference text unique default ('QR-' || nextval('public.quote_reference_seq'));
-- free-text services / message for standard quote requests
alter table public.quote_requests add column if not exists services text[] not null default '{}';
