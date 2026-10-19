'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon } from '@hugeicons/core-free-icons'
import { signIn } from '../utils/auth'
import { MobileMenu } from './mobile-menu'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloading, setReloading] = useState(false)
  function reloadHome(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    if (reloading) return
    setReloading(true)
    window.setTimeout(() => window.location.assign('/'), 3_000)
  }
  async function handleLogin(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const result = await signIn(email, password)
    setLoading(false)
    if (result.destination) router.replace(result.destination)
    else setError(result.error ?? 'Could not sign in.')
  }
  return <main className="landing">
    <nav><a className={`brand ${reloading ? 'brand-reloading' : ''}`} href="/" onClick={reloadHome} aria-label="Reload Smartwave home after three seconds"><span><HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8}/></span> smartwave</a><div className="nav-links"><a href="/products">Products</a><a href="/about-us">About us</a><a href="#approach">Our approach</a><a href="#contact">Contact us</a><a href="/trust-security-compliance">Security</a></div><a className="nav-login" href="#login">Client login →</a><MobileMenu links={[{ href: '/products', label: 'Products' }, { href: '/about-us', label: 'About us' }, { href: '#approach', label: 'Our approach' }, { href: '#contact', label: 'Contact us' }, { href: '/trust-security-compliance', label: 'Security' }]} loginHref="#login" /></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">UNITED KINGDOM · INVEST WITH CLARITY</p><h1>A more confident<br/><i>financial future.</i></h1><p className="intro">Smartwave Finance brings modern investment management and personal expertise together, so your money moves with purpose.</p><div className="hero-stats"><div><b>12.4%</b><span>Average annual return</span></div><div><b>40k+</b><span>Clients across Europe</span></div></div></div>
      <div className="orb-wrap"><div className="orb"><div className="orb-line line-one"/><div className="orb-line line-two"/><div className="orb-center">SW</div></div><p>Investment, in motion.</p></div></section>
    <section className="login-card" id="login"><div className="login-title"><p className="eyebrow">CLIENT PORTAL</p><h2>Welcome back.</h2><p>Sign in to review your portfolio and manage your funds.</p></div><form onSubmit={handleLogin}><label>Email address<input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in to your account'} <span>→</span></button><p className="login-note">Accounts are created through your Smartwave adviser.</p></form></section>
    <section className="values" id="approach"><p className="eyebrow">BUILT AROUND YOU</p><h2>Money deserves<br/>a human perspective.</h2><div className="value-grid"><article><b>01</b><h3>Clear by design</h3><p>Understand where every złoty is working and why.</p></article><article><b>02</b><h3>Always personal</h3><p>Thoughtful guidance from people who know your goals.</p></article><article><b>03</b><h3>Built for tomorrow</h3><p>Long-term decisions shaped around the life you want.</p></article></div></section>
    <section className="contact" id="contact"><div className="contact-heading"><p className="eyebrow">CONTACT US</p><h2>Here when you need us.</h2><p>Speak with the Smartwave Finance team about your account, remittances, or partnership enquiries.</p><address>1 Canada Square, Canary Wharf<br/>London E14 5AB, United Kingdom</address><div className="support-promise"><p>24/7 DEDICATED CUSTOMER SUPPORT</p><span>Get instant assistance anytime from our live support team or smart AI assistant directly within the platform.</span></div></div><div className="contact-grid"><article><p>REMITTANCE ADMINISTRATION</p><h3>Dariusz Stanislaw Nowak</h3><span>Director, Remittance Administration Department</span><a href="mailto:Dariuszstanislaw00@gmail.com">Dariuszstanislaw00@gmail.com</a></article><article><p>PARTNER</p><h3>Anna Maria Walecka</h3><span>Smartwave Finance Partner</span><a href="mailto:waleckaannamariawalecka@gmail.com">waleckaannamariawalecka@gmail.com</a></article><article><p>GENERAL ENQUIRIES</p><h3>Smartwave Finance</h3><span>Our client support team</span><a href="mailto:swaveuk@gmail.com">swaveuk@gmail.com</a></article></div></section>
    <footer id="security"><a className={`brand ${reloading ? 'brand-reloading' : ''}`} href="/" onClick={reloadHome} aria-label="Reload Smartwave home after three seconds"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p><p>Protected with bank-grade security</p></footer>
  </main>
}
