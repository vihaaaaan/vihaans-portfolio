import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', display: 'swap' })

export const metadata: Metadata = {
  title: 'vihaan vulpala',
  description: 'software engineer & product builder',
  icons: { icon: '/favicon.png' },
}

const themeScript = `(() => {
  try {
    const saved = localStorage.getItem('portfolio-theme')
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
  } catch {
    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
