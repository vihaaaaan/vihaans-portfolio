import { cookies } from 'next/headers'
import { HomeClient } from '@/components/HomeClient'
import { UnderConstruction } from '@/components/UnderConstruction'
import { getDB } from '@/lib/adapters/mongodb'
import { isValidSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const cookieStore = await cookies()
  const isAdmin = isValidSession(cookieStore.get('admin_session')?.value)

  // Public visitors see the construction splash. The real (editable) site is
  // only rendered for a valid admin session — hidden behind it until launch.
  if (!isAdmin) {
    return <UnderConstruction />
  }

  const db = await getDB()
  const [profile, work, projects, bookshelf] = await Promise.all([
    db.collection('profile').findOne({}),
    db.collection('work').findOne({}),
    db.collection('projects').findOne({}),
    db.collection('bookshelf').findOne({}),
  ])

  const data = {
    profile,
    tabs: [
      { key: 'work', label: work?.title ?? 'work', emoji: work?.emoji, subtitle: work?.subtitle, content: { current: work?.current ?? [], prev: work?.prev ?? [] } },
      { key: 'projects', label: projects?.title ?? 'projects', emoji: projects?.emoji, subtitle: projects?.subtitle, content: { items: projects?.items ?? [] } },
      { key: 'digital_bookshelf', label: bookshelf?.title ?? 'digital bookshelf', emoji: bookshelf?.emoji, subtitle: bookshelf?.subtitle, content: { current: bookshelf?.current ?? [], future: bookshelf?.future ?? [], buckets: bookshelf?.buckets ?? { current: 'current + just finished', future: 'future' } } },
    ],
  }

  return <HomeClient data={JSON.parse(JSON.stringify(data))} isAdmin={isAdmin} />
}
