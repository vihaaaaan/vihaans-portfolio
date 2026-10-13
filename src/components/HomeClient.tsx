'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { RotatingQuote } from '@/components/RotatingQuote'
import { SectionViewport, preloadSectionModule } from '@/components/SectionViewport'
import { SocialLink } from '@/components/SocialLink'
import { TAB_HASHES, TABS, TabBarNav } from '@/components/TabNav'
import { loadItemVariants, loadTransition, LOAD_STAGGER, LOAD_Y } from '@/lib/motion'
import type { Profile, RemoteSectionKey, SectionKey } from '@/types'

const AdminLoginModal = dynamic(
  () => import('@/components/AdminLoginModal').then((module) => module.AdminLoginModal),
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: LOAD_STAGGER, delayChildren: 0.08 },
  },
}

function sectionFromHash(): SectionKey {
  const hash = window.location.hash.slice(1)
  return TABS.find((tab) => tab.hash === hash)?.key ?? 'about'
}

interface HomeClientProps {
  profile: Profile
  sectionHeadlines: Record<RemoteSectionKey, string>
}

export function HomeClient({ profile, sectionHeadlines }: HomeClientProps) {
  const [activeKey, setActiveKey] = useState<SectionKey>('about')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [footerReadyKey, setFooterReadyKey] = useState<SectionKey | null>(null)

  useLayoutEffect(() => {
    const syncHash = () => setActiveKey(sectionFromHash())
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      preloadSectionModule('work')
      preloadSectionModule('projects')
      preloadSectionModule('bookshelf')
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/session')
      .then((response) => response.json())
      .then((session) => {
        if (active) setAdminUnlocked(Boolean(session.authenticated))
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setSessionReady(true)
      })
    return () => { active = false }
  }, [])

  const handleEditHash = useCallback(async () => {
    if (!sessionReady || window.location.hash !== '#edit') return
    history.replaceState(null, '', window.location.pathname + window.location.search)
    if (adminUnlocked) {
      await fetch('/api/logout', { method: 'POST' })
      setAdminUnlocked(false)
    } else {
      setShowPasswordModal(true)
    }
  }, [adminUnlocked, sessionReady])

  useEffect(() => {
    void handleEditHash()
    window.addEventListener('hashchange', handleEditHash)
    return () => window.removeEventListener('hashchange', handleEditHash)
  }, [handleEditHash])

  const selectSection = (key: SectionKey) => {
    setActiveKey(key)
    history.pushState(null, '', `${window.location.pathname}${window.location.search}#${TAB_HASHES[key]}`)
  }

  const signalIntent = (key: SectionKey) => {
    if (key !== 'about') preloadSectionModule(key as RemoteSectionKey)
  }

  const handleSequenceComplete = useCallback((key: SectionKey) => {
    setFooterReadyKey(key)
  }, [])

  const activeHeadline = activeKey === 'about' ? profile.headline : sectionHeadlines[activeKey]

  return (
    <motion.div
      className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <main className="flex flex-col pb-6 pt-16 sm:pb-8 sm:pt-20">
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-3">
          <motion.div variants={loadItemVariants}>
            <motion.h1
              key={activeKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-lg lowercase tracking-normal text-gray-900 sm:text-xl"
            >
              {activeHeadline}
            </motion.h1>
            {activeKey === 'about' && profile.sublines?.length ? <RotatingQuote quotes={profile.sublines} /> : null}
          </motion.div>

          <motion.div variants={loadItemVariants} className="flex-shrink-0">
            <TabBarNav activeKey={activeKey} onSelect={selectSection} onIntent={signalIntent} />
          </motion.div>
        </div>

        <motion.div variants={loadItemVariants} className="min-w-0 flex-1">
          <SectionViewport
            activeKey={activeKey}
            profile={profile}
            adminUnlocked={adminUnlocked}
            onSequenceComplete={handleSequenceComplete}
          />
        </motion.div>
      </main>

      <motion.footer
        key={`footer-${activeKey}`}
        layout="position"
        initial={{ opacity: 0, y: LOAD_Y }}
        animate={footerReadyKey === activeKey ? { opacity: 1, y: 0 } : { opacity: 0, y: LOAD_Y }}
        transition={{
          ...loadTransition,
          layout: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        }}
        className="flex items-center space-x-3 pb-14"
      >
        {profile.socials?.github ? <SocialLink icon={FaGithub} link={profile.socials.github} /> : null}
        {profile.socials?.linkedin ? <SocialLink icon={FaLinkedin} link={profile.socials.linkedin} /> : null}
        {profile.socials?.twitter ? <SocialLink icon={FaTwitter} link={profile.socials.twitter} /> : null}
      </motion.footer>

      {showPasswordModal ? (
        <AdminLoginModal
          onAuthenticated={() => { setAdminUnlocked(true); setShowPasswordModal(false) }}
          onClose={() => setShowPasswordModal(false)}
        />
      ) : null}
    </motion.div>
  )
}
