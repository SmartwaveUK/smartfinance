'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '../utils/auth'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function handleLogin(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await signIn(email, password)
    setLoading(false)
    if (result === 'demo' || result === null) router.push('/dashboard')
    else setError(result)
  }
  return <main className="landing">
    <nav><a className="brand" href="#top"><span>⌁</span> smartwave</a><div className="nav-links"><a href="#approach">Our approach</a><a href="#security">Security</a></div><a className="nav-login" href="#login">Client login →</a></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">POLAND · INVEST WITH CLARITY</p><h1>A more confident<br/><i>financial future.</i></h1><p className="intro">Smartwave Finance brings modern investment management and personal expertise together, so your money moves with purpose.</p><div className="hero-stats"><div><b>12.4%</b><span>Average annual return</span></div><div><b>40k+</b><span>Clients across Europe</span></div></div></div>
      <div className="orb-wrap"><div className="orb"><div className="orb-line line-one"/><div className="orb-line line-two"/><div className="orb-center">SW</div></div><p>Investment, in motion.</p></div></section>
    <section className="login-card" id="login"><div className="login-title"><p className="eyebrow">CLIENT PORTAL</p><h2>Welcome back.</h2><p>Sign in to review your portfolio and manage your funds.</p></div><form onSubmit={handleLogin}><label>Email address<input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in to your account'} <span>→</span></button><p className="login-note">Accounts are created through your Smartwave adviser.</p></form></section>
    <section className="values" id="approach"><p className="eyebrow">BUILT AROUND YOU</p><h2>Money deserves<br/>a human perspective.</h2><div className="value-grid"><article><b>01</b><h3>Clear by design</h3><p>Understand where every złoty is working and why.</p></article><article><b>02</b><h3>Always personal</h3><p>Thoughtful guidance from people who know your goals.</p></article><article><b>03</b><h3>Built for tomorrow</h3><p>Long-term decisions shaped around the life you want.</p></article></div></section>
    <footer id="security"><span className="brand"><span>⌁</span> smartwave</span><p>© 2026 Smartwave Finance Sp. z o.o. · Warsaw, Poland</p><p>Protected with bank-grade security</p></footer>
  </main>
}
