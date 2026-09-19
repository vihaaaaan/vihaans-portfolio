'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContributionCalendar, ContributionDay } from '@/lib/github'

// Grayscale, not GitHub green. The nav emoji and project emoji were both pulled
// for reading inconsistently against the serif/grayscale page; a block of green
// in the middle of the projects tab would be the loudest thing on the site.
// Hex rather than Tailwind classes because these are SVG fills — gray-100, 300,
// 500, 700, 900.
const LEVEL_INK = ['#f3f4f6', '#d1d5db', '#6b7280', '#374151', '#111827']

// SVG user units, not pixels. The whole grid scales to whatever width the card
// gives it, so these set the grid's proportions — square cells, gaps that
// shrink with them — not its rendered size.
const CELL = 10
const GAP = 3
const STEP = CELL + GAP
const ROWS = 7

const DAYS_SHOWN = 365

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
  for (let i = 0; i < cells.length; i += ROWS) {
    const week = cells.slice(i, i + ROWS)
    weeks.push([...week, ...Array(ROWS - week.length).fill(null)])
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

  useEffect(() => {
    fetch('/api/github-activity')
      .then((r) => r.json())
      .then(setCalendar)
      .catch(() => {})
  }, [])

  // Nothing to say if GitHub was unreachable or the markup moved: the section
  // simply isn't there, rather than showing an empty grid or an error.
  if (!calendar || calendar.days.length === 0) return null

  // GitHub returns a few days more than a year — enough to open on a partial
  // week of the previous September and label it twice at both ends.
  const days = calendar.days.slice(-DAYS_SHOWN)
  const weeks = toWeeks(days)
  const labels = monthLabels(weeks)
  const total = days.reduce((sum, d) => sum + d.count, 0)

  // The viewBox is the grid's own coordinate space; `width: 100%` with no
  // height then scales the whole thing to the card. That's what keeps a full
  // year on screen at every width instead of scrolling — the squares get
  // smaller on a phone, which is the tradeoff for never hiding half the year.
  const width = weeks.length * STEP - GAP
  const height = ROWS * STEP - GAP

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-4 border-[0.5px] border-gray-200 rounded-md bg-white p-3 sm:p-4"
      aria-label={`${total} GitHub contributions in the last year`}
    >
      {/* Labels stay HTML at a fixed size rather than scaling inside the SVG,
          where they'd be ~5px on a phone. Positioned as a percentage of the
          same track the columns below use, so they stay over their month. */}
      <div className="relative h-3 mb-1">
        {labels.map((label, i) =>
          label ? (
            <span
              key={i}
              className="absolute top-0 text-[10px] leading-none font-sans text-gray-400"
              style={{ left: `${((i * STEP) / width) * 100}%` }}
            >
              {label}
            </span>
          ) : null
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        role="img"
        aria-label={`Contribution calendar, ${total} contributions`}
      >
        {weeks.map((week, w) =>
          week.map((day, d) =>
            day ? (
              <rect
                key={`${w}-${d}`}
                x={w * STEP}
                y={d * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={LEVEL_INK[day.level] ?? LEVEL_INK[0]}
              >
                <title>{describe(day)}</title>
              </rect>
            ) : null
          )
        )}
      </svg>

      <p className="mt-3 text-xs sm:text-sm font-sans text-gray-500 lowercase">
        {total.toLocaleString()} contributions in the last year
      </p>
    </motion.section>
  )
}
