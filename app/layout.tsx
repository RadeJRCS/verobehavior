import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeroBehavior — The Psychology of Conversion, Decoded by AI',
  description: 'Stop testing words. Start testing psychology. The only CRO platform that explains the why behind every click, scroll, and conversion.',
  openGraph: {
    title: 'VeroBehavior',
    description: 'Behavioral psychology meets AI. Understand why users convert.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
