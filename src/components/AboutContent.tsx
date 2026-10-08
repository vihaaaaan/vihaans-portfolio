'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

interface AboutContentProps {
  bio: string[]
}

export function AboutContent({ bio }: AboutContentProps) {
  return (
    <motion.div variants={loadListVariants} className="space-y-5">
      {bio.map((para, i) => (
        <motion.p key={i} variants={loadItemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
          <InlineMarkdown text={para} />
        </motion.p>
      ))}
    </motion.div>
  )
}
