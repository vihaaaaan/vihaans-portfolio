import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { getDB } from '@/lib/adapters/mongodb'
import { getSection } from '@/lib/content'
import { getProjectImages } from '@/lib/projectImages'
import { isValidSession } from '@/lib/session'
import type { ProjectItemProps, ProjectsSectionDocument, RemoteSectionKey } from '@/types'

const ALLOWED = new Set(['profile', 'work', 'projects', 'bookshelf'])

async function checkAdmin() {
  const cookieStore = await cookies()
  return isValidSession(cookieStore.get('admin_session')?.value)
}

function withProjectImages(items: ProjectItemProps[] | undefined) {
  return items?.map((project) => ({
    ...project,
    images: project.containsImages ? getProjectImages(project.name) : [],
  }))
}

export async function GET(request: Request) {
  const section = new URL(request.url).searchParams.get('section')
  if (!section || !ALLOWED.has(section) || section === 'profile') {
    return NextResponse.json({ error: 'unknown section' }, { status: 400 })
  }

  const data = await getSection(section as RemoteSectionKey)
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const response = section === 'projects'
    ? (() => {
        const projects = data as ProjectsSectionDocument
        return {
          ...projects,
          current: withProjectImages(projects.current),
          prev: withProjectImages(projects.prev),
          items: withProjectImages(projects.items),
        }
      })()
    : data

  return NextResponse.json(response)
}

// Admin-only: replace a single section document (one doc per collection).
export async function PUT(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { section, doc } = await request.json()
  if (!ALLOWED.has(section)) {
    return NextResponse.json({ error: 'unknown section' }, { status: 400 })
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return NextResponse.json({ error: 'missing doc' }, { status: 400 })
  }

  const db = await getDB()
  // Never let the client overwrite the Mongo _id.
  delete (doc as Record<string, unknown>)._id
  // Guard against an empty payload silently wiping a whole section.
  if (Object.keys(doc).length === 0) {
    return NextResponse.json({ error: 'refusing to write empty section' }, { status: 400 })
  }
  await db.collection(section).replaceOne({}, doc, { upsert: true })
  revalidateTag('portfolio-content')
  return NextResponse.json({ ok: true })
}
