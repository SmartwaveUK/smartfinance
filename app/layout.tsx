import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

export const metadata: Metadata = { title: 'Smartwave Finance', description: 'A clearer way to invest.' }
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()])
  return <html lang={locale}><body><NextIntlClientProvider locale={locale} messages={messages}>{children}<a className="whatsapp-float" href="https://wa.me/48726408767?text=Hello%20Smartwave%20Finance%2C%20I%20need%20support." target="_blank" rel="noreferrer" aria-label="Chat with Smartwave Finance on WhatsApp"><svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.1 19.8L3 29l6.4-1.7A13 13 0 1 0 16 3Zm0 23.6c-2.1 0-4.2-.6-6-1.8l-.4-.2-3.8 1 1-3.7-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.3-.4.3-.7.1a8.7 8.7 0 0 1-2.6-1.6 9.6 9.6 0 0 1-1.8-2.3c-.2-.3 0-.5.1-.7l.5-.6.2-.5c.1-.2 0-.4 0-.6l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.1.8.3 1.5.6 2 .7.9.3 1.7.2 2.3.1.7-.1 2- .8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.5Z"/></svg><span>WhatsApp support</span></a></NextIntlClientProvider></body></html>
}
