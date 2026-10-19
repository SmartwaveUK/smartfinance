import { HugeiconsIcon } from '@hugeicons/react'
import { Globe02Icon, Home01Icon, ShieldKeyIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import './about.css'
import { MobileMenu } from '../ui/mobile-menu'

const principles = [
  { icon: Globe02Icon, title: 'Borderless by default', text: 'Move money and manage your financial life without unnecessary geographic barriers.' },
  { icon: Wallet01Icon, title: 'Designed for real goals', text: 'Savings, lending, cards, and remittances built around the moments that matter.' },
  { icon: ShieldKeyIcon, title: 'Clear and secure', text: 'Rapid verification, strong safeguards, and plain-spoken products from start to finish.' },
]

export default function AboutUsPage() {
  return <main className="about-page">
    <nav className="about-nav"><a className="about-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">Home</a><a href="/products">Products</a><a className="active" href="/about-us">About us</a><a href="/trust-security-compliance">Security</a><a href="/#contact">Contact us</a><a className="about-login" href="/#login">Client login →</a></div><MobileMenu links={[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { href: '/about-us', label: 'About us' }, { href: '/trust-security-compliance', label: 'Security' }, { href: '/#contact', label: 'Contact us' }]} /></nav>
    <section className="about-hero"><p className="eyebrow">ABOUT SMARTWAVE</p><h1>SmartWave is built for<br/><i>borderless, transparent banking.</i></h1></section>
    <section className="about-story"><p className="eyebrow">WHY WE EXIST</p><div><p>Legacy banks were built on rigid rules, hidden processing fees, and delayed transfers. We built our platform to do the exact opposite.</p><p>Whether you are applying for a flexible personal or business loan, building an emergency fund in high-yield savings vaults, or sending remittances home to family overseas, our regulated infrastructure ensures your funds move quickly and safely.</p><p>We prioritize security, rapid digital verification, and plain-spoken financial products designed around your goals.</p></div></section>
    <section className="about-principles">{principles.map(({ icon, title, text }, index) => <article key={title}><div><span>0{index + 1}</span><HugeiconsIcon icon={icon} size={27} strokeWidth={1.55}/></div><h2>{title}</h2><p>{text}</p></article>)}</section>
    <section className="about-cta"><div><p className="eyebrow">BANKING, REIMAGINED</p><h2>Financial services that work at your pace.</h2></div><a href="/products">Explore our products →</a></section>
    <footer className="about-footer"><a className="about-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
