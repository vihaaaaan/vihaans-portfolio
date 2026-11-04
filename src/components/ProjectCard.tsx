'use client'

import type { ProjectItemProps } from '@/types'
import { loadTransition, LOAD_Y } from '@/lib/motion'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ProjectCardProps extends ProjectItemProps {
  revealDelay?: number
  onOpen: (images: string[]) => void
}

export function ProjectCard({
  name,
  emoji,
  blurb,
  images = [],
  revealDelay = 0,
  onOpen,
}: ProjectCardProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)

  const videoPreview = images.find((src) => /\.(mp4|webm|mov)$/i.test(src))
  const previewImage = videoPreview ?? images[0]
  const previewIsVideo = /\.(mp4|webm|mov)$/i.test(previewImage ?? '')

  return (
    <motion.button
      type="button"
      aria-label={`open ${name} project details`}
      aria-haspopup="dialog"
      onClick={() => onOpen(images)}
      className="group relative block w-full overflow-hidden bg-transparent text-left outline-none focus-visible:ring-1 focus-visible:ring-subtle"
      initial={{ opacity: 0, y: LOAD_Y }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.995, transition: { duration: 0.12 } }}
      transition={{ ...loadTransition, delay: revealDelay }}
    >
      <div className="relative aspect-[36/25] overflow-hidden">
        {previewImage && previewIsVideo ? (
            <video
              src={previewImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setMediaLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${mediaLoaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
            />
        ) : previewImage ? (
          <img
            key={previewImage}
            src={previewImage}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setMediaLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${mediaLoaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
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

        <div className="absolute inset-0 flex flex-col justify-end bg-gray-950/75 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
          <div className="min-w-0">
            <h3 className="font-serif text-sm leading-none text-white sm:text-base">
              {name.toLowerCase()}
            </h3>
            <p className="mt-1.5 line-clamp-2 font-sans text-[9px] leading-snug text-white/75 sm:text-[10px]">
              {blurb.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
