'use client'

import { motion } from 'framer-motion'
import { PiUserCircleFill, PiLaptopFill, PiFlaskFill, PiBookOpenFill } from 'react-icons/pi'
import type { IconType } from 'react-icons'

// Icon stand-ins for the nav tabs — swapped in for the old per-tab emoji, which
// read as colorful/inconsistent against the rest of the serif+grayscale look.
// (Heroicons outline felt too thin/sterile; Heroicons solid's rocket for
// "projects" didn't land either — Phosphor's rounder filled set + a flask
// (ties to the section's "products and experiments" subtitle) instead.)
export const TAB_ICONS: Record<string, IconType> = {
  about: PiUserCircleFill,
  work: PiLaptopFill,
  projects: PiFlaskFill,
  digital_bookshelf: PiBookOpenFill,
}

// Map tab keys to URL hash fragments
export const TAB_HASHES: Record<string, string> = {
  about: 'about',
  work: 'work',
  projects: 'projects',
  digital_bookshelf: 'bookshelf',
}

interface TabNavProps {
  data: Array<{ key: string; label: string }>
  activeTab: number
  onSelect: (index: number) => void
}

// Compact horizontal pill — phone widths, sits above the "hi, i'm ___" heading.
export function TabBarNav({ data, activeTab, onSelect }: TabNavProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border-[0.5px] border-gray-200 bg-white px-1.5 py-1">
      {data.map((tab, index) => {
        const Icon = TAB_ICONS[tab.key]
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="relative w-9 h-9 flex items-center justify-center hover:cursor-pointer"
          >
            {activeTab === index && (
              <motion.div
                layoutId="tab-indicator-bar"
                className="absolute inset-0 rounded-full bg-gray-100"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <motion.span
              className={`inline-flex relative z-10 ${activeTab === index ? 'text-gray-900' : 'text-gray-500'}`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {Icon && <Icon size={17} />}
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}

interface TabRailNavProps extends TabNavProps {
  // Distinct per rendered instance — two rail instances can be mounted at once
  // (one hidden via CSS at any given viewport), so they can't share a layoutId.
  layoutId: string
  // Which side the hover tooltip opens toward, so it doesn't run off-screen.
  tooltipSide?: 'left' | 'right'
}

// Vertical stacked pill — used inline next to the heading at tablet widths,
// and as the outside-left rail at desktop widths.
export function TabRailNav({ data, activeTab, onSelect, layoutId, tooltipSide = 'right' }: TabRailNavProps) {
  const tooltipPositionClass =
    tooltipSide === 'right'
      ? "left-full ml-3 before:right-full before:border-r-gray-800"
      : "right-full mr-3 before:left-full before:border-l-gray-800"

  return (
    <div className="flex flex-col items-center gap-1 rounded-full border-[0.5px] border-gray-200 bg-white px-1.5 py-2">
      {data.map((tab, index) => {
        const Icon = TAB_ICONS[tab.key]
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="relative w-12 h-12 flex items-center justify-center group hover:cursor-pointer"
          >
            {activeTab === index && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gray-100"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative inline-block z-10">
              <motion.span
                className={`inline-flex ${activeTab === index ? 'text-gray-900' : 'text-gray-500'} group-hover:text-gray-800 transition-colors duration-200`}
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {Icon && <Icon size={21} />}
              </motion.span>
              <span
                className={`
                  absolute top-1/2 -translate-y-1/2
                  bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-sm
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out
                  pointer-events-none whitespace-nowrap
                  before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2
                  before:border-4 before:border-transparent
                  ${tooltipPositionClass}
                `}
              >
                {tab.label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
