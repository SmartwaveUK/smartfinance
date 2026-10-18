import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, randomInt, scryptSync } from 'crypto'

const digest = (pin: string) => { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(pin, salt, 64).toString('hex')}` }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const token = request.headers.get('authorization')?.replace('Bearer ', ''); if (!token || !service) return NextResponse.json({ error: 'Admin service is unavailable.' }, { status: 503 })
  const verifier = createClient(url, key); const { data: { user } } = await verifier.auth.getUser(token)
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 })
  const pin = () => String(randomInt(100000, 1000000)); const insurance = pin(), tax = pin(); const { id } = await params
  const db = createClient(url, service); const { error } = await db.from('withdrawal_pin_credentials').upsert({ user_id: id, insurance_hash: digest(insurance), tax_hash: digest(tax), insurance_attempts: 0, tax_attempts: 0, withdrawal_hold_at: null, used_at: null, updated_at: new Date().toISOString() })
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ insurance, tax })
}
