import { createHash } from 'node:crypto'
import { GridFSBucket } from 'mongodb'
import sharp from 'sharp'
import { imageNaming } from './imageNaming.mjs'

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
export const UPLOAD_IMAGE_BYTES = 4 * 1024 * 1024
const MIME = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif', heif: 'image/avif' }

/** @param {import('mongodb').Db} db */
export function imageBucket(db) {
  return new GridFSBucket(db, { bucketName: 'images' })
}

/** Store source bytes unchanged; metadata inspection never re-encodes the image.
 * @param {import('mongodb').Db} db
 * @param {Buffer} bytes
 * @param {{filename: string, sourceUrl?: string, kind?: string, name?: string, folder?: string}} options
 */
export async function storeOriginal(db, bytes, { filename, sourceUrl, kind, name, folder }) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('Image must be between 1 byte and 25 MB')
  const info = await sharp(bytes, { limitInputPixels: 100_000_000 }).metadata()
  const contentType = MIME[info.format ?? '']
  if (!contentType) throw new Error('Use a PNG, JPEG, WebP, GIF, SVG, or AVIF image')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const files = db.collection('images.files')
  const existing = await files.findOne({ 'metadata.sha256': sha256 })
  if (existing) {
    if (sourceUrl) await files.updateOne({ _id: existing._id }, { $addToSet: { 'metadata.sourceUrls': sourceUrl } })
    return { id: existing._id.toString(), url: `/api/images/${existing._id}`, width: info.width, height: info.height, sha256 }
  }
  const naming = imageNaming({ filename, sourceUrl, kind, name, folder, sha256, contentType })
  const stream = imageBucket(db).openUploadStream(naming.filename, {
    metadata: { originalFilename: filename, folder: naming.folder, contentType, sha256, width: info.width, height: info.height, sourceUrls: sourceUrl ? [sourceUrl] : [] },
  })
  try {
    await new Promise((resolve, reject) => { stream.once('error', reject); stream.once('finish', resolve); stream.end(bytes) })
  } catch (error) {
    await stream.abort().catch(() => {})
    throw error
  }
  return { id: stream.id.toString(), url: `/api/images/${stream.id}`, width: info.width, height: info.height, sha256 }
}

/** Resolve legacy URLs without rewriting live content before deployment.
 * @param {import('mongodb').Db} db
 * @param {string[]} urls
 */
export async function resolveOriginalUrls(db, urls) {
  if (!urls.length) return urls
  const files = await db.collection('images.files').find({ 'metadata.sourceUrls': { $in: urls } }).sort({ uploadDate: -1 }).toArray()
  const mapping = new Map()
  for (const file of files) for (const source of file.metadata?.sourceUrls ?? []) {
    if (!mapping.has(source)) mapping.set(source, `/api/images/${file._id}`)
  }
  return urls.map(url => mapping.get(url) ?? url)
}

// Only the cover providers used by this app can be fetched server-side.
export function isCoverSource(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      (['image.tmdb.org', 'covers.openlibrary.org', 'a.ltrbxd.com'].includes(url.hostname) || /^(?:[a-z0-9-]+\.)*mzstatic\.com$/.test(url.hostname))
  } catch { return false }
}

/** @param {string} sourceUrl */
export async function fetchOriginal(sourceUrl) {
  let url = sourceUrl
  for (let redirects = 0; redirects < 5; redirects++) {
    if (!isCoverSource(url)) throw new Error('Unsupported image host')
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000) })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) throw new Error('Missing image redirect')
      url = new URL(location, url).href
      continue
    }
    if (!response.ok || !response.body) throw new Error(`Image download failed (${response.status})`)
    if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) { await response.body.cancel(); throw new Error('Image exceeds 25 MB') }
    const reader = response.body.getReader()
    const chunks = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new Error('Image exceeds 25 MB') }
      chunks.push(Buffer.from(value))
    }
    return Buffer.concat(chunks)
  }
  throw new Error('Too many image redirects')
}

/** @param {import('mongodb').Db} db @param {string} url */
export async function importCover(db, url, name = '') {
  if (!isCoverSource(url)) return url
  const [existing] = await resolveOriginalUrls(db, [url])
  if (existing !== url) return existing
  const bytes = await fetchOriginal(url)
  return (await storeOriginal(db, bytes, { filename: 'cover', sourceUrl: url, kind: 'cover', name })).url
}
