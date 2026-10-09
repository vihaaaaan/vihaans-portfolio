'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookshelfCatalogModal } from '@/components/BookshelfCatalogModal'
import { loadItemVariants, loadListVariants } from '@/lib/motion'
import type { BookItemProps, DigitalBookshelfContentProps } from '@/types'

type BucketKey = 'current' | 'future'

const DEFAULT_BUCKET_TITLES: Record<'current' | 'future', string> = {
  current: 'current + just finished',
  future: 'future',
}

const TYPE_EMOJI: Record<string, string> = {
  book: '📖',
  movie: '🎬',
  'tv show': '📺',
  tv: '📺',
  show: '📺',
  podcast: '🎙️',
  comic: '💥',
  music: '♪',
}

function typeLabel(item: BookItemProps) {
  return [item.type, item.category].filter(Boolean).join(' · ').toLowerCase()
}

function itemSeed(item: BookItemProps, index: number) {
  return `${item.title}-${item.category}-${index}`.split('').reduce((sum, char) => (
    (sum * 31 + char.charCodeAt(0)) % 9973
  ), 17)
}

function imageRatioFor(item: BookItemProps) {
  if (item.imageWidth && item.imageHeight) return item.imageWidth / item.imageHeight
  const type = item.type.toLowerCase()
  if (type === 'podcast' || type === 'music') return 1
  if (type === 'movie' && item.coverSource === 'tmdb') return 16 / 9
  return 2 / 3
}

interface CollageTile {
  item: BookItemProps
  index: number
  width: number
  height: number
}

interface CollageRow {
  tiles: CollageTile[]
  width: number
  align: 'flex-start' | 'center' | 'flex-end'
  direction: 'row' | 'row-reverse'
}

function messyTargetHeight(containerWidth: number, rowIndex: number) {
  const base = containerWidth < 460 ? 92 : 118
  const pattern = [1.04, 0.82, 1.18, 0.94]
  return base * pattern[rowIndex % pattern.length]
}

function buildCollageRows(items: BookItemProps[], containerWidth: number, gap: number): CollageTile[][] {
  if (items.length === 0 || containerWidth <= 0) return []

  const groups: Array<Array<{ item: BookItemProps; index: number; ratio: number }>> = []
  let pending: Array<{ item: BookItemProps; index: number; ratio: number }> = []
  let ratioSum = 0

  const pushGroup = () => {
    if (pending.length === 0) return
    groups.push(pending)
    pending = []
    ratioSum = 0
  }

  items.forEach((item, index) => {
    const ratio = imageRatioFor(item)
    pending.push({ item, index, ratio })
    ratioSum += ratio

    const targetHeight = messyTargetHeight(containerWidth, groups.length)
    const projectedWidth = ratioSum * targetHeight + gap * (pending.length - 1)
    const fillTarget = groups.length % 3 === 1 ? 0.66 : 0.82
    if (projectedWidth >= containerWidth * fillTarget || pending.length >= 4) pushGroup()
  })

  pushGroup()

  const lastGroup = groups[groups.length - 1]
  if (lastGroup?.length === 1 && groups.length > 1 && groups[groups.length - 2].length > 1) {
    lastGroup.unshift(groups[groups.length - 2].pop()!)
  } else if (lastGroup?.length === 1 && groups.length > 1) {
    groups[groups.length - 2].push(lastGroup[0])
    groups.pop()
  }

  return groups.map((group, groupIndex) => {
    const groupRatioSum = group.reduce((sum, tile) => sum + tile.ratio, 0)
    const gaps = gap * (group.length - 1)
    const rowWidth = containerWidth * ([0.98, 0.82, 0.9, 0.74][groupIndex % 4])
    const filledHeight = (rowWidth - gaps) / groupRatioSum
    const targetHeight = messyTargetHeight(containerWidth, groupIndex)
    const isLast = groupIndex === groups.length - 1
    const shouldFill = !isLast || filledHeight <= targetHeight * 1.1
    const rowHeight = Math.max(containerWidth < 460 ? 58 : 70, shouldFill ? filledHeight : targetHeight)

    return group.map(({ item, index, ratio }) => ({
      item,
      index,
      width: ratio * rowHeight,
      height: rowHeight,
    }))
  })
}

function rowWidth(row: CollageTile[], gap: number) {
  return row.reduce((sum, tile) => sum + tile.width, 0) + gap * Math.max(0, row.length - 1)
}

function rowSeed(row: CollageTile[], rowIndex: number) {
  return row.reduce((sum, tile) => (
    (sum + itemSeed(tile.item, tile.index) * (tile.index + 3)) % 9973
  ), rowIndex * 431)
}

function rowAlign(row: CollageTile[], rowIndex: number): CollageRow['align'] {
  const options = ['flex-start', 'center', 'flex-end'] as const
  return options[rowSeed(row, rowIndex) % options.length]
}

function rowDirection(row: CollageTile[], rowIndex: number): CollageRow['direction'] {
  return rowSeed(row, rowIndex) % 2 === 0 ? 'row' : 'row-reverse'
}

function MediaTile({ item, index, width, height }: CollageTile) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const emoji = TYPE_EMOJI[item.type.toLowerCase()] ?? '□'

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [item.coverUrl])

  return (
    <article
      tabIndex={0}
      aria-label={`${item.title}, ${typeLabel(item)}`}
      className="group relative shrink-0 overflow-hidden bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400"
      style={{ width, height }}
    >
      {item.coverUrl && !failed && (
        <img
          key={item.coverUrl}
          src={item.coverUrl}
          alt=""
          width={item.imageWidth}
          height={item.imageHeight}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`block h-auto w-full transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        />
      )}
      {(!item.coverUrl || failed) && (
        <div className="flex aspect-[2/3] items-center justify-center text-xl text-gray-400" aria-hidden="true">
          {emoji}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gray-950/75 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
        <h4 className="line-clamp-2 text-xs font-serif leading-tight text-white lowercase">
          {item.title}
        </h4>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-sans leading-tight text-gray-300 lowercase">
          {typeLabel(item)}
        </p>
      </div>
    </article>
  )
}

function BookshelfCollage({ books }: { books: BookItemProps[] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(620)
  const gap = 8
  const rows = buildCollageRows(books, width, gap).map((tiles, rowIndex) => ({
    tiles,
    width: rowWidth(tiles, gap),
    align: rowAlign(tiles, rowIndex),
    direction: rowDirection(tiles, rowIndex),
  }))

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const syncWidth = () => setWidth(node.clientWidth)
    syncWidth()
    const observer = new ResizeObserver(syncWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="mx-auto flex w-full max-w-[620px] flex-col" style={{ gap }}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-start"
          style={{ gap, justifyContent: row.align, flexDirection: row.direction, width: '100%' }}
        >
          {row.tiles.map((tile) => (
            <MediaTile
              key={`${tile.item.source ?? 'manual'}-${tile.item.title}-${tile.index}`}
              {...tile}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface ListSectionProps {
  title: string
  books: BookItemProps[]
  canEdit: boolean
  onEdit: () => void
}

function BookshelfListSection({ title, books, canEdit, onEdit }: ListSectionProps) {
  return (
    <motion.section variants={loadItemVariants} className="mt-5 first:mt-3">
      <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-gray-200 pb-0.5">
        <div className="min-w-0">
          <h3 className="font-serif text-sm lowercase text-gray-900 sm:text-base">{title}</h3>
        </div>
        {canEdit && (
          <button
            onClick={onEdit}
            className="shrink-0 cursor-pointer font-sans text-[11px] text-gray-400 transition-colors duration-200 hover:text-gray-700"
          >
            edit
          </button>
        )}
      </div>

      {books.length === 0 ? (
        <div className="py-4 font-sans text-xs lowercase text-gray-400">
          nothing here yet
        </div>
      ) : (
        <BookshelfCollage books={books} />
      )}
    </motion.section>
  )
}

export function DigitalBookshelfContent({ current, future, buckets, admin }: DigitalBookshelfContentProps) {
  const [openKey, setOpenKey] = useState<'current' | 'future' | null>(null)
  const [currentBooks, setCurrentBooks] = useState(current)
  const [futureBooks, setFutureBooks] = useState(future)
  const BUCKET_TITLES = { ...DEFAULT_BUCKET_TITLES, ...(buckets ?? {}) }

  useEffect(() => {
    setCurrentBooks(current)
  }, [current])

  useEffect(() => {
    setFutureBooks(future)
  }, [future])

  const booksFor = (key: BucketKey): BookItemProps[] => (
    key === 'current' ? currentBooks : futureBooks
  )

  const handleSave = async (key: BucketKey, books: BookItemProps[]) => {
    if (key === 'current') setCurrentBooks(books)
    else setFutureBooks(books)
    await admin?.updateBucket(key, books)
  }

  const canEdit = !!admin?.unlocked

  return (
    <>
      <motion.div variants={loadListVariants}>
        <BookshelfListSection
          title={BUCKET_TITLES.current}
          books={currentBooks}
          canEdit={canEdit}
          onEdit={() => setOpenKey('current')}
        />
        <BookshelfListSection
          title={BUCKET_TITLES.future}
          books={futureBooks}
          canEdit={canEdit}
          onEdit={() => setOpenKey('future')}
        />
      </motion.div>

      <AnimatePresence>
        {openKey && (
          <BookshelfCatalogModal
            title={BUCKET_TITLES[openKey]}
            books={booksFor(openKey)}
            admin={admin}
            onSave={admin ? (books) => handleSave(openKey, books) : undefined}
            onClose={() => setOpenKey(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
