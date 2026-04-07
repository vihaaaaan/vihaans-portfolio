'use client'

import { motion } from 'framer-motion'

interface LocationIndicatorProps {
  location: string
}

export function LocationIndicator({ location }: LocationIndicatorProps) {
  return (
    <motion.div
      className="inline-flex items-center gap-1.5 cursor-default select-none"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <motion.span
        className="text-[11px] sm:text-sm font-serif italic text-gray-500 relative"
        variants={{ rest: { x: 0 }, hover: { x: 1 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {location.toLowerCase()}
        <motion.span
          className="absolute bottom-0 left-0 h-[1px] bg-gray-400"
          variants={{ rest: { width: '0%' }, hover: { width: '100%' } }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </motion.span>
      <motion.span
        className="text-sm leading-none"
        variants={{
          rest: { y: 0, rotate: 0 },
          hover: {
            y: [0, 4, -2, 1, 0],
            rotate: [0, -10, 6, -3, 0],
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      >
        📍
      </motion.span>
    </motion.div>
  )
}
