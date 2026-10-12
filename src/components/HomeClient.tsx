'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { RotatingQuote } from '@/components/RotatingQuote'
import { SectionViewport, preloadSectionModule } from '@/components/SectionViewport'
import { SocialLink } from '@/components/SocialLink'
import { TAB_HASHES, TABS, TabBarNav } from '@/components/TabNav'
import type { Profile, RemoteSectionKey, SectionKey } from '@/types'

const AdminLoginModal = dynamic(
  () => import('@/components/AdminLoginModal').then((module) => module.AdminLoginModal),
)

function sectionFromHash(): SectionKey {
  const hash = window.location.hash.slice(1)
  return TABS.find((tab) => tab.hash === hash)?.key ?? 'about'
}

export function HomeClient({ profile }: { profile: Profile }) {
  const [activeKey, setActiveKey] = useState<SectionKey>('about')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const syncHash = () => setActiveKey(sectionFromHash())
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
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

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 sm:px-6">
      <main className="flex flex-col pb-6 pt-16 sm:pb-8 sm:pt-20">
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-lg tracking-normal text-gray-900 sm:text-xl">{profile.headline}</h1>
            {profile.sublines?.length ? <RotatingQuote quotes={profile.sublines} /> : null}
          </div>

          <div className="flex-shrink-0">
            <TabBarNav activeKey={activeKey} onSelect={selectSection} onIntent={signalIntent} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <SectionViewport activeKey={activeKey} profile={profile} adminUnlocked={adminUnlocked} />
        </div>
      </main>

      <footer className="flex items-center space-x-3 pb-14">
        {profile.socials?.github ? <SocialLink icon={FaGithub} link={profile.socials.github} /> : null}
        {profile.socials?.linkedin ? <SocialLink icon={FaLinkedin} link={profile.socials.linkedin} /> : null}
        {profile.socials?.twitter ? <SocialLink icon={FaTwitter} link={profile.socials.twitter} /> : null}
      </footer>

      {showPasswordModal ? (
        <AdminLoginModal
          onAuthenticated={() => { setAdminUnlocked(true); setShowPasswordModal(false) }}
          onClose={() => setShowPasswordModal(false)}
        />
      ) : null}
    </div>
  )
}
