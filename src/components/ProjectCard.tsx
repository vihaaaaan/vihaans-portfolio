'use client'

import type { ProjectItemProps } from '@/types'
import { useState, useEffect } from 'react'
import { ProjectImageCarousel } from '@/components/ProjectImageCarousel'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectCardProps extends ProjectItemProps {
  isExpanded: boolean
  onToggle: () => void
}

const badgeContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}

const badgeVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

export function ProjectCard({ name, emoji, blurb, description, technologies, containsImages, links, status, isExpanded, onToggle }: ProjectCardProps) {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (!containsImages) return
    fetch(`/api/project-images?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .catch(() => {})
  }, [containsImages, name])

  return (
    <motion.div
      className={
        'rounded-lg border overflow-hidden cursor-pointer ' +
        (isExpanded ? 'border-gray-300 bg-gray-50 shadow-sm' : 'border-gray-200 bg-white')
      }
      animate={{ borderColor: isExpanded ? '#d1d5db' : '#e5e7eb' }}
      whileHover={!isExpanded ? { boxShadow: '0 1px 6px rgba(0,0,0,0.08)', borderColor: '#d1d5db' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <h3 className="text-md text-gray-700 font-serif whitespace-nowrap">{name.toLowerCase()}</h3>
          </div>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-3 h-3 text-gray-400 flex-shrink-0"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </motion.svg>
          <span className="hidden sm:inline text-[11px] font-sans text-gray-400 truncate">
            {blurb.toLowerCase()}
          </span>
        </div>
        <span className="text-[10px] font-sans text-gray-400 whitespace-nowrap ml-2">
          {status.toLowerCase()}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
                opacity: { duration: 0.25, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.25, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
                opacity: { duration: 0.15 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4" onClick={(e) => e.stopPropagation()}>
              {containsImages && images.length > 0 && (
                <ProjectImageCarousel images={images} projectName={name} />
              )}
              <div className="mb-3 flex flex-col gap-1.5">
                {description.map((para, i) => (
                  <p key={i} className="text-xs font-sans text-gray-500">{para}</p>
                ))}
              </div>
              <motion.div
                className="flex flex-wrap gap-1.5 mb-3"
                variants={badgeContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    variants={badgeVariants}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="inline-block rounded-sm shadow-sm bg-gray-100 px-1.5 py-0.5"
                  >
                    <span className="font-sans text-[10px] text-gray-500">{tech.toLowerCase()}</span>
                  </motion.div>
                ))}
              </motion.div>
              <div className="flex flex-wrap gap-2">
                {links.map(([linkName, linkUrl], index) => (
                  <a
                    key={index}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-sans text-gray-500 hover:text-gray-700 underline decoration-dotted transition-colors duration-200"
                  >
                    {linkName.toLowerCase()}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
