import type { ExperienceBlockProps } from "../types";
import { useState } from "react";

export function ExperienceBlock({logoUrl, companyName, role, isInternship, isPresent, startDate, endDate, description}: ExperienceBlockProps) {
    const [ showDescription, setShowDescription ] = useState(false);

    const toggleDescription = () => setShowDescription(!showDescription);

    return (
        <div className="flex items-start group hover:scale-[1.02] transition-transform duration-200 ease-in-out pt-4" onClick={toggleDescription}>
            <img src={logoUrl} className="w-10 h-10 mr-4 rounded-md shadow-md"/>
            <div className="flex flex-col">
                <div className="flex items-center">
                    <h3 className="text-lg text-gray-700 font-serif mr-6">{companyName}</h3>
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