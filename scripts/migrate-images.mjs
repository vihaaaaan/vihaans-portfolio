import { createRequire } from 'node:module'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'
import { MongoClient, ObjectId } from 'mongodb'
import { imageBucket, storeOriginal, fetchOriginal, resolveOriginalUrls } from '../src/lib/imageStorage.mjs'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} })
const apply = process.argv.includes('--apply')
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, { serverSelectionTimeoutMS: 10000 })
const root = path.resolve('public')
const report = { stored: [], failed: [], mode: apply ? 'apply' : 'dry-run' }

async function walk(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(full))
    else if (entry.isFile() && /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(entry.name)) files.push(full)
  }
  return files
}

try {
  await client.connect()
  const db = client.db('portfolio')
  const sources = new Set((await walk(root)).map(file => '/' + path.relative(root, file).split(path.sep).join('/')))
  const bookshelf = await db.collection('bookshelf').findOne({})
  const coverTitles = new Map([...(bookshelf?.current ?? []), ...(bookshelf?.future ?? [])].map(item => [item.coverUrl, item.title]))
  for (const item of [...(bookshelf?.current ?? []), ...(bookshelf?.future ?? [])]) {
    if (item.coverUrl && !item.coverUrl.startsWith('/api/images/')) sources.add(item.coverUrl)
  }
  if (apply) {
    await db.collection('images.files').createIndex({ 'metadata.sourceUrls': 1 })
    await db.collection('images.files').createIndex({ 'metadata.sha256': 1 })
  }
  for (const source of sources) {
    if (!apply) { console.log(source); continue }
    try {
      const [mapped] = await resolveOriginalUrls(db, [source])
      if (mapped !== source) {
        // Never reset an image that an administrator has already replaced.
        const id = new ObjectId(mapped.split('/').pop())
        const existing = await db.collection('images.files').findOne({ _id: id })
        const hash = createHash('sha256')
        for await (const chunk of imageBucket(db).openDownloadStream(id)) hash.update(chunk)
        if (hash.digest('hex') !== existing?.metadata?.sha256) throw new Error('Stored bytes failed checksum verification')
        report.stored.push({ source, id: id.toString(), url: mapped, bytes: existing.length, reused: true })
        continue
      }
      const filePath = source.startsWith('/') ? path.resolve(root, '.' + decodeURIComponent(source)) : null
      if (filePath && !filePath.startsWith(root + path.sep)) throw new Error('Invalid local path')
      const bytes = filePath ? await readFile(filePath) : await fetchOriginal(source)
      const filename = path.basename(filePath ?? new URL(source).pathname)
      const stored = await storeOriginal(db, bytes, { filename, sourceUrl: source, name: coverTitles.get(source) ?? '', kind: coverTitles.has(source) ? 'cover' : '' })
      const hash = createHash('sha256')
      for await (const chunk of imageBucket(db).openDownloadStream(new ObjectId(stored.id))) hash.update(chunk)
      if (hash.digest('hex') !== stored.sha256) throw new Error('Stored bytes failed checksum verification')
      report.stored.push({ source, ...stored, bytes: bytes.length })
      console.log(`Verified ${source}`)
    } catch (error) {
      const reason = error.code === 'ENOENT' ? 'Source file is missing' : error.message
      report.failed.push({ source, reason })
      console.log(`Skipped ${source}: ${reason}`)
    }
  }
  if (apply) {
    const folder = path.join(homedir(), 'Documents', 'Database Backups', 'vihaans-portfolio')
    await mkdir(folder, { recursive: true, mode: 0o700 })
    const manifest = path.join(folder, `image-migration-${Date.now()}.json`)
    await writeFile(manifest, JSON.stringify(report, null, 2), { mode: 0o600, flag: 'wx' })
    console.log(JSON.stringify({ stored: report.stored.length, failed: report.failed, manifest }))
  }
} finally { await client.close() }
