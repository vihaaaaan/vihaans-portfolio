import type { MotionName } from '@/components/stickers/motions'
import { STICKER_ART, type StickerArtName } from '@/data/stickers.generated'

export interface StickerConfig {
  /** Which prepared drawing to use — a key of STICKER_ART, filled in by
   *  `npm run stickers` from whatever is in stickers-raw/. */
  art: StickerArtName
  side: 'left' | 'right'
  /** How far down the page, e.g. '18%' or '420px' */
  top: string
  /** Rendered width in px; height follows the drawing */
  width: number
  /** How the drawing moves on the page. See components/stickers/motions.ts */
  move?: MotionName
  /** Seconds for one loop of a flipbook. Ignored for still drawings. */
  flipDuration?: number
  /** Resting tilt in degrees, for a stuck-on feel */
  rotate?: number
}

// Scattered down both margins. Keep them sparse — they're marginalia, not
// content, and anything that competes with the text column has gone too far.
//
// Nothing renders until there's art to render. Once `npm run stickers` has
// processed a drawing, add a line here, e.g.:
//
//   { art: 'swing', side: 'right', top: '3%', width: 126, move: 'swing' },
//
export const stickers: StickerConfig[] = []

/** Guards against a placement pointing at art that hasn't been prepared yet. */
export const placedStickers = stickers.filter((s) => s.art in STICKER_ART)
