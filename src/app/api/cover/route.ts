import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/session'
import { fetchMovieCover, fetchTVCover, fetchBookCover, fetchPodcastCover } from '@/hooks/coverApi'

// Admin-only: resolve a cover image URL for a media item so it can be stored
// at save time (instead of fetched live on every page load).
export async function GET(request: Request) {
  const cookieStore = await cookies()
  if (!isValidSession(cookieStore.get('admin_session')?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? ''
  const type = (searchParams.get('type') ?? '').toLowerCase()
  const creator = searchParams.get('creator') ?? undefined
  const query = searchParams.get('coverSearchQuery') || title

  let coverUrl = ''
  if (type === 'movie') coverUrl = await fetchMovieCover(query)
  else if (type === 'tv' || type === 'tv show' || type === 'show') coverUrl = await fetchTVCover(query)
  else if (type === 'book' || type === 'comic') coverUrl = await fetchBookCover(query, creator)
  else if (type === 'podcast') coverUrl = await fetchPodcastCover(query)

  return NextResponse.json({ coverUrl })
}
