'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOAD_EASE } from '@/lib/motion'

interface Quote {
  quote: string
  author: string
}

export function RotatingQuote({ quotes }: { quotes: Quote[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (quotes.length < 2) return
    const id = window.setInterval(() => setIndex((current) => (current + 1) % quotes.length), 6000)
    return () => window.clearInterval(id)
  }, [quotes.length])

  if (quotes.length === 0) return null
  const current = quotes[index]

  return (
    <div className="mt-3 flex min-h-[3.75rem] items-start sm:min-h-[4.25rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.64, ease: LOAD_EASE }}
        >
          <h3 className="font-sans text-xs leading-snug tracking-tight text-muted sm:text-sm">“{current.quote}”</h3>
          <p className="mt-1.5 font-sans text-[11px] text-subtle sm:text-xs">by {current.author}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
