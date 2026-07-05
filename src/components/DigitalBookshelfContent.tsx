'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BookshelfRow } from '@/components/BookshelfRow'
import { BookshelfCatalogModal } from '@/components/BookshelfCatalogModal'
import type { BookItemProps, DigitalBookshelfContentProps } from '@/types'

const DEFAULT_BUCKET_TITLES: Record<'current' | 'future', string> = {
  current: 'current + just finished',
  future: 'future',
}

export function DigitalBookshelfContent({ current, future, buckets, admin }: DigitalBookshelfContentProps) {
  const [openKey, setOpenKey] = useState<'current' | 'future' | null>(null)
  const BUCKET_TITLES = { ...DEFAULT_BUCKET_TITLES, ...(buckets ?? {}) }

  const booksFor = (key: 'current' | 'future'): BookItemProps[] => (key === 'current' ? current : future)

  return (
    <>
      <BookshelfRow
        title={BUCKET_TITLES.current}
        books={current}
        onOpenCatalog={() => setOpenKey('current')}
      />
      <BookshelfRow
        title={BUCKET_TITLES.future}
        books={future}
        onOpenCatalog={() => setOpenKey('future')}
      />

      <AnimatePresence>
        {openKey && (
          <BookshelfCatalogModal
            title={BUCKET_TITLES[openKey]}
            books={booksFor(openKey)}
            admin={admin}
            onSave={admin ? (books) => admin.updateBucket(openKey, books) : undefined}
            onClose={() => setOpenKey(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
