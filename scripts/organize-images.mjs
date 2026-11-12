// Rename metadata only: bytes, IDs, aliases, and content documents stay intact.
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { MongoClient, BSON } from 'mongodb'
import { imageNaming } from '../src/lib/imageNaming.mjs'
const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} })
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING)
const apply = process.argv.includes('--apply')
try {
  await client.connect()
  const db = client.db('portfolio')
  const files = await db.collection('images.files').find({}).toArray()
  const bookshelf = await db.collection('bookshelf').findOne({})
  const titles = new Map([...(bookshelf?.current ?? []), ...(bookshelf?.future ?? [])].map(item => [item.coverUrl, item.title]))
  const changes = files.filter(file => !file.metadata?.folder).map(file => {
    const sources = file.metadata?.sourceUrls ?? []
    const sourceUrl = sources.find(source => titles.has(source)) || sources.find(source => !source.startsWith('/api/images/')) || ''
    const name = titles.get(sourceUrl) || titles.get(`/api/images/${file._id}`) || ''
    const naming = imageNaming({ filename: file.filename, sourceUrl, name, kind: name ? 'cover' : '', sha256: file.metadata.sha256, contentType: file.metadata.contentType })
    return { file, naming }
  })
  if (apply && changes.length) {
    const directory = path.join(homedir(), 'Documents', 'Database Backups', 'vihaans-portfolio')
    await mkdir(directory, { recursive: true, mode: 0o700 })
    const backup = path.join(directory, `image-names-before-${Date.now()}.ejson`)
    await writeFile(backup, BSON.EJSON.stringify(files, { relaxed: false }), { mode: 0o600, flag: 'wx' })
    console.log(`Metadata backup: ${backup}`)
    for (const { file, naming } of changes) {
      const result = await db.collection('images.files').updateOne({ _id: file._id, filename: file.filename, 'metadata.folder': { $exists: false } }, { $set: { filename: naming.filename, 'metadata.folder': naming.folder, 'metadata.originalFilename': file.filename } })
      if (!result.matchedCount) throw new Error(`Image ${file._id} changed during organization; rerun to review`)
    }
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', count: changes.length, names: changes.map(change => change.naming.filename) }, null, 2))
} finally { await client.close() }
