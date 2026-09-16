'use client'

import React from 'react'
import type { SocialLinkProps } from '@/types'
import { motion } from 'framer-motion'
import { ICON_COLOR, ICON_SIZE } from '@/components/icons'

export function SocialLink({ icon, link }: SocialLinkProps) {
  return (
    <motion.a
      href={link}
      className="flex"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      {React.createElement(icon, { size: ICON_SIZE, className: ICON_COLOR })}
    </motion.a>
  )
}
