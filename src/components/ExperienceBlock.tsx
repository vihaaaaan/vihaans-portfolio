import type { ExperienceBlockProps } from "../types";
import { useState } from "react";
import etsyLogo from '@assets/logos/etsylogo.jpeg';
import lioncrestLogo from '@assets/logos/lioncrestlogo.png';
import osuLogo from '@assets/logos/osulogo.jpeg';
import krogerLogo from '@assets/logos/krogerlogo.png';
import raziLogo from '@assets/logos/razilogo.png';
import unbaneLogo from '@assets/logos/unbanelogo.png';

const logoMap: Record<string, string> = {
    'etsy': etsyLogo,
    'lioncrest': lioncrestLogo,
    'kroger': krogerLogo,
    'razi': raziLogo,
    'unbane': unbaneLogo,
    'osu': osuLogo
};

export function ExperienceBlock({logoUrl, companyName, role, isInternship, isPresent, startDate, endDate, description}: ExperienceBlockProps) {
    const [ showDescription, setShowDescription ] = useState(false);
    const logo = logoMap[logoUrl as keyof typeof logoMap] || '';

    const toggleDescription = () => setShowDescription(!showDescription);

    return (
        <div className="flex items-start group hover:scale-[1.02] transition-transform duration-200 ease-in-out pt-4" onClick={toggleDescription}>
            {logo && (<img src={logo} className="w-9 h-9 mr-4 rounded-md"/>)}
            <div className="flex flex-col">
                <div className="flex items-center">
                    <h3 className="text-md text-gray-700 font-serif mr-6">{companyName}</h3>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={
                        `w-3 h-3 text-gray-400 group-hover:text-gray-500 transition-transform duration-200 ease-in-out mr-2` +
                        (showDescription ? ' rotate-90' : '')
                        }
                        >
                        <path
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                    </svg>

                </div>
                <div className="flex-1 flex items-start">
                    <h4 className="text-xs text-gray-400 group-hover:text-gray-500 font-sans">{role} {isInternship && "• Internship"}</h4>
                    {/* <span className="text-xs text-gray-400 group-hover:text-gray-500 font-sans">{startDate} - {isPresent ? "Present" : endDate}</span> */}
                </div>
                { showDescription && <p className="text-xs text-gray-400 group-hover:text-gray-500 mt-1">{description}</p> }
            </div>    
        </div>
    );
}