'use client'

import type { ExperienceBlockProps } from '@/types'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ExperienceBlock({ companyName, role, isInternship, isPresent, startDate, endDate, description, technologies, location, link }: ExperienceBlockProps) {
  const [showDescription, setShowDescription] = useState(false)
  const hostname = link ? new URL(link).hostname.replace(/^www\./, '') : ''

  return (
    <motion.div className="flex flex-col group pt-4">
      <div className="flex items-center cursor-pointer" onClick={() => setShowDescription(!showDescription)}>
        {link && (
          <img
            className="w-7 h-7 mr-4 rounded-sm flex-shrink-0"
            src={`https://img.logo.dev/${hostname}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_KEY}`}
            alt={`${companyName} logo`}
          />
        )}
        <div className="flex flex-col w-full">
          <div className="flex items-center">
            <h3 className="text-md text-gray-700 font-serif mr-2">{companyName.toLowerCase()}</h3>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3 text-gray-500 group-hover:text-gray-600 mr-2"
              animate={{ rotate: showDescription ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </motion.svg>
          </div>
          <h4 className="text-xs text-gray-500 group-hover:text-gray-600 font-sans flex items-center">
            <span className="whitespace-nowrap">{role.toLowerCase()} {isInternship && '• internship'}</span>
            <span className="hidden sm:flex flex-1 border-b border-dotted border-gray-400 h-1 mx-1"></span>
            <div className="hidden sm:flex items-center space-x-1">
              <span className="whitespace-nowrap">{startDate?.toLowerCase()}</span>
              <span>→</span>
              <span>{endDate ? endDate.toLowerCase() : isPresent ? 'present' : ''}</span>
            </div>
          </h4>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showDescription && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
                opacity: { duration: 0.24, delay: 0.06 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.24, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
                opacity: { duration: 0.14 },
              },
            }}
            className="overflow-hidden ml-11"
          >
            <div className="sm:hidden flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-xs text-gray-500 group-hover:text-gray-600">
                <span className="whitespace-nowrap">{startDate?.toLowerCase()}</span>
                <span>→</span>
                <span>{endDate ? endDate.toLowerCase() : isPresent ? 'present' : ''}</span>
              </div>
              <div className="sm:hidden text-xs text-gray-500 group-hover:text-gray-600">
                <div className="inline-block">
                  <span className="mr-1">📍</span>
                  <span className="font-serif italic text-xs">{location?.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="mt-1 mb-2 flex gap-2.5">
              <div className="w-[2px] flex-shrink-0 bg-gray-200 rounded-full" />
              <div className="flex flex-col gap-1.5">
                {description.map((para, i) => (
                  <p key={i} className="text-xs font-sans text-gray-500 group-hover:text-gray-600 flex gap-1">
                    <span className="flex-shrink-0">↳</span>
                    <span>{para}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 group-hover:text-gray-600">
                {technologies?.map((tech, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="inline-block rounded-sm shadow-sm bg-gray-100 px-1.5 py-0.5 font-sans"
                  >
                    <span className="font-sans text-[10px]">{tech.toLowerCase()}</span>
                  </motion.div>
                ))}
              </div>
              <div className="hidden sm:block text-xs text-gray-500 group-hover:text-gray-600 mb-2">
                <div className="inline-block">
                  <span className="mr-1">📍</span>
                  <span className="font-serif italic text-xs">{location?.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
