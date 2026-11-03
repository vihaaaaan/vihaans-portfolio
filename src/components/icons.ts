/**
 * Navigation is intentionally a touch quieter than the footer socials. The
 * surrounding controls still share one rhythm, so both groups align cleanly.
 */
export const NAV_ICON_SIZE = 18
export const SOCIAL_ICON_SIZE = 20

/**
 * One ink for every navigation state. The active tab is marked by the grey
 * circle behind it, not by a darker glyph. Social links inherit body color so
 * hyperlinks keep the same contrast in both themes.
 */
export const ICON_COLOR = 'text-icon'

/**
 * Shared geometry keeps the navigation and footer icons optically aligned:
 * 18–20px glyphs inside 28px controls, with a 6px gap between controls. That
 * produces the same 34px center-to-center rhythm in both groups.
 */
export const ICON_CONTROL_CLASS = 'group relative flex h-7 w-7 items-center justify-center'
export const ICON_GROUP_CLASS = 'flex items-center gap-1.5'

export const ICON_TOOLTIP_CLASS = 'pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-tooltip px-2 py-1 font-sans text-[10px] leading-none text-tooltip-text opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100'
