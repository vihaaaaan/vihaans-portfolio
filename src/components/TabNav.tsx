'use client'

import { motion } from 'framer-motion'
import { PiBookOpenFill, PiFlaskFill, PiLaptopFill, PiUserCircleFill } from 'react-icons/pi'
import type { IconType } from 'react-icons'
import { ICON_COLOR, ICON_CONTROL_CLASS, ICON_TOOLTIP_CLASS, NAV_ICON_SIZE } from '@/components/icons'
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
    <nav aria-label="Portfolio sections" className="flex w-40 items-center justify-between rounded-full border-[0.5px] border-line bg-surface px-1.5 py-0.5">
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
            className={`${ICON_CONTROL_CLASS} hover:cursor-pointer`}
          >
            {active ? (
              <motion.span
                layoutId="tab-indicator-bar"
                className="absolute inset-0 rounded-full bg-surface-strong"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            ) : null}
            <motion.span
              className={`relative z-10 inline-flex ${ICON_COLOR}`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon size={NAV_ICON_SIZE} />
            </motion.span>
            <span aria-hidden="true" className={`${ICON_TOOLTIP_CLASS} bottom-full mb-2`}>
              {tab.label}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-tooltip" />
            </span>
          </button>
        )
      })}
    </nav>
  )
}
