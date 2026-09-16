'use client'

import type { ExperienceContentProps, ExperienceBlockProps } from '@/types'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

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

function dateRange(e: ExperienceBlockProps) {
  const start = e.startDate?.toLowerCase() ?? ''
  const end = e.endDate ? e.endDate.toLowerCase() : e.isPresent ? 'present' : ''
  return end ? `${start} → ${end}` : start
}

interface WorkEntryProps {
  e: ExperienceBlockProps
  isExpanded: boolean
  onToggle: () => void
}

function WorkEntry({ e, isExpanded, onToggle }: WorkEntryProps) {
  const details = e.description ?? []
  const hasMore = details.length > 0 || (e.technologies?.length ?? 0) > 0

  return (
    <motion.div variants={itemVariants} className="py-1.5">
      <div
        className={`flex items-start gap-3 ${hasMore ? 'cursor-pointer group' : ''}`}
        onClick={hasMore ? onToggle : undefined}
      >
        <span
          className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gray-800 transition-colors duration-200"
          aria-hidden="true"
        />
        <p className="flex-1 min-w-0 text-xs sm:text-sm font-sans text-gray-600 group-hover:text-gray-800 leading-relaxed transition-colors duration-200">
          <InlineMarkdown text={e.text ?? ''} />
        </p>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.22, delay: 0.05 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22 }, opacity: { duration: 0.12 } } }}
            className="overflow-hidden ml-8 mt-2"
          >
            <div className="border-[0.5px] border-gray-300 bg-gray-50 shadow-sm rounded-md p-3 flex flex-col gap-1.5">
              <span className="self-end text-[11px] sm:text-xs font-sans text-gray-400">{dateRange(e)}</span>
              {details.map((para, i) => (
                <p key={i} className="text-xs sm:text-sm font-sans text-gray-500 flex gap-1.5">
                  <span className="flex-shrink-0">↳</span>
                  <span>{para}</span>
                </p>
              ))}
              {e.location && (
                <span className="text-[11px] sm:text-xs font-sans text-gray-400 text-right">
                  📍 {e.location.toLowerCase()}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ExperienceContent({ current, prev }: ExperienceContentProps) {
  // One entry open at a time, matching the projects tab. The key is scoped by
  // section because indices repeat across the two lists — and keeping a single
  // key (rather than one per list) means opening something under "prev" closes
  // whatever was open under "current".
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const renderList = (items: ExperienceBlockProps[], section: string) =>
    items.map((e, i) => {
      const key = `${section}-${i}`
      return (
        <WorkEntry
          key={key}
          e={e}
          isExpanded={expandedKey === key}
          onToggle={() => setExpandedKey((open) => (open === key ? null : key))}
        />
      )
    })

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible" className="mt-3 lowercase">
      <motion.h3 variants={itemVariants} className="text-lg sm:text-xl font-serif text-gray-900 mb-1">current</motion.h3>
      {renderList(current, 'current')}

      <motion.h3 variants={itemVariants} className="text-lg sm:text-xl font-serif text-gray-900 mt-4 mb-1">prev</motion.h3>
      {renderList(prev, 'prev')}
    </motion.div>
  )
}
