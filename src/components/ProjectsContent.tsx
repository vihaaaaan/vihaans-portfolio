'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { ProjectCard } from '@/components/ProjectCard'
import { LOAD_EASE } from '@/lib/motion'
import type { ProjectItemProps, ProjectsContentProps } from '@/types'
import { useState } from 'react'

const GitHubActivity = dynamic(
  () => import('@/components/GitHubActivity').then((module) => module.GitHubActivity),
)

const ProjectDetailsModal = dynamic(
  () => import('@/components/ProjectDetailsModal').then((module) => module.ProjectDetailsModal),
)

interface SelectedProject {
  project: ProjectItemProps
  images: string[]
}

function revealDelay(order: number) {
  return 0.12 + order * 0.16
}

export function ProjectsContent({ current, prev }: ProjectsContentProps) {
  const [selected, setSelected] = useState<SelectedProject | null>(null)

  const renderSection = (
    title: string,
    items: ProjectItemProps[],
    bucket: string,
    headerOrder: number,
    firstCardOrder: number,
    featured = false,
  ) => (
    <section className={bucket === 'prev' && current.length > 0 ? 'mt-12' : ''}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: revealDelay(headerOrder), ease: LOAD_EASE }}
        className="mb-5 border-b border-gray-200 pb-1"
      >
        <h3 className="font-sans text-sm text-gray-900 sm:text-base">{title}</h3>
      </motion.div>

      <div className={featured && items.length === 1 ? 'mx-auto grid w-full max-w-sm grid-cols-1 gap-6' : 'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
        {items.map((project, index) => (
          <div key={`${bucket}-${project.name}`}>
            <ProjectCard
              {...project}
              featured={featured && items.length === 1}
              revealDelay={revealDelay(firstCardOrder + index)}
              onOpen={(images) => setSelected({ project, images })}
            />
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <>
      <div className="mt-2 lowercase">
        {current.length > 0 ? renderSection('current', current, 'current', 0, 1, true) : null}
        {prev.length > 0 ? renderSection(
          'prev',
          prev,
          'prev',
          current.length + 1,
          current.length + 2,
        ) : null}
      </div>

      <div className="mt-10 border-t border-gray-200 pt-5">
        <GitHubActivity revealDelay={revealDelay(current.length + prev.length + 3)} />
      </div>

      <AnimatePresence>
        {selected ? (
          <ProjectDetailsModal
            project={selected.project}
            images={selected.images}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
