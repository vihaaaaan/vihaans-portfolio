'use client'

import { BookshelfRow } from '@/components/BookshelfRow'
import type { DigitalBookshelfContentProps } from '@/types'

export function DigitalBookshelfContent({ current, future }: DigitalBookshelfContentProps) {
  return (
    <>
      <BookshelfRow title="current + just finished" books={current} />
      <BookshelfRow title="future" books={future} />
    </>
  )
}
