import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDB } from '@/lib/adapters/mongodb'
import { isValidSession } from '@/lib/session'

async function checkAdmin() {
  const cookieStore = await cookies()
  return isValidSession(cookieStore.get('admin_session')?.value)
}

export async function GET() {
  const db = await getDB()
  const data = await db.collection('content').findOne({})
  return NextResponse.json(JSON.parse(JSON.stringify(data)))
}

// Admin-only: persist updated content (location and/or tabs) to the single content doc.
export async function PUT(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const db = await getDB()
  const existing = await db.collection('content').findOne({})
  if (!existing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = {}
  if (body.location !== undefined) update.location = body.location
  if (body.tabs !== undefined) update.tabs = body.tabs

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  await db.collection('content').updateOne({ _id: existing._id }, { $set: update })
  return NextResponse.json({ ok: true })
}
