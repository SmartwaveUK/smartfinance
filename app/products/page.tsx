import { HugeiconsIcon } from '@hugeicons/react'
import { CreditCardIcon, Globe02Icon, Home01Icon, MoneyBag01Icon, MoneyReceive02Icon } from '@hugeicons/core-free-icons'
import './products.css'
import { MobileMenu } from '../ui/mobile-menu'
import { LanguageSwitcher } from '../ui/language-switcher'
import { getPublicCopy } from '../ui/public-copy'
import { getLocale } from 'next-intl/server'

const products = [
  {
    icon: MoneyBag01Icon,
    number: '01',
    title: 'High-Yield Savings Accounts',
    description: 'Grow your wealth with competitive interest rates, automated recurring deposits, and flexible withdrawal options designed with zero hidden fees.',
  },
  {
    icon: MoneyReceive02Icon,
    number: '02',
    title: 'Personal & Express Loans',
    description: 'Access fast, transparent credit with custom repayment terms, instant online eligibility checks, and competitive fixed rates.',
  },
  {
    icon: Globe02Icon,
    number: '03',
    title: 'International Money Transfers',
    description: 'Send and receive money globally across multiple currencies with low fees, real-time exchange rates, and fast cross-border settlement.',
  },
  {
    icon: CreditCardIcon,
    number: '04',
    title: 'Credit Card / Digital Wallet',
    description: 'Manage your day-to-day spending seamlessly with virtual or physical debit cards, real-time balance updates, and multi-currency support.',
  },
]

export default async function ProductsPage() {
  const copy = getPublicCopy(await getLocale())
  const { nav, products: text } = copy
  return <main className="products-page">
    <nav className="products-nav"><a className="products-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">{nav.home}</a><a className="active" href="/products">{nav.products}</a><a href="/about-us">{nav.about}</a><a href="/trust-security-compliance">{nav.security}</a><a href="/#contact">{nav.contact}</a></div><div className="page-nav-actions"><LanguageSwitcher/><a className="products-login" href="/#login">{nav.login}</a></div><MobileMenu links={[{ href: '/', label: nav.home }, { href: '/products', label: nav.products }, { href: '/about-us', label: nav.about }, { href: '/trust-security-compliance', label: nav.security }, { href: '/#contact', label: nav.contact }]} /></nav>
    <section className="products-hero"><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}<br/><i>{text.titleAccent}</i></h1><p>{text.intro}</p></section>
    <section className="products-grid" aria-label={text.eyebrow}>{products.map(({ icon, number }, index) => <article key={number}><div className="product-card-head"><span>{number}</span><HugeiconsIcon icon={icon} size={28} strokeWidth={1.55}/></div><h2>{text.cards[index][0]}</h2><p>{text.cards[index][1]}</p><a href="/#contact">{text.speak} <b>→</b></a></article>)}</section>
    <section className="products-cta"><div><p className="eyebrow">{text.support}</p><h2>{text.question}</h2></div><a href="/#contact">{text.contact}</a></section>
    <footer className="products-footer"><a className="products-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
