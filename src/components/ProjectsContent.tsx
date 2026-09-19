'use client'

import { ProjectCard } from '@/components/ProjectCard'
import { GitHubActivity } from '@/components/GitHubActivity'
import type { ProjectItemProps, ProjectsContentProps } from '@/types'
import { useState } from 'react'
import { motion } from 'framer-motion'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

export function ProjectsContent({ current, prev }: ProjectsContentProps) {
  // One card open at a time across both buckets, matching the work tab. Indices
  // repeat between the two lists, so the key is scoped by bucket — and keeping
  // a single key means opening something under "prev" closes whatever was open
  // under "current".
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const renderList = (items: ProjectItemProps[], bucket: string) => (
    <div className="flex flex-col gap-2">
      {items.map((project, i) => {
        const key = `${bucket}-${i}`
        return (
          <motion.div key={key} variants={itemVariants}>
            <ProjectCard
              {...project}
              isExpanded={expandedKey === key}
              onToggle={() => setExpandedKey((open) => (open === key ? null : key))}
            />
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <>
      <motion.div variants={listVariants} initial="hidden" animate="visible" className="mt-3 lowercase">
        {/* Headers are dropped when a bucket is empty — an empty "prev" reads as
            a missing section rather than an intentional one. */}
        {current.length > 0 && (
          <>
            <motion.h3 variants={itemVariants} className="text-lg sm:text-xl font-serif text-gray-900 mb-2">
              current
            </motion.h3>
            {renderList(current, 'current')}
          </>
        )}

        {prev.length > 0 && (
          <>
            <motion.h3
              variants={itemVariants}
              className={`text-lg sm:text-xl font-serif text-gray-900 mb-2 ${current.length > 0 ? 'mt-5' : ''}`}
            >
              prev
            </motion.h3>
            {renderList(prev, 'prev')}
          </>
        )}
      </motion.div>
      {/* Sits below the cards: the projects are the content, the calendar is
          evidence underneath them. Outside the list so the stagger above
          doesn't reach it. */}
      <GitHubActivity />
    </>
  )
}
