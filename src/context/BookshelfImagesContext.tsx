'use client'

import { createContext, useContext } from 'react'

export const BookshelfImagesContext = createContext<Record<string, string>>({})
export const useBookshelfImages = () => useContext(BookshelfImagesContext)
