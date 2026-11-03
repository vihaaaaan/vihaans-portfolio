'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'portfolio-theme:v1'

function documentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(documentTheme())
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = documentTheme() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    root.dataset.themeChanging = 'true'
    root.dataset.theme = nextTheme
    void root.offsetWidth
    delete root.dataset.themeChanging

    setTheme(nextTheme)

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // The visual toggle still works when storage is unavailable.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-[11px] lowercase text-muted">theme</span>
      <button
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={toggleTheme}
        className="relative h-6 w-11 cursor-pointer rounded-full bg-surface-strong shadow-inner outline-none ring-1 ring-line transition-colors focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="theme-toggle-thumb absolute left-1 top-1 h-4 w-4 rounded-full bg-foreground shadow-sm transition-transform duration-200" />
      </button>
    </div>
  )
}
