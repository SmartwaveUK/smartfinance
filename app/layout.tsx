import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Smartwave Finance', description: 'A clearer way to invest' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
