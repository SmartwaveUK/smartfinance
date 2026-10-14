'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Dashboard from '../ui/dashboard'
import { signOut } from '../utils/auth'
import './client-summary.css'

type ClientDetails = { name: string; address: string[]; accountNumber: string }

function ClientSummary() {
  const [details, setDetails] = useState<ClientDetails | null>(null)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) return
    const supabase = createBrowserClient(url, key)
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: profile }, { data: account }] = await Promise.all([
        supabase.from('profiles').select('full_name, address_line_1, address_line_2, city, postal_code, country').eq('id', user.id).maybeSingle(),
        supabase.from('investment_accounts').select('account_number').eq('user_id', user.id).limit(1).maybeSingle(),
      ])
      if (!profile || !account) return
      setDetails({ name: profile.full_name, address: [profile.address_line_1, profile.address_line_2, [profile.postal_code, profile.city].filter(Boolean).join(' '), profile.country].filter(Boolean), accountNumber: account.account_number })
    })()
  }, [])
  if (!details) return null
  return <section className="client-summary"><div><p>REGISTERED CLIENT</p><b>{details.name}</b><span>{details.address.map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</span></div><div><p>SMARTWAVE ACCOUNT NUMBER</p><b>{details.accountNumber}</b><span>Your unique reference for Smartwave servicing.</span></div></section>
}

export default function DashboardPage() {
  const router = useRouter()
  return <><Dashboard onSignOut={async () => { await signOut(); router.replace('/') }} /><ClientSummary /></>
}
