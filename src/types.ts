export interface ContentHeaderProps {
    sectionTitle: string;
    sectionSubtitle: string;
}

export interface ContentBoxProps {
    ContentHeaderProps: ContentHeaderProps;
    children?: React.ReactNode;
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
}


