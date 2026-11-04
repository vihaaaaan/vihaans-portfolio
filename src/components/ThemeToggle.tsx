'use client'

import { motion } from 'framer-motion'
import { useLayoutEffect, useState } from 'react'
import { PiMoonFill, PiSunFill } from 'react-icons/pi'
import { ICON_COLOR, ICON_TOOLTIP_CLASS, NAV_ICON_SIZE } from '@/components/icons'

type Theme = 'light' | 'dark'

function activeTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useLayoutEffect(() => {
    setTheme(activeTheme())
  }, [])

  const resolvedTheme = theme ?? 'light'
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  const toggleTheme = () => {
    const next = activeTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    window.localStorage.setItem('portfolio-theme', next)
    setTheme(next)
  }

  const Icon = resolvedTheme === 'dark' ? PiMoonFill : PiSunFill

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[0.5px] border-line bg-surface hover:cursor-pointer hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-icon"
    >
      <motion.span
        key={resolvedTheme}
        className={`inline-flex ${ICON_COLOR}`}
        initial={{ opacity: 0, rotate: resolvedTheme === 'dark' ? -35 : 35, scale: 0.72 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Icon size={NAV_ICON_SIZE} />
      </motion.span>
      <span aria-hidden="true" className={`${ICON_TOOLTIP_CLASS} bottom-full mb-2`}>
        {nextTheme} mode
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-tooltip" />
      </span>
    </button>
  )
}
