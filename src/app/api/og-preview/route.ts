import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; portfolio-bot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    const get = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'))
      return match?.[1] ?? null
    }
    const getTitle = () => {
      const og = get('title')
      if (og) return og
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return m?.[1]?.trim() ?? null
    }

    const hostname = new URL(url).hostname.replace(/^www\./, '')

    return NextResponse.json({
      title: getTitle(),
      description: get('description'),
      image: get('image'),
      url,
      hostname,
    })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
