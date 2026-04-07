'use client'

import { ProjectCard } from '@/components/ProjectCard'
import type { ProjectsContentProps } from '@/types'
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

export function ProjectsContent({ items }: ProjectsContentProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <motion.div
      className="flex flex-col gap-2 mt-4"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((project, index) => (
        <motion.div key={index} variants={itemVariants}>
          <ProjectCard
            {...project}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
