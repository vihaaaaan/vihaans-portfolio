'use client'

import { useEffect, useState } from 'react'
import { FadeInCoverImage } from '@/components/FadeInCoverImage'
import type { BookItemProps, BookshelfAdmin } from '@/types'

const typeEmoji: Record<string, string> = {
  book: '📖',
  movie: '🎬',
  'tv show': '📺',
  tv: '📺',
  show: '📺',
  podcast: '🎙️',
  comic: '💥',
  music: '🎵',
}

const SQUARE_TYPES = new Set(['podcast', 'music'])
const TYPE_OPTIONS = ['book', 'movie', 'tv show', 'podcast', 'comic', 'music']

const emptyForm = { title: '', creators: '', type: 'book', category: '' }

interface Props {
  title: string
  books: BookItemProps[]
  admin?: BookshelfAdmin
  onSave?: (books: BookItemProps[]) => void | Promise<void>
  onClose: () => void
}

export function BookshelfCatalogModal({ title, books, admin, onSave, onClose }: Props) {
  const canEdit = !!admin?.unlocked && !!onSave

  // null = viewing grid, 'new' = adding, number = editing that index
  const [editing, setEditing] = useState<'new' | number | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const startAdd = () => {
    setForm(emptyForm)
    setEditing('new')
  }

  const startEdit = (index: number) => {
    const item = books[index]
    setForm({
      title: item.title,
      creators: (item.creators ?? []).join(', '),
      type: item.type,
      category: item.category,
    })
    setEditing(index)
  }

  const [saving, setSaving] = useState(false)

  const saveForm = async () => {
    if (!form.title.trim() || !onSave) return
    setSaving(true)
    const creators = form.creators.split(',').map((c) => c.trim()).filter(Boolean)
    const type = form.type.trim() || 'book'
    const title = form.title.trim()

    // Resolve + store the cover once, at save time.
    const prev = typeof editing === 'number' ? books[editing] : undefined
    let imageFields: Pick<BookItemProps, 'coverUrl' | 'imageWidth' | 'imageHeight' | 'coverSource'> = {
      coverUrl: prev?.coverUrl,
      imageWidth: prev?.imageWidth,
      imageHeight: prev?.imageHeight,
      coverSource: prev?.coverSource,
    }
    const titleChanged = !prev
      || prev.title !== title
      || prev.type !== type
      || prev.category !== form.category.trim()
      || (prev.creators ?? []).join(', ') !== creators.join(', ')
    if (titleChanged || !imageFields.coverUrl) {
      try {
        const params = new URLSearchParams({
          title,
          type,
          ...(creators[0] ? { creator: creators[0] } : {}),
          ...(type.toLowerCase() === 'movie' && form.category.trim() ? { year: form.category.trim() } : {}),
        })
        const res = await fetch(`/api/cover?${params}`)
        if (res.ok) {
          const resolved = await res.json()
          imageFields = {
            coverUrl: resolved.coverUrl || imageFields.coverUrl,
            imageWidth: resolved.imageWidth || imageFields.imageWidth,
            imageHeight: resolved.imageHeight || imageFields.imageHeight,
            coverSource: resolved.coverSource || imageFields.coverSource,
          }
        }
      } catch {}
    }

    const item: BookItemProps = { title, creators, type, category: form.category.trim(), ...imageFields }
    const next = editing === 'new'
      ? [...books, item]
      : books.map((b, i) => (i === editing ? item : b))
    onSave(next)
    setSaving(false)
    setEditing(null)
  }

  const deleteItem = (index: number) => {
    if (!onSave) return
    onSave(books.filter((_, i) => i !== index))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className="section-enter relative max-h-[80vh] w-full max-w-2xl overflow-y-auto border border-line bg-surface p-6 shadow-xl"
      >
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-serif text-base text-foreground sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-sm leading-none text-subtle transition-colors duration-200 hover:text-foreground"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {editing !== null ? (
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="title"
              className="w-full border border-line px-3 py-2 font-sans text-sm outline-none transition-colors duration-200 focus:border-subtle"
            />
            <input
              value={form.creators}
              onChange={(e) => setForm({ ...form, creators: e.target.value })}
              placeholder="creators (comma separated)"
              className="w-full border border-line px-3 py-2 font-sans text-sm outline-none transition-colors duration-200 focus:border-subtle"
            />
            <div className="flex gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="flex-1 border border-line bg-surface px-3 py-2 font-sans text-sm outline-none transition-colors duration-200 focus:border-subtle"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="category"
                className="flex-1 border border-line px-3 py-2 font-sans text-sm outline-none transition-colors duration-200 focus:border-subtle"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 cursor-pointer border border-line py-2 font-sans text-sm text-muted transition-colors duration-200 hover:bg-surface-muted"
              >
                cancel
              </button>
              <button
                onClick={saveForm}
                disabled={!form.title.trim() || saving}
                className="flex-1 cursor-pointer bg-control py-2 font-sans text-sm text-on-control transition-colors duration-200 hover:bg-control-hover disabled:cursor-default disabled:opacity-40"
              >
                {saving ? 'saving…' : editing === 'new' ? 'add' : 'save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {canEdit && (
              <button
                onClick={startAdd}
                className="mb-4 w-full cursor-pointer border border-dashed border-line py-2 font-sans text-sm text-subtle transition-all duration-200 hover:border-subtle hover:text-body"
              >
                + add item
              </button>
            )}

            {books.length === 0 ? (
              <p className="py-6 text-center font-sans text-sm text-subtle">nothing here yet</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                {books.map((item, index) => {
                  const emoji = typeEmoji[item.type.toLowerCase()] ?? '📄'
                  const coverUrl = item.coverUrl
                  const isSquare = SQUARE_TYPES.has(item.type.toLowerCase())

                  return (
                    <div key={index} className="group/item flex flex-col">
                      <div className="relative">
                        <div
                          className={`relative w-full ${isSquare ? 'aspect-square' : 'aspect-[2/3]'} overflow-hidden border border-line bg-surface-muted`}
                        >
                          <FadeInCoverImage
                            src={coverUrl}
                            alt={item.title}
                            fallback={
                              <div className="w-full h-full flex flex-col items-center justify-center p-1">
                              <span className="text-2xl mb-1">{emoji}</span>
                              <span className="line-clamp-2 text-center font-sans text-[9px] leading-tight text-subtle">
                                {item.title.toLowerCase()}
                              </span>
                              </div>
                            }
                          />
                        </div>

                        {canEdit && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEdit(index)}
                              className="flex h-5 w-5 cursor-pointer items-center justify-center border border-line bg-surface/90 text-[11px] text-body hover:text-foreground"
                              aria-label="edit"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteItem(index)}
                              className="flex h-5 w-5 cursor-pointer items-center justify-center border border-line bg-surface/90 text-[11px] text-body hover:text-red-500"
                              aria-label="delete"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="mt-1.5 line-clamp-2 font-serif text-xs leading-tight text-foreground">
                        {item.title.toLowerCase()}
                      </p>
                      {item.creators?.length > 0 && (
                        <p className="line-clamp-1 font-sans text-[11px] leading-tight text-subtle">
                          {item.creators.join(', ').toLowerCase()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
