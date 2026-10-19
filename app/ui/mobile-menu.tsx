import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon } from '@hugeicons/core-free-icons'
import { LanguageSwitcher } from './language-switcher'

type MobileMenuProps = {
  links: Array<{ href: string; label: string }>
  loginHref?: string
}

export function MobileMenu({ links, loginHref = '/#login' }: MobileMenuProps) {
  return <details className="mobile-menu">
    <summary aria-label="Open navigation menu"><HugeiconsIcon icon={Menu01Icon} size={23} strokeWidth={1.8}/></summary>
    <div className="mobile-menu-panel">
      <p>SMARTWAVE FINANCE</p>
      <LanguageSwitcher />
      <nav aria-label="Mobile navigation">
        {links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        <a className="mobile-menu-login" href={loginHref}>Client login <span>→</span></a>
      </nav>
    </div>
  </details>
}
