'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

function formatContactLine(paragraph: string) {
  const contact = paragraph.match(/^reach out(?: at)? \[[^\]]+\]\((mailto:[^)]+)\)$/i)
  return contact ? `[Let's chat!](${contact[1]})` : paragraph
}

export function AboutContent({ bio }: { bio: string[] }) {
  return (
    <motion.div variants={loadListVariants} className="max-w-[62ch] space-y-5">
      {bio.map((paragraph, index) => (
        <motion.p key={index} variants={loadItemVariants} className="font-sans text-[11px] leading-[1.7] text-body sm:text-xs">
          <InlineMarkdown text={formatContactLine(paragraph)} />
        </motion.p>
      ))}
    </motion.div>
  )
}
