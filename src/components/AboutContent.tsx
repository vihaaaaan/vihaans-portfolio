'use client'

import { motion } from 'framer-motion'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { loadItemVariants, loadListVariants } from '@/lib/motion'

const CONTACT_LINE = /^reach out(?: at)? \[[^\]]+\]\((mailto:[^)]+)\)$/i
const FREE_TIME_LINE = /^in my free time,/i
const DOUBLE_DASH = /\s*--\s*/g

function formatBioParagraph(paragraph: string) {
  const contact = paragraph.match(CONTACT_LINE)
  if (contact) {
    return `[Are we just going to keep playing Eye Tag, baby girl?](${contact[1]})`
  }

  if (FREE_TIME_LINE.test(paragraph)) {
    return 'In my free time, you can find me reading comics.'
  }

  return paragraph.replace(DOUBLE_DASH, ' — ')
}

export function AboutContent({ bio }: { bio: string[] }) {
  return (
    <motion.div variants={loadListVariants} className="space-y-5">
      {bio.map((paragraph, index) => (
        <motion.p key={index} variants={loadItemVariants} className="font-sans text-[11px] leading-[1.7] text-body sm:text-xs">
          <InlineMarkdown text={formatBioParagraph(paragraph)} />
        </motion.p>
      ))}
    </motion.div>
  )
}
