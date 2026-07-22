'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

interface AboutContentProps {
  bio: string[]
}

export function AboutContent({ bio }: AboutContentProps) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-5">
      {bio.map((para, i) => (
        <motion.p key={i} variants={itemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
          <InlineMarkdown text={para} />
        </motion.p>
      ))}
    </motion.div>
  )
}
