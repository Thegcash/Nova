import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nova Command Center',
  description: 'Nova Command Center Dashboard',
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


