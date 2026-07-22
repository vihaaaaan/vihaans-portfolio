'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { BookItemProps, BookshelfAdmin } from '@/types'
import { useBookshelfImages } from '@/context/BookshelfImagesContext'

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
  const coverImages = useBookshelfImages()
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
    let coverUrl = prev?.coverUrl
    const titleChanged = !prev || prev.title !== title || prev.type !== type
    if (titleChanged || !coverUrl) {
      try {
        const params = new URLSearchParams({ title, type, ...(creators[0] ? { creator: creators[0] } : {}) })
        const res = await fetch(`/api/cover?${params}`)
        if (res.ok) coverUrl = (await res.json()).coverUrl || coverUrl
      } catch {}
    }

    const item: BookItemProps = { title, creators, type, category: form.category.trim(), coverUrl }
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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <motion.div
        className="relative bg-white border border-gray-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-lg sm:text-xl font-serif text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200 text-sm cursor-pointer leading-none"
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
              className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200"
            />
            <input
              value={form.creators}
              onChange={(e) => setForm({ ...form, creators: e.target.value })}
              placeholder="creators (comma separated)"
              className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200"
            />
            <div className="flex gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="flex-1 text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200 bg-white"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="category"
                className="flex-1 text-sm font-sans border border-gray-200 focus:border-gray-400 px-3 py-2 outline-none transition-colors duration-200"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 text-sm font-sans border border-gray-200 text-gray-500 py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={saveForm}
                disabled={!form.title.trim() || saving}
                className="flex-1 text-sm font-sans bg-gray-800 text-white py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
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
                className="mb-4 w-full border border-dashed border-gray-200 py-2 text-sm font-sans text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                + add item
              </button>
            )}

            {books.length === 0 ? (
              <p className="text-sm font-sans text-gray-400 py-6 text-center">nothing here yet</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                {books.map((item, index) => {
                  const emoji = typeEmoji[item.type.toLowerCase()] ?? '📄'
                  const coverUrl = item.coverUrl || coverImages[item.title]
                  const isSquare = SQUARE_TYPES.has(item.type.toLowerCase())

                  return (
                    <div key={index} className="group/item flex flex-col">
                      <div className="relative">
                        <div
                          className={`w-full ${isSquare ? 'aspect-square' : 'aspect-[2/3]'} overflow-hidden border border-gray-200 bg-gray-100`}
                        >
                          {coverUrl ? (
                            <img src={coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1">
                              <span className="text-2xl mb-1">{emoji}</span>
                              <span className="text-[8px] font-sans text-gray-400 text-center leading-tight line-clamp-2">
                                {item.title.toLowerCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {canEdit && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEdit(index)}
                              className="w-5 h-5 flex items-center justify-center bg-white/90 border border-gray-200 text-[10px] text-gray-600 hover:text-gray-900 cursor-pointer"
                              aria-label="edit"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteItem(index)}
                              className="w-5 h-5 flex items-center justify-center bg-white/90 border border-gray-200 text-[10px] text-gray-600 hover:text-red-500 cursor-pointer"
                              aria-label="delete"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="mt-1.5 text-[11px] font-serif text-gray-800 leading-tight line-clamp-2">
                        {item.title.toLowerCase()}
                      </p>
                      {item.creators?.length > 0 && (
                        <p className="text-[10px] font-sans text-gray-400 leading-tight line-clamp-1">
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
      </motion.div>
    </motion.div>
  )
}
