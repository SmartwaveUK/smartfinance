'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { withdrawalAction } from '../utils/auth'
import './dashboard.css'
import './sidebar-static.css'
import './withdrawal-error.css'
import './withdrawal-loading.css'

const banks = ['PKO Bank Polski', 'mBank', 'Santander Bank Polska', 'ING Bank Śląski', 'Bank Pekao', 'Alior Bank']
const money = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)
const stages = ['details', 'tax', 'activation', 'transfer'] as const
type Stage = typeof stages[number] | 'complete'
type Account = { id: string; account_number: string; total_value: number; available_balance: number }
type Profile = { full_name: string; address_line_1?: string; city?: string }
type Withdrawal = { id: string; amount: number; status: string; created_at: string }

const stageCopy: Record<Stage, { title: string; eyebrow: string; action: string; hint: string }> = {
  details: { eyebrow: 'STEP 1 OF 4', title: 'Request a withdrawal.', action: 'Continue to Tax PIN →', hint: 'Enter the destination details for this transfer.' },
  tax: { eyebrow: 'STEP 2 OF 4', title: 'Confirm your Tax PIN.', action: 'Verify Tax PIN →', hint: 'Enter the Tax PIN issued by your Smartwave administrator.' },
  activation: { eyebrow: 'STEP 3 OF 4', title: 'Confirm your Activation PIN.', action: 'Verify Activation PIN →', hint: 'Enter your Activation PIN to continue.' },
  transfer: { eyebrow: 'STEP 4 OF 4', title: 'Confirm your Transfer PIN.', action: 'Submit withdrawal →', hint: 'Enter your Transfer PIN to submit this withdrawal for review.' },
  complete: { eyebrow: 'REQUEST SUBMITTED', title: 'Your withdrawal is in review.', action: 'Close', hint: 'Your request has been recorded and will be reviewed by Smartwave Finance.' },
}

export default function Dashboard({ onSignOut }: { onSignOut: () => void | Promise<void> }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState(banks[0])
  const [iban, setIban] = useState('')
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<Stage>('details')
  const [sessionId, setSessionId] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) { setLoading(false); return }
    const supabase = createBrowserClient(url, key)
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const [p, a, w] = await Promise.all([
        supabase.from('profiles').select('full_name, address_line_1, city').eq('id', user.id).maybeSingle(),
        supabase.from('investment_accounts').select('id, account_number, total_value, available_balance').eq('user_id', user.id).limit(1).maybeSingle(),
        supabase.from('withdrawal_requests').select('id, amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setProfile(p.data)
      setAccount(a.data)
      setWithdrawals(w.data ?? [])
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('withdrawal-submitting', submitting)
    return () => document.body.classList.remove('withdrawal-submitting')
  }, [submitting])

  const closeWithdrawal = () => {
    setModal(false); setMessage(''); setStage('details'); setAmount(''); setIban(''); setPin(''); setSessionId('')
  }

  const openWithdrawal = () => {
    setMessage(''); setStage('details'); setPin(''); setSessionId(''); setModal(true)
  }

  async function withdraw() {
    if (submitting || stage === 'complete') return
    if (stage === 'details') {
      if (!(Number(amount) > 0)) { setMessage('Enter a withdrawal amount greater than zero.'); return }
      if (Number(amount) > Number(account?.available_balance ?? 0)) { setMessage('The requested amount exceeds your available balance.'); return }
      if (!/^PL\d{26}$/.test(iban.replace(/\s/g, ''))) { setMessage('Enter a valid Polish IBAN.'); return }
    } else if (!/^\d{6}$/.test(pin)) {
      setMessage('Enter your six-digit PIN.')
      return
    }

    setSubmitting(true); setMessage('')
    try {
      const result = stage === 'details'
        ? await withdrawalAction({ action: 'start', amount: Number(amount), bank, iban })
        : await withdrawalAction({ sessionId, stage, pin })
      if (result.error) { setMessage(result.error); return }
      if (stage === 'details' && result.id && result.stage) {
        setSessionId(result.id); setStage(result.stage as Stage); setPin(''); return
      }
      if (result.stage === 'complete') {
        if (result.withdrawal) setWithdrawals((items) => [result.withdrawal!, ...items.filter((item) => item.id !== result.withdrawal!.id)].slice(0, 5))
        setStage('complete')
        return
      }
      setStage(result.stage as Stage); setPin('')
    } finally { setSubmitting(false) }
  }

  const current = stageCopy[stage]
  const name = profile?.full_name ?? 'Client'
  const first = name.split(' ')[0]
  const showPinStep = stage === 'tax' || stage === 'activation' || stage === 'transfer'
  const fieldError = (field: 'amount' | 'iban' | 'pin') => (field === 'amount' && message.toLowerCase().includes('amount')) || (field === 'iban' && message.includes('IBAN')) || (field === 'pin' && !message.includes('IBAN') && !message.toLowerCase().includes('amount') && Boolean(message))
  const jumpTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return <main className="dashboard">
    <aside><div className="brand"><span>⌁</span> smartwave</div><div className="profile"><div className="avatar">{name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><b>{loading ? 'Loading account…' : name}</b><small>{account?.account_number ?? 'No account number'}</small></div></div><nav className="side-nav" aria-label="Client portal"><a className="active" href="#overview" onClick={event => { event.preventDefault(); jumpTo('.dash-content') }}>⌂ Overview</a><a href="#portfolio" onClick={event => { event.preventDefault(); jumpTo('.portfolio') }}>◫ Portfolio</a><a href="#activity" onClick={event => { event.preventDefault(); jumpTo('.activity') }}>↗ Activity</a><span className="nav-unavailable">◈ Documents <small>Coming soon</small></span></nav><button className="signout" onClick={() => void onSignOut()}>↪ Sign out</button></aside>
    <section className="dash-content"><header><div><p className="eyebrow">CLIENT PORTAL</p><h1>Welcome, {first}.</h1></div></header><section className="balance-card"><div><p>YOUR TOTAL BALANCE</p><h2>{loading ? 'Loading…' : money(Number(account?.total_value ?? 0))}</h2><span className="gain">Available to withdraw <em>{money(Number(account?.available_balance ?? 0))}</em></span></div><div className="chart"><p>SMARTWAVE ACCOUNT</p><b>{account?.account_number ?? 'No account found'}</b><span>{profile?.address_line_1 ? `${profile.address_line_1}${profile.city ? `, ${profile.city}` : ''}` : 'Your registered address will appear here.'}</span></div></section><div className="overview-grid"><section className="portfolio"><div className="section-heading"><div><p className="eyebrow">YOUR PORTFOLIO</p><h2>Investment allocation</h2></div></div><div className="empty-data"><p>Allocation data has not been configured for this account.</p><small>Your Smartwave adviser will publish investment holdings here.</small></div></section><section className="quick"><p className="eyebrow">QUICK ACTIONS</p><button disabled={!account} onClick={openWithdrawal}><span>↗</span><div><b>Withdraw funds</b><small>Transfer to your bank</small></div><strong>→</strong></button></section></div><section className="activity"><div className="section-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Withdrawal requests</h2></div></div>{withdrawals.length ? withdrawals.map(item => <div className="transaction" key={item.id}><span className="round-icon">↗</span><div><b>Withdrawal request</b><small>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(item.created_at))} · {item.status.replace('_', ' ')}</small></div><em>{money(Number(item.amount))}</em></div>) : <div className="empty-data"><p>No withdrawal requests yet.</p></div>}</section></section>
    {modal && <div className="modal-backdrop"><div className="withdraw-modal" role="dialog" aria-modal="true" aria-labelledby="withdrawal-title"><button className="close" aria-label="Close withdrawal" onClick={closeWithdrawal}>×</button><p className="eyebrow">WITHDRAW FUNDS · {current.eyebrow}</p><h2 id="withdrawal-title">{current.title}</h2>{stage !== 'complete' && <div className="steps" aria-label={`Withdrawal ${current.eyebrow}`}><span className={stage === 'details' ? 'current' : ''}>Details</span><b/><span className={stage === 'tax' ? 'current' : ''}>Tax PIN</span><b/><span className={stage === 'activation' ? 'current' : ''}>Activation</span><b/><span className={stage === 'transfer' ? 'current' : ''}>Transfer</span></div>}<div className="step-content">{stage === 'details' && <><p className="step-hint">{current.hint}</p><label>Amount (PLN)<div className={`amount-input ${fieldError('amount') ? 'field-error' : ''}`}><span>zł</span><input type="number" min="1" max={account?.available_balance ?? 0} value={amount} onChange={e => { setAmount(e.target.value); setMessage('') }} placeholder="0.00"/></div></label><label>Destination bank<select value={bank} onChange={e => setBank(e.target.value)}>{banks.map(name => <option key={name}>{name}</option>)}</select></label><label>Polish IBAN<input className={fieldError('iban') ? 'field-error' : ''} value={iban} onChange={e => { setIban(e.target.value.toUpperCase()); setMessage('') }} placeholder="PL00 0000 0000 0000 0000 0000 0000"/></label></>}{showPinStep && <><p className="step-hint">{current.hint}</p><label>{stage === 'tax' ? 'Tax PIN' : stage === 'activation' ? 'Activation PIN' : 'Transfer PIN'}<input className={`pin-input ${fieldError('pin') ? 'field-error' : ''}`} type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setMessage('') }} placeholder="••••••"/></label><p className="pin-security-note">For your security, each PIN is limited to three attempts.</p></>}{stage === 'complete' && <div className="success"><div className="success-mark">✓</div><p>{current.hint}</p></div>}{message && <p className="modal-validation-error" role="alert">{message}</p>}{stage === 'complete' ? <button className="primary" onClick={closeWithdrawal}>Close</button> : <button className="primary" disabled={submitting || (stage === 'details' ? !amount || !iban : pin.length !== 6)} onClick={() => void withdraw()}>{current.action}</button>}</div></div></div>}
  </main>
}
