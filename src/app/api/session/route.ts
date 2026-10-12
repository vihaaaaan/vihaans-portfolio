import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isValidSession } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const authenticated = isValidSession(cookieStore.get('admin_session')?.value)
  return NextResponse.json({ authenticated }, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
