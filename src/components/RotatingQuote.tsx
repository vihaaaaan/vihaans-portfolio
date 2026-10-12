'use client'

import { useEffect, useState } from 'react'

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
    <div className="flex min-h-[3.25rem] items-start sm:min-h-[3.75rem]">
      <div key={index} className="quote-enter">
        <h3 className="font-sans text-xs tracking-tight text-gray-500 sm:text-sm">“{current.quote}”</h3>
        <p className="mt-1 font-sans text-[11px] text-gray-400 sm:text-xs">— {current.author}</p>
      </div>
    </div>
  )
}
