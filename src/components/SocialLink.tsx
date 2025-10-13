
import React from 'react';
import type { SocialLinkProps } from '../types';

export function SocialLink({icon, link}: SocialLinkProps) {
    return (
        <a href={link} className="flex space-x-4" target="_blank" rel="noopener noreferrer">
            {React.createElement(icon, { size: 24, className: "text-gray-500 hover:text-gray-700 transition-transform duration-400 hover:-translate-y-1" })}
        </a>
    )
}