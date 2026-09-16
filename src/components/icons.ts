/**
 * One size for every icon in the page chrome: the tab nav (both the desktop
 * rail and the phone bar), the footer socials, and the edit-mode lock.
 *
 * These live in three different components and render at different viewports,
 * which is how they drifted to 13/17/18/24/21px in the first place. Change it
 * here, not at the call site.
 */
export const ICON_SIZE = 20

/**
 * One ink for every icon, in every state. The nav's active tab is marked by the
 * grey circle behind it, not by a darker glyph, and hover is answered by the
 * scale/lift motion each control already has — so nothing here needs a second
 * shade.
 */
export const ICON_COLOR = 'text-gray-700'

/**
 * Every icon in the chrome sits 24px from its neighbour, edge to edge, whichever
 * group it's in. That number is reached two different ways, so both have to
 * move together if it changes:
 *
 *   nav bar + rail   40px button - 20px icon = 10px padding a side, + gap-1 (4px) = 24px
 *   footer socials   icons are tight to their links, so space-x-6                 = 24px
 *
 * Tailwind needs those as literal class names, so they can't be read from this
 * file — this comment is the record of where the numbers come from.
 */
