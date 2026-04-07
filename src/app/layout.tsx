import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'vihaan vulpala',
  description: 'software engineer & product builder',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
