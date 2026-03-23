import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Thesis — AI-Powered Equity Research',
  description: 'Generate institutional-grade equity research reports on any public company. DCF valuation, comparable analysis, and AI-driven insights — in seconds.',
  keywords: 'equity research, stock analysis, DCF valuation, AI research, institutional research',
  openGraph: {
    title: 'Thesis Research',
    description: 'Institutional equity research. Instantly.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
