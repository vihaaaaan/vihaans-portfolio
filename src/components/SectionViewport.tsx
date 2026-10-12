'use client'

import dynamic from 'next/dynamic'
import { AboutContent } from '@/components/AboutContent'
import { ContentHeader } from '@/components/ContentHeader'
import { preloadSection, useSection } from '@/hooks/useSection'
import type { BookshelfAdmin, Profile, RemoteSectionKey, SectionKey } from '@/types'

function ChunkLoading() {
  return <div className="h-24 animate-pulse bg-gray-100/70" aria-hidden="true" />
}

const ExperienceContent = dynamic(
  () => import('@/components/ExperienceContent').then((module) => module.ExperienceContent),
  { loading: ChunkLoading },
)

const ProjectsContent = dynamic(
  () => import('@/components/ProjectsContent').then((module) => module.ProjectsContent),
  { loading: ChunkLoading },
)

const DigitalBookshelfContent = dynamic(
  () => import('@/components/DigitalBookshelfContent').then((module) => module.DigitalBookshelfContent),
  { loading: ChunkLoading },
)

export function preloadSectionModule(key: RemoteSectionKey) {
  preloadSection(key)
  if (key === 'work') void import('@/components/ExperienceContent')
  if (key === 'projects') void import('@/components/ProjectsContent')
  if (key === 'bookshelf') void import('@/components/DigitalBookshelfContent')
}

function SectionLoading() {
  return (
    <div className="space-y-3 pt-2" role="status" aria-label="Loading section">
      <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
      <div className="h-20 animate-pulse rounded bg-gray-100" />
    </div>
  )
}

function LoadFailure() {
  return <p className="py-6 font-sans text-xs text-gray-400">this section could not be loaded.</p>
}

function WorkSection() {
  const section = useSection('work')
  if (section.status === 'loading') return <SectionLoading />
  if (section.status === 'error') return <LoadFailure />
  return (
    <div className="section-enter">
      <ContentHeader sectionTitle={section.data.title ?? 'work'} sectionSubtitle={section.data.subtitle ?? ''} />
      <ExperienceContent current={section.data.current ?? []} prev={section.data.prev ?? []} />
    </div>
  )
}

function ProjectsSection() {
  const section = useSection('projects')
  if (section.status === 'loading') return <SectionLoading />
  if (section.status === 'error') return <LoadFailure />
  return (
    <div className="section-enter">
      <ContentHeader sectionTitle={section.data.title ?? 'projects'} sectionSubtitle={section.data.subtitle ?? ''} />
      <ProjectsContent current={section.data.current ?? section.data.items ?? []} prev={section.data.prev ?? []} />
    </div>
  )
}

function BookshelfSection({ adminUnlocked }: { adminUnlocked: boolean }) {
  const section = useSection('bookshelf')
  if (section.status === 'loading') return <SectionLoading />
  if (section.status === 'error') return <LoadFailure />

  const updateBucket: BookshelfAdmin['updateBucket'] = async (bucketKey, books) => {
    const previous = section.data
    section.mutate((current) => ({ ...current, [bucketKey]: books }))
    const doc = { ...section.data, [bucketKey]: books }
    const response = await fetch('/api/section', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'bookshelf', doc }),
    })
    if (!response.ok) {
      section.mutate(() => previous)
      throw new Error('Unable to save bookshelf')
    }
  }

  return (
    <div className="section-enter">
      <ContentHeader sectionTitle={section.data.title ?? 'digital bookshelf'} sectionSubtitle={section.data.subtitle ?? ''} />
      <DigitalBookshelfContent
        current={section.data.current ?? []}
        future={section.data.future ?? []}
        buckets={section.data.buckets}
        admin={{ unlocked: adminUnlocked, updateBucket }}
      />
    </div>
  )
}

export function SectionViewport({ activeKey, profile, adminUnlocked }: {
  activeKey: SectionKey
  profile: Profile
  adminUnlocked: boolean
}) {
  if (activeKey === 'about') {
    return <div className="section-enter"><AboutContent bio={profile.bio ?? []} /></div>
  }
  if (activeKey === 'work') return <WorkSection />
  if (activeKey === 'projects') return <ProjectsSection />
  return <BookshelfSection adminUnlocked={adminUnlocked} />
}
