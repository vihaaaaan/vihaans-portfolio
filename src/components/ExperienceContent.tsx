import { ExperienceBlock } from "./ExperienceBlock"
import type { ExperienceContentProps } from "../types"

export function ExperienceContent({ workExp, educationExp }: ExperienceContentProps) {
    return (
        <>
            { workExp.map((experience) => (
                <ExperienceBlock
                    logoUrl={experience.logoUrl}
                    companyName={experience.companyName}
                    role={experience.role}
                    isInternship={experience.isInternship}
                    isPresent={experience.isPresent}
                    startDate={experience.startDate}
                    endDate={experience.endDate}
                    description={experience.description}
                />
            )) }
            <h3 className="text-lg font-serif italic underline mt-4">education</h3>
            { educationExp.map((experience) => (
                <ExperienceBlock
                    logoUrl={experience.logoUrl}
                    companyName={experience.companyName}
                    role={experience.role}
                    isInternship={experience.isInternship}
                    isPresent={experience.isPresent}
                    startDate={experience.startDate}
                    endDate={experience.endDate}
                    description={experience.description}
                />
            )) }
        </>
        
    )
}