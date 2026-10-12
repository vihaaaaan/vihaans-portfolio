'use client'

import dynamic from 'next/dynamic'
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

export function ProjectsContent({ current, prev }: ProjectsContentProps) {
  const [selected, setSelected] = useState<SelectedProject | null>(null)

  const renderSection = (
    title: string,
    items: ProjectItemProps[],
    bucket: string,
    featured = false,
  ) => (
    <section className={bucket === 'prev' && current.length > 0 ? 'mt-12' : ''}>
      <div className="mb-5 border-b border-gray-200 pb-1">
        <h3 className="font-serif text-sm text-gray-900 sm:text-base">{title}</h3>
      </div>

      <div className={featured && items.length === 1 ? 'mx-auto grid w-full max-w-sm grid-cols-1 gap-6' : 'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
        {items.map((project) => (
          <div key={`${bucket}-${project.name}`}>
            <ProjectCard
              {...project}
              featured={featured && items.length === 1}
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
        {current.length > 0 && renderSection('current', current, 'current', true)}
        {prev.length > 0 && renderSection('prev', prev, 'prev')}
      </div>

      <div className="mt-10 border-t border-gray-200 pt-5">
        <GitHubActivity />
      </div>

      {selected ? (
          <ProjectDetailsModal
            project={selected.project}
            images={selected.images}
            onClose={() => setSelected(null)}
          />
      ) : null}
    </>
  )
}
