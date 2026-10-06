import { XMLParser } from 'fast-xml-parser'
import { completeMediaImage, resolveMediaImage } from '@/lib/mediaImages'
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

function letterboxdKey(title: string, year: string) {
  return `${title.trim().toLowerCase()}::${year.trim()}`
}

function savedMediaByKey(items: BookItemProps[] = []) {
  const saved = new Map<string, Pick<BookItemProps, 'coverUrl' | 'imageWidth' | 'imageHeight' | 'coverSource'>>()
  for (const item of items) {
    if (item.source !== 'letterboxd' || !item.coverUrl) continue
    saved.set(letterboxdKey(item.title, item.category), {
      coverUrl: item.coverUrl,
      imageWidth: item.imageWidth,
      imageHeight: item.imageHeight,
      coverSource: item.coverSource,
    })
  }
  return saved
}

async function fetchFeed(url: string): Promise<RssItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'vihaans-portfolio-sync' },
    next: { revalidate: 1800 },
  })
  if (!res.ok) throw new Error(`letterboxd feed fetch failed (${res.status}): ${url}`)
  const xml = await res.text()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item
  if (!items) return []
  return Array.isArray(items) ? items : [items]
}

async function toBookItem(
  item: RssItem,
  savedMedia: Map<string, Pick<BookItemProps, 'coverUrl' | 'imageWidth' | 'imageHeight' | 'coverSource'>>,
  forceImageSearch: boolean
): Promise<BookItemProps> {
  const title = item['letterboxd:filmTitle'] ?? item.title ?? 'untitled'
  const year = item['letterboxd:filmYear']
  const titleText = String(title)
  const yearText = year ? String(year) : ''
  const saved = savedMedia.get(letterboxdKey(titleText, yearText))
  const image = saved?.coverUrl && !forceImageSearch
    ? await completeMediaImage('movie', saved)
    : await resolveMediaImage({
      title: titleText,
      creators: [],
      type: 'movie',
      category: yearText,
      fallbackUrl: posterFrom(item.description),
    })

  return {
    title: titleText,
    creators: [],
    type: 'movie',
    category: yearText,
    ...image,
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
  {
    diaryLimit = 6,
    watchlistLimit = 12,
    existingItems = [],
    forceMovieImages = false,
  }: {
    diaryLimit?: number
    watchlistLimit?: number
    existingItems?: BookItemProps[]
    forceMovieImages?: boolean
  } = {}
): Promise<LetterboxdSyncResult> {
  const [diary, watchlist] = await Promise.all([
    fetchFeedSafe(DIARY_FEED(username)),
    fetchFeedSafe(WATCHLIST_FEED(username)),
  ])
  const savedMedia = savedMediaByKey(existingItems)

  // Diary can contain repeat entries for rewatches — de-dupe by title, keep first (most recent).
  const seen = new Set<string>()
  const current: BookItemProps[] = []
  for (const item of diary.items) {
    const title = String(item['letterboxd:filmTitle'] ?? item.title ?? 'untitled')
    if (seen.has(title)) continue
    seen.add(title)
    const book = await toBookItem(item, savedMedia, forceMovieImages)
    current.push(book)
    if (current.length >= diaryLimit) break
  }

  const future = await Promise.all(watchlist.items.slice(0, watchlistLimit).map((item) => (
    toBookItem(item, savedMedia, forceMovieImages)
  )))

  return { current, future, errors: { current: diary.error, future: watchlist.error } }
}
