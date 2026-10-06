import sharp from 'sharp'
import { fetchBookCover, fetchMovieCover, fetchPodcastCover, fetchTVCover } from '@/hooks/coverApi'
import type { BookItemProps } from '@/types'

type MediaImageFields = Pick<BookItemProps, 'coverUrl' | 'imageWidth' | 'imageHeight' | 'coverSource'>

const IMAGE_USER_AGENT = 'vihaans-portfolio-media-sync'

function cleanType(type: string) {
  return type.trim().toLowerCase()
}

function fallbackDimensions(type: string, coverUrl?: string): Pick<BookItemProps, 'imageWidth' | 'imageHeight'> {
  const normalized = cleanType(type)
  if (coverUrl?.includes('image.tmdb.org/t/p/w780')) return { imageWidth: 1600, imageHeight: 900 }
  if (normalized === 'podcast' || normalized === 'music') return { imageWidth: 1000, imageHeight: 1000 }
  if (normalized === 'movie' && coverUrl?.includes('image.tmdb.org/t/p/w342')) return { imageWidth: 600, imageHeight: 900 }
  if (normalized === 'movie') return { imageWidth: 1600, imageHeight: 900 }
  return { imageWidth: 600, imageHeight: 900 }
}

export async function completeMediaImage(
  type: string,
  media: MediaImageFields
): Promise<MediaImageFields> {
  if (!media.coverUrl || (media.imageWidth && media.imageHeight)) return media
  const measuredDimensions = await readImageDimensions(media.coverUrl)
  const dimensions = measuredDimensions.imageWidth && measuredDimensions.imageHeight
    ? measuredDimensions
    : fallbackDimensions(type, media.coverUrl)

  return { ...media, ...dimensions }
}

export async function readImageDimensions(coverUrl: string): Promise<Pick<BookItemProps, 'imageWidth' | 'imageHeight'>> {
  try {
    const response = await fetch(coverUrl, {
      headers: { 'User-Agent': IMAGE_USER_AGENT },
    })
    if (!response.ok) return {}

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) return {}

    const buffer = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata()
    if (!metadata.width || !metadata.height) return {}

    return { imageWidth: metadata.width, imageHeight: metadata.height }
  } catch {
    return {}
  }
}

export async function resolveMediaImage(
  item: Pick<BookItemProps, 'title' | 'type' | 'category' | 'creators' | 'coverSearchQuery'> & {
    fallbackUrl?: string
  }
): Promise<MediaImageFields> {
  const query = item.coverSearchQuery || item.title
  const creator = item.creators?.[0]
  const type = cleanType(item.type)

  let coverUrl = ''
  let coverSource = ''

  if (type === 'movie') {
    coverUrl = await fetchMovieCover(query, item.category)
    coverSource = coverUrl ? 'tmdb' : ''
  } else if (type === 'tv' || type === 'tv show' || type === 'show') {
    coverUrl = await fetchTVCover(query)
    coverSource = coverUrl ? 'tmdb' : ''
  } else if (type === 'book' || type === 'comic') {
    coverUrl = await fetchBookCover(query, creator)
    coverSource = coverUrl ? 'openlibrary' : ''
  } else if (type === 'podcast') {
    coverUrl = await fetchPodcastCover(query)
    coverSource = coverUrl ? 'itunes' : ''
  }

  if (!coverUrl && item.fallbackUrl) {
    coverUrl = item.fallbackUrl
    coverSource = 'source'
  }

  if (!coverUrl) return {}

  return completeMediaImage(type, { coverUrl, coverSource })
}

export async function attachStaticImage(
  item: BookItemProps,
  { forceImageSearch = false }: { forceImageSearch?: boolean } = {}
): Promise<BookItemProps> {
  if (item.coverUrl && !forceImageSearch) {
    return { ...item, ...(await completeMediaImage(item.type, item)) }
  }

  const resolved = await resolveMediaImage({
    title: item.title,
    creators: item.creators,
    type: item.type,
    category: item.category,
    coverSearchQuery: item.coverSearchQuery,
    fallbackUrl: item.coverUrl,
  })

  return resolved.coverUrl ? { ...item, ...resolved } : item
}

export async function attachStaticImages(
  items: BookItemProps[],
  { forceMovieImages = false }: { forceMovieImages?: boolean } = {}
): Promise<BookItemProps[]> {
  return Promise.all(items.map((item) => attachStaticImage(item, {
    forceImageSearch: forceMovieImages && cleanType(item.type) === 'movie',
  })))
}
