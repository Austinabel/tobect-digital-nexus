-- Fails (safely) while any order still uses 'bank-transfer' — change those orders first.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('paystack', 'pay-on-confirmation'));
