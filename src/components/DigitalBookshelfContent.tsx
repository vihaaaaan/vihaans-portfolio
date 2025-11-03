import { BookshelfRow } from "./BookshelfRow"
import type { DigitalBookshelfContentProps } from "../types"

export function DigitalBookshelfContent({ current, future }: DigitalBookshelfContentProps) {
    return (
        <>
            <BookshelfRow title="Current" books={current.books} />
            <BookshelfRow title="Future" books={future.books} />
        </>
        
    )
}