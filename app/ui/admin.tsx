'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import './admin.css'
import './admin-empty.css'

type Client = { id: string | number; accountId?: string; accountNumber?: string; name: string; email: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string; tier: string; portfolio: number; available: number; equity: number; fixed: number; alternative: number }
const pln = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)

export default function AdminWorkspace() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedId, setSelectedId] = useState<string | number>(1)
  const [created, setCreated] = useState(false)
  const [notice, setNotice] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [pinCodes, setPinCodes] = useState<{ tax: string; activation: string; transfer: string } | null>(null)
  const selected = clients.find((client) => client.id === selectedId) ?? clients[0]
  const update = (field: keyof Client, value: string | number) => setClients((items) => items.map((client) => client.id === selected.id ? { ...client, [field]: value } : client))
  async function request(method: 'GET' | 'POST' | 'PATCH', body?: unknown, path = '/api/admin/clients') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) return null
    const supabase = createBrowserClient(url, key)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sign in as an administrator first.')
    const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: body ? JSON.stringify(body) : undefined })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed.')
    return data
  }
  useEffect(() => { request('GET').then((data) => { if (data?.clients?.length) { setClients(data.clients); setSelectedId(data.clients[0].id) } else setNotice('No client accounts exist yet.') }).catch((error) => setNotice(error instanceof Error ? error.message : 'Could not load client accounts.')) }, [])
  async function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    const portfolio = Number(form.get('portfolio') || 0)
    const password = String(form.get('password') || '')
    const addressLine1 = String(form.get('addressLine1') || '')
    const addressLine2 = String(form.get('addressLine2') || '')
    const city = String(form.get('city') || '')
    const postalCode = String(form.get('postalCode') || '')
    const country = String(form.get('country') || 'Poland')
    setSyncing(true); setNotice('')
    try {
      const data = await request('POST', { name, email, password, addressLine1, addressLine2, city, postalCode, country, tier: 'Standard Investor', portfolio, available: portfolio, equity: 60, fixed: 25, alternative: 15 })
      const client = data?.client ?? { id: Date.now(), name, email, addressLine1, addressLine2, city, postalCode, country, tier: 'Standard Investor', portfolio, available: portfolio, equity: 60, fixed: 25, alternative: 15 }
      setClients((items) => [...items, client]); setSelectedId(client.id); setCreated(false); setNotice(`${name}’s account has been created.`); formElement.reset()
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not create account.') } finally { setSyncing(false) }
  }
  async function save() { setSyncing(true); setNotice(''); try { await request('PATCH', { ...selected, userId: selected.id }); setNotice(`Changes to ${selected.name}’s dashboard have been saved.`) } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save changes.') } finally { setSyncing(false) } }
  async function generatePins() { setSyncing(true); setNotice(''); setPinCodes(null); try { const pins = await request('POST', undefined, `/api/admin/clients/${selected.id}/withdrawal-pins`); setPinCodes(pins); setNotice(`New withdrawal PINs have been generated for ${selected.name}.`) } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not generate withdrawal PINs.') } finally { setSyncing(false) } }
  if (!selected) return <main className="admin-shell"><aside className="admin-sidebar"><a className="brand" href="/"><span>⌁</span> smartwave</a><p className="admin-label">ADMIN CONSOLE</p></aside><section className="admin-content"><header className="admin-header"><div><p className="eyebrow">ADMINISTRATION</p><h1>Client management</h1><p>Configure the information clients see in their Smartwave dashboard.</p></div></header><section className="admin-empty"><p className="eyebrow">CLIENT ACCOUNTS</p><h2>No client accounts yet.</h2><p>{notice || 'Create the first Smartwave client account below.'}</p><form className="first-client-form" onSubmit={addClient}><label>Full name<input name="name" placeholder="e.g. Jan Kowalski" required/></label><label>Email address<input type="email" name="email" placeholder="client@example.com" required/></label><label>Temporary password<input type="password" name="password" minLength={8} placeholder="At least 8 characters" required/></label><label>Street address<input name="addressLine1" placeholder="Street and house number" required/></label><label>Address line 2<input name="addressLine2" placeholder="Apartment, suite, etc. (optional)"/></label><label>City<input name="city" placeholder="e.g. Warsaw" required/></label><label>Postal code<input name="postalCode" placeholder="00-001" required/></label><label>Country<input name="country" defaultValue="Poland" required/></label><label>Opening portfolio value (PLN)<input type="number" name="portfolio" min="0" placeholder="0.00" required/></label><button className="admin-primary" disabled={syncing} type="submit">{syncing ? 'Creating…' : 'Create first client →'}</button></form><p className="admin-empty-note">The account is created in Supabase Auth and a matching Smartwave profile and investment account are added to the database. A unique account number is generated automatically.</p></section></section></main>
  return <main className="admin-shell">
    <aside className="admin-sidebar"><a className="brand" href="/admin"><span>⌁</span> smartwave</a><p className="admin-label">ADMIN CONSOLE</p><nav aria-label="Administration"><a className="current" href="/admin">⌂ Client management</a><a onClick={() => setCreated(true)}>＋ Create client</a></nav><div className="admin-user"><div>SW</div><p><b>Smartwave Admin</b><small>Administrator</small></p></div></aside>
    <section className="admin-content"><header className="admin-header"><div><p className="eyebrow">ADMINISTRATION</p><h1>Client management</h1><p>Configure the information clients see in their Smartwave dashboard.</p></div><button className="admin-primary" onClick={() => setCreated(true)}>+ Create client account</button></header>
      <div className="admin-stats"><article><span>Active clients</span><b>{clients.length}</b><small>↑ 1 this month</small></article><article><span>Assets under management</span><b>{pln(clients.reduce((total, client) => total + client.portfolio, 0))}</b><small>Across all client accounts</small></article><article><span>Pending withdrawals</span><b>3</b><small>Requires review</small></article></div>
      <section className="admin-grid"><div className="client-list"><div className="admin-section-head"><div><p className="eyebrow">CLIENTS</p><h2>Client accounts</h2></div><button>Filter ▾</button></div><input className="client-search" placeholder="Search clients"/><div className="client-table"><div className="table-head"><span>Client</span><span>Portfolio value</span><span>Status</span></div>{clients.map((client) => <button className={client.id === selected.id ? 'selected' : ''} onClick={() => { setSelectedId(client.id); setCreated(false); setNotice('') }} key={client.id}><span><i>{client.name.split(' ').map(x => x[0]).join('')}</i><b>{client.name}<small>{client.email}</small></b></span><span>{pln(client.portfolio)}</span><em>Active</em></button>)}</div></div>
        <div className="editor"><div className="admin-section-head"><div><p className="eyebrow">DASHBOARD SETTINGS</p><h2>{selected.name}</h2></div><span className="live-dot">Live preview</span></div><div className="form-grid"><label>Client name<input value={selected.name} onChange={e => update('name', e.target.value)}/></label><label>Investor tier<select value={selected.tier} onChange={e => update('tier', e.target.value)}><option>Standard Investor</option><option>Premium Investor</option><option>Private Client</option></select></label><label>Email address<input value={selected.email} onChange={e => update('email', e.target.value)}/></label><label>Portfolio value (PLN)<input type="number" value={selected.portfolio} onChange={e => update('portfolio', Number(e.target.value))}/></label><label>Available to withdraw (PLN)<input type="number" value={selected.available} onChange={e => update('available', Number(e.target.value))}/></label></div><button className="admin-primary save" disabled={syncing} onClick={save}>{syncing ? 'Saving…' : 'Save dashboard changes →'}</button><section className="pin-admin"><div><p className="eyebrow">WITHDRAWAL SECURITY</p><h3>Withdrawal PINs</h3><p>Generate replacement Tax, Activation, and Transfer PINs. New PINs immediately replace existing ones and clear a withdrawal hold.</p></div><button type="button" className="pin-generate" disabled={syncing} onClick={generatePins}>{syncing ? 'Generating…' : 'Generate new PINs'}</button>{pinCodes && <div className="pin-codes"><p>Record these now—they will not be shown again.</p><dl><div><dt>Tax PIN</dt><dd>{pinCodes.tax}</dd></div><div><dt>Activation PIN</dt><dd>{pinCodes.activation}</dd></div><div><dt>Transfer PIN</dt><dd>{pinCodes.transfer}</dd></div></dl></div>}</section>{notice && <p className="admin-notice">✓ {notice}</p>}</div></section>
      {created && <div className="admin-modal-wrap"><form className="admin-modal" onSubmit={addClient}><button type="button" className="close" onClick={() => setCreated(false)}>×</button><p className="eyebrow">NEW CLIENT</p><h2>Create a client account</h2><p>Create a portal profile, registered address, and opening portfolio.</p><label>Full name<input name="name" placeholder="e.g. Jan Kowalski" required/></label><label>Email address<input type="email" name="email" placeholder="client@example.com" required/></label><label>Temporary password<input type="password" name="password" minLength={8} placeholder="At least 8 characters" required/></label><label>Street address<input name="addressLine1" placeholder="Street and house number" required/></label><label>Address line 2<input name="addressLine2" placeholder="Apartment, suite, etc. (optional)"/></label><label>City<input name="city" placeholder="e.g. Warsaw" required/></label><label>Postal code<input name="postalCode" placeholder="00-001" required/></label><label>Country<input name="country" defaultValue="Poland" required/></label><label>Opening portfolio value (PLN)<input type="number" name="portfolio" min="0" placeholder="0.00" required/></label><button className="admin-primary" disabled={syncing} type="submit">{syncing ? 'Creating…' : 'Create client account →'}</button><small>A unique Smartwave account number is generated automatically.</small></form></div>}</section>
  </main>
}
