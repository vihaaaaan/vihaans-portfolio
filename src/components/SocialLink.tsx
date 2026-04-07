'use client'

import React from 'react'
import type { SocialLinkProps } from '@/types'
import { motion } from 'framer-motion'

export function SocialLink({ icon, link }: SocialLinkProps) {
  return (
    <motion.a
      href={link}
      className="flex space-x-4"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      {React.createElement(icon, { size: 18, className: 'sm:w-6 sm:h-6 text-gray-500 hover:text-gray-700' })}
    </motion.a>
  )
}
