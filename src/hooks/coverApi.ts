// All fetchers return an empty string on failure so callers always get a string.
// TMDB requires an API key (NEXT_PUBLIC_TMDB_API_KEY). Open Library and iTunes are free/keyless.

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY as string | undefined
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342'

export async function fetchMovieCover(query: string): Promise<string> {
  if (!TMDB_KEY) return ''
  try {
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`)
    if (!res.ok) return ''
    const { results } = await res.json()
    const poster = results?.[0]?.poster_path
    return poster ? `${TMDB_IMG}${poster}` : ''
  } catch { return '' }
}

export async function fetchTVCover(query: string): Promise<string> {
  if (!TMDB_KEY) return ''
  try {
    const res = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`)
    if (!res.ok) return ''
    const { results } = await res.json()
    const poster = results?.[0]?.poster_path
    return poster ? `${TMDB_IMG}${poster}` : ''
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
