'use client'

import type { BookshelfRowProps } from '@/types'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookshelfImages } from '@/context/BookshelfImagesContext'

const MAX_ITEMS = 4

const typeEmoji: Record<string, string> = {
  book: '📖',
  movie: '🎬',
  'tv show': '📺',
  tv: '📺',
  show: '📺',
  podcast: '🎙️',
  comic: '💥',
}

const SQUARE_TYPES = new Set(['podcast', 'music'])

const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const bookVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

export function BookshelfRow({ title, books }: BookshelfRowProps) {
  const displayItems = books.slice(0, MAX_ITEMS)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const coverImages = useBookshelfImages()

  return (
    <div className="mt-4 sm:mt-6">
      <motion.div
        className="flex items-end justify-around"
        variants={rowVariants}
        initial="hidden"
        animate="visible"
      >
        {displayItems.map((item, index) => {
          const emoji = typeEmoji[item.type.toLowerCase()] ?? '📄'
          const coverUrl = coverImages[item.title]
          const isSquare = SQUARE_TYPES.has(item.type.toLowerCase())
          const sizeClass = isSquare
            ? 'w-16 sm:w-22 h-16 sm:h-22'
            : 'w-16 sm:w-22 h-24 sm:h-33'

          return (
            <motion.div
              key={index}
              variants={bookVariants}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className={`${sizeClass} rounded-sm overflow-hidden shadow-sm border border-gray-200 bg-gray-100`}
                whileHover={{ y: -7, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                    <span className="text-2xl sm:text-3xl mb-1">{emoji}</span>
                    <span className="text-[8px] sm:text-[9px] font-sans text-gray-400 text-center leading-tight line-clamp-2">
                      {item.title.toLowerCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="bg-gray-800 text-white text-[10px] px-2 py-1.5 rounded-sm whitespace-nowrap max-w-48 text-center shadow-lg">
                      <p className="font-serif italic leading-tight">{item.title.toLowerCase()}</p>
                      <p className="text-gray-300 mt-0.5">{item.type.toLowerCase()} · {item.category.toLowerCase()}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="w-full border-b-4 sm:border-b-6 border-gray-300 shadow-[0_3px_4px_-2px_rgba(0,0,0,0.25)]" />
      <h3 className="text-base sm:text-lg font-serif text-gray-400 italic mt-1 flex justify-end">{title}</h3>
    </div>
  )
}
