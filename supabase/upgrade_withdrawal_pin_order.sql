-- Run once in Supabase SQL Editor for an existing Smartwave database.
-- Renames the final Transfer PIN to Insurance PIN and changes the verification order.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'withdrawal_pin_credentials' and column_name = 'transfer_hash') then
    alter table public.withdrawal_pin_credentials rename column transfer_hash to insurance_hash;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'withdrawal_pin_credentials' and column_name = 'transfer_attempts') then
    alter table public.withdrawal_pin_credentials rename column transfer_attempts to insurance_attempts;
  end if;
end $$;

alter table public.withdrawal_verification_sessions
  drop constraint if exists withdrawal_verification_sessions_stage_check;
update public.withdrawal_verification_sessions set stage = 'insurance' where stage = 'transfer';
alter table public.withdrawal_verification_sessions alter column stage set default 'insurance';
alter table public.withdrawal_verification_sessions
  add constraint withdrawal_verification_sessions_stage_check
  check (stage in ('insurance', 'tax', 'complete'));

-- Refresh the Data API schema cache after renaming columns.
notify pgrst, 'reload schema';
