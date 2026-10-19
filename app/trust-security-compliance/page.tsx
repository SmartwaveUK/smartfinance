import { HugeiconsIcon } from '@hugeicons/react'
import { Certificate01Icon, FingerPrintScanIcon, Home01Icon, SecurityCheckIcon, ShieldKeyIcon } from '@hugeicons/core-free-icons'
import './trust.css'
import { MobileMenu } from '../ui/mobile-menu'
import { LanguageSwitcher } from '../ui/language-switcher'
import { getPublicCopy } from '../ui/public-copy'
import { getLocale } from 'next-intl/server'

const safeguards = [
  {
    icon: ShieldKeyIcon,
    number: '01',
    title: 'Bank-Grade 256-Bit Encryption',
    description: 'Your accounts and personal data are safeguarded around the clock using advanced encryption protocols and multi-factor authentication.',
  },
  {
    icon: Certificate01Icon,
    number: '02',
    title: 'Fully Licensed & Regulated',
    description: 'We operate in full compliance with central banking regulations, providing transparent financial services you can depend on.',
  },
  {
    icon: SecurityCheckIcon,
    number: '03',
    title: 'Deposit Protection Guarantee',
    description: 'Eligible deposits are insured under formal government protection schemes, ensuring your money remains secure no matter what.',
  },
  {
    icon: FingerPrintScanIcon,
    number: '04',
    title: 'Fast & Secure Digital Verification',
    description: 'Instant biometric identity verification guarantees safe account creation and protects your identity against online fraud.',
  },
]

export default async function TrustSecurityCompliancePage() {
  const copy = getPublicCopy(await getLocale())
  const { nav, trust: text } = copy
  return <main className="trust-page">
    <nav className="trust-nav"><a className="trust-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">{nav.home}</a><a href="/products">{nav.products}</a><a href="/about-us">{nav.about}</a><a className="active" href="/trust-security-compliance">{nav.security}</a><a href="/#contact">{nav.contact}</a></div><div className="page-nav-actions"><LanguageSwitcher/><a className="trust-login" href="/#login">{nav.login}</a></div><MobileMenu links={[{ href: '/', label: nav.home }, { href: '/products', label: nav.products }, { href: '/about-us', label: nav.about }, { href: '/trust-security-compliance', label: nav.security }, { href: '/#contact', label: nav.contact }]} /></nav>
    <section className="trust-hero"><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}<br/><i>{text.titleAccent}</i></h1><p>{text.intro}</p></section>
    <section className="trust-grid" aria-label={text.eyebrow}>{safeguards.map(({ icon, number }, index) => <article key={number}><div className="trust-card-head"><span>{number}</span><HugeiconsIcon icon={icon} size={28} strokeWidth={1.55}/></div><h2>{text.cards[index][0]}</h2><p>{text.cards[index][1]}</p></article>)}</section>
    <section className="trust-cta"><div><p className="eyebrow">{text.cta}</p><h2>{text.question}</h2></div><a href="/#contact">{text.contact}</a></section>
    <footer className="trust-footer"><a className="trust-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
