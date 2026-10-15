-- Run once in the Supabase SQL Editor for existing projects.
-- Makes each issued Insurance PIN + Tax Code + Activation PIN set single-use.
alter table public.withdrawal_pin_credentials
  add column if not exists used_at timestamptz;
