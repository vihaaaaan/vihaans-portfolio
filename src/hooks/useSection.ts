'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RemoteSectionKey, SectionDocumentMap } from '@/types'

type AnySection = SectionDocumentMap[RemoteSectionKey]
type SectionState<K extends RemoteSectionKey> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: SectionDocumentMap[K]; error: null }
  | { status: 'error'; data: null; error: Error }

const sectionCache = new Map<RemoteSectionKey, AnySection>()
const requestCache = new Map<RemoteSectionKey, Promise<AnySection>>()

async function requestSection<K extends RemoteSectionKey>(key: K): Promise<SectionDocumentMap[K]> {
  const cached = sectionCache.get(key) as SectionDocumentMap[K] | undefined
  if (cached) return cached

  let request = requestCache.get(key)
  if (!request) {
    request = fetch(`/api/section?section=${key}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load ${key}`)
        return response.json() as Promise<AnySection>
      })
      .then((data) => {
        sectionCache.set(key, data)
        requestCache.delete(key)
        return data
      })
      .catch((error) => {
        requestCache.delete(key)
        throw error
      })
    requestCache.set(key, request)
  }

  return request as Promise<SectionDocumentMap[K]>
}

export function preloadSection(key: RemoteSectionKey) {
  void requestSection(key).catch(() => undefined)
}

export function useSection<K extends RemoteSectionKey>(key: K) {
  const cached = sectionCache.get(key) as SectionDocumentMap[K] | undefined
  const [state, setState] = useState<SectionState<K>>(() => cached
    ? { status: 'ready', data: cached, error: null }
    : { status: 'loading', data: null, error: null })

  useEffect(() => {
    let active = true
    const available = sectionCache.get(key) as SectionDocumentMap[K] | undefined
    if (available) {
      setState({ status: 'ready', data: available, error: null })
      return () => { active = false }
    }

    setState({ status: 'loading', data: null, error: null })
    requestSection(key)
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null })
      })
      .catch((error: Error) => {
        if (active) setState({ status: 'error', data: null, error })
      })

    return () => { active = false }
  }, [key])

  const mutate = useCallback((update: (current: SectionDocumentMap[K]) => SectionDocumentMap[K]) => {
    const current = sectionCache.get(key) as SectionDocumentMap[K] | undefined
    if (!current) return
    const next = update(current)
    sectionCache.set(key, next)
    setState({ status: 'ready', data: next, error: null })
  }, [key])

  return { ...state, mutate }
}
