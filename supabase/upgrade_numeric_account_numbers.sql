-- Run once in the Supabase SQL Editor.
-- Replaces legacy prefixed account numbers and ensures all future values are 16 digits.

update public.investment_accounts
set account_number = substr(translate(replace(gen_random_uuid()::text, '-', ''), 'abcdef', '012345'), 1, 16)
where account_number !~ '^[0-9]{16}$';

alter table public.investment_accounts
  alter column account_number set default (substr(translate(replace(gen_random_uuid()::text, '-', ''), 'abcdef', '012345'), 1, 16));

alter table public.investment_accounts
  drop constraint if exists investment_accounts_account_number_digits_check;

alter table public.investment_accounts
  add constraint investment_accounts_account_number_digits_check
  check (account_number ~ '^[0-9]{16}$');

notify pgrst, 'reload schema';
