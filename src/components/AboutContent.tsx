'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

export function AboutContent({ bio }: { bio: string[] }) {
  return (
    <motion.div variants={loadListVariants} className="max-w-[65ch] space-y-5">
      {bio.map((paragraph, index) => (
        <motion.p key={index} variants={loadItemVariants} className="font-sans text-[11px] leading-[1.7] text-body sm:text-xs">
          <InlineMarkdown text={paragraph} />
        </motion.p>
      ))}
    </motion.div>
  )
}
