import { unstable_cache } from 'next/cache'
import { getDB } from '@/lib/adapters/mongodb'
import { resolveOriginalUrls } from '@/lib/imageStorage.mjs'
import { ObjectId } from 'mongodb'
import type { Profile, RemoteSectionKey, SectionDocumentMap } from '@/types'

const CACHE_SECONDS = 300

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const getProfile = unstable_cache(
  async () => {
    const db = await getDB()
    return serialize(await db.collection<Profile>('profile').findOne({}, { projection: { _id: 0 } }))
  },
  ['portfolio-profile'],
  { revalidate: CACHE_SECONDS, tags: ['portfolio-content'] },
)

export const getSection = unstable_cache(
  async <K extends RemoteSectionKey>(section: K): Promise<SectionDocumentMap[K] | null> => {
    const db = await getDB()
    const document = await db.collection(section).findOne({}, { projection: { _id: 0 } })
    if (section === 'bookshelf' && document) {
      for (const bucket of ['current', 'future']) {
        const items = document[bucket] ?? []
        const urls = await resolveOriginalUrls(db, items.map((item: { coverUrl?: string }) => item.coverUrl ?? ''))
        const ids = urls.filter((url: string) => /^\/api\/images\/[a-f\d]{24}$/i.test(url)).map((url: string) => new ObjectId(url.split('/').pop()))
        const files = ids.length ? await db.collection('images.files').find({ _id: { $in: ids } }).toArray() : []
        const dimensions = new Map(files.map(file => [`/api/images/${file._id}`, { imageWidth: file.metadata?.width, imageHeight: file.metadata?.height }]))
        document[bucket] = items.map((item: object, i: number) => urls[i] ? { ...item, coverUrl: urls[i], ...(dimensions.get(urls[i]) ?? {}) } : item)
      }
    }
    return document ? serialize(document) as unknown as SectionDocumentMap[K] : null
  },
  ['portfolio-section'],
  { revalidate: CACHE_SECONDS, tags: ['portfolio-content'] },
)
