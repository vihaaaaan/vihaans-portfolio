import { ContentHeader } from "@components";
import type { ContentBoxProps } from "../types";
import { useState } from "react";

export function ContentBox({ ContentHeaderProps, children }: ContentBoxProps) {
  const [ tab, setTab ] = useState(0);


  return (
    <div className="bg-gray-100 rounded-lg shadow-md h-full w-full flex">
        <div className="flex-9 p-6">
            <ContentHeader {...ContentHeaderProps} />
            {children}
        </div>
        <div className="flex-1 flex-col rounded-r-lg bg-gray-200">
            <div className="flex flex-1 justify-center rounded-lg">
                <div className="h-14 w-full rounded-r-lg bg-gray-100 flex items-center justify-center group hover:cursor-pointer">
                    <span className="group-hover:scale-[1.25] transition-transform duration-200 ease-in-out">💼</span>
                </div>
            </div>
            <div className="flex flex-1 justify-center rounded-lg">
                <div className="h-14 w-full rounded-r-lg bg-gray-200 flex items-center justify-center group hover:cursor-pointer">
                    <span className="group-hover:scale-[1.25] transition-transform duration-200 ease-in-out">📁</span>
                </div>
            </div>
        </div>

    </div>
  );
}
