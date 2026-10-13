import type { ComponentType } from 'react'
import type { IconBaseProps } from 'react-icons'

export interface BookshelfAdmin {
  unlocked: boolean
  updateBucket: (bucketKey: 'current' | 'future', books: Array<BookItemProps>) => void | Promise<void>
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
  images?: string[]
}

export interface ProjectsContentProps {
  current: Array<ProjectItemProps>
  prev: Array<ProjectItemProps>
}

export interface SocialLinkProps {
  icon: ComponentType<IconBaseProps>
  link: string
}

export interface BookItemProps {
  title: string
  creators: Array<string>
  type: string
  category: string
  notes?: string
  coverSearchQuery?: string
  coverUrl?: string
  imageWidth?: number
  imageHeight?: number
  coverSource?: string
  // Set to 'letterboxd' on entries pulled in by the automated sync, so re-syncing
  // can replace just those without touching anything added by hand.
  source?: string
}

export interface DigitalBookshelfContentProps {
  current: Array<BookItemProps>
  future: Array<BookItemProps>
  buckets?: { current?: string; future?: string }
  admin?: BookshelfAdmin
}

export interface Profile {
  headline: string
  sublines?: Array<{ quote: string; author: string }>
  bio: string[]
  location: string
  socials: { github?: string; linkedin?: string; twitter?: string }
  aboutEmoji?: string
  illustration?: string
}

export interface WorkSectionDocument {
  title?: string
  emoji?: string
  subtitle?: string
  current: ExperienceBlockProps[]
  prev: ExperienceBlockProps[]
}

export interface ProjectsSectionDocument {
  title?: string
  emoji?: string
  subtitle?: string
  current?: ProjectItemProps[]
  prev?: ProjectItemProps[]
  items?: ProjectItemProps[]
}

export interface BookshelfSectionDocument {
  title?: string
  emoji?: string
  subtitle?: string
  current: BookItemProps[]
  future: BookItemProps[]
  buckets?: { current?: string; future?: string }
}

export type RemoteSectionKey = 'work' | 'projects' | 'bookshelf'
export type SectionKey = 'about' | RemoteSectionKey

export interface SectionDocumentMap {
  work: WorkSectionDocument
  projects: ProjectsSectionDocument
  bookshelf: BookshelfSectionDocument
}
