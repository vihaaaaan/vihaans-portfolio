'use client'

import type { ContentHeaderProps } from '@/types'

export function ContentHeader({ sectionSubtitle }: ContentHeaderProps) {
  // Section title is intentionally not rendered (it still lives in the DB and
  // powers the emoji hover tooltip). We show only the subtitle, forced lowercase.
  return (
    <h2 className="text-sm sm:text-base font-sans text-gray-500 lowercase">{sectionSubtitle}</h2>
  )
}
