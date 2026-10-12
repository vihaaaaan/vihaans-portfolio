'use client'

import type { ExperienceContentProps, ExperienceBlockProps } from '@/types'
import { InlineMarkdown } from '@/components/InlineMarkdown'
import { useState } from 'react'

function dateRange(e: ExperienceBlockProps) {
  const start = e.startDate?.toLowerCase() ?? ''
  const end = e.endDate ? e.endDate.toLowerCase() : e.isPresent ? 'present' : ''
  return end ? `${start} → ${end}` : start
}

interface WorkEntryProps {
  e: ExperienceBlockProps
  isExpanded: boolean
  onToggle: () => void
}

function WorkEntry({ e, isExpanded, onToggle }: WorkEntryProps) {
  const details = e.description ?? []
  const hasMore = details.length > 0 || (e.technologies?.length ?? 0) > 0

  return (
    <div className="py-1.5">
      <div
        className={`flex w-full items-start gap-1 text-left ${hasMore ? 'group cursor-pointer' : ''}`}
        onClick={hasMore ? (event) => {
          if ((event.target as Element).closest('a, button')) return
          onToggle()
        } : undefined}
      >
        {hasMore ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-label={`toggle details for ${e.companyName || e.role}`}
            onClick={onToggle}
            className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600 transition-colors duration-150 group-hover:bg-gray-800" aria-hidden="true" />
          </button>
        ) : (
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          </span>
        )}
        <p className="min-w-0 flex-1 font-sans text-[11px] leading-relaxed text-gray-600 transition-colors duration-200 group-hover:text-gray-800 sm:text-xs">
          <InlineMarkdown text={e.text ?? ''} />
        </p>
      </div>

      {isExpanded && hasMore ? (
          <div className="section-enter ml-8 mt-2 overflow-hidden">
            <div className="border-[0.5px] border-gray-300 bg-gray-50 shadow-sm rounded-md p-3 flex flex-col gap-1.5">
              <span className="self-end font-sans text-[10px] text-gray-400 sm:text-[11px]">{dateRange(e)}</span>
              {details.map((para, i) => (
                <p key={i} className="flex gap-1.5 font-sans text-[11px] text-gray-500 sm:text-xs">
                  <span className="flex-shrink-0">↳</span>
                  <span>{para}</span>
                </p>
              ))}
              {e.location && (
                <span className="text-right font-sans text-[10px] text-gray-400 sm:text-[11px]">
                  📍 {e.location.toLowerCase()}
                </span>
              )}
            </div>
          </div>
      ) : null}
    </div>
  )
}

export function ExperienceContent({ current, prev }: ExperienceContentProps) {
  // One entry open at a time, matching the projects tab. The key is scoped by
  // section because indices repeat across the two lists — and keeping a single
  // key (rather than one per list) means opening something under "prev" closes
  // whatever was open under "current".
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const renderList = (items: ExperienceBlockProps[], section: string) =>
    items.map((e, i) => {
      const key = `${section}-${i}`
      return (
        <WorkEntry
          key={key}
          e={e}
          isExpanded={expandedKey === key}
          onToggle={() => setExpandedKey((open) => (open === key ? null : key))}
        />
      )
    })

  return (
    <div className="mt-2 lowercase">
      <h3 className="mb-1 font-serif text-sm text-gray-900 sm:text-base">current</h3>
      {renderList(current, 'current')}

      <h3 className="mb-1 mt-3 font-serif text-sm text-gray-900 sm:text-base">prev</h3>
      {renderList(prev, 'prev')}
    </div>
  )
}
