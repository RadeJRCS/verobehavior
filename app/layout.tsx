import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeroBehavior: Understand why shoppers don\'t buy',
  description: 'The conversion platform for online stores that explains the why behind every click, scroll, and abandoned cart, powered by AI trained on behavioral science.',
  openGraph: {
    title: 'VeroBehavior: Understand why shoppers don\'t buy',
    description: 'The conversion platform for online stores that explains the why behind every click, scroll, and abandoned cart, powered by AI trained on behavioral science.',
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
