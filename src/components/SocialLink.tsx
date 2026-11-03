'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SocialLinkProps } from '@/types'
import { ICON_COLOR, ICON_CONTROL_CLASS, ICON_SIZE } from '@/components/icons'

export function SocialLink({ icon, label, link }: SocialLinkProps) {
  return (
    <motion.a
      href={link}
      className={ICON_CONTROL_CLASS}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      {React.createElement(icon, { size: ICON_SIZE, className: ICON_COLOR })}
    </motion.a>
  )
}
