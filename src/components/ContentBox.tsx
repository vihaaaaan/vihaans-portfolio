'use client'

import { useEffect, useRef, useState } from 'react'
import { ContentHeader } from '@/components/ContentHeader'
import { AboutContent } from '@/components/AboutContent'
import { ExperienceContent } from '@/components/ExperienceContent'
import { DigitalBookshelfContent } from '@/components/DigitalBookshelfContent'
import { ProjectsContent } from '@/components/ProjectsContent'
import type { ContentBoxProps } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const slideVariants = {
  enter: (dir: number) => ({ x: dir * -36, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease } },
  exit: (dir: number) => ({ x: dir * 36, opacity: 0, transition: { duration: 0.2, ease } }),
}

// Nav (mobile bar / tablet & desktop rails) lives in HomeClient now, since its
// placement moves relative to the "hi, i'm ___" heading at different
// breakpoints. This just renders whichever tab's content is active.
export function ContentBox({ data, activeTab, direction, admin }: ContentBoxProps) {
  const currData = data[activeTab] ?? data[0]

  // Tabs vary a lot in height (a one-line bio vs. a 5-card project list), and
  // AnimatePresence swaps the DOM the instant the new tab mounts — with no
  // height animation of our own, that swap makes this box (and everything
  // below it, like the footer) snap to the new height instead of settling
  // into it. A ResizeObserver on the actual content tracks its true height
  // after each swap, and we animate the wrapper to follow it — a real height
  // tween, not a layout/transform trick, so text never stretches mid-animation.
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      className="min-w-0 overflow-hidden"
      animate={{ height }}
      transition={{ duration: 0.35, ease }}
    >
      <div ref={innerRef}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
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
    </motion.div>
  )
}
