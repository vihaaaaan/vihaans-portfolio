'use client'

import type { ProjectItemProps } from '@/types'
import { useState } from 'react'

interface ProjectCardProps extends ProjectItemProps {
  featured?: boolean
  onOpen: (images: string[]) => void
}

export function ProjectCard({
  name,
  emoji,
  blurb,
  images = [],
  featured = false,
  onOpen,
}: ProjectCardProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)

  const videoPreview = images.find((src) => /\.(mp4|webm|mov)$/i.test(src))
  const previewImage = videoPreview ?? images[0]
  const previewIsVideo = /\.(mp4|webm|mov)$/i.test(previewImage ?? '')
  const mediaReady = !previewImage || mediaLoaded

  return (
    <button
      type="button"
      aria-label={`open ${name} project details`}
      aria-haspopup="dialog"
      onClick={() => onOpen(images)}
      className={`group relative block w-full overflow-hidden bg-gray-900 text-left shadow-sm outline-none ring-1 ring-black/10 transition-[opacity,transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-gray-500 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(17,24,39,0.16)] active:scale-[0.995] ${mediaReady ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <div className="relative aspect-[16/10]">
        {previewImage && previewIsVideo ? (
            <video
              src={previewImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setMediaLoaded(true)}
              className="absolute inset-0 h-full w-full object-contain"
            />
        ) : previewImage ? (
          <img
            key={previewImage}
            src={previewImage}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setMediaLoaded(true)}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : null}

        {!previewImage ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#4b5563,_#111827_68%)]" />
        ) : null}

        {!previewImage ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30" aria-hidden="true">
            {emoji}
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 transition-colors duration-300 group-hover:from-black/95 group-hover:via-black/35" />

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <div className="min-w-0">
            <h3 className={`${featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-serif leading-none text-white`}>
              {name.toLowerCase()}
            </h3>
            <p className="mt-1 line-clamp-2 font-sans text-[9px] leading-snug text-white/70 sm:text-[10px]">
              {blurb.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}
