import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { BucketListClient } from '@/components/BucketListClient'

export const dynamic = 'force-dynamic'

export default async function BucketListPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'

  const dataPath = path.join(process.cwd(), 'src', 'data', 'bucket-list.json')
  const bucketList = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  return <BucketListClient data={bucketList} isAdmin={isAdmin} />
}
