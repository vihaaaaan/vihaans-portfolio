// All fetchers return an empty string on failure so callers always get a string.
// TMDB requires an API key (TMDB_API_KEY or NEXT_PUBLIC_TMDB_API_KEY).
// Open Library and iTunes are free/keyless.

const TMDB_KEY = (process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY) as string | undefined
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_POSTER_IMG = 'https://image.tmdb.org/t/p/w342'
const TMDB_BACKDROP_IMG = 'https://image.tmdb.org/t/p/w780'

interface TmdbImage {
  file_path?: string
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

function releaseYear(releaseDate?: string) {
  return releaseDate?.slice(0, 4)
}

export async function fetchMovieCover(query: string, year?: string): Promise<string> {
  if (!TMDB_KEY) return ''
  try {
    const params = new URLSearchParams({ api_key: TMDB_KEY, query })
    if (year) params.set('primary_release_year', year)

    let res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
    if (!res.ok) return ''
    let { results } = await res.json()

    // If the year-qualified search misses, retry title-only before giving up.
    if ((!results || results.length === 0) && year) {
      params.delete('primary_release_year')
      res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
      if (!res.ok) return ''
      ;({ results } = await res.json())
    }

    const matches = Array.isArray(results) ? results : []
    const match = year
      ? matches.find((movie: any) => releaseYear(movie.release_date) === year) ?? matches[0]
      : matches[0]
    if (!match?.id) return ''

    const imagesRes = await fetch(
      `${TMDB_BASE}/movie/${match.id}/images?api_key=${TMDB_KEY}&include_image_language=en,null`
    )
    if (imagesRes.ok) {
      const images = await imagesRes.json()
      const backdrops = ((images.backdrops ?? []) as TmdbImage[]).filter((image) => image.file_path)
      const posters = ((images.posters ?? []) as TmdbImage[]).filter((image) => image.file_path)
      const backdrop = pickRandom(backdrops.slice(0, 24))
      if (backdrop?.file_path) return `${TMDB_BACKDROP_IMG}${backdrop.file_path}`

      const poster = pickRandom(posters.slice(0, 24))
      if (poster?.file_path) return `${TMDB_POSTER_IMG}${poster.file_path}`
    }

    if (match.backdrop_path) return `${TMDB_BACKDROP_IMG}${match.backdrop_path}`
    if (match.poster_path) return `${TMDB_POSTER_IMG}${match.poster_path}`
    return ''
  } catch { return '' }
}

export async function fetchTVCover(query: string): Promise<string> {
  if (!TMDB_KEY) return ''
  try {
    const res = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`)
    if (!res.ok) return ''
    const { results } = await res.json()
    const match = results?.[0]
    if (!match?.id) return ''

    const imagesRes = await fetch(
      `${TMDB_BASE}/tv/${match.id}/images?api_key=${TMDB_KEY}&include_image_language=en,null`
    )
    if (imagesRes.ok) {
      const images = await imagesRes.json()
      const backdrops = ((images.backdrops ?? []) as TmdbImage[]).filter((image) => image.file_path)
      const posters = ((images.posters ?? []) as TmdbImage[]).filter((image) => image.file_path)
      const backdrop = pickRandom(backdrops.slice(0, 24))
      if (backdrop?.file_path) return `${TMDB_BACKDROP_IMG}${backdrop.file_path}`

      const poster = pickRandom(posters.slice(0, 24))
      if (poster?.file_path) return `${TMDB_POSTER_IMG}${poster.file_path}`
    }

    if (match.backdrop_path) return `${TMDB_BACKDROP_IMG}${match.backdrop_path}`
    if (match.poster_path) return `${TMDB_POSTER_IMG}${match.poster_path}`
    return ''
  } catch { return '' }
}

export async function fetchBookCover(query: string, author?: string): Promise<string> {
  try {
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&language=eng&limit=1&fields=cover_i`
    if (author) url += `&author=${encodeURIComponent(author)}`
    const res = await fetch(url)
    if (!res.ok) return ''
    const { docs } = await res.json()
    const id = docs?.[0]?.cover_i
    return id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : ''
  } catch { return '' }
}

export async function fetchPodcastCover(query: string): Promise<string> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&limit=1`)
    if (!res.ok) return ''
    const { results } = await res.json()
    return results?.[0]?.artworkUrl600 ?? ''
  } catch { return '' }
}
