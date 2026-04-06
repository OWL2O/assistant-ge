import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import { Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ASSISTANTS.ge',
    template: '%s — ASSISTANTS.ge',
  },
  description: 'TBC და BOG ბანკების ამონაწერების იმპორტი FINS-ში',
  applicationName: 'ASSISTANTS.ge',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ASSISTANTS.ge',
    description: 'TBC და BOG ბანკების ამონაწერების იმპორტი FINS-ში',
    locale: 'ka_GE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
