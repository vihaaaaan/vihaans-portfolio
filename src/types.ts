import type { ComponentType } from 'react';
import type { IconBaseProps } from 'react-icons';

export interface ContentHeaderProps {
    sectionTitle: string;
    sectionSubtitle: string;
}

export interface ContentBoxProps {
    data: Array<any>
    children?: React.ReactNode;
}

export interface ExperienceContentProps {
    workExp: Array<ExperienceBlockProps>;
    educationExp: Array<ExperienceBlockProps>;
}

export interface ExperienceBlockProps {
    logoUrl: string;
    companyName: string;
    role: string;
    isInternship: boolean;
    isPresent: boolean;
    startDate: string;
    endDate?: string;
    description: string;
    technologies?: Array<string>;
    location?: string;
    link?: string;
}

export interface SocialLinkProps {
    icon: ComponentType<IconBaseProps>;
    link: string;
}

export interface BookshelfRowProps {
    title: string;
    books: Array<BookItemProps>;
}

export interface BookItemProps {
    title: string;
    creators: Array<string>;
    type: string;
    category: string;
    notes: string;
}

export interface DigitalBookshelfContentProps {
    current: BookshelfRowProps;
    future: BookshelfRowProps;
}

