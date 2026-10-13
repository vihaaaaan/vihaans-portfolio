'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { AboutContent } from '@/components/AboutContent'
import { preloadSection, useSection } from '@/hooks/useSection'
import { LOAD_EASE, LOAD_STAGGER } from '@/lib/motion'
import type { BookshelfAdmin, Profile, RemoteSectionKey, SectionKey } from '@/types'

const tabVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: LOAD_STAGGER } },
  exit: { y: -6, opacity: 0, transition: { duration: 0.24, ease: LOAD_EASE } },
}

function ChunkLoading() {
  return <div className="min-h-24" aria-hidden="true" />
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
    <div className="min-h-24" role="status" aria-label="Loading section">
      <span className="sr-only">loading section</span>
    </div>
  )
}

function LoadFailure() {
  return <p className="py-6 font-sans text-xs text-gray-400">this section could not be loaded.</p>
}

function useSequenceComplete(
  key: SectionKey,
  ready: boolean,
  delay: number,
  onComplete: (key: SectionKey) => void,
) {
  useEffect(() => {
    if (!ready) return
    const timeout = window.setTimeout(() => onComplete(key), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, key, onComplete, ready])
}

function AboutSection({ bio, onComplete }: {
  bio: string[]
  onComplete: (key: SectionKey) => void
}) {
  useSequenceComplete('about', true, 760 + Math.max(0, bio.length - 1) * 90, onComplete)
  return <AboutContent bio={bio} />
}

function WorkSection({ onComplete }: { onComplete: (key: SectionKey) => void }) {
  const section = useSection('work')
  const itemCount = section.status === 'ready'
    ? (section.data.current?.length ?? 0) + (section.data.prev?.length ?? 0)
    : 0
  useSequenceComplete('work', section.status !== 'loading', section.status === 'ready'
    ? 760 + (itemCount + 1) * 90
    : 200, onComplete)
  if (section.status === 'loading') return <SectionLoading />
  if (section.status === 'error') return <LoadFailure />
  return (
    <ExperienceContent current={section.data.current ?? []} prev={section.data.prev ?? []} />
  )
}

function ProjectsSection({ onComplete }: { onComplete: (key: SectionKey) => void }) {
  const section = useSection('projects')
  const itemCount = section.status === 'ready'
    ? (section.data.current?.length ?? section.data.items?.length ?? 0) + (section.data.prev?.length ?? 0)
    : 0
  useSequenceComplete('projects', section.status !== 'loading', section.status === 'ready'
    ? 900 + (itemCount + 4) * 160
    : 200, onComplete)
  if (section.status === 'loading') return <SectionLoading />
  if (section.status === 'error') return <LoadFailure />
  return (
    <ProjectsContent current={section.data.current ?? section.data.items ?? []} prev={section.data.prev ?? []} />
  )
}

function BookshelfSection({ adminUnlocked, onComplete }: {
  adminUnlocked: boolean
  onComplete: (key: SectionKey) => void
}) {
  const section = useSection('bookshelf')
  const rowCount = section.status === 'ready'
    ? Math.ceil((section.data.current?.length ?? 0) / 2) + Math.ceil((section.data.future?.length ?? 0) / 2)
    : 0
  useSequenceComplete('bookshelf', section.status !== 'loading', section.status === 'ready'
    ? 700 + (rowCount + 2) * 140
    : 200, onComplete)
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
    <DigitalBookshelfContent
      current={section.data.current ?? []}
      future={section.data.future ?? []}
      buckets={section.data.buckets}
      admin={{ unlocked: adminUnlocked, updateBucket }}
    />
  )
}

export function SectionViewport({ activeKey, profile, adminUnlocked, onSequenceComplete }: {
  activeKey: SectionKey
  profile: Profile
  adminUnlocked: boolean
  onSequenceComplete: (key: SectionKey) => void
}) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={activeKey}
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {activeKey === 'about' ? <AboutSection bio={profile.bio ?? []} onComplete={onSequenceComplete} /> : null}
        {activeKey === 'work' ? <WorkSection onComplete={onSequenceComplete} /> : null}
        {activeKey === 'projects' ? <ProjectsSection onComplete={onSequenceComplete} /> : null}
        {activeKey === 'bookshelf' ? (
          <BookshelfSection adminUnlocked={adminUnlocked} onComplete={onSequenceComplete} />
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}
