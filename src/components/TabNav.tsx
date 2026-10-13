'use client'

import { motion } from 'framer-motion'
import { PiBookOpenFill, PiFlaskFill, PiLaptopFill, PiUserCircleFill } from 'react-icons/pi'
import type { IconType } from 'react-icons'
import { ICON_COLOR, ICON_SIZE } from '@/components/icons'
import type { SectionKey } from '@/types'

export interface TabDefinition {
  key: SectionKey
  label: string
  hash: string
  icon: IconType
}

export const TABS: TabDefinition[] = [
  { key: 'about', label: 'about', hash: 'about', icon: PiUserCircleFill },
  { key: 'work', label: 'work', hash: 'work', icon: PiLaptopFill },
  { key: 'projects', label: 'projects', hash: 'projects', icon: PiFlaskFill },
  { key: 'bookshelf', label: 'digital bookshelf', hash: 'bookshelf', icon: PiBookOpenFill },
]

export const TAB_HASHES = Object.fromEntries(TABS.map((tab) => [tab.key, tab.hash])) as Record<SectionKey, string>

interface TabNavProps {
  activeKey: SectionKey
  onSelect: (key: SectionKey) => void
  onIntent?: (key: SectionKey) => void
}

export function TabBarNav({ activeKey, onSelect, onIntent }: TabNavProps) {
  return (
    <nav aria-label="Portfolio sections" className="flex items-center gap-0.5 rounded-full border-[0.5px] border-gray-200 bg-white p-0.5">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const active = activeKey === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            onPointerEnter={() => onIntent?.(tab.key)}
            onFocus={() => onIntent?.(tab.key)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            title={tab.label}
            className="relative flex h-7 w-7 items-center justify-center hover:cursor-pointer"
          >
            {active ? (
              <motion.span
                layoutId="tab-indicator-bar"
                className="absolute inset-0 rounded-full bg-gray-100"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            ) : null}
            <motion.span
              className={`relative z-10 inline-flex ${ICON_COLOR}`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon size={ICON_SIZE} />
            </motion.span>
          </button>
        )
      })}
    </nav>
  )
}
