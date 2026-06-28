'use client'

import { motion } from 'framer-motion'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

export function AboutContent() {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
      <motion.p variants={itemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
        I first fell in love with building at the age of 10, when I got tired of playing vanilla Minecraft and wanted to build my own mods. That was the first time I felt the excitement of turning something in my head into something tangible--and I&apos;ve been chasing it ever since.
      </motion.p>
      <motion.p variants={itemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
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
      </motion.p>
      <motion.p variants={itemVariants} className="text-xs sm:text-sm font-sans text-gray-600">
        I&apos;m always open to meeting people and learning what others are building. Feel free to reach out at{' '}
        <a href="mailto:vihaanv14@gmail.com" className="hover:text-gray-800 underline decoration-dotted">vihaanv14@gmail.com</a>.
      </motion.p>
    </motion.div>
  )
}
