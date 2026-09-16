import { Sticker } from '@/components/stickers/Sticker'
import { STICKER_ART } from '@/data/stickers.generated'
import type { StickerConfig } from '@/data/stickers'

// Content column is max-w-2xl (672px), centered — half-width is 336px.
// Stickers sit GAP px beyond that edge, in the margin gutter.
const HALF_CONTENT_WIDTH = 336
const GAP = 32

// Only rendered once the viewport is wide enough to have real margin space.
export function MarginStickers({ stickers }: { stickers: StickerConfig[] }) {
  if (!stickers.length) return null

  return (
    <div className="hidden xl:block absolute inset-0 pointer-events-none z-0 text-gray-700" aria-hidden="true">
      {stickers.map((s) => {
        // A sticker in the RIGHT margin is offset from the left edge, and vice
        // versa — anchoring `right` would push it back across the page.
        const edge = s.side === 'right' ? 'left' : 'right'

        return (
          <Sticker
            key={s.art}
            art={STICKER_ART[s.art]}
            width={s.width}
            move={s.move}
            flipDuration={s.flipDuration}
            className="absolute select-none"
            style={{
              top: s.top,
              rotate: s.rotate ? `${s.rotate}deg` : undefined,
              [edge]: `calc(50% + ${HALF_CONTENT_WIDTH + GAP}px)`,
            }}
          />
        )
      })}
    </div>
  )
}
