import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDB } from '@/lib/adapters/mongodb'
import { isValidSession } from '@/lib/session'
import { storeOriginal, UPLOAD_IMAGE_BYTES } from '@/lib/imageStorage.mjs'
import { getProjectImages } from '@/lib/projectImages'

export const runtime = 'nodejs'

async function authenticated() {
  return isValidSession((await cookies()).get('admin_session')?.value)
}

export async function GET() {
  if (!await authenticated()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = await getDB()
  const files = await db.collection('images.files').find({}).sort({ uploadDate: -1 }).toArray()
  return NextResponse.json({ images: files.map(file => ({
    id: file._id.toString(), url: `/api/images/${file._id}`, name: file.filename, folder: file.metadata?.folder ?? 'library',
    size: file.length, width: file.metadata?.width, height: file.metadata?.height,
    sources: file.metadata?.sourceUrls ?? [],
  })) })
}

export async function POST(request: Request) {
  if (!await authenticated()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (Number(request.headers.get('content-length')) > UPLOAD_IMAGE_BYTES + 65536) return NextResponse.json({ error: 'Images must be 4 MB or smaller' }, { status: 413 })
  let form: FormData
  try { form = await request.formData() } catch { return NextResponse.json({ error: 'Invalid upload' }, { status: 400 }) }
  const file = form.get('file')
  if (!(file instanceof File) || !file.size || file.size > UPLOAD_IMAGE_BYTES) return NextResponse.json({ error: 'Choose an image up to 4 MB' }, { status: 400 })
  const kind = String(form.get('kind') ?? 'library')
  const bucket = String(form.get('bucket') ?? '')
  const name = String(form.get('name') ?? '')
  const index = Number(form.get('index'))
  const oldId = String(form.get('oldId') ?? '')
  if (!['library', 'project', 'cover', 'replacement'].includes(kind)) return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
  const db = await getDB()
  const replacement = kind === 'replacement' && /^[a-f\d]{24}$/i.test(oldId) ? await db.collection('images.files').findOne({ _id: new ObjectId(oldId) }) : null
  if (kind === 'replacement' && !replacement) return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  const attach = kind === 'project' || kind === 'cover'
  const collection = kind === 'project' ? 'projects' : 'bookshelf'
  const doc = attach ? await db.collection(collection).findOne({}) : null
  const allowedBuckets = kind === 'project' ? ['current', 'prev', 'items'] : ['current', 'future']
  if (attach && (!allowedBuckets.includes(bucket) || !doc || !Array.isArray(doc[bucket]) || !Number.isInteger(index) || index < 0 || (kind === 'project' ? doc[bucket][index]?.name : doc[bucket][index]?.title) !== name)) {
    return NextResponse.json({ error: 'This item changed. Refresh the library and try again.' }, { status: 409 })
  }
  let image
  try { image = await storeOriginal(db, Buffer.from(await file.arrayBuffer()), { filename: file.name, kind, name, folder: replacement?.metadata?.folder }) }
  catch { return NextResponse.json({ error: 'Could not store this image. Use a valid PNG, JPEG, WebP, GIF, SVG, or AVIF.' }, { status: 400 }) }
  if (replacement && image.id !== oldId) {
    const aliases = [...new Set([...(replacement.metadata?.sourceUrls ?? []), `/api/images/${oldId}`])]
    const session = db.client.startSession()
    try {
      await session.withTransaction(async () => {
        await db.collection('images.files').updateMany({ _id: { $ne: new ObjectId(image.id) }, 'metadata.sourceUrls': { $in: aliases } }, [{ $set: { 'metadata.sourceUrls': { $setDifference: ['$metadata.sourceUrls', { $literal: aliases }] } } }], { session })
        await db.collection('images.files').updateOne({ _id: new ObjectId(image.id) }, { $addToSet: { 'metadata.sourceUrls': { $each: aliases } } }, { session })
      })
    } finally { await session.endSession() }
  }
  if (doc) {
    const items = [...doc[bucket]]
    const item = items[index]
    items[index] = kind === 'project'
      ? { ...item, containsImages: true, images: [...new Set([...(item.images ?? (item.containsImages ? getProjectImages(item.name) : [])), image.url])] }
      : { ...item, coverUrl: image.url, imageWidth: image.width, imageHeight: image.height, coverSource: 'upload' }
    const result = await db.collection(collection).updateOne({ _id: doc._id, [bucket]: doc[bucket] }, { $set: { [bucket]: items } })
    if (!result.matchedCount) return NextResponse.json({ error: 'Image saved to the library, but the item changed. Refresh and try again.' }, { status: 409 })
  }
  revalidateTag('portfolio-content')
  return NextResponse.json(image, { status: 201 })
}
