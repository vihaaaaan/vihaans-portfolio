import type { BookItemProps } from '@/types'

export function keepManualBooks(items: BookItemProps[] = []): BookItemProps[] {
  return items.filter((item) => item.source !== 'letterboxd')
}

export function mergeLetterboxdItems(
  existing: BookItemProps[] = [],
  fresh: BookItemProps[] = [],
  error: string | null = null
): BookItemProps[] {
  if (error) return existing
  return [...fresh, ...keepManualBooks(existing)]
}
