import { HugeiconsIcon } from '@hugeicons/react'
import { CreditCardIcon, Globe02Icon, Home01Icon, MoneyBag01Icon, MoneyReceive02Icon } from '@hugeicons/core-free-icons'
import './products.css'
import { MobileMenu } from '../ui/mobile-menu'

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

export default function ProductsPage() {
  return <main className="products-page">
    <nav className="products-nav"><a className="products-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">Home</a><a className="active" href="/products">Products</a><a href="/about-us">About us</a><a href="/trust-security-compliance">Security</a><a href="/#contact">Contact us</a><a className="products-login" href="/#login">Client login →</a></div><MobileMenu links={[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { href: '/about-us', label: 'About us' }, { href: '/trust-security-compliance', label: 'Security' }, { href: '/#contact', label: 'Contact us' }]} /></nav>
    <section className="products-hero"><p className="eyebrow">SMARTWAVE PRODUCTS</p><h1>Financial tools that<br/><i>move with your life.</i></h1><p>Flexible products for saving, borrowing, spending, and moving money—designed around how you live today.</p></section>
    <section className="products-grid" aria-label="Smartwave products">{products.map(({ icon, number, title, description }) => <article key={title}><div className="product-card-head"><span>{number}</span><HugeiconsIcon icon={icon} size={28} strokeWidth={1.55}/></div><h2>{title}</h2><p>{description}</p><a href="/#contact">Speak with our team <b>→</b></a></article>)}</section>
    <section className="products-cta"><div><p className="eyebrow">PERSONAL SUPPORT</p><h2>Not sure which product fits?</h2></div><a href="/#contact">Contact Smartwave Finance →</a></section>
    <footer className="products-footer"><a className="products-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
