import { XMLParser } from 'fast-xml-parser'
import type { BookItemProps } from '@/types'

// Letterboxd exposes read-only RSS feeds per user — no API key/approval needed.
// Diary = recently watched (→ bookshelf "current"), watchlist = queued (→ "future").
const DIARY_FEED = (username: string) => `https://letterboxd.com/${username}/rss/`
const WATCHLIST_FEED = (username: string) => `https://letterboxd.com/${username}/watchlist/rss/`

const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata' })

interface RssItem {
  title?: string
  'letterboxd:filmTitle'?: string
  'letterboxd:filmYear'?: string | number
  description?: string | { __cdata?: string }
  link?: string
}

function textOf(field: string | { __cdata?: string } | undefined): string {
  if (!field) return ''
  return typeof field === 'string' ? field : field.__cdata ?? ''
}

// Letterboxd's RSS description is an HTML blob with the poster as the first <img>.
function posterFrom(description: string | { __cdata?: string } | undefined): string | undefined {
  const html = textOf(description)
  const match = html.match(/<img[^>]+src="([^"]+)"/i)
  return match?.[1]
}

async function fetchFeed(url: string): Promise<RssItem[]> {
  const res = await fetch(url, { headers: { 'User-Agent': 'vihaans-portfolio-sync' } })
  if (!res.ok) throw new Error(`letterboxd feed fetch failed (${res.status}): ${url}`)
  const xml = await res.text()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item
  if (!items) return []
  return Array.isArray(items) ? items : [items]
}

function toBookItem(item: RssItem): BookItemProps {
  const title = item['letterboxd:filmTitle'] ?? item.title ?? 'untitled'
  const year = item['letterboxd:filmYear']
  return {
    title: String(title),
    creators: [],
    type: 'movie',
    category: year ? String(year) : '',
    coverUrl: posterFrom(item.description),
    source: 'letterboxd',
  }
}

export interface LetterboxdSyncResult {
  current: BookItemProps[]
  future: BookItemProps[]
  // Which side(s) failed (e.g. a private/unreachable watchlist) — null means it succeeded.
  errors: { current: string | null; future: string | null }
}

// Fetch a feed but don't let its failure take the other feed down with it — e.g. a
// private watchlist 403ing shouldn't stop the diary (public) side from syncing.
async function fetchFeedSafe(url: string): Promise<{ items: RssItem[]; error: string | null }> {
  try {
    return { items: await fetchFeed(url), error: null }
  } catch (err) {
    return { items: [], error: err instanceof Error ? err.message : String(err) }
  }
}

// diaryLimit/watchlistLimit cap how many synced movies show up in each bucket —
// diary is chronological (most recent first) so a low cap keeps "current" fresh;
// watchlist has no natural cap, so trim it to keep the row from overflowing.
export async function syncLetterboxd(
  username: string,
  { diaryLimit = 6, watchlistLimit = 12 }: { diaryLimit?: number; watchlistLimit?: number } = {}
): Promise<LetterboxdSyncResult> {
  const [diary, watchlist] = await Promise.all([
    fetchFeedSafe(DIARY_FEED(username)),
    fetchFeedSafe(WATCHLIST_FEED(username)),
  ])

  // Diary can contain repeat entries for rewatches — de-dupe by title, keep first (most recent).
  const seen = new Set<string>()
  const current: BookItemProps[] = []
  for (const item of diary.items) {
    const book = toBookItem(item)
    if (seen.has(book.title)) continue
    seen.add(book.title)
    current.push(book)
    if (current.length >= diaryLimit) break
  }

  const future = watchlist.items.slice(0, watchlistLimit).map(toBookItem)

  return { current, future, errors: { current: diary.error, future: watchlist.error } }
}
