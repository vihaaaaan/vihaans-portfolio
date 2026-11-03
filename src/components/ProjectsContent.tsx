'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { ProjectCard } from '@/components/ProjectCard'
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
  const projects = [...current, ...prev]

  return (
    <>
      <div className="mt-2 grid grid-cols-1 gap-6 lowercase sm:grid-cols-2">
        {projects.map((project, index) => (
          <div key={`${project.name}-${index}`} className={index === 0 ? 'sm:col-span-2' : undefined}>
            <ProjectCard
              {...project}
              featured={index === 0}
              revealDelay={revealDelay(index)}
              onOpen={(images) => setSelected({ project, images })}
            />
          </div>
        ))}

        <div className="mt-4 sm:col-span-2">
          <GitHubActivity revealDelay={revealDelay(projects.length)} />
        </div>
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
