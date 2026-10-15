import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type ClientPayload = { name: string; email?: string; password?: string; tier: string; portfolio: number; available: number; equity: number; fixed: number; alternative: number; currency?: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string; accountId?: string; userId?: string }
const currencies = ['PLN', 'EUR', 'USD', 'GBP'] as const
const validCurrency = (value: unknown): value is typeof currencies[number] => typeof value === 'string' && currencies.includes(value as typeof currencies[number])

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !publishableKey || !serviceKey) return null
  return { url, publishableKey, serviceKey }
}

async function adminClient(request: NextRequest) {
  const settings = config()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!settings || !token) return { error: 'Admin service is not configured.', status: 503 as const }
  const verifier = createClient(settings.url, settings.publishableKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: { user }, error } = await verifier.auth.getUser(token)
  if (error || !user || user.app_metadata?.role !== 'admin') return { error: 'Administrator access is required.', status: 403 as const }
  return { client: createClient(settings.url, settings.serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }) }
}

export async function GET(request: NextRequest) {
  const result = await adminClient(request)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  const [{ data: profiles, error: profilesError }, { data: accounts, error: accountsError }, { data: users, error: usersError }] = await Promise.all([
    result.client.from('profiles').select('id, full_name, address_line_1, address_line_2, city, postal_code, country'),
    result.client.from('investment_accounts').select('id, user_id, account_name, account_number, currency, available_balance, total_value'),
    result.client.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  if (profilesError || accountsError || usersError) return NextResponse.json({ error: profilesError?.message || accountsError?.message || usersError?.message }, { status: 400 })
  const emailById = new Map(users.users.map((user) => [user.id, user.email]))
  return NextResponse.json({ clients: profiles.map((profile) => {
    const account = accounts.find((entry) => entry.user_id === profile.id)
    return { id: profile.id, accountId: account?.id, accountNumber: account?.account_number ?? '', name: profile.full_name, email: emailById.get(profile.id) ?? '', addressLine1: profile.address_line_1 ?? '', addressLine2: profile.address_line_2 ?? '', city: profile.city ?? '', postalCode: profile.postal_code ?? '', country: profile.country ?? 'Poland', tier: 'Investor', currency: account?.currency ?? 'PLN', portfolio: account?.total_value ?? 0, available: account?.available_balance ?? 0, equity: 60, fixed: 25, alternative: 15 }
  }) })
}

export async function POST(request: NextRequest) {
  const result = await adminClient(request)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  const body = await request.json() as ClientPayload
  if (!body.name || !body.email || !body.password || body.portfolio < 0 || (body.currency && !validCurrency(body.currency))) return NextResponse.json({ error: 'Enter a name, email, temporary password, valid portfolio value, and supported currency.' }, { status: 400 })
  const { data: created, error: createError } = await result.client.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true })
  if (createError || !created.user) return NextResponse.json({ error: createError?.message ?? 'Could not create account.' }, { status: 400 })
  const { error: profileError } = await result.client.from('profiles').insert({ id: created.user.id, full_name: body.name, address_line_1: body.addressLine1, address_line_2: body.addressLine2 || null, city: body.city, postal_code: body.postalCode, country: body.country || 'Poland' })
  const currency = body.currency ?? 'PLN'
  const { data: account, error: accountError } = await result.client.from('investment_accounts').insert({ user_id: created.user.id, account_name: 'Smartwave Investment Account', currency, total_value: body.portfolio, available_balance: body.available ?? body.portfolio }).select('id, account_number, currency').single()
  if (profileError || accountError) return NextResponse.json({ error: profileError?.message || accountError?.message }, { status: 400 })
  return NextResponse.json({ client: { id: created.user.id, accountId: account.id, accountNumber: account.account_number, name: body.name, email: body.email, addressLine1: body.addressLine1 ?? '', addressLine2: body.addressLine2 ?? '', city: body.city ?? '', postalCode: body.postalCode ?? '', country: body.country ?? 'Poland', tier: body.tier, currency: account.currency, portfolio: body.portfolio, available: body.available ?? body.portfolio, equity: body.equity, fixed: body.fixed, alternative: body.alternative } })
}

export async function PATCH(request: NextRequest) {
  const result = await adminClient(request)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  const body = await request.json() as ClientPayload
  if (!body.userId || !body.accountId || !body.name || body.portfolio < 0 || body.available < 0 || !validCurrency(body.currency)) return NextResponse.json({ error: 'Missing account details or unsupported currency.' }, { status: 400 })
  const [{ error: profileError }, { error: accountError }] = await Promise.all([
    result.client.from('profiles').update({ full_name: body.name, address_line_1: body.addressLine1, address_line_2: body.addressLine2 || null, city: body.city, postal_code: body.postalCode, country: body.country || 'Poland' }).eq('id', body.userId),
    result.client.from('investment_accounts').update({ total_value: body.portfolio, available_balance: body.available, currency: body.currency }).eq('id', body.accountId).eq('user_id', body.userId),
  ])
  if (profileError || accountError) return NextResponse.json({ error: profileError?.message || accountError?.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
