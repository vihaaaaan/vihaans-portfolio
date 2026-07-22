'use client'

import { ContentHeader } from '@/components/ContentHeader'
import { AboutContent } from '@/components/AboutContent'
import { ExperienceContent } from '@/components/ExperienceContent'
import { DigitalBookshelfContent } from '@/components/DigitalBookshelfContent'
import { ProjectsContent } from '@/components/ProjectsContent'
import type { ContentBoxProps } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 36, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease } },
  exit: (dir: number) => ({ x: dir * -36, opacity: 0, transition: { duration: 0.2, ease } }),
}

// Map tab keys to URL hash fragments
const TAB_HASHES: Record<string, string> = {
  about: 'about',
  work: 'work',
  projects: 'projects',
  digital_bookshelf: 'bookshelf',
}

export function ContentBox({ data, admin }: ContentBoxProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState(0)
  const directionRef = useRef(0)
  const currData = data[activeTab] ?? data[0]

  // After mount: sync to hash and listen for back/forward nav
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '')
      const idx = data.findIndex((t) => TAB_HASHES[t.key] === hash)
      if (idx >= 0 && idx !== activeTab) {
        directionRef.current = idx > activeTab ? 1 : -1
        setActiveTab(idx)
      }
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleActiveTabChange = (index: number) => {
    if (index === activeTab) return
    directionRef.current = index > activeTab ? 1 : -1
    setActiveTab(index)
    const hash = TAB_HASHES[data[index].key]
    router.push(`${pathname}#${hash}`, { scroll: false })
  }

  return (
    <div className="w-full flex flex-col">

      {/* Mobile tabs — Top */}
      <div className="sm:hidden flex-shrink-0 flex justify-center mb-4">
        <div className="flex items-center gap-0.5 rounded-full border-[0.5px] border-gray-200 bg-white px-1.5 py-1">
          {data.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleActiveTabChange(index)}
              className="relative w-9 h-9 flex items-center justify-center hover:cursor-pointer"
            >
              {activeTab === index && (
                <motion.div
                  layoutId="tab-indicator-mobile"
                  className="absolute inset-0 rounded-full bg-gray-100"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <motion.span
                className="inline-block text-base relative z-10"
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {tab.emoji}
              </motion.span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row sm:items-start min-w-0">
        <div className="flex-1 min-w-0 sm:mr-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
              key={activeTab}
              custom={directionRef.current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currData.key !== 'about' && (
                <ContentHeader sectionTitle={currData.label} sectionSubtitle={currData.subtitle} />
              )}
              {(() => {
                switch (currData.key) {
                  case 'about':
                    return <AboutContent bio={currData.content.bio} />
                  case 'work':
                    return <ExperienceContent current={currData.content.current} prev={currData.content.prev} />
                  case 'projects':
                    return <ProjectsContent items={currData.content.items} />
                  case 'digital_bookshelf':
                    return <DigitalBookshelfContent current={currData.content.current} future={currData.content.future} buckets={currData.content.buckets} admin={admin} />
                  default:
                    return null
                }
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop tabs — Right side */}
        <div className="hidden sm:flex flex-shrink-0 flex-col items-center gap-1 rounded-full border-[0.5px] border-gray-200 bg-white px-1.5 py-2">
          {data.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleActiveTabChange(index)}
              className="relative w-12 h-12 flex items-center justify-center group hover:cursor-pointer"
            >
              {activeTab === index && (
                <motion.div
                  layoutId="tab-indicator-desktop"
                  className="absolute inset-0 rounded-full bg-gray-100"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative inline-block z-10">
                <motion.span
                  className="inline-block text-xl"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {tab.emoji}
                </motion.span>
                <span className="
                  absolute right-full top-1/2 -translate-y-1/2 mr-3
                  bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-sm
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out
                  pointer-events-none whitespace-nowrap
                  before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2
                  before:border-4 before:border-transparent before:border-l-gray-800
                ">
                  {tab.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
