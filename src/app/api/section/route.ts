import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDB } from '@/lib/adapters/mongodb'
import { isValidSession } from '@/lib/session'

const ALLOWED = new Set(['profile', 'work', 'projects', 'bookshelf'])

async function checkAdmin() {
  const cookieStore = await cookies()
  return isValidSession(cookieStore.get('admin_session')?.value)
}

// Admin-only: replace a single section document (one doc per collection).
export async function PUT(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { section, doc } = await request.json()
  if (!ALLOWED.has(section)) {
    return NextResponse.json({ error: 'unknown section' }, { status: 400 })
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return NextResponse.json({ error: 'missing doc' }, { status: 400 })
  }

  const db = await getDB()
  // Never let the client overwrite the Mongo _id.
  delete (doc as Record<string, unknown>)._id
  // Guard against an empty payload silently wiping a whole section.
  if (Object.keys(doc).length === 0) {
    return NextResponse.json({ error: 'refusing to write empty section' }, { status: 400 })
  }
  await db.collection(section).replaceOne({}, doc, { upsert: true })
  return NextResponse.json({ ok: true })
}
