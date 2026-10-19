import { HugeiconsIcon } from '@hugeicons/react'
import { Certificate01Icon, FingerPrintScanIcon, Home01Icon, SecurityCheckIcon, ShieldKeyIcon } from '@hugeicons/core-free-icons'
import './trust.css'

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

export default function TrustSecurityCompliancePage() {
  return <main className="trust-page">
    <nav className="trust-nav"><a className="trust-brand" href="/" aria-label="Smartwave home"><span><HugeiconsIcon icon={Home01Icon} size={17} strokeWidth={1.8}/></span> smartwave</a><div><a href="/">Home</a><a href="/products">Products</a><a href="/about-us">About us</a><a className="active" href="/trust-security-compliance">Security</a><a href="/#contact">Contact us</a><a className="trust-login" href="/#login">Client login →</a></div></nav>
    <section className="trust-hero"><p className="eyebrow">TRUST, SECURITY & COMPLIANCE</p><h1>Built to protect<br/><i>what matters most.</i></h1><p>Security and transparency are embedded in every Smartwave Finance experience, so you can manage your money with confidence.</p></section>
    <section className="trust-grid" aria-label="Trust, security, and compliance commitments">{safeguards.map(({ icon, number, title, description }) => <article key={title}><div className="trust-card-head"><span>{number}</span><HugeiconsIcon icon={icon} size={28} strokeWidth={1.55}/></div><h2>{title}</h2><p>{description}</p></article>)}</section>
    <section className="trust-cta"><div><p className="eyebrow">SECURE BY DESIGN</p><h2>Questions about your account security?</h2></div><a href="/#contact">Contact Smartwave Finance →</a></section>
    <footer className="trust-footer"><a className="trust-brand" href="/"><span><HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.8}/></span> smartwave</a><p>© 2026 Smartwave Finance Ltd · 1 Canada Square, London E14 5AB, United Kingdom</p></footer>
  </main>
}
