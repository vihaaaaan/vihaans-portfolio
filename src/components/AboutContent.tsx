import { InlineMarkdown } from '@/components/InlineMarkdown'

export function AboutContent({ bio }: { bio: string[] }) {
  return (
    <div className="space-y-4">
      {bio.map((paragraph, index) => (
        <p key={index} className="font-sans text-[11px] leading-relaxed text-gray-600 sm:text-xs">
          <InlineMarkdown text={paragraph} />
        </p>
      ))}
    </div>
  )
}
