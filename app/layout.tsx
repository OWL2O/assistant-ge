import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASSISTANTS.ge',
  description: 'TBC ბანკის ამონაწერის იმპორტი FINS-ში',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  )
}
