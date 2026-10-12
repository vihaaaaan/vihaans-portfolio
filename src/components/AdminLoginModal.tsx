'use client'

import { useEffect, useState } from 'react'

export function AdminLoginModal({ onAuthenticated, onClose }: {
  onAuthenticated: () => void
  onClose: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const login = async () => {
    if (!password || loading) return
    setLoading(true)
    setError(false)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (response.ok) onAuthenticated()
    else setError(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="close login" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="admin-login-title" className="section-enter relative flex w-full max-w-xs flex-col gap-3 border border-gray-200 bg-white p-6 shadow-xl">
        <h2 id="admin-login-title" className="font-serif text-lg text-gray-900">enter password</h2>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(event) => { setPassword(event.target.value); setError(false) }}
          onKeyDown={(event) => { if (event.key === 'Enter') void login() }}
          placeholder="password"
          className="w-full border border-gray-200 px-3 py-2 font-sans text-sm outline-none transition-colors duration-150 focus:border-gray-400"
        />
        {error ? <p className="-mt-1 font-sans text-[11px] text-red-400">incorrect password</p> : null}
        <button
          type="button"
          onClick={() => void login()}
          disabled={loading || !password}
          className="cursor-pointer bg-gray-800 py-2 font-sans text-sm text-white transition-colors duration-150 hover:bg-gray-700 disabled:cursor-default disabled:opacity-40"
        >
          {loading ? 'unlocking…' : 'unlock'}
        </button>
      </div>
    </div>
  )
}
