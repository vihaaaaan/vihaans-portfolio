import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { BucketListClient } from '@/components/BucketListClient'
import { isValidSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function BucketListPage() {
  const cookieStore = await cookies()
  const isAdmin = isValidSession(cookieStore.get('admin_session')?.value)

  const dataPath = path.join(process.cwd(), 'src', 'data', 'bucket-list.json')
  const bucketList = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  return <BucketListClient data={bucketList} isAdmin={isAdmin} />
}
