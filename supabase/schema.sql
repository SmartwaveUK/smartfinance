-- First-time setup only: run this in the Supabase SQL Editor before connecting the application.
-- For an existing database, run upgrade_account_details.sql instead; do not re-run this file.
-- All user-facing tables are protected with explicit grants and RLS policies.

create type public.withdrawal_status as enum ('pending_review', 'approved', 'rejected', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  address_line_1 text,
  address_line_2 text,
  city text,
  postal_code text,
  country text not null default 'Poland',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_name text not null,
  account_number text not null unique default (substr(translate(replace(gen_random_uuid()::text, '-', ''), 'abcdef', '012345'), 1, 16)) check (account_number ~ '^[0-9]{16}$'),
  currency char(3) not null default 'PLN' check (currency in ('PLN', 'EUR', 'USD', 'GBP')),
  available_balance numeric(14,2) not null default 0 check (available_balance >= 0),
  total_value numeric(14,2) not null default 0 check (total_value >= 0),
  created_at timestamptz not null default now()
);

create table public.investment_holdings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.investment_accounts(id) on delete cascade,
  asset_name text not null,
  allocation_percent numeric(5,2) not null check (allocation_percent >= 0 and allocation_percent <= 100),
  market_value numeric(14,2) not null check (market_value >= 0),
  created_at timestamptz not null default now()
);

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  investment_account_id uuid references public.investment_accounts(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  currency char(3) not null default 'PLN' check (currency in ('PLN', 'EUR', 'USD', 'GBP')),
  destination_bank text not null,
  destination_iban_last4 char(4) not null check (destination_iban_last4 ~ '^[0-9]{4}$'),
  status public.withdrawal_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reference text unique
);

create index investment_accounts_user_id_idx on public.investment_accounts(user_id);
create index withdrawal_requests_user_id_created_at_idx on public.withdrawal_requests(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.investment_accounts enable row level security;
alter table public.investment_holdings enable row level security;
alter table public.withdrawal_requests enable row level security;

revoke all on public.profiles, public.investment_accounts, public.investment_holdings, public.withdrawal_requests from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.investment_accounts, public.investment_holdings to authenticated;
grant select, insert on public.withdrawal_requests to authenticated;

create policy "Users read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users read their own investment accounts" on public.investment_accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users read their own holdings" on public.investment_holdings for select to authenticated using (exists (select 1 from public.investment_accounts a where a.id = account_id and a.user_id = (select auth.uid())));
create policy "Users read their own withdrawals" on public.withdrawal_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users submit their own withdrawals" on public.withdrawal_requests for insert to authenticated with check ((select auth.uid()) = user_id and status = 'pending_review');

-- Create profiles and investment accounts with a trusted, server-side admin process.
-- Do not insert balances or approve withdrawals from the browser.

-- Safe upgrades for projects where the first version of this schema was already applied.
alter table public.profiles add column if not exists address_line_1 text;
alter table public.profiles add column if not exists address_line_2 text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists country text not null default 'Poland';
alter table public.investment_accounts add column if not exists account_number text;
update public.investment_accounts set account_number = substr(translate(replace(gen_random_uuid()::text, '-', ''), 'abcdef', '012345'), 1, 16) where account_number is null;
alter table public.investment_accounts alter column account_number set default (substr(translate(replace(gen_random_uuid()::text, '-', ''), 'abcdef', '012345'), 1, 16));
alter table public.investment_accounts alter column account_number set not null;
create unique index if not exists investment_accounts_account_number_key on public.investment_accounts(account_number);
