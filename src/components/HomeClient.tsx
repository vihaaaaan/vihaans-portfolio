'use client'

import { ContentBox } from '@/components/ContentBox'
import { LocationIndicator } from '@/components/LocationIndicator'
import { SocialLink } from '@/components/SocialLink'
import { FaGithub, FaLinkedin, FaTwitter, FaFileAlt } from 'react-icons/fa'
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

  return (
    <BookshelfImagesContext.Provider value={coverImages}>
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 sm:my-10 md:my-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col py-8 sm:py-10">
          <div className="flex items-center justify-between mb-4 gap-4">
            <motion.div variants={itemVariants}>
              <h1
                className="
                  text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight
                  bg-clip-text text-transparent
                  bg-[linear-gradient(90deg,#111,#6b7280,#111)]
                  bg-[length:200%_100%]
                  animate-[shine_10s_linear_infinite]
                "
              >
                hi, i'm vihaan!
              </h1>
              <style>{`
                @keyframes shine {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
              <h3
                className="
                  text-sm sm:text-lg font-sans tracking-tight
                  bg-clip-text text-transparent
                  bg-[linear-gradient(90deg,#111,#6b7280,#111)]
                  bg-[length:200%_100%]
                  animate-[shine_10s_linear_infinite]"
              >
                i love building software that brings people joy
              </h3>
              <div className="mt-1 flex flex-col gap-3">
                <LocationIndicator location={data.location} />
                <div className="flex space-x-3 sm:space-x-4">
                  <SocialLink icon={FaGithub} link="https://github.com/vihaaaaan" />
                  <SocialLink icon={FaLinkedin} link="https://www.linkedin.com/in/vihaan-vulpala/" />
                  <SocialLink icon={FaTwitter} link="" />
                  <SocialLink icon={FaFileAlt} link="https://drive.google.com/file/d/10BYm-nDPL4QEDeoAG8sQ0XbyQHhEaZcc/view?usp=sharing" />
                </div>
              </div>
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
                  className="rounded-sm mr-4"
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mb-6 space-y-2">
            <p className="text-xs sm:text-sm font-sans text-gray-600">
              I first fell in love with building at the age of 10, when I got tired of playing vanilla Minecraft and wanted to build my own mods. That was the first time I felt the excitement of turning something in my head into something tangible--and I&apos;ve been chasing it ever since.
            </p>
            <p className="text-xs sm:text-sm font-sans text-gray-600">
              Today, I&apos;m working on{' '}
              <motion.a
                href="https://www.unbane.com/"
                target="_blank"
                className="text-sm sm:text-base font-serif italic hover:text-gray-800 leading-none relative inline-block"
                initial="rest" whileHover="hover" animate="rest"
              >
                Unbane
                <motion.span className="absolute bottom-0 left-0 h-[1px] bg-gray-600" variants={{ rest: { width: '0%' }, hover: { width: '100%' } }} transition={{ duration: 0.25, ease: 'easeOut' }} />
              </motion.a>
              , the voice-first intelligence layer for the built world, starting with data capture. I&apos;m also a student at{' '}
              <motion.a
                href="https://cse.osu.edu/"
                target="_blank"
                className="text-sm sm:text-base font-serif italic hover:text-gray-800 leading-none relative inline-block"
                initial="rest" whileHover="hover" animate="rest"
              >
                Ohio State
                <motion.span className="absolute bottom-0 left-0 h-[1px] bg-gray-600" variants={{ rest: { width: '0%' }, hover: { width: '100%' } }} transition={{ duration: 0.25, ease: 'easeOut' }} />
              </motion.a>
              , where I&apos;m exploring my interests in startups, product, and engineering.
            </p>
            <p className="text-xs sm:text-sm font-sans text-gray-600">
              I&apos;m always open to meeting people and learning what others are building. Feel free to reach out at{' '}
              <a href="mailto:vihaanv14@gmail.com" className="hover:text-gray-800 underline decoration-dotted">vihaanv14@gmail.com</a>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1">
            <ContentBox data={data.tabs} />
          </motion.div>
        </div>
      </motion.div>
    </BookshelfImagesContext.Provider>
  )
}
