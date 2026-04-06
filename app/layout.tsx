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
        <div className="mobile-block">
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '20px',
          }}>
            ASSISTANTS.ge
          </div>
          <div style={{ fontSize: '40px', marginBottom: '24px' }}>💻</div>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '26px',
            color: 'var(--text)',
            letterSpacing: '-0.3px',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}>
            გთხოვთ გამოიყენოთ კომპიუტერი
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text2)',
            lineHeight: 1.75,
            maxWidth: '300px',
            marginBottom: '12px',
          }}>
            ASSISTANTS.ge განკუთვნილია Excel-ფაილებთან სამუშაოდ და ოპტიმიზებულია
            დესკტოპის ეკრანებისთვის.
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--text3)',
            lineHeight: 1.7,
            maxWidth: '280px',
          }}>
            გთხოვთ გახსენით საიტი კომპიუტერზე, ლეპტოპზე ან სხვა ფართო ეკრანის მოწყობილობაზე.
          </p>
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
