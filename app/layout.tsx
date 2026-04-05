import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import { Instrument_Serif } from 'next/font/google'
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
  title: 'ASSISTANTS.ge',
  description: 'TBC და BOG ბანკების ამონაწერების იმპორტი FINS-ში',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
