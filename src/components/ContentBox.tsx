import { ContentHeader, ExperienceContent, DigitalBookshelfContent} from "@components";
import type { ContentBoxProps } from "../types";
import { useState } from "react";
import db from '../../db.json';

export function ContentBox({ data, children }: ContentBoxProps) {
  const [ activeTab, setActiveTab ] = useState(0);
  const currData = data[activeTab] ?? data[0];

  const handleActiveTabChange = (index: number) => {
    setActiveTab(index);
  } 


  return (
    <div className="bg-gray-100 rounded-lg shadow-md h-full w-full flex flex-col">
        {/* Mobile tabs - Top */}
        <div className="sm:hidden w-full flex-shrink-0 flex justify-start gap-0 rounded-t-lg bg-gray-200">
            { db.map((tab, index) => (
                <button
                key={index}
                onClick={() => handleActiveTabChange(index)}
                className={
                    "w-14 h-12 rounded-t-lg flex items-center justify-center group hover:cursor-pointer " +
                    (activeTab === index ? "bg-gray-100" : "bg-gray-200")
                }
                >
                    <span className="m-1 inline-block transform transition-transform duration-200 ease-in-out group-hover:scale-125 text-lg">
                        {tab.emoji}
                    </span>
                </button>
            ))
            }
        </div>

        <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row min-w-0">
            <div className="flex-1 min-w-0 sm:mr-6">
                <ContentHeader sectionTitle={currData.title} sectionSubtitle={currData.subtitle}/>
                {
                    (() => {
                        switch (currData.title.toLowerCase()) {
                            case "experience":
                                return <ExperienceContent workExp={currData.content.work} educationExp={currData.content.education}/>;
                            case "projects":
                                return null;
                            case "digital_bookshelf":
                                return <DigitalBookshelfContent current={currData.content.current} future={currData.content.future} />;
                            default:
                                return null;
                        }
                    })()
                }
                {children}
            </div>

            {/* Desktop tabs - Right side */}
            <div className="hidden sm:flex w-16 flex-shrink-0 flex-col rounded-r-lg bg-gray-200 -mr-6 -my-6">
                { db.map((tab, index) => (
                    <button
                    key={index}
                    onClick={() => handleActiveTabChange(index)}
                    className={
                        "h-14 w-full rounded-r-lg flex items-center justify-center group hover:cursor-pointer " +
                        (activeTab === index ? "bg-gray-100" : "bg-gray-200")
                    }
                    >
                        <span className="relative inline-block">
                            <span className="m-2 inline-block transform transition-transform duration-200 ease-in-out group-hover:scale-125 text-xl">
                                {tab.emoji}
                            </span>

                            {/* Tooltip */}
                            <span
                            className="
                                absolute right-full top-1/2 -translate-y-1/2 mr-2
                                bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-sm
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out
                                pointer-events-none whitespace-nowrap

                                before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2
                                before:border-4 before:border-transparent before:border-l-gray-800
                            "
                            >
                            {tab.title.replace('_', ' ')}
                            </span>
                        </span>
                    </button>
                ))
                }
            </div>
        </div>
    </div>
  );
}
