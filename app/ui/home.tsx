'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon } from '@hugeicons/core-free-icons'
import { signIn } from '../utils/auth'
import { MobileMenu } from './mobile-menu'
import { LanguageSwitcher } from './language-switcher'
import { getPublicCopy } from './public-copy'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloading, setReloading] = useState(false)
  const copy = getPublicCopy(useLocale())
  const { nav, home } = copy
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
    <nav><a className={`brand ${reloading ? 'brand-reloading' : ''}`} href="/" onClick={reloadHome} aria-label="Reload Smartwave home after three seconds"><span><HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.8}/></span> smartwave</a><div className="nav-links"><a href="/products">{nav.products}</a><a href="/about-us">{nav.about}</a><a href="#approach">{nav.approach}</a><a href="#contact">{nav.contact}</a><a href="/trust-security-compliance">{nav.security}</a></div><div className="nav-actions"><LanguageSwitcher/><a className="nav-login" href="#login">{nav.login}</a></div><MobileMenu links={[{ href: '/products', label: nav.products }, { href: '/about-us', label: nav.about }, { href: '#approach', label: nav.approach }, { href: '#contact', label: nav.contact }, { href: '/trust-security-compliance', label: nav.security }]} loginHref="#login" /></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">{home.eyebrow}</p><h1>{home.title}<br/><i>{home.titleAccent}</i></h1><p className="intro">{home.intro}</p><div className="hero-stats"><div><b>12.4%</b><span>{home.return}</span></div><div><b>40k+</b><span>{home.clients}</span></div></div></div><div className="orb-wrap"><div className="orb"><div className="orb-line line-one"/><div className="orb-line line-two"/><div className="orb-center">SW</div></div><p>{home.motion}</p></div></section>
    <section className="login-card" id="login"><div className="login-title"><p className="eyebrow">{home.portal}</p><h2>{home.welcome}</h2><p>{home.signIn}</p></div><form onSubmit={handleLogin}><label>{home.email}<input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>{home.password}<input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Signing in…' : home.signButton} <span>→</span></button><p className="login-note">{home.note}</p></form></section>
    <section className="values" id="approach"><p className="eyebrow">{home.values}</p><h2>{home.valuesTitle}<br/>{home.valuesAccent}</h2><div className="value-grid">{home.valueItems.map(([title, text], index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="contact" id="contact"><div className="contact-heading"><p className="eyebrow">{nav.contact.toUpperCase()}</p><h2>{home.contactTitle}</h2><p>{home.contactIntro}</p><address>1 Canada Square, Canary Wharf<br/>London E14 5AB, United Kingdom</address><div className="support-promise"><p>{home.support}</p><span>{home.supportText}</span></div></div><div className="contact-grid"><article><p>{home.remittance}</p><h3>Dariusz Stanislaw Nowak</h3><span>{home.director}</span><a href="mailto:Dariuszstanislaw00@gmail.com">Dariuszstanislaw00@gmail.com</a></article><article><p>{home.partner}</p><h3>Anna Maria Walecka</h3><span>{home.partnerRole}</span><a href="mailto:waleckaannamariawalecka@gmail.com">waleckaannamariawalecka@gmail.com</a></article><article><p>{home.enquiries}</p><h3>Smartwave Finance</h3><span>{home.supportRole}</span><a href="mailto:swaveuk@gmail.com">swaveuk@gmail.com</a></article></div></section>
    <footer id="security"><a className={`brand ${reloading ? 'brand-reloading' : ''}`} href="/" onClick={reloadHome} aria-label="Reload Smartwave home after three seconds"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p><p>{home.protected}</p></footer>
  </main>
}
