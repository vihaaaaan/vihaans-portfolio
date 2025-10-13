import { ContentHeader, ExperienceContent } from "@components";
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
    <div className="bg-gray-100 rounded-lg shadow-md h-full w-full flex">
        <div className="flex-[9] p-6">
            <ContentHeader sectionTitle={currData.title} sectionSubtitle={currData.subtitle}/>
            {
                (() => {
                    switch (currData.title.toLowerCase()) {
                        case "experience":
                            return <ExperienceContent workExp={currData.content.work} educationExp={currData.content.education}/>;
                        case "projects":
                            return null;
                        case "digital_bookshelf":
                            return null;
                        default:
                            return null;
                    }
                })()
            }
            {children}
        </div>


        <div className="flex-1 flex-col rounded-r-lg bg-gray-200">
            { db.map((tab, index) => (
                <div className="flex flex-1 justify-center rounded-lg">
                    <button onClick={() => handleActiveTabChange(index)} className={"h-14 w-full rounded-r-lg flex items-center justify-center group hover:cursor-pointer" + (activeTab === index ? ' bg-gray-100' : 'bg-gray-200')}>
                        <span className="group-hover:scale-[1.25] transition-transform duration-200 ease-in-out">{tab.emoji}</span>
                    </button>
                </div>
                ))
            }
        </div>

    </div>
  );
}
