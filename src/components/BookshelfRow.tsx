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

export function BookshelfRow({ title, books, onOpenCatalog }: BookshelfRowProps) {
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
                className={`${sizeClass} relative overflow-hidden shadow-sm border border-gray-200 bg-gray-100`}
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

                {/* Caption overlays the cover in place, rather than floating a tooltip
                    outside it — a floating box can pop past the row (page header above
                    the first row, container edge below the last) and gets clipped by
                    ContentBox's overflow-hidden. Staying inside the cover's own bounds
                    means there's never anywhere for it to overflow into. */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/85 px-1.5 text-center pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-[8px] sm:text-[11px] font-sans text-white leading-tight line-clamp-3">
                        {item.title.toLowerCase()}
                      </p>
                      <p className="text-[7px] sm:text-[10px] font-sans text-gray-300 mt-1">
                        {item.type.toLowerCase()} · {item.category.toLowerCase()}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="w-full border-b-4 sm:border-b-6 border-gray-300 shadow-[0_3px_4px_-2px_rgba(0,0,0,0.25)]" />
      <div className="mt-1 flex justify-end">
        <button
          onClick={onOpenCatalog}
          className="group/label inline-flex items-center gap-1 text-base sm:text-lg font-serif text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
        >
          {title}
          <span className="text-xs not-italic opacity-0 -translate-x-1 group-hover/label:opacity-100 group-hover/label:translate-x-0 transition-all duration-200">→</span>
        </button>
      </div>
    </div>
  )
}
