import type { ExperienceBlockProps } from "../types";
import { useState } from "react";
import etsyLogo from '@assets/logos/etsylogo.jpeg';
import lioncrestLogo from '@assets/logos/lioncrestlogo.png';
import osuLogo from '@assets/logos/osulogo.jpeg';
import krogerLogo from '@assets/logos/krogerlogo.png';
import raziLogo from '@assets/logos/razilogo.png';
import unbaneLogo from '@assets/logos/unbanelogo.png';
import db from '../../db.json'

const logoMap: Record<string, string> = {
    'etsy': etsyLogo,
    'lioncrest': lioncrestLogo,
    'kroger': krogerLogo,
    'razi': raziLogo,
    'unbane': unbaneLogo,
    'osu': osuLogo
};

export function ExperienceBlock({logoUrl, companyName, role, isInternship, isPresent, startDate, endDate, description, technologies, location, link}: ExperienceBlockProps) {
    const [ showDescription, setShowDescription ] = useState(false);
    const logo = logoMap[logoUrl as keyof typeof logoMap] || '';

    const toggleDescription = () => setShowDescription(!showDescription);

    return (
        <div className="flex flex-col group hover:scale-[1.02] transition-transform duration-200 ease-in-out pt-4">
            <div className="flex items-center" onClick={toggleDescription}>
                {logo && (<img src={logo} className="w-7 h-7 mr-4 rounded-sm flex-shrink-0"/>)}
                <div className="flex flex-col w-full">
                    <div className="flex items-center">
                        <h3 className="text-md text-gray-700 font-serif mr-2">{companyName.toLowerCase()}</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={
                            `w-3 h-3 text-gray-500 group-hover:text-gray-600 transition-transform duration-200 ease-in-out mr-2` +
                            (showDescription ? ' rotate-90' : '')
                            }
                            >
                            <path
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </div>
                    <h4 className="text-xs text-gray-500 group-hover:text-gray-600 font-sans flex items-center">
                        <span className="whitespace-nowrap">{role.toLowerCase()} {isInternship && "• internship"}</span>
                        <span className="hidden sm:flex flex-1 border-b border-dotted border-gray-400 h-1 mx-1"></span>
                        <div className="hidden sm:flex items-center space-x-1">
                            <span className="whitespace-nowrap">  {startDate?.toLowerCase()}</span>
                            <span>→</span>
                            <span>{endDate ? endDate.toLowerCase() : isPresent ? "present" : ""}</span>
                        </div>
                    </h4>
                </div>
            </div>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ml-11
                        ${showDescription ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}`}
            >
                <div className="sm:hidden flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 group-hover:text-gray-600">
                        <span className="whitespace-nowrap">{startDate?.toLowerCase()}</span>
                        <span>→</span>
                        <span>{endDate ? endDate.toLowerCase() : isPresent ? "present" : ""}</span>
                    </div>
                    <div
                        className={`sm:hidden text-xs text-gray-500 group-hover:text-gray-600
                                    ${showDescription ? "" : "pointer-events-none"}`}
                    >
                        <div className="inline-block">
                            <span className="mr-1">📍</span>
                            <span className="font-serif italic text-xs">{location?.toLowerCase()}</span>
                        </div>
                    </div>

                </div>
                <p
                    className={`text-xs font-sans text-gray-500 group-hover:text-gray-600 mb-2
                                ${showDescription ? "" : "pointer-events-none"}`}
                >
                    {description}
                </p>
                <div className="flex items-center justify-between">
                    <div
                        className={`flex flex-wrap gap-1.5 text-xs text-gray-500 group-hover:text-gray-600 
                                    ${showDescription ? "" : "pointer-events-none"}`}
                    >
                        {technologies?.map((tech, index) => (
                            <div 
                                key={index}
                                className="transition-transform duration-200 hover:-translate-y-1 inline-block rounded-sm shadow-sm bg-gray-200 px-1.5 py-0.5 font-sans"
                            >
                                <span className="font-sans text-[10px]">{tech.toLowerCase()}</span>
                            </div>
                        ))}
                    </div>
                    <div
                    className={`hidden sm:block text-xs text-gray-500 group-hover:text-gray-600 mb-2
                                ${showDescription ? "" : "pointer-events-none"}`}
                    >
                        <div className="inline-block">
                            <span className="mr-1">📍</span>
                            <span className="font-serif italic text-xs">{location?.toLowerCase()}</span>
                        </div>
                    </div>
                </div>
            <div>
                
            </div>
            </div>
        </div>
    );
}