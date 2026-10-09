'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Quote {
  quote: string
  author: string
}

export function RotatingQuote({ quotes }: { quotes: Quote[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (quotes.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 6000)
    return () => clearInterval(id)
  }, [quotes.length])

  if (quotes.length === 0) return null
  const current = quotes[index]

  return (
    <div className="flex min-h-[3.25rem] items-start sm:min-h-[3.75rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h3 className="font-sans text-xs tracking-tight text-gray-500 sm:text-sm">
            “{current.quote}”
          </h3>
          <p className="mt-1 font-sans text-[11px] text-gray-400 sm:text-xs">
            — {current.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
