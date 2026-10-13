'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

export function AboutContent({ bio }: { bio: string[] }) {
  return (
    <motion.div variants={loadListVariants} className="space-y-4">
      {bio.map((paragraph, index) => (
        <motion.p key={index} variants={loadItemVariants} className="font-sans text-[11px] leading-relaxed text-gray-600 sm:text-xs">
          <InlineMarkdown text={paragraph} />
        </motion.p>
      ))}
    </motion.div>
  )
}
