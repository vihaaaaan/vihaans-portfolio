import { HomeClient } from '@/components/HomeClient'
import { getDB } from '@/lib/adapters/mongodb'

export default async function Page() {
  const db = await getDB()
  const data = await db.collection('content').findOne({})
  const jsonData = JSON.parse(JSON.stringify(data))
  return <HomeClient data={jsonData} />
}
