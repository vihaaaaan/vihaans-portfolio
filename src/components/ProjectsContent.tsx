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
      <div className="mx-auto mt-3 grid w-full max-w-[620px] grid-cols-1 gap-2 lowercase sm:grid-cols-2">
        {projects.map((project, index) => (
          <div
            key={`${project.name}-${index}`}
            className={projects.length % 2 === 1 && index === projects.length - 1 ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.25rem)]' : undefined}
          >
            <ProjectCard
              {...project}
              revealDelay={revealDelay(index)}
              onOpen={(images) => setSelected({ project, images })}
            />
          </div>
        ))}

        <div className="mt-6 sm:col-span-2">
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
