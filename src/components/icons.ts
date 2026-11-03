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
export const ICON_COLOR = 'text-icon'

/**
 * Shared geometry keeps the navigation and footer icons optically aligned:
 * 20px glyphs inside 28px controls, with a 6px gap between controls. That
 * produces the same 34px center-to-center rhythm in both groups.
 */
export const ICON_CONTROL_CLASS = 'group relative flex h-7 w-7 items-center justify-center'
export const ICON_GROUP_CLASS = 'flex items-center gap-1.5'

export const ICON_TOOLTIP_CLASS = 'pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-tooltip px-2 py-1 font-sans text-[10px] leading-none text-tooltip-text opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100'
