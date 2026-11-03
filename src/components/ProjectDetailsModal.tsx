'use client'

import { ProjectImageCarousel } from '@/components/ProjectImageCarousel'
import type { ProjectItemProps } from '@/types'
import { useEffect, useRef } from 'react'

interface ProjectDetailsModalProps {
  project: ProjectItemProps
  images: string[]
  onClose: () => void
}

export function ProjectDetailsModal({ project, images, onClose }: ProjectDetailsModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('disabled'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const previousOverflow = document.body.style.overflow

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5"
    >
      <button
        type="button"
        aria-label="close project details"
        className="absolute inset-0 cursor-default bg-gray-950/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        className="section-enter relative z-10 max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-surface shadow-2xl sm:max-h-[90vh] sm:rounded-lg"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="close project details"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur-sm transition hover:bg-black/65 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        {images.length > 0 ? (
          <ProjectImageCarousel images={images} projectName={project.name} />
        ) : (
          <div className="flex aspect-[16/8] items-center justify-center bg-gray-900 text-5xl text-white/30" aria-hidden="true">
            {project.emoji}
          </div>
        )}

        <div className="p-4 lowercase sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="project-dialog-title" className="font-serif text-xl leading-none text-foreground sm:text-2xl">
                {project.name.toLowerCase()}
              </h2>
              <p className="mt-2 font-sans text-[11px] leading-relaxed text-muted sm:text-xs">
                {project.blurb.toLowerCase()}
              </p>
            </div>
            {project.status ? (
              <span className="shrink-0 rounded-full border border-line px-2.5 py-1 font-sans text-[10px] tracking-[0.12em] text-muted">
                {project.status.toLowerCase()}
              </span>
            ) : null}
          </div>

          {project.description.length > 0 ? (
            <div className="mt-4 space-y-1.5 border-t border-line pt-4">
              {project.description.map((paragraph) => (
                <p key={paragraph} className="font-sans text-[11px] leading-[1.65] text-body sm:text-xs">
                  {paragraph.toLowerCase()}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-sm bg-surface-strong px-2 py-1 font-sans text-[10px] text-muted">
                  {tag.toLowerCase()}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {project.links.map(([label, href]) => (
                <a
                  key={`${label}-${href}`}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-[10px] text-body underline decoration-line underline-offset-4 sm:text-[11px]"
                >
                  {label.toLowerCase()}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
