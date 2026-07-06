'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

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

// Render inline markdown links: [text](url) -> anchor. Everything else stays plain text.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const [, label, href] = m
    const isMail = href.startsWith('mailto:')
    nodes.push(
      <a
        key={key++}
        href={href}
        {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className="font-serif italic hover:text-gray-800 underline decoration-dotted"
      >
        {label}
      </a>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

interface AboutContentProps {
  bio: string[]
}

export function AboutContent({ bio }: AboutContentProps) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-5">
      {bio.map((para, i) => (
        <motion.p key={i} variants={itemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
          {renderInline(para)}
        </motion.p>
      ))}
    </motion.div>
  )
}
