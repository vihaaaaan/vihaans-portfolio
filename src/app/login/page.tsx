'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(false)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <h1 className="text-base font-serif italic text-gray-700">enter password</h1>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && password) submit() }}
          placeholder="password"
          className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200"
        />
        {error && <p className="text-[11px] font-sans text-red-400 -mt-1">incorrect password</p>}
        <button
          onClick={submit}
          disabled={loading || !password}
          className="text-sm font-sans bg-gray-800 text-white py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
        >
          {loading ? 'unlocking…' : 'enter'}
        </button>
      </div>
    </div>
  )
}
