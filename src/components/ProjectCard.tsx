'use client'

import type { ProjectItemProps } from '@/types'
import { loadTransition, LOAD_Y } from '@/lib/motion'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProjectCardProps extends ProjectItemProps {
  featured?: boolean
  onOpen: (images: string[]) => void
}

export function ProjectCard({
  name,
  emoji,
  blurb,
  containsImages,
  featured = false,
  onOpen,
}: ProjectCardProps) {
  const [images, setImages] = useState<string[]>([])
  const [imagesFetched, setImagesFetched] = useState(!containsImages)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set())
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    setImages([])
    setLoadedImages(new Set())
    setImagesFetched(!containsImages)
    if (!containsImages) return

    const controller = new AbortController()
    fetch(`/api/project-images?name=${encodeURIComponent(name)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        setImages(data.images ?? [])
        setImagesFetched(true)
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setImagesFetched(true)
      })

    return () => controller.abort()
  }, [containsImages, name])

  const videoPreview = images.find((src) => /\.(mp4|webm|mov)$/i.test(src))
  const previewImage = videoPreview ?? images[previewIndex % Math.max(images.length, 1)]
  const previewIsVideo = /\.(mp4|webm|mov)$/i.test(previewImage ?? '')
  const mediaReady = imagesFetched && (!previewImage || loadedImages.has(previewImage))

  const markLoaded = (src: string) => {
    setLoadedImages((loaded) => {
      if (loaded.has(src)) return loaded
      const next = new Set(loaded)
      next.add(src)
      return next
    })
  }

  useEffect(() => {
    setPreviewIndex(0)
    if (videoPreview || images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => {
      setPreviewIndex((index) => (index + 1) % images.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [images.length, videoPreview])

  return (
    <motion.button
      type="button"
      aria-label={`open ${name} project details`}
      aria-haspopup="dialog"
      onClick={() => onOpen(images)}
      className="group relative block w-full overflow-hidden rounded-md bg-gray-900 text-left shadow-sm outline-none ring-1 ring-black/10 transition-shadow focus-visible:ring-2 focus-visible:ring-gray-500"
      initial={{ opacity: 0, y: LOAD_Y }}
      animate={mediaReady ? { opacity: 1, y: 0 } : { opacity: 0, y: LOAD_Y }}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(17, 24, 39, 0.16)', transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.995, transition: { duration: 0.12 } }}
      transition={loadTransition}
    >
      <div className="relative aspect-[36/25]">
        {previewImage && previewIsVideo ? (
            <video
              src={previewImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => markLoaded(previewImage)}
              className="absolute inset-0 h-full w-full object-contain"
            />
        ) : (
          images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="eager"
              decoding="async"
              onLoad={() => markLoaded(src)}
              className={`absolute inset-0 h-full w-full object-contain ${index === previewIndex ? 'visible' : 'invisible'}`}
            />
          ))
        )}

        {!previewImage ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#4b5563,_#111827_68%)]" />
        ) : null}

        {!previewImage ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30" aria-hidden="true">
            {emoji}
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 transition-colors duration-300 group-hover:from-black/95 group-hover:via-black/35" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className={`${featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-serif leading-none text-white`}>
              {name.toLowerCase()}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[11px] font-sans leading-snug text-white/70 sm:text-xs">
              {blurb.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
