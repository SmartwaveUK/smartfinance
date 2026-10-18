-- Run once in the Supabase SQL Editor.
-- Changes withdrawals to Insurance PIN → Tax Code → pending review.

alter table public.withdrawal_verification_sessions
  drop constraint if exists withdrawal_verification_sessions_stage_check;

update public.withdrawal_verification_sessions
set stage = 'tax'
where stage = 'activation';

alter table public.withdrawal_verification_sessions
  alter column stage set default 'insurance';

alter table public.withdrawal_verification_sessions
  add constraint withdrawal_verification_sessions_stage_check
  check (stage in ('insurance', 'tax', 'complete'));

alter table public.withdrawal_pin_credentials
  drop column if exists activation_hash,
  drop column if exists activation_attempts;

notify pgrst, 'reload schema';
