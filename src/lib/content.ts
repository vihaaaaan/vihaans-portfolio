import { unstable_cache } from 'next/cache'
import { getDB } from '@/lib/adapters/mongodb'
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
    return document ? serialize(document) as unknown as SectionDocumentMap[K] : null
  },
  ['portfolio-section'],
  { revalidate: CACHE_SECONDS, tags: ['portfolio-content'] },
)
