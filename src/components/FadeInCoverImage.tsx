'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface FadeInCoverImageProps {
  src?: string
  alt: string
  fallback: ReactNode
}

export function FadeInCoverImage({ src, alt, fallback }: FadeInCoverImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) return <>{fallback}</>

  return (
    <>
      <img
        key={src}
        src={src}
        alt={alt}
        decoding="async"
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
    </>
  )
}
