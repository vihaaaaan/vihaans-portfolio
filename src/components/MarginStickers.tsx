import type { StickerConfig } from '@/data/stickers'

// Content column is max-w-2xl (672px), centered — half-width is 336px.
// Stickers sit GAP px beyond that edge, in the margin gutter.
const HALF_CONTENT_WIDTH = 336
const GAP = 32

// Only rendered once the viewport is wide enough to have real margin space.
export function MarginStickers({ stickers }: { stickers: StickerConfig[] }) {
  if (!stickers.length) return null

  return (
    <div className="hidden xl:block absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {stickers.map((s) => (
        // eslint-disable-next-line @next/next/no-img-element -- unknown intrinsic size per sticker; decorative only
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          className="absolute select-none"
          style={{
            top: s.top,
            width: s.width,
            height: 'auto',
            transform: `rotate(${s.rotate}deg)`,
            [s.side]: `calc(50% + ${HALF_CONTENT_WIDTH + GAP}px)`,
          }}
        />
      ))}
    </div>
  )
}
