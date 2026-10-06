import { NextResponse } from 'next/server'
import { getDB } from '@/lib/adapters/mongodb'
import { syncLetterboxd } from '@/lib/letterboxd'

export async function GET() {
  const username = process.env.LETTERBOXD_USERNAME
  if (!username) {
    return NextResponse.json({ error: 'LETTERBOXD_USERNAME is not set' }, { status: 500 })
  }

  const db = await getDB()
  const doc = await db.collection('bookshelf').findOne({})
  const existingItems = [...(doc?.current ?? []), ...(doc?.future ?? [])]
  const synced = await syncLetterboxd(username, { existingItems })

  return NextResponse.json(synced, {
    headers: { 'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400' },
  })
}
