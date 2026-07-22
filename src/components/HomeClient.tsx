'use client'

import { ContentBox } from '@/components/ContentBox'
import { RotatingQuote } from '@/components/RotatingQuote'
import { SocialLink } from '@/components/SocialLink'
import { FaGithub, FaLinkedin, FaTwitter, FaLock, FaLockOpen } from 'react-icons/fa'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookshelfImagesContext } from '@/context/BookshelfImagesContext'
import type { BookItemProps } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

interface Profile {
  headline: string
  sublines?: Array<{ quote: string; author: string }>
  bio: string[]
  location: string
  socials: { github?: string; linkedin?: string; twitter?: string }
  aboutEmoji?: string
  illustration?: string
}

interface DataShape {
  profile: Profile
  tabs: Array<any>
}

interface Props {
  data: DataShape
  isAdmin: boolean
}

export function HomeClient({ data: initialData, isAdmin }: Props) {
  const [data, setData] = useState<DataShape>(initialData)
  const [adminUnlocked, setAdminUnlocked] = useState(isAdmin)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const { profile } = data

  // Cover URLs are stored on each item now — build the lookup map directly (no live fetching).
  const bookshelfTab = data.tabs.find((t: any) => t.key === 'digital_bookshelf')
  const bookshelfItems = [
    ...(bookshelfTab?.content?.current ?? []),
    ...(bookshelfTab?.content?.future ?? []),
  ]
  const coverImages: Record<string, string> = {}
  for (const it of bookshelfItems) {
    if (it.coverUrl) coverImages[it.title] = it.coverUrl
  }

  const aboutTab = { key: 'about', label: 'about', emoji: profile.aboutEmoji ?? '👋', subtitle: '', content: { bio: profile.bio } }
  const tabs = [aboutTab, ...data.tabs]

  // Persist an updated bookshelf bucket (current | future) to its section document.
  const updateBucket = async (bucketKey: 'current' | 'future', books: BookItemProps[]) => {
    const newTabs = data.tabs.map((t: any) =>
      t.key === 'digital_bookshelf'
        ? { ...t, content: { ...t.content, [bucketKey]: books } }
        : t
    )
    setData({ ...data, tabs: newTabs })
    const bs = newTabs.find((t: any) => t.key === 'digital_bookshelf')
    await fetch('/api/section', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'bookshelf',
        doc: { title: bs.label, emoji: bs.emoji, subtitle: bs.subtitle, buckets: bs.content.buckets, current: bs.content.current, future: bs.content.future },
      }),
    })
  }

  const handleLogin = async () => {
    setAuthLoading(true)
    setAuthError(false)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setAuthLoading(false)
    if (res.ok) {
      setAdminUnlocked(true)
      setShowPasswordModal(false)
      setPassword('')
    } else {
      setAuthError(true)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setAdminUnlocked(false)
  }

  return (
    <BookshelfImagesContext.Provider value={coverImages}>
      <motion.div
        className="min-h-screen max-w-2xl mx-auto px-6 sm:px-8 md:px-8 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex-1 flex flex-col pt-20 sm:pt-28 pb-8 sm:pb-10">
          <div className="flex items-center justify-between mb-4 gap-4">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-gray-900">
                {profile.headline}
              </h1>
              {profile.sublines && profile.sublines.length > 0 && (
                <RotatingQuote quotes={profile.sublines} />
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.06, rotate: 1.5 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              >
                <Image
                  src={profile.illustration ?? '/assets/vihaan_illustration.png'}
                  alt="vihaan illustration"
                  width={140}
                  height={140}
                  className="mr-4 w-16 h-16 sm:w-24 sm:h-24 md:w-[140px] md:h-[140px]"
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex-1">
            <ContentBox data={tabs} admin={{ unlocked: adminUnlocked, updateBucket }} />
          </motion.div>
        </div>

        <motion.footer variants={itemVariants} className="pb-20 flex items-center space-x-4">
          {profile.socials?.github && <SocialLink icon={FaGithub} link={profile.socials.github} />}
          {profile.socials?.linkedin && <SocialLink icon={FaLinkedin} link={profile.socials.linkedin} />}
          {profile.socials?.twitter && <SocialLink icon={FaTwitter} link={profile.socials.twitter} />}
          <button
            onClick={() => (adminUnlocked ? handleLogout() : setShowPasswordModal(true))}
            className="ml-auto text-gray-300 hover:text-gray-500 transition-colors duration-200 cursor-pointer"
            title={adminUnlocked ? 'exit edit mode' : 'unlock edit mode'}
            aria-label={adminUnlocked ? 'exit edit mode' : 'unlock edit mode'}
          >
            {adminUnlocked ? <FaLockOpen size={13} /> : <FaLock size={13} />}
          </button>
        </motion.footer>
      </motion.div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowPasswordModal(false)} />
            <motion.div
              className="relative bg-white border border-gray-200 shadow-xl p-6 w-full max-w-xs flex flex-col gap-3"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-base font-serif text-gray-700">enter password</h2>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && password) handleLogin() }}
                placeholder="password"
                className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200"
              />
              {authError && <p className="text-[11px] font-sans text-red-400 -mt-1">incorrect password</p>}
              <button
                onClick={handleLogin}
                disabled={authLoading || !password}
                className="text-sm font-sans bg-gray-800 text-white py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                {authLoading ? 'unlocking…' : 'unlock'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookshelfImagesContext.Provider>
  )
}
