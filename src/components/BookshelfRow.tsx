import type { BookshelfRowProps } from "../types";

export function BookshelfRow({ title, books }: BookshelfRowProps) {

    return (
        <div className="mt-4 sm:mt-6">
            <div className="w-20 sm:w-27 h-28 sm:h-40 bg-transparent">
            </div>
        <div className="w-full border-b-4 sm:border-b-6 border-gray-300 shadow-[0_3px_4px_-2px_rgba(0,0,0,0.25)]"></div>
            <h3 className="text-base sm:text-lg font-serif text-gray-400 italic mt-1 flex justify-end">{title}</h3>
        </div>
    )

}