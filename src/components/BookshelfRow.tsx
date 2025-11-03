import type { BookshelfRowProps } from "../types";

export function BookshelfRow({ title, books }: BookshelfRowProps) {

    return (
        <div className="mt-6">
            <div className="w-48 h-36 bg-transparent">
            </div>
        <div className="w-full border-b-6 border-gray-300 shadow-[0_3px_4px_-2px_rgba(0,0,0,0.25)]"></div>
            <h3 className="text-lg font-serif text-gray-400 italic mt-1 flex justify-end">{title}</h3>
        </div>
    )

}