import React from 'react'
import type { SocialLinkProps } from '@/types'
import { ICON_COLOR, ICON_SIZE } from '@/components/icons'

export function SocialLink({ icon, link }: SocialLinkProps) {
  return (
    <a
      href={link}
      className="flex transition-transform duration-150 hover:-translate-y-1 active:scale-95"
      target="_blank"
      rel="noopener noreferrer"
    >
      {React.createElement(icon, { size: ICON_SIZE, className: ICON_COLOR })}
    </a>
  )
}
