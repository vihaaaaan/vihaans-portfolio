export interface StickerConfig {
  /** Path under /public/stickers, e.g. '/stickers/coffee.png' */
  src: string
  alt: string
  side: 'left' | 'right'
  /** CSS `top` value, e.g. '18%' or '420px' */
  top: string
  /** Rendered width in px; height scales automatically */
  width: number
  /** Rotation in degrees, for a scattered/stuck-on feel */
  rotate: number
}

// Fixed positions scattered down the page. Add one entry per sticker once
// its outlined PNG exists in public/stickers/ (see scripts/add-sticker-outline.mjs).
export const stickers: StickerConfig[] = [
  // { src: '/stickers/coffee.png', alt: 'coffee cup', side: 'left', top: '12%', width: 72, rotate: -8 },
]
