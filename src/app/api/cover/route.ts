import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/session'
import { resolveMediaImage } from '@/lib/mediaImages'

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
  const year = searchParams.get('year') ?? undefined
  const query = searchParams.get('coverSearchQuery') || title

  const image = await resolveMediaImage({
    title,
    type,
    category: year ?? '',
    creators: creator ? [creator] : [],
    coverSearchQuery: query,
  })

  return NextResponse.json(image)
}
