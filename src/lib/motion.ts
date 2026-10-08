import type { Variants } from 'framer-motion'

export const LOAD_EASE = [0.22, 1, 0.36, 1] as const
export const LOAD_DURATION = 0.62
export const LOAD_STAGGER = 0.09
export const LOAD_Y = 16

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
