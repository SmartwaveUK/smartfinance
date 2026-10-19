'use client'

import { useLocale } from 'next-intl'

export function LanguageSwitcher() {
  const locale = useLocale()

  function changeLanguage(nextLocale: string) {
    if (nextLocale === locale) return
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return <label className="language-switcher"><span className="sr-only">Select language</span><select value={locale} onChange={event => changeLanguage(event.target.value)} aria-label="Select language"><option value="en">English</option><option value="pl">Polski</option><option value="nl">Nederlands</option><option value="de">Deutsch</option><option value="es">Español</option><option value="cs">Čeština</option></select></label>
}
