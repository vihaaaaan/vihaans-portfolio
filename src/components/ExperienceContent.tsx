'use client'

import type { ExperienceContentProps, ExperienceBlockProps } from '@/types'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

function dateRange(e: ExperienceBlockProps) {
  const start = e.startDate?.toLowerCase() ?? ''
  const end = e.endDate ? e.endDate.toLowerCase() : e.isPresent ? 'present' : ''
  return end ? `${start} → ${end}` : start
}

const BRANDFETCH_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID

function brandfetchSrc(hostname: string, type: 'symbol' | 'logo') {
  // fallback and type must be path segments (not query params) or Brandfetch silently
  // falls back to its own defaults (type=icon, fallback=brandfetch's "B" mark).
  // fallback/404 makes a missing symbol 404 so onError below can advance to type/logo.
  return `https://cdn.brandfetch.io/${hostname}/w/64/h/64/fallback/404/type/${type}?c=${BRANDFETCH_ID}`
}

function logoSrc(hostname: string) {
  if (!hostname) return ''
  // Prefer Brandfetch (transparent square symbol) when a client id is set; otherwise fall back to logo.dev.
  if (BRANDFETCH_ID) return brandfetchSrc(hostname, 'symbol')
  return `https://img.logo.dev/${hostname}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_KEY}`
}

function WorkEntry({ e }: { e: ExperienceBlockProps }) {
  const [open, setOpen] = useState(false)
  const [triedLogoFallback, setTriedLogoFallback] = useState(false)
  const hostname = e.link ? new URL(e.link).hostname.replace(/^www\./, '') : ''
  const logoUrl = triedLogoFallback && BRANDFETCH_ID ? brandfetchSrc(hostname, 'logo') : logoSrc(hostname)
  const details = e.description ?? []
  const hasMore = details.length > 0 || (e.technologies?.length ?? 0) > 0

  return (
    <motion.div variants={itemVariants} className="py-1.5">
      <div
        className={`flex items-start gap-3 ${hasMore ? 'cursor-pointer group' : ''}`}
        onClick={hasMore ? () => setOpen((o) => !o) : undefined}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="h-5 w-auto max-w-8 flex-shrink-0 mt-0.5 object-contain"
            onError={(ev) => {
              if (BRANDFETCH_ID && !triedLogoFallback) {
                setTriedLogoFallback(true)
              } else {
                ev.currentTarget.style.visibility = 'hidden'
              }
            }}
          />
        )}
        <p className="flex-1 min-w-0 text-xs sm:text-sm font-sans text-gray-600 group-hover:text-gray-800 leading-relaxed transition-colors duration-200">
          <InlineMarkdown text={e.text ?? ''} />
          {hasMore && (
            <motion.span
              className="inline-block ml-1.5 text-gray-400 align-baseline"
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              ›
            </motion.span>
          )}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {open && hasMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.22, delay: 0.05 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22 }, opacity: { duration: 0.12 } } }}
            className="overflow-hidden ml-8 mt-2"
          >
            <div className="border-[0.5px] border-gray-300 bg-gray-50 shadow-sm rounded-md p-3 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-[11px] sm:text-xs font-sans text-gray-400">
                <span>{e.location && `📍 ${e.location.toLowerCase()}`}</span>
                <span>{dateRange(e)}</span>
              </div>
              {details.map((para, i) => (
                <p key={i} className="text-xs sm:text-sm font-sans text-gray-500 flex gap-1.5">
                  <span className="flex-shrink-0">↳</span>
                  <span>{para}</span>
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ExperienceContent({ current, prev }: ExperienceContentProps) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible" className="mt-3 lowercase">
      <motion.h3 variants={itemVariants} className="text-base sm:text-lg font-sans text-gray-900 mb-1">current</motion.h3>
      {current.map((e, i) => <WorkEntry key={i} e={e} />)}

      <motion.h3 variants={itemVariants} className="text-base sm:text-lg font-sans text-gray-900 mt-4 mb-1">prev</motion.h3>
      {prev.map((e, i) => <WorkEntry key={i} e={e} />)}
    </motion.div>
  )
}
