-- Run once in the Supabase SQL Editor.
-- Creates the withdrawal record and debits the account in one transaction.

create or replace function public.create_withdrawal_and_debit(
  p_user_id uuid,
  p_amount numeric,
  p_destination_bank text,
  p_destination_iban_last4 char(4)
)
returns table (
  withdrawal_id uuid,
  withdrawal_amount numeric,
  withdrawal_currency char(3),
  withdrawal_status public.withdrawal_status,
  withdrawal_created_at timestamptz,
  total_value numeric,
  available_balance numeric
)
language plpgsql
set search_path = ''
as $$
declare
  account public.investment_accounts%rowtype;
  new_total_value numeric;
  new_available_balance numeric;
begin
  if p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero.';
  end if;

  select * into account
  from public.investment_accounts
  where user_id = p_user_id
  order by created_at asc
  limit 1
  for update;

  if not found then
    raise exception 'No investment account was found for this withdrawal.';
  end if;

  if account.available_balance < p_amount or account.total_value < p_amount then
    raise exception 'The requested amount exceeds your available balance.';
  end if;

  update public.investment_accounts as investment_account
  set available_balance = investment_account.available_balance - p_amount,
      total_value = investment_account.total_value - p_amount
  where investment_account.id = account.id
  returning investment_account.total_value, investment_account.available_balance
  into new_total_value, new_available_balance;

  return query
  with request as (
    insert into public.withdrawal_requests (
      user_id,
      investment_account_id,
      amount,
      currency,
      destination_bank,
      destination_iban_last4
    )
    values (
      p_user_id,
      account.id,
      p_amount,
      account.currency,
      p_destination_bank,
      p_destination_iban_last4
    )
    returning id, amount, currency, status, created_at
  )
  select request.id, request.amount, request.currency, request.status, request.created_at,
    new_total_value, new_available_balance
  from request;
end;
$$;

revoke all on function public.create_withdrawal_and_debit(uuid, numeric, text, char) from public, anon, authenticated;
grant execute on function public.create_withdrawal_and_debit(uuid, numeric, text, char) to service_role;

notify pgrst, 'reload schema';
