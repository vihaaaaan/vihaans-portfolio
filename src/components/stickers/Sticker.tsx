'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { StickerArt } from '@/data/stickers.generated'
import { MOTIONS, type MotionName } from './motions'

interface Props {
  art: StickerArt
  /** How the whole drawing moves on the page. */
  move?: MotionName
  /** Seconds for one full pass of a flipbook. Ignored for still drawings. */
  flipDuration?: number
  /** Rendered width in px; height follows the artwork. */
  width: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders one prepared drawing, still or flipbook, with an optional ambient
 * motion applied on top.
 *
 * The art is drawn as a CSS mask rather than an <img>, so the ink colour comes
 * from `currentColor` — the drawing stays matched to the page's text colour
 * instead of being baked into the PNG.
 */
export function Sticker({ art, move = 'none', flipDuration = 1, width, className, style }: Props) {
  const reduced = useReducedMotion()
  const preset = move === 'none' ? null : MOTIONS[move]
  const height = (width * art.height) / art.width
  const isFlipbook = art.frames > 1

  const mask: React.CSSProperties = {
    width,
    height,
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${art.src})`,
    maskImage: `url(${art.src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    // A flipbook's file is one long strip; blow it up so exactly one frame
    // fills the box, then step the mask across it.
    WebkitMaskSize: isFlipbook ? `${art.frames * 100}% 100%` : 'contain',
    maskSize: isFlipbook ? `${art.frames * 100}% 100%` : 'contain',
    // `jump-none` is load-bearing: a percentage mask position spans
    // (strip width - frame width), so plain steps(n) lands between frames and
    // shows two of them at once. jump-none puts a stop on 0% and 100% both,
    // which is exactly one stop per frame.
    ...(isFlipbook && !reduced
      ? { animation: `sticker-flip ${flipDuration}s steps(${art.frames}, jump-none) infinite` }
      : null),
  }

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: preset?.origin, ...style }}
      animate={preset && !reduced ? preset.animate : undefined}
      transition={preset?.transition}
    >
      <div style={mask} />
    </motion.div>
  )
}
