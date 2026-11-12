// Integration checks against a running LOCAL dev server. Only temporary,
// randomly generated library images are written; portfolio records are untouched.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createHash, createHmac, randomBytes } from 'node:crypto'
import { MongoClient, ObjectId } from 'mongodb'
import sharp from 'sharp'
import { imageBucket, resolveOriginalUrls, isCoverSource } from '../src/lib/imageStorage.mjs'

const require = createRequire(import.meta.url)
require('@next/env').loadEnvConfig(process.cwd(), true, { info() {}, error() {} })
const base = process.argv[2] || 'http://localhost:3001'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Run against a local server only')
const payload = Buffer.from(JSON.stringify({ admin: true, exp: Date.now() + 60000 })).toString('base64url')
const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url')
const headers = { cookie: `admin_session=${payload}.${signature}` }
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING)
const temporary = new Set()
let db
const prefix = `image-check-${randomBytes(12).toString('hex')}`

async function upload(bytes, fields = {}, authenticated = true) {
  const form = new FormData()
  form.set('file', new Blob([bytes], { type: 'image/png' }), `${prefix}.png`)
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  const response = await fetch(`${base}/api/images`, { method: 'POST', headers: authenticated ? headers : {}, body: form })
  const body = await response.json()
  if (response.ok) temporary.add(body.id)
  return { response, body }
}

try {
  await client.connect()
  db = client.db('portfolio')
  const before = await Promise.all(['profile', 'work', 'projects', 'bookshelf'].map(name => db.collection(name).find({}).toArray()))
  assert.equal((await fetch(`${base}/api/images`)).status, 401)
  assert.equal((await upload(Buffer.from('invalid'), {}, false)).response.status, 401)
  assert.equal((await upload(Buffer.from('not an image'))).response.status, 400)
  assert.equal((await fetch(`${base}/api/images/not-an-id`)).status, 404)
  assert.equal((await fetch(`${base}/api/images/${new ObjectId()}`)).status, 404)
  const bytes = await sharp(randomBytes(8 * 8 * 3), { raw: { width: 8, height: 8, channels: 3 } }).png().toBuffer()
  const { response, body } = await upload(bytes)
  assert.equal(response.status, 201)
  const download = await fetch(`${base}${body.url}`)
  assert.equal(download.status, 200)
  assert.equal(download.headers.get('content-type'), 'image/png')
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes)
  assert.equal((await fetch(`${base}${body.url}`, { headers: { 'if-none-match': download.headers.get('etag') } })).status, 304)
  assert.equal((await upload(bytes)).body.id, body.id, 'Identical uploads reuse original bytes')
  assert.equal((await upload(bytes, { kind: 'cover', bucket: 'wrong', index: '0', name: 'not a real item' })).response.status, 409)
  const source = `/${prefix}.png`
  await db.collection('images.files').updateOne({ _id: new ObjectId(body.id) }, { $addToSet: { 'metadata.sourceUrls': source } })
  assert.deepEqual(await resolveOriginalUrls(db, [source]), [body.url])
  const replacementBytes = await sharp(randomBytes(12 * 6 * 3), { raw: { width: 12, height: 6, channels: 3 } }).png().toBuffer()
  const replacement = await upload(replacementBytes, { kind: 'replacement', oldId: body.id })
  assert.equal(replacement.response.status, 201)
  assert.deepEqual(await resolveOriginalUrls(db, [source, body.url]), [replacement.body.url, replacement.body.url])
  assert.deepEqual(Buffer.from(await (await fetch(`${base}${body.url}`)).arrayBuffer()), bytes, 'Original downloads stay immutable')
  const stored = await db.collection('images.files').findOne({ _id: new ObjectId(replacement.body.id) })
  assert.equal(stored.metadata.folder, 'library')
  assert.match(stored.filename, /^library\/[a-z0-9-]+-[a-f0-9]{12}\.png$/)
  assert.equal(stored.metadata.originalFilename, `${prefix}.png`)
  assert.equal(stored.metadata.sha256, createHash('sha256').update(replacementBytes).digest('hex'))
  assert.equal(isCoverSource('https://image.tmdb.org/t/p/w780/test.jpg'), true)
  for (const url of ['http://127.0.0.1/image', 'https://example.com/image', 'https://image.tmdb.org.evil.test/image', 'https://image.tmdb.org:444/image']) assert.equal(isCoverSource(url), false)
  const assets = await (await fetch(`${base}/api/images`, { headers })).json()
  assert(assets.images.some(image => image.id === body.id))
  const after = await Promise.all(['profile', 'work', 'projects', 'bookshelf'].map(name => db.collection(name).find({}).toArray()))
  assert.deepEqual(after, before, 'Portfolio documents must remain unchanged')
  console.log('PASS: auth, validation, originals, deduplication, ETags, replacement aliases, remote-host restrictions, and content preservation')
} finally {
  if (db) {
    const files = await db.collection('images.files').find({ 'metadata.originalFilename': `${prefix}.png` }).toArray()
    for (const file of files) temporary.add(file._id.toString())
    for (const id of temporary) await imageBucket(db).delete(new ObjectId(id))
    console.log(`Removed ${temporary.size} temporary test images`)
  }
  await client.close()
}
