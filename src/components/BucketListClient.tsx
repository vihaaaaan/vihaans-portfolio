'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { DatePicker } from '@/components/DatePicker'

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const GRADUATION = new Date(2026, 4, 10, 10, 0, 0)

interface OGPreview {
  title: string | null
  description: string | null
  image: string | null
  hostname: string
  url: string
}

interface BucketItem {
  id: string
  name: string
  location: string | null
  date: string | null
  description: string | null
  link: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

interface Props {
  data: { items: BucketItem[] }
  isAdmin: boolean
}

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}
const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function calcTimeLeft() {
  const diff = GRADUATION.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<OGPreview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => { setPreview(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [url])

  const hostname = (() => {
    try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
  })()
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`

  if (loading) {
    return (
      <div className="mt-3 h-12 rounded-md border border-gray-100 bg-gray-50 animate-pulse" />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="mt-3 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 px-3.5 py-3 group"
    >
      {/* Favicon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconUrl}
        alt=""
        className="w-4 h-4 flex-shrink-0 rounded-sm"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />

      {/* Text */}
      <div className="flex flex-col min-w-0 gap-0.5">
        <p className="text-xs font-sans text-gray-700 truncate group-hover:text-gray-900 transition-colors">
          {preview?.title ?? hostname}
        </p>
        {preview?.description && (
          <p className="text-[11px] font-sans text-gray-400 line-clamp-1 leading-snug">
            {preview.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-gray-300 flex-shrink-0 ml-auto group-hover:text-gray-400 transition-colors">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  )
}

export function BucketListClient({ data, isAdmin }: Props) {
  // Auth
  const [adminUnlocked, setAdminUnlocked] = useState(isAdmin)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Items
  const [items, setItems] = useState<BucketItem[]>(data.items)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newDate, setNewDate] = useState<string | null>(null)
  const [newDescription, setNewDescription] = useState('')
  const [newLink, setNewLink] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Edit modal
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDate, setEditDate] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editLink, setEditLink] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const editNameInputRef = useRef<HTMLInputElement>(null)

  // Countdown
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof calcTimeLeft>>(null)

  useEffect(() => {
    setTimeLeft(calcTimeLeft())
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (showPasswordModal) setTimeout(() => passwordInputRef.current?.focus(), 50)
  }, [showPasswordModal])

  useEffect(() => {
    if (showAddModal) setTimeout(() => nameInputRef.current?.focus(), 50)
  }, [showAddModal])

  useEffect(() => {
    if (editingItem) setTimeout(() => editNameInputRef.current?.focus(), 50)
  }, [editingItem])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(false)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setAuthLoading(false)
    if (res.ok) {
      setAdminUnlocked(true)
      setShowPasswordModal(false)
      setPassword('')
    } else {
      setAuthError(true)
      setPassword('')
      passwordInputRef.current?.focus()
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setAdminUnlocked(false)
  }

  const handleToggle = async (e: React.MouseEvent, id: string, completed: boolean) => {
    e.stopPropagation()
    if (!adminUnlocked) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed, completedAt: completed ? new Date().toISOString() : null } : i))
    await fetch('/api/bucket-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    })
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setItems(prev => prev.filter(i => i.id !== id))
    if (expandedId === id) setExpandedId(null)
    await fetch(`/api/bucket-list?id=${id}`, { method: 'DELETE' })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAddLoading(true)
    const res = await fetch('/api/bucket-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        location: newLocation || null,
        date: newDate,
        description: newDescription || null,
        link: newLink || null,
      }),
    })
    setAddLoading(false)
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [...prev, item])
      closeAddModal()
    }
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setNewName('')
    setNewLocation('')
    setNewDate(null)
    setNewDescription('')
    setNewLink('')
  }

  const openEditModal = (e: React.MouseEvent, item: BucketItem) => {
    e.stopPropagation()
    setEditingItem(item)
    setEditName(item.name)
    setEditLocation(item.location ?? '')
    setEditDate(item.date)
    setEditDescription(item.description ?? '')
    setEditLink(item.link ?? '')
  }

  const closeEditModal = () => {
    setEditingItem(null)
    setEditName('')
    setEditLocation('')
    setEditDate(null)
    setEditDescription('')
    setEditLink('')
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editName.trim()) return
    setEditLoading(true)
    const res = await fetch('/api/bucket-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingItem.id,
        name: editName,
        location: editLocation || null,
        date: editDate,
        description: editDescription || null,
        link: editLink || null,
      }),
    })
    setEditLoading(false)
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      closeEditModal()
    }
  }

  const hasExpandable = (item: BucketItem) => !!(item.description || item.link)

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 sm:my-10 md:my-10 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col py-8 sm:py-10">

        {/* Back link */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-sans text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            portfolio
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="
              text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight
              bg-clip-text text-transparent
              bg-[linear-gradient(90deg,#111,#6b7280,#111)]
              bg-[length:200%_100%]
              animate-[shine_10s_linear_infinite]
            ">
              bucket list
            </h1>
            <style>{`
              @keyframes shine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>

            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap" suppressHydrationWarning>
              {timeLeft === null ? (
                <span className="text-sm font-sans text-gray-400">you graduated 🎓</span>
              ) : (
                <>
                  {[
                    { val: timeLeft.days, label: 'd' },
                    { val: timeLeft.hours, label: 'h' },
                    { val: timeLeft.minutes, label: 'm' },
                    { val: timeLeft.seconds, label: 's' },
                  ].map(({ val, label }) => (
                    <span key={label} className="font-sans text-sm text-gray-400">
                      <span className="font-sans text-base text-gray-400">{String(val).padStart(2, '0')}</span>
                      {label}
                    </span>
                  ))}
                  <span className="text-sm font-sans text-gray-400">until graduation</span>
                </>
              )}
            </div>
          </div>

          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.06, rotate: 1.5 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <Image
              src="/assets/bucket-list/shoe.png"
              alt="shoe"
              width={200}
              height={200}
              className="rounded-sm object-contain mr-4"
            />
          </motion.div>
        </motion.div>

        {/* Edit row */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <AnimatePresence>
            {adminUnlocked && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="inline-flex items-center gap-1.5 text-[11px] font-sans text-gray-400 italic"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                edit mode
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => adminUnlocked ? handleLogout() : setShowPasswordModal(true)}
            className="ml-auto text-gray-300 hover:text-gray-500 transition-colors duration-200 cursor-pointer"
            title={adminUnlocked ? 'exit edit mode' : 'unlock edit mode'}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </motion.div>
          </button>
        </motion.div>

        {/* Items list */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                key="empty"
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5"
              >
                <p className="text-sm font-sans text-gray-400 italic">nothing here yet.</p>
              </motion.div>
            ) : (
              items.map((item) => {
                const isExpanded = expandedId === item.id
                const expandable = hasExpandable(item)
                return (
                  <motion.div
                    key={item.id}
                    layout
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                    className={`
                      bg-white rounded-lg border shadow-sm
                      transition-colors duration-200
                      ${item.completed ? 'border-gray-100' : 'border-gray-200'}
                      ${expandable ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => expandable && setExpandedId(isExpanded ? null : item.id)}
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-3 p-3 sm:p-4">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => handleToggle(e, item.id, !item.completed)}
                        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          adminUnlocked ? 'cursor-pointer' : 'cursor-default'
                        } ${
                          item.completed
                            ? 'bg-gray-800 border-gray-800'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {item.completed && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-serif text-sm sm:text-base transition-all duration-300 ${
                            item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                          }`}>
                            {item.name}
                          </p>
                          {expandable && (
                            <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="w-3 h-3 text-gray-300 flex-shrink-0"
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                            >
                              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </motion.svg>
                          )}
                        </div>
                        {(item.location || item.date) && (
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {item.location && (
                              <span className="text-[11px] font-sans text-gray-400 flex items-center gap-1">
                                <span>📍</span> {item.location.toLowerCase()}
                              </span>
                            )}
                            {item.date && (
                              <span className="text-[11px] font-sans text-gray-400">
                                {formatDate(item.date)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Edit + Delete */}
                      <AnimatePresence>
                        {adminUnlocked && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 mt-0.5"
                          >
                            <button
                              onClick={(e) => openEditModal(e, item)}
                              className="text-gray-200 hover:text-gray-400 transition-colors duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, item.id)}
                              className="text-gray-200 hover:text-red-300 transition-colors duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Expanded body */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto', opacity: 1,
                            transition: {
                              height: { duration: 0.3, ease },
                              opacity: { duration: 0.2, delay: 0.05 },
                            },
                          }}
                          exit={{
                            height: 0, opacity: 0,
                            transition: {
                              height: { duration: 0.22, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
                              opacity: { duration: 0.12 },
                            },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 ml-7 flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="w-full h-px bg-gray-100 mb-3" />
                            {item.description && (
                              <p className="text-xs font-sans text-gray-500 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.link && <LinkPreview url={item.link} />}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>

          {/* Add item button */}
          <AnimatePresence>
            {adminUnlocked && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                onClick={() => setShowAddModal(true)}
                className="mt-1 w-full border border-dashed border-gray-200 rounded-lg py-3 text-sm font-sans text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                + add item
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add item modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <form
                onSubmit={handleAdd}
                className="pointer-events-auto bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-sm flex flex-col gap-3"
                onClick={e => e.stopPropagation()}
                style={{ overflow: 'visible' }}
              >
                <h2 className="text-base font-serif text-gray-700">add item</h2>

                {/* Name */}
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="what do you want to do?"
                  className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 rounded-sm px-3 py-2 outline-none transition-colors duration-200"
                />

                {/* Description */}
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="description (optional)"
                  rows={2}
                  className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 rounded-sm px-3 py-2 outline-none transition-colors duration-200 resize-none"
                />

                {/* Location */}
                <div className="flex items-center gap-2 border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="location (optional)"
                    className="flex-1 text-sm font-sans outline-none bg-transparent text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                {/* Link */}
                <div className="flex items-center gap-2 border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 1 1.242 7.244" />
                  </svg>
                  <input
                    type="url"
                    value={newLink}
                    onChange={e => setNewLink(e.target.value)}
                    placeholder="link (optional)"
                    className="flex-1 text-sm font-sans outline-none bg-transparent text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                {/* Date picker */}
                <div className="border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200" style={{ overflow: 'visible', position: 'relative' }}>
                  <DatePicker value={newDate} onChange={setNewDate} />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 text-sm font-sans border border-gray-200 text-gray-500 rounded-sm py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading || !newName.trim()}
                    className="flex-1 text-sm font-sans bg-gray-800 text-white rounded-sm py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    {addLoading ? 'adding...' : 'add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit item modal */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <form
                onSubmit={handleEdit}
                className="pointer-events-auto bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-sm flex flex-col gap-3"
                onClick={e => e.stopPropagation()}
                style={{ overflow: 'visible' }}
              >
                <h2 className="text-base font-serif text-gray-700">edit item</h2>

                <input
                  ref={editNameInputRef}
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="what do you want to do?"
                  className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 rounded-sm px-3 py-2 outline-none transition-colors duration-200"
                />

                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="description (optional)"
                  rows={2}
                  className="w-full text-sm font-sans border border-gray-200 focus:border-gray-400 rounded-sm px-3 py-2 outline-none transition-colors duration-200 resize-none"
                />

                <div className="flex items-center gap-2 border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    placeholder="location (optional)"
                    className="flex-1 text-sm font-sans outline-none bg-transparent text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                <div className="flex items-center gap-2 border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 1 1.242 7.244" />
                  </svg>
                  <input
                    type="url"
                    value={editLink}
                    onChange={e => setEditLink(e.target.value)}
                    placeholder="link (optional)"
                    className="flex-1 text-sm font-sans outline-none bg-transparent text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                <div className="border border-gray-200 focus-within:border-gray-400 rounded-sm px-3 py-2 transition-colors duration-200" style={{ overflow: 'visible', position: 'relative' }}>
                  <DatePicker value={editDate} onChange={setEditDate} />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 text-sm font-sans border border-gray-200 text-gray-500 rounded-sm py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !editName.trim()}
                    className="flex-1 text-sm font-sans bg-gray-800 text-white rounded-sm py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    {editLoading ? 'saving...' : 'save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Password modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPasswordModal(false); setAuthError(false); setPassword('') }}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <form
                onSubmit={handleLogin}
                className="pointer-events-auto bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-72 flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-base font-serif text-gray-700">enter password</h2>
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setAuthError(false) }}
                  placeholder="password"
                  className={`w-full text-sm font-sans border rounded-sm px-3 py-2 outline-none transition-colors duration-200 ${
                    authError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {authError && (
                  <p className="text-[11px] font-sans text-red-400 -mt-2">incorrect password</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading || !password}
                  className="w-full text-sm font-sans bg-gray-800 text-white rounded-sm py-2 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  {authLoading ? 'checking...' : 'unlock'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
