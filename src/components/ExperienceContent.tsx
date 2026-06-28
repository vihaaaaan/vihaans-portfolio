'use client'

import { ExperienceBlock } from '@/components/ExperienceBlock'
import type { ExperienceContentProps } from '@/types'
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

export function ExperienceContent({ current, prev }: ExperienceContentProps) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible">
      <motion.h3 variants={itemVariants} className="text-lg font-serif italic">
        current
      </motion.h3>
      {current.map((experience, index) => (
        <motion.div key={index} variants={itemVariants}>
          <ExperienceBlock
            companyName={experience.companyName}
            role={experience.role}
            isInternship={experience.isInternship}
            isPresent={experience.isPresent}
            startDate={experience.startDate}
            endDate={experience.endDate}
            description={experience.description}
            technologies={experience.technologies}
            location={experience.location}
            link={experience.link}
          />
        </motion.div>
      ))}
      <motion.h3 variants={itemVariants} className="text-lg font-serif italic mt-4">
        prev
      </motion.h3>
      {prev.map((experience, index) => (
        <motion.div key={index} variants={itemVariants}>
          <ExperienceBlock
            companyName={experience.companyName}
            role={experience.role}
            isInternship={experience.isInternship}
            isPresent={experience.isPresent}
            startDate={experience.startDate}
            endDate={experience.endDate}
            description={experience.description}
            technologies={experience.technologies}
            location={experience.location}
            link={experience.link}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
