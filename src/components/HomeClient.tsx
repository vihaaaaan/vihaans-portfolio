'use client'

import { ContentBox } from '@/components/ContentBox'
import { SocialLink } from '@/components/SocialLink'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookshelfImagesContext } from '@/context/BookshelfImagesContext'
import { useCoverImages } from '@/hooks/useCoverImages'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

interface Props {
  data: {
    location: string
    tabs: Array<any>
  }
}

export function HomeClient({ data }: Props) {
  const bookshelfTab = data.tabs.find((t: any) => t.title === 'digital_bookshelf')
  const bookshelfItems = [
    ...(bookshelfTab?.content?.current ?? []),
    ...(bookshelfTab?.content?.future ?? []),
  ]
  const coverImages = useCoverImages(bookshelfItems)

  const aboutTab = { title: 'about', emoji: '👋', subtitle: '', content: {} }
  const tabs = [aboutTab, ...data.tabs]

  return (
    <BookshelfImagesContext.Provider value={coverImages}>
      <motion.div
        className="min-h-screen max-w-2xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex-1 flex flex-col pt-20 sm:pt-28 pb-8 sm:pb-10">
          <div className="flex items-center justify-between mb-4 gap-4">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-gray-900">
                hi, i'm vihaan!
              </h1>
              <h3 className="text-sm sm:text-lg font-sans tracking-tight text-gray-500">
                i love building software that brings people joy
              </h3>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.06, rotate: 1.5 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              >
                <Image
                  src="/assets/vihaan_illustration.png"
                  alt="vihaan illustration"
                  width={140}
                  height={140}
                  className="mr-4"
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex-1">
            <ContentBox data={tabs} />
          </motion.div>
        </div>

        <motion.footer variants={itemVariants} className="pb-20 flex space-x-4">
          <SocialLink icon={FaGithub} link="https://github.com/vihaaaaan" />
          <SocialLink icon={FaLinkedin} link="https://www.linkedin.com/in/vihaan-vulpala/" />
          <SocialLink icon={FaTwitter} link="" />
        </motion.footer>
      </motion.div>
    </BookshelfImagesContext.Provider>
  )
}
