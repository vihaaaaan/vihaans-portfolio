import crypto from 'crypto'

// A tiny signed-token scheme (HMAC-SHA256), no external deps.
// Token format: base64url(payload).base64url(signature)
// The signature can only be produced with SESSION_SECRET, so the cookie
// value can't be forged the way a plain `admin_session=true` could.

const SECRET = process.env.SESSION_SECRET
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: string) {
  if (!SECRET) throw new Error('SESSION_SECRET is not set')
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function createSession(): string {
  const payload = b64url(JSON.stringify({ admin: true, exp: Date.now() + MAX_AGE_MS }))
  return `${payload}.${sign(payload)}`
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token || !SECRET) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false

  const expected = sign(payload)
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  // timingSafeEqual throws on length mismatch — guard first.
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data?.admin === true && typeof data.exp === 'number' && Date.now() < data.exp
  } catch {
    return false
  }
}
