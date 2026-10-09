'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

interface AboutContentProps {
  bio: string[]
}

export function AboutContent({ bio }: AboutContentProps) {
  return (
    <motion.div variants={loadListVariants} className="space-y-4">
      {bio.map((para, i) => (
        <motion.p key={i} variants={loadItemVariants} className="font-sans text-[11px] leading-relaxed text-gray-600 sm:text-xs">
          <InlineMarkdown text={para} />
        </motion.p>
      ))}
    </motion.div>
  )
}
