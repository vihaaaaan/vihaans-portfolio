'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContributionCalendar, ContributionDay } from '@/lib/github'

// Grayscale, not GitHub green. The nav emoji and project emoji were both pulled
// for reading inconsistently against the serif/grayscale page; a block of green
// in the middle of the projects tab would be the loudest thing on the site.
const LEVEL_INK = [
  'bg-gray-100',
  'bg-gray-300',
  'bg-gray-500',
  'bg-gray-700',
  'bg-gray-900',
]

const CELL = 10 // px, square
const GAP = 3 // px, between cells and between weeks
const LABEL_ROW = 12 // px, clears the 10px month labels above the grid

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * Chronological days → columns of 7, one column per calendar week starting
 * Sunday. The first column is padded with nulls when the range opens mid-week,
 * so every row is the same weekday all the way across.
 */
function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return []

  const cells: (ContributionDay | null)[] = [
    ...Array(new Date(`${days[0].date}T00:00:00`).getDay()).fill(null),
    ...days,
  ]

  const weeks: (ContributionDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7)
    // Pad the trailing partial week too, so the last column isn't short.
    weeks.push([...week, ...Array(7 - week.length).fill(null)])
  }
  return weeks
}

/** Month name for a column, only on the column where that month first appears. */
function monthLabels(weeks: (ContributionDay | null)[][]): (string | null)[] {
  let previous = -1
  return weeks.map((week) => {
    const first = week.find((d): d is ContributionDay => d !== null)
    if (!first) return null
    const month = new Date(`${first.date}T00:00:00`).getMonth()
    if (month === previous) return null
    previous = month
    return MONTHS[month]
  })
}

function describe(day: ContributionDay): string {
  const count = day.count === 1 ? '1 contribution' : `${day.count} contributions`
  return `${count} on ${day.date}`
}

export function GitHubActivity() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/github-activity')
      .then((r) => r.json())
      .then(setCalendar)
      .catch(() => {})
  }, [])

  // The interesting end is the recent one, and at phone widths only ~15 of the
  // 53 weeks fit — so open on this week rather than a year ago.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [calendar])

  // Nothing to say if GitHub was unreachable or the markup moved: the section
  // simply isn't there, rather than showing an empty grid or an error.
  if (!calendar || calendar.days.length === 0) return null

  const weeks = toWeeks(calendar.days)
  const labels = monthLabels(weeks)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-4 border-[0.5px] border-gray-200 rounded-md bg-white p-3 sm:p-4"
      aria-label={`${calendar.total} GitHub contributions in the last year`}
    >
      <div ref={scroller} className="overflow-x-auto">
        <div className="inline-flex flex-col" style={{ gap: GAP }}>
          {/* Each label sits in its month's first week column but is wider than
              one cell, so it's taken out of flow — which means this row needs an
              explicit height or it collapses onto the grid below. */}
          <div className="flex" style={{ gap: GAP }}>
            {labels.map((label, i) => (
              <div key={i} className="relative" style={{ width: CELL, height: LABEL_ROW }}>
                {label && (
                  <span className="absolute left-0 top-0 text-[10px] leading-none font-sans text-gray-400 whitespace-nowrap">
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, d) => (
                  <div
                    key={d}
                    // Padding cells hold the grid's shape without reading as a
                    // zero-contribution day.
                    className={day ? `rounded-[2px] ${LEVEL_INK[day.level] ?? LEVEL_INK[0]}` : ''}
                    style={{ width: CELL, height: CELL }}
                    title={day ? describe(day) : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs sm:text-sm font-sans text-gray-500 lowercase">
        {calendar.total.toLocaleString()} contributions in the last year
      </p>
    </motion.section>
  )
}
