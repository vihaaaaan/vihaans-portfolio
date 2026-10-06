#!/usr/bin/env node

const baseUrl = (process.env.LETTERBOXD_SYNC_URL || process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const secret = process.env.LETTERBOXD_SYNC_SECRET
const forceImages = process.argv.includes('--force-images') || process.env.FORCE_LETTERBOXD_IMAGES === '1'

if (!secret) {
  console.error('LETTERBOXD_SYNC_SECRET is not set.')
  process.exit(1)
}

const url = `${baseUrl}/api/letterboxd-sync${forceImages ? '?forceImages=1' : ''}`
const response = await fetch(url, {
  method: 'POST',
  headers: { 'x-sync-secret': secret },
})

const text = await response.text()
let body
try {
  body = JSON.parse(text)
} catch {
  body = text
}

if (!response.ok) {
  console.error(body)
  process.exit(1)
}

console.log(JSON.stringify(body, null, 2))
