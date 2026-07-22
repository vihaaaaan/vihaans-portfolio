import type { ComponentType } from 'react'
import type { IconBaseProps } from 'react-icons'

export interface ContentHeaderProps {
  sectionTitle: string
  sectionSubtitle: string
}

export interface BookshelfAdmin {
  unlocked: boolean
  updateBucket: (bucketKey: 'current' | 'future', books: Array<BookItemProps>) => void | Promise<void>
}

export interface ContentBoxProps {
  data: Array<any>
  admin?: BookshelfAdmin
  children?: React.ReactNode
}

export interface ExperienceContentProps {
  current: Array<ExperienceBlockProps>
  prev: Array<ExperienceBlockProps>
}

export interface ExperienceBlockProps {
  companyName: string
  role: string
  isInternship: boolean
  isPresent: boolean
  startDate: string
  endDate?: string
  description: string[]
  technologies?: Array<string>
  location?: string
  link?: string
  text?: string
}

export interface ProjectItemProps {
  name: string
  emoji: string
  blurb: string
  description: string[]
  tags: Array<string>
  containsImages: boolean
  links: Array<[string, string]>
  status: string
}

export interface ProjectsContentProps {
  items: Array<ProjectItemProps>
}

export interface SocialLinkProps {
  icon: ComponentType<IconBaseProps>
  link: string
}

export interface BookshelfRowProps {
  title: string
  books: Array<BookItemProps>
  onOpenCatalog?: () => void
}

export interface BookItemProps {
  title: string
  creators: Array<string>
  type: string
  category: string
  notes?: string
  coverSearchQuery?: string
  coverUrl?: string
}

export interface DigitalBookshelfContentProps {
  current: Array<BookItemProps>
  future: Array<BookItemProps>
  buckets?: { current?: string; future?: string }
  admin?: BookshelfAdmin
}
