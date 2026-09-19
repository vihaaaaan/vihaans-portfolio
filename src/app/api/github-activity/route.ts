import { NextResponse } from 'next/server'
import { fetchContributions } from '@/lib/github'

// Username is fixed rather than a query param: this endpoint exists to serve
// this site's own calendar, and taking it from the caller would turn the route
// into an open proxy for scraping anyone's profile.
const USERNAME = 'vihaaaaan'

export async function GET() {
  const calendar = await fetchContributions(USERNAME)
  return NextResponse.json(calendar, {
    // fetchContributions already revalidates hourly server-side; this lets the
    // browser and any CDN in front of it skip the round trip entirely.
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}
