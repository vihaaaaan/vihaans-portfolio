import { ObjectId } from 'mongodb'
import { Readable } from 'node:stream'
import { getDB } from '@/lib/adapters/mongodb'
import { imageBucket } from '@/lib/imageStorage.mjs'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-f\d]{24}$/i.test(id)) return new Response('Not found', { status: 404 })
  const db = await getDB()
  const objectId = new ObjectId(id)
  const file = await db.collection('images.files').findOne({ _id: objectId })
  if (!file) return new Response('Not found', { status: 404 })
  const headers = {
    'Content-Type': file.metadata?.contentType ?? 'application/octet-stream',
    'Content-Length': String(file.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'ETag': `"${file.metadata?.sha256 ?? id}"`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  }
  if (request.headers.get('if-none-match') === headers.ETag) {
    return new Response(null, { status: 304, headers: { ETag: headers.ETag, 'Cache-Control': headers['Cache-Control'] } })
  }
  const stream = imageBucket(db).openDownloadStream(objectId)
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers })
}
