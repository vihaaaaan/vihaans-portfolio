import type { Transition, TargetAndTransition } from 'framer-motion'

/**
 * Ways a finished drawing can move on the page, independent of whether the
 * drawing itself is animated. A still sketch on `swing` already reads as
 * alive; a flipbook can sit on `none` and do all its own moving.
 */
export type MotionName = 'none' | 'swing' | 'drift' | 'bob' | 'twinkle'

interface Preset {
  /** Where the transform pivots, as a CSS transform-origin. */
  origin: string
  animate: TargetAndTransition
  transition: Transition
}

export const MOTIONS: Record<Exclude<MotionName, 'none'>, Preset> = {
  // Pendulum from the top edge — for anything hanging off a line or a hand.
  swing: {
    origin: '50% 0%',
    animate: { rotate: [-15, 13, -15] },
    transition: { duration: 4.2, ease: 'easeInOut', repeat: Infinity },
  },
  // Loose wandering, for things in flight.
  drift: {
    origin: '50% 50%',
    animate: { x: [0, 6, -3, 5, 0], y: [0, -8, -2, -10, 0], rotate: [0, 4, -3, 2, 0] },
    transition: { duration: 9, ease: 'easeInOut', repeat: Infinity },
  },
  // A slow breath, for anything resting.
  bob: {
    origin: '50% 100%',
    animate: { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] },
    transition: { duration: 5.5, ease: 'easeInOut', repeat: Infinity },
  },
  // Fades and pulses in place.
  twinkle: {
    origin: '50% 50%',
    animate: { opacity: [0.35, 1, 0.35], scale: [0.92, 1, 0.92] },
    transition: { duration: 3.6, ease: 'easeInOut', repeat: Infinity },
  },
}
