import { NextResponse } from 'next/server'
import { getDB } from '@/lib/adapters/mongodb'
import { syncLetterboxd } from '@/lib/letterboxd'
import type { BookItemProps } from '@/types'

// Called on a schedule (see /scripts or the external cron hitting this route) — not
// gated by the admin cookie session since there's no browser involved, just a shared
// secret passed as a header.
function checkSecret(request: Request) {
  const expected = process.env.LETTERBOXD_SYNC_SECRET
  if (!expected) return false
  return request.headers.get('x-sync-secret') === expected
}

export async function POST(request: Request) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const username = process.env.LETTERBOXD_USERNAME
  if (!username) {
    return NextResponse.json({ error: 'LETTERBOXD_USERNAME is not set' }, { status: 500 })
  }

  const synced = await syncLetterboxd(username)

  const db = await getDB()
  const doc = await db.collection('bookshelf').findOne({})
  if (!doc) {
    return NextResponse.json({ error: 'no bookshelf doc to merge into' }, { status: 404 })
  }

  // Drop any previously-synced letterboxd entries, then splice the fresh ones back in —
  // everything else (books, tv shows, podcasts you added by hand) is left untouched.
  // If a feed failed (e.g. a private watchlist), leave that bucket's letterboxd
  // entries as they were rather than wiping them out with an empty result.
  const keep = (items: BookItemProps[] = []) => items.filter((b) => b.source !== 'letterboxd')
  const current = synced.errors.current ? doc.current : [...synced.current, ...keep(doc.current)]
  const future = synced.errors.future ? doc.future : [...synced.future, ...keep(doc.future)]

  await db.collection('bookshelf').updateOne({}, { $set: { current, future } })

  return NextResponse.json({
    ok: true,
    synced: { current: synced.current.length, future: synced.future.length },
    errors: synced.errors,
  })
}
