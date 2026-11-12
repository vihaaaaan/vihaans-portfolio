'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BookItemProps, ProjectItemProps } from '@/types'

interface ImageAsset { id: string; url: string; name: string; folder?: string; size: number; width?: number; height?: number }
interface Destination { label: string; kind: string; bucket?: string; index?: number; name?: string; oldId?: string }
const library: Destination = { label: 'image library only', kind: 'library' }

export function ImageLibraryModal({ onClose }: { onClose: () => void }) {
  const [images, setImages] = useState<ImageAsset[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([library])
  const [destination, setDestination] = useState(0)
  const [folder, setFolder] = useState('all')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const dialog = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const active = useRef(true)

  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]') ?? [])]
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    const read = async (url: string) => {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error('Unable to load the image library. Please sign in again.')
      return response.json()
    }
    Promise.all([read('/api/images'), read('/api/section?section=projects'), read('/api/section?section=bookshelf')])
      .then(([assets, projects, bookshelf]) => {
        setImages(assets.images)
        const choices: Destination[] = [library, ...assets.images.map((image: ImageAsset) => ({ label: `replace image — ${image.name}`, kind: 'replacement', oldId: image.id }))]
        for (const bucket of ['current', 'prev', 'items']) for (const [index, item] of ((projects[bucket] ?? []) as ProjectItemProps[]).entries()) {
          choices.push({ label: `add screenshot — ${item.name}`, kind: 'project', bucket, index, name: item.name })
        }
        for (const bucket of ['current', 'future']) for (const [index, item] of ((bookshelf[bucket] ?? []) as BookItemProps[]).entries()) {
          choices.push({ label: `replace cover — ${item.title}`, kind: 'cover', bucket, index, name: item.title })
        }
        setDestinations(choices)
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => {
      active.current = false
      controller.abort()
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  const upload = async () => {
    if (!file) return
    setError(''); setMessage('')
    if (file.size > 4 * 1024 * 1024) { setError('Choose an image no larger than 4 MB.'); return }
    setBusy(true)
    try {
      const form = new FormData()
      form.set('file', file)
      const target = destinations[destination]
      for (const [key, value] of Object.entries(target)) if (key !== 'label') form.set(key, String(value))
      const response = await fetch('/api/images', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')
      if (!active.current) return
      const refreshed = await fetch('/api/images')
      if (!refreshed.ok) throw new Error('Image saved, but the library could not refresh. Reopen it to see the upload.')
      const assets = await refreshed.json()
      if (!active.current) return
      setImages(assets.images)
      setFolder('all')
      setDestinations(current => [{ label: `replace image — ${file.name}`, kind: 'replacement', oldId: result.id }, ...current])
      setDestination(0)
      setFile(null)
      if (input.current) input.current.value = ''
      setMessage(target.kind === 'library' ? 'Original saved. Use its image URL wherever you need it.' : 'Image saved and attached. Reload the page to see the change.')
    } catch (error) { if (active.current) setError(error instanceof Error ? error.message : 'Upload failed') }
    finally { if (active.current) setBusy(false) }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onClick={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="image-library-title" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-5 text-foreground shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="image-library-title" className="font-serif text-xl">image library</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="close image library" className="p-2 disabled:opacity-40">✕</button>
        </div>
        <div className="space-y-3 border-b border-line pb-5 text-sm">
          <label className="block">use image for
            <select value={destination} onChange={event => setDestination(Number(event.target.value))} disabled={busy || loading} className="mt-1 block w-full rounded border border-line bg-surface p-2">
              {destinations.map((item, index) => <option key={index} value={index}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">original image · up to 4 MB
            <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif" disabled={busy} onChange={event => setFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs" />
          </label>
          <button type="button" onClick={upload} disabled={!file || busy || loading} className="rounded bg-foreground px-3 py-2 text-surface disabled:opacity-40">{busy ? 'uploading…' : 'upload original'}</button>
          {error ? <p role="alert" className="text-red-500">{error}</p> : null}
          {message ? <p role="status">{message}</p> : null}
        </div>
        {loading ? <p role="status" className="py-4 text-sm">loading images…</p> : null}
        <label className="mt-5 block text-sm">folder
          <select value={folder} onChange={event => setFolder(event.target.value)} className="mt-1 block w-full rounded border border-line bg-surface p-2">
            <option value="all">all images</option>
            {[...new Set(images.map(image => image.folder ?? 'library'))].sort().map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.filter(image => folder === 'all' || (image.folder ?? 'library') === folder).map(image => <div key={image.id} className="min-w-0">
            <a href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt={image.name} loading="lazy" className="h-28 w-full rounded border border-line bg-surface object-contain" /></a>
            <p className="mt-1 break-words text-xs">{image.name}</p>
            <p className="text-[10px] text-muted">{image.width} × {image.height} · {Math.ceil(image.size / 1024)} KB</p>
            <input aria-label={`image URL for ${image.name}`} readOnly value={image.url} onFocus={event => event.target.select()} className="mt-1 w-full rounded border border-line bg-surface p-1 text-[10px]" />
          </div>)}
        </div>
      </div>
    </div>, document.body,
  )
}
