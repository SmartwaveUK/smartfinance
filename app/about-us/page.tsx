import { HugeiconsIcon } from '@hugeicons/react'
import { Globe02Icon, Home01Icon, ShieldKeyIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import './about.css'
import { MobileMenu } from '../ui/mobile-menu'
import { LanguageSwitcher } from '../ui/language-switcher'
import { getPublicCopy } from '../ui/public-copy'
import { getLocale } from 'next-intl/server'

const principles = [
  { icon: Globe02Icon, title: 'Borderless by default', text: 'Move money and manage your financial life without unnecessary geographic barriers.' },
  { icon: Wallet01Icon, title: 'Designed for real goals', text: 'Savings, lending, cards, and remittances built around the moments that matter.' },
  { icon: ShieldKeyIcon, title: 'Clear and secure', text: 'Rapid verification, strong safeguards, and plain-spoken products from start to finish.' },
]

export default async function AboutUsPage() {
  const copy = getPublicCopy(await getLocale())
  const { nav, about: text } = copy
  return <main className="about-page">
    <nav className="about-nav"><a className="about-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">{nav.home}</a><a href="/products">{nav.products}</a><a className="active" href="/about-us">{nav.about}</a><a href="/trust-security-compliance">{nav.security}</a><a href="/#contact">{nav.contact}</a></div><div className="page-nav-actions"><LanguageSwitcher/><a className="about-login" href="/#login">{nav.login}</a></div><MobileMenu links={[{ href: '/', label: nav.home }, { href: '/products', label: nav.products }, { href: '/about-us', label: nav.about }, { href: '/trust-security-compliance', label: nav.security }, { href: '/#contact', label: nav.contact }]} /></nav>
    <section className="about-hero"><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}<br/><i>{text.titleAccent}</i></h1></section>
    <section className="about-story"><p className="eyebrow">{text.why}</p><div>{text.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></section>
    <section className="about-principles">{principles.map(({ icon }, index) => <article key={index}><div><span>0{index + 1}</span><HugeiconsIcon icon={icon} size={27} strokeWidth={1.55}/></div><h2>{text.principles[index][0]}</h2><p>{text.principles[index][1]}</p></article>)}</section>
    <section className="about-cta"><div><p className="eyebrow">{text.cta}</p><h2>{text.question}</h2></div><a href="/products">{text.explore}</a></section>
    <footer className="about-footer"><a className="about-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
