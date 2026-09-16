// GitHub's contribution calendar, without a token.
//
// The GraphQL API exposes this properly but requires a PAT, which would mean a
// secret to rotate for something that's already public on the profile page.
// Instead we read the same HTML fragment the profile page lazy-loads. It needs
// no auth and returns only the calendar, not the whole profile.
//
// The tradeoff: this is markup, not a contract, so it can change without
// notice. Everything below fails soft — a parse that finds no days returns an
// empty calendar and the UI renders nothing rather than breaking the tab.
const CONTRIBUTIONS_URL = (username: string) =>
  `https://github.com/users/${username}/contributions`

export interface ContributionDay {
  date: string
  /** GitHub's own 0-4 bucketing. Level, not count, drives the shading. */
  level: number
  count: number
}

export interface ContributionCalendar {
  days: ContributionDay[]
  total: number
}

const EMPTY: ContributionCalendar = { days: [], total: 0 }

// Each cell is a <td> carrying the date and level; the count lives in a
// separate <tool-tip for="<cell id>"> elsewhere in the document ("4
// contributions on September 28th." / "No contributions on ...").
const CELL = /<td[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g
const ID_IN_CELL = /\bid="([^"]+)"/
const LEVEL_IN_CELL = /\bdata-level="(\d+)"/
const TOOLTIP = /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g

function countsByCellId(html: string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const [, cellId, text] of html.matchAll(TOOLTIP)) {
    const match = text.match(/^([\d,]+) contribution/)
    counts.set(cellId, match ? Number(match[1].replace(/,/g, '')) : 0)
  }
  return counts
}

export function parseContributions(html: string): ContributionCalendar {
  const counts = countsByCellId(html)
  const days: ContributionDay[] = []

  for (const [cell, date] of html.matchAll(CELL)) {
    const id = cell.match(ID_IN_CELL)?.[1]
    days.push({
      date,
      level: Number(cell.match(LEVEL_IN_CELL)?.[1] ?? 0),
      count: (id && counts.get(id)) || 0,
    })
  }

  // The fragment emits cells row-major (all Sundays, then all Mondays, ...),
  // so they arrive out of order. The grid is rebuilt from dates at render time
  // and both callers want chronological.
  days.sort((a, b) => a.date.localeCompare(b.date))

  return { days, total: days.reduce((sum, d) => sum + d.count, 0) }
}

/**
 * The last year of contributions for `username`. Never throws: an unreachable
 * or unparseable response yields an empty calendar.
 */
export async function fetchContributions(username: string): Promise<ContributionCalendar> {
  try {
    const res = await fetch(CONTRIBUTIONS_URL(username), {
      headers: { 'User-Agent': 'vihaans-portfolio', Accept: 'text/html' },
      // Contributions change at most a few times a day; the profile page itself
      // is not more current than this.
      next: { revalidate: 3600 },
    })
    if (!res.ok) return EMPTY
    return parseContributions(await res.text())
  } catch {
    return EMPTY
  }
}
