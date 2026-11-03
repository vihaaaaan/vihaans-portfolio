'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ContributionCalendar, ContributionDay } from '@/lib/github'
import { loadTransition, LOAD_Y } from '@/lib/motion'

// Grayscale, not GitHub green. The nav emoji and project emoji were both pulled
// for reading inconsistently against the serif/grayscale page; a block of green
// in the middle of the projects tab would be the loudest thing on the site.
// CSS variables keep the contribution scale legible in both color schemes.
const LEVEL_INK = [
  'var(--activity-0)',
  'var(--activity-1)',
  'var(--activity-2)',
  'var(--activity-3)',
  'var(--activity-4)',
]

// SVG user units, not pixels. The whole grid scales to whatever width the card
// gives it, so these set the grid's proportions — square cells, gaps that
// shrink with them — not its rendered size.
const CELL = 10
const GAP = 3
const STEP = CELL + GAP
const ROWS = 7

const DAYS_SHOWN = 365
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const GLOW_FADE_DELAY = 180

type GlowLevel = 'primary' | 'near' | 'soft'

const GLOW_FIELD: Array<[weekOffset: number, dayOffset: number, level: GlowLevel]> = [
  [0, 0, 'primary'],
  [-1, 0, 'near'],
  [1, 0, 'near'],
  [0, -1, 'near'],
  [0, 1, 'near'],
  [-1, -1, 'soft'],
  [-1, 1, 'soft'],
  [1, -1, 'soft'],
  [1, 1, 'soft'],
]

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

function GitHubActivityLoading() {
  return (
    <div className="min-h-24" role="status" aria-label="Loading GitHub contribution activity">
      <span className="sr-only">loading GitHub activity</span>
    </div>
  )
}

export function GitHubActivity({ revealDelay = 0 }: { revealDelay?: number }) {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [glowLevels, setGlowLevels] = useState<Record<string, GlowLevel>>({})
  const glowLevelsRef = useRef<Record<string, GlowLevel>>({})
  const glowTimersRef = useRef(new Map<string, number>())

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/github-activity', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`github activity failed (${r.status})`)
        return r.json()
      })
      .then((data) => {
        setCalendar(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  useEffect(() => () => {
    glowTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    glowTimersRef.current.clear()
  }, [])

  if (status === 'loading') return <GitHubActivityLoading />

  // Nothing to say if GitHub was unreachable or the markup moved: the section
  // simply isn't there, rather than showing an empty grid or an error.
  if (status === 'error' || !calendar || calendar.days.length === 0) return null

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

  const queueGlowFade = (key: string) => {
    if (glowTimersRef.current.has(key)) return

    const timer = window.setTimeout(() => {
      glowTimersRef.current.delete(key)
      const current = glowLevelsRef.current
      if (!(key in current)) return

      const next = { ...current }
      delete next[key]
      glowLevelsRef.current = next
      setGlowLevels(next)
    }, GLOW_FADE_DELAY)

    glowTimersRef.current.set(key, timer)
  }

  const showGlowField = (weekIndex: number, dayIndex: number) => {
    const active = new Map<string, GlowLevel>()

    GLOW_FIELD.forEach(([weekOffset, dayOffset, level]) => {
      const week = weekIndex + weekOffset
      const day = dayIndex + dayOffset
      if (!weeks[week]?.[day]) return
      active.set(`${week}-${day}`, level)
    })

    const current = glowLevelsRef.current
    Object.keys(current).forEach((key) => {
      if (!active.has(key)) queueGlowFade(key)
    })

    const next = { ...current }
    active.forEach((level, key) => {
      const timer = glowTimersRef.current.get(key)
      if (timer !== undefined) {
        window.clearTimeout(timer)
        glowTimersRef.current.delete(key)
      }
      next[key] = level
    })

    glowLevelsRef.current = next
    setGlowLevels(next)
  }

  const fadeGlowField = () => {
    Object.keys(glowLevelsRef.current).forEach(queueGlowFade)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: LOAD_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...loadTransition, delay: revealDelay }}
      className="group rounded-sm py-1 outline-none focus-visible:ring-1 focus-visible:ring-line"
      aria-label={`${total} GitHub contributions in the last year`}
      tabIndex={0}
    >
      {/* Labels stay HTML at a fixed size rather than scaling inside the SVG,
          where they'd be ~5px on a phone. Positioned as a percentage of the
          same track the columns below use, so they stay over their month. */}
      <div className="relative mb-1 h-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
        {labels.map((label, i) =>
          label ? (
            <span
              key={i}
              className="absolute top-0 font-sans text-[9px] leading-none text-subtle sm:text-[10px]"
              style={{ left: `${((i * STEP) / width) * 100}%` }}
            >
              {label}
            </span>
          ) : null
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Contribution calendar, ${total} contributions`}
        onPointerLeave={fadeGlowField}
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
                className="contribution-cell"
                data-glow={glowLevels[`${w}-${d}`]}
                fill={LEVEL_INK[day.level] ?? LEVEL_INK[0]}
                onPointerEnter={() => showGlowField(w, d)}
              >
                <title>{describe(day)}</title>
              </rect>
            ) : null
          )
        )}
      </svg>

      <p className="mt-1.5 font-sans text-[9px] lowercase text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 sm:text-[10px]">
        {total.toLocaleString()} contributions in the last year
      </p>
    </motion.section>
  )
}
