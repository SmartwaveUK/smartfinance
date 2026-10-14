-- Run this file ONLY for an existing Smartwave database.
-- It adds client address fields and generated account numbers without touching tables or RLS policies.

alter table public.profiles add column if not exists address_line_1 text;
alter table public.profiles add column if not exists address_line_2 text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists country text not null default 'Poland';

alter table public.investment_accounts add column if not exists account_number text;
update public.investment_accounts
set account_number = 'SW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
where account_number is null;
alter table public.investment_accounts
alter column account_number set default ('SW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)));
alter table public.investment_accounts alter column account_number set not null;
create unique index if not exists investment_accounts_account_number_key
on public.investment_accounts(account_number);
