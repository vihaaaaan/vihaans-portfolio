import type { Variants } from 'framer-motion'

// A restrained editorial reveal: short travel, slow acceleration, and no
// spring overshoot. It should feel like a camera dissolve, not a UI bounce.
export const LOAD_EASE = [0.25, 0.1, 0.25, 1] as const
export const LOAD_DURATION = 0.78
export const LOAD_STAGGER = 0.07
export const LOAD_Y = 7

export const loadItemVariants: Variants = {
  hidden: { opacity: 0, y: LOAD_Y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: LOAD_DURATION, ease: LOAD_EASE },
  },
}

export const loadListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: LOAD_STAGGER,
    },
  },
}

export const loadTransition = {
  duration: LOAD_DURATION,
  ease: LOAD_EASE,
}
