import { createBrowserClient } from '@supabase/ssr'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return url && key ? createBrowserClient(url, key) : null
}

export async function signIn(email: string, password: string): Promise<{ error?: string; destination?: '/dashboard' | '/admin'; demo?: true }> {
  const supabase = getClient()
  if (!supabase) return { demo: true, destination: '/dashboard' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'Your session could not be verified. Please try again.' }
  return { destination: user.app_metadata?.role === 'admin' ? '/admin' : '/dashboard' }
}

export async function signOut(): Promise<void> {
  const supabase = getClient()
  if (supabase) await supabase.auth.signOut()
}

export async function submitWithdrawal(amount: number, bank: string, iban: string): Promise<string | null> {
  const supabase = getClient()
  if (!supabase) return null
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return 'Your session has expired. Please sign in again.'
  const digits = iban.replace(/\s/g, '')
  if (!/^PL\d{26}$/.test(digits)) return 'Enter a valid Polish IBAN.'
  const { error } = await supabase.from('withdrawal_requests').insert({
    user_id: user.id,
    amount,
    destination_bank: bank,
    destination_iban_last4: digits.slice(-4),
  })
  return error?.message ?? null
}

export async function withdrawalAction(payload: Record<string, unknown>): Promise<{ error?: string; stage?: string; id?: string; withdrawal?: { id: string; amount: number; currency: string; status: string; created_at: string } }> {
  const supabase = getClient()
  if (!supabase) return { error: 'Supabase is not configured.' }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Your session has expired. Please sign in again.' }
  const response = await fetch('/api/withdrawals', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) })
  return response.json()
}
