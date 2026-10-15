-- Run once in Supabase SQL Editor. PIN values are never stored in plaintext.
create table if not exists public.withdrawal_pin_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tax_hash text not null,
  activation_hash text not null,
  insurance_hash text not null,
  tax_attempts smallint not null default 0 check (tax_attempts between 0 and 3),
  activation_attempts smallint not null default 0 check (activation_attempts between 0 and 3),
  insurance_attempts smallint not null default 0 check (insurance_attempts between 0 and 3),
  withdrawal_hold_at timestamptz,
  used_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.withdrawal_verification_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  destination_bank text not null,
  destination_iban_last4 char(4) not null check (destination_iban_last4 ~ '^[0-9]{4}$'),
  stage text not null default 'insurance' check (stage in ('insurance','tax','activation','complete')),
  expires_at timestamptz not null default now() + interval '15 minutes',
  created_at timestamptz not null default now()
);
alter table public.withdrawal_pin_credentials enable row level security;
alter table public.withdrawal_verification_sessions enable row level security;
revoke all on public.withdrawal_pin_credentials, public.withdrawal_verification_sessions from anon, authenticated;
