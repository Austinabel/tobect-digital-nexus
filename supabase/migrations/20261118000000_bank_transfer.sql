-- Orders can be paid by bank transfer (to the account in Site settings) while
-- online payment isn't available. Widens the payment-method check only.
-- Down: 20261118000000_bank_transfer.down.sql
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('paystack', 'pay-on-confirmation', 'bank-transfer'));
