import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID, scryptSync, timingSafeEqual } from 'crypto'

type CompletedWithdrawal = {
  withdrawal_id: string
  withdrawal_amount: number
  withdrawal_currency: string
  withdrawal_status: string
  withdrawal_created_at: string
  total_value: number
  available_balance: number
}

const config = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, service: process.env.SUPABASE_SERVICE_ROLE_KEY! })
const hash = (pin: string) => { const salt = randomUUID(); return `${salt}:${scryptSync(pin, salt, 64).toString('hex')}` }
const matches = (pin: string, stored: string) => { const [salt, value] = stored.split(':'); return timingSafeEqual(Buffer.from(value, 'hex'), scryptSync(pin, salt, 64)) }
async function userClient(request: NextRequest) { const c = config(), token = request.headers.get('authorization')?.replace('Bearer ', ''); if (!token) return null; const pub = createClient(c.url, c.key); const { data: { user } } = await pub.auth.getUser(token); return user ? { user, db: createClient(c.url, c.service) } : null }

export async function POST(request: NextRequest) {
  const access = await userClient(request); if (!access) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const body = await request.json(); const { db, user } = access
  if (body.action === 'start') {
    const iban = String(body.iban || '').replace(/\s/g, ''); if (!/^PL\d{26}$/.test(iban) || !(Number(body.amount) > 0)) return NextResponse.json({ error: 'Enter a valid amount and Polish IBAN.' }, { status: 400 })
    const { data: credentials } = await db.from('withdrawal_pin_credentials').select('withdrawal_hold_at, used_at').eq('user_id', user.id).maybeSingle()
    if (!credentials) return NextResponse.json({ error: 'Withdrawal PINs have not been issued by your adviser.' }, { status: 403 })
    if (credentials.withdrawal_hold_at) return NextResponse.json({ error: 'Withdrawals are on hold. Contact Smartwave support.' }, { status: 423 })
    if (credentials.used_at) return NextResponse.json({ error: 'A new withdrawal PIN set must be issued by your adviser before you can make another request.' }, { status: 403 })
    const { data, error } = await db.from('withdrawal_verification_sessions').insert({ user_id: user.id, amount: body.amount, destination_bank: body.bank, destination_iban_last4: iban.slice(-4) }).select('id, stage').single()
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
  }
  const { data: session } = await db.from('withdrawal_verification_sessions').select('*').eq('id', body.sessionId).eq('user_id', user.id).gt('expires_at', new Date().toISOString()).maybeSingle()
  if (!session || session.stage !== body.stage) return NextResponse.json({ error: 'This withdrawal verification session is invalid or expired.' }, { status: 400 })
  const { data: pins } = await db.from('withdrawal_pin_credentials').select('*').eq('user_id', user.id).single()
  if (!pins || pins.withdrawal_hold_at) return NextResponse.json({ error: 'Withdrawals are on hold. Contact Smartwave support.' }, { status: 423 })
  if (pins.used_at) return NextResponse.json({ error: 'This PIN set has already been used. Ask your adviser to issue a new set.' }, { status: 403 })
  if (body.stage !== 'insurance' && body.stage !== 'tax') return NextResponse.json({ error: 'This withdrawal verification session is invalid or expired.' }, { status: 400 })
  const column = body.stage === 'insurance' ? 'insurance' : 'tax'; const valid = matches(String(body.pin || ''), pins[`${column}_hash`])
  if (!valid) { const attempts = Number(pins[`${column}_attempts`]) + 1; const update: Record<string, unknown> = { [`${column}_attempts`]: attempts, updated_at: new Date().toISOString() }; if (attempts >= 3) update.withdrawal_hold_at = new Date().toISOString(); await db.from('withdrawal_pin_credentials').update(update).eq('user_id', user.id); return NextResponse.json({ error: attempts >= 3 ? 'Three failed attempts. Withdrawals are now on hold.' : `Incorrect PIN. ${3 - attempts} attempt(s) remaining.` }, { status: attempts >= 3 ? 423 : 400 }) }
  const next = body.stage === 'insurance' ? 'tax' : 'complete'; await db.from('withdrawal_verification_sessions').update({ stage: next }).eq('id', session.id)
  if (next === 'complete') {
    const { data: result, error } = await db.rpc('create_withdrawal_and_debit', {
      p_user_id: user.id,
      p_amount: session.amount,
      p_destination_bank: session.destination_bank,
      p_destination_iban_last4: session.destination_iban_last4,
    }).single()
    if (error || !result) return NextResponse.json({ error: error?.message || 'Your PIN was verified, but we could not record the withdrawal request. Please contact Smartwave support.' }, { status: 400 })
    const completed = result as CompletedWithdrawal
    const { error: consumeError } = await db.from('withdrawal_pin_credentials').update({ used_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', user.id).is('used_at', null)
    if (consumeError) return NextResponse.json({ error: 'Your request was recorded, but the PIN set could not be secured. Contact Smartwave support before making another request.' }, { status: 500 })
    return NextResponse.json({ stage: next, withdrawal: { id: completed.withdrawal_id, amount: completed.withdrawal_amount, currency: completed.withdrawal_currency, status: completed.withdrawal_status, created_at: completed.withdrawal_created_at }, account: { total_value: completed.total_value, available_balance: completed.available_balance } })
  }
  return NextResponse.json({ stage: next })
}
