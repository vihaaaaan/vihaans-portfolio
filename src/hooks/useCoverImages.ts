'use client'

import { useState, useEffect } from 'react'
import type { BookItemProps } from '@/types'
import { fetchMovieCover, fetchTVCover, fetchBookCover, fetchPodcastCover } from './coverApi'

function preload(url: string) {
  const img = new window.Image()
  img.src = url
}

export function useCoverImages(items: BookItemProps[]): Record<string, string> {
  const [images, setImages] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!items.length) return

    Promise.all(
      items.map(async (item) => {
        const query = item.coverSearchQuery ?? item.title
        const type = item.type.toLowerCase()
        const creator = item.creators?.[0]

        let url = ''
        if (type === 'movie') url = await fetchMovieCover(query)
        else if (type === 'tv' || type === 'tv show' || type === 'show') url = await fetchTVCover(query)
        else if (type === 'book' || type === 'comic') url = await fetchBookCover(query, creator)
        else if (type === 'podcast') url = await fetchPodcastCover(query)

        if (url) preload(url)
        return [item.title, url] as [string, string]
      })
    ).then((entries) =>
      setImages(Object.fromEntries(entries.filter(([, url]) => url)))
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return images
}
