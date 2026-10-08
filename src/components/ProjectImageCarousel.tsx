'use client'

import { useRef, useState } from 'react'

interface ProjectImageCarouselProps {
  images: string[]
  projectName: string
}

export function ProjectImageCarousel({ images, projectName }: ProjectImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  if (images.length === 0) return null

  const goToPrev = () => setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  const goToNext = () => setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1))

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const difference = touchStartX.current - touchEndX.current
    if (Math.abs(difference) > 50) difference > 0 ? goToNext() : goToPrev()
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div className="group relative overflow-hidden bg-gray-950">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            /\.(mp4|webm|mov)$/i.test(src) ? (
              <video
                key={src}
                src={src}
                aria-label={`${projectName} video ${index + 1}`}
                className="h-full w-full flex-shrink-0 object-contain"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              <img
                key={src}
                src={src}
                alt={`${projectName} screenshot ${index + 1}`}
                className="h-full w-full flex-shrink-0 object-contain"
                draggable={false}
                decoding="async"
              />
            )
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="previous screenshot"
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 opacity-100 backdrop-blur-sm transition hover:bg-black/65 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="next screenshot"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 opacity-100 backdrop-blur-sm transition hover:bg-black/65 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((src, index) => (
              <button
                type="button"
                key={src}
                onClick={() => setCurrentIndex(index)}
                aria-label={`show screenshot ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
