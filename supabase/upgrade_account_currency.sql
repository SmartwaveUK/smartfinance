-- Run once in the Supabase SQL Editor for an existing Smartwave database.
-- Currency is an account denomination. This does not convert stored balances.
alter table public.investment_accounts
  add column if not exists currency char(3) not null default 'PLN';

alter table public.investment_accounts
  drop constraint if exists investment_accounts_currency_check;
alter table public.investment_accounts
  add constraint investment_accounts_currency_check
  check (currency in ('PLN', 'EUR', 'USD', 'GBP'));

alter table public.withdrawal_requests
  drop constraint if exists withdrawal_requests_currency_check;
alter table public.withdrawal_requests
  add constraint withdrawal_requests_currency_check
  check (currency in ('PLN', 'EUR', 'USD', 'GBP'));
