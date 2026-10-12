import { HomeClient } from '@/components/HomeClient'
import { getProfile, getSection } from '@/lib/content'

export const revalidate = 300

export default async function Page() {
  // Prime section caches during build/revalidation without serializing their
  // content into the initial page. Client section requests then stay modular
  // without making the first visitor wait on a cold database connection.
  const [profile] = await Promise.all([
    getProfile(),
    getSection('work'),
    getSection('projects'),
    getSection('bookshelf'),
  ])
  if (!profile) return null
  return <HomeClient profile={profile} />
}
