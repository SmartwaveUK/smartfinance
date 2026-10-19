import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'pl', 'nl', 'de', 'es', 'cs'] as const
export type AppLocale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const storedLocale = (await cookies()).get('NEXT_LOCALE')?.value
  const locale: AppLocale = locales.includes(storedLocale as AppLocale) ? storedLocale as AppLocale : 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
