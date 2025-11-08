import type { ContentHeaderProps } from '../types';

export function ContentHeader({ sectionTitle, sectionSubtitle }: ContentHeaderProps) {
  return (
    <>
        <h3 className="text-base sm:text-lg font-serif italic underline">{sectionTitle}</h3>
        <h2 className="text-lg sm:text-xl font-serif text-gray-400">{sectionSubtitle}</h2>
    </>

  );
}
