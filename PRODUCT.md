# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three overlapping audiences, all served by the same single-page site:
- Recruiters and potential collaborators/co-founders evaluating Vihaan professionally (work history, projects, credibility).
- People who already know him (friends, network, people he's met) using it as a personal hub/calling-card.
- The same visitors in either category also want a sense of who he is personally, not just a resume — bookshelf, rotating quotes, and personal-interest content are load-bearing, not filler.

## Product Purpose

Vihaan Vulpala's personal portfolio/homepage. Presents his work experience, current projects, and personal interests (reading, etc.) in one place, and lets visitors reach out. Success is a visitor coming away with an accurate, current sense of what he's building and who he is — and knowing how to contact him.

## Positioning

Personality-forward, living content — not a static resume PDF or LinkedIn clone. The site reads as current and human because Vihaan actively edits its content himself (projects, work history, bookshelf) through a real admin flow, and because personal-interest sections (digital bookshelf, rotating quotes) are treated as first-class content alongside professional history.

## Operating Context

Vihaan maintains the site's content himself: work history, projects, and bookshelf entries are edited live through a password-gated admin mode in the UI, backed by MongoDB — not hardcoded in source. Design and code work must assume content changes independently of deploys.

## Capabilities and Constraints

- Content (profile, work, projects, bookshelf) is stored in MongoDB and edited via an in-page admin mode gated by a signed-cookie session (`admin_session`) unlocked with a password — future UI work must keep content editable through this flow, not bake static copy into components.
- The digital bookshelf's `current`/`future` buckets accept any typed item (books, movies, etc.), not just books. A Letterboxd sync (`src/lib/letterboxd.ts`, `/api/letterboxd-sync`) reads Vihaan's public diary and watchlist RSS feeds and populates these buckets automatically alongside admin-entered items — diary → `current`, watchlist → `future`. No API key required; each feed fails independently so a private/unreachable one doesn't take the other down.
- Must remain fully responsive/usable on mobile — a meaningful share of visitors are on phones; every surface needs a real mobile treatment, not a scaled-down desktop layout.
- Built on Next.js (App Router) + MongoDB; fonts are loaded via Google Fonts (Inter, Cormorant Garamond) — no self-hosted or paid/licensed font files currently in use.
- A margin-stickers system (`src/data/stickers.ts`, `src/components/MarginStickers.tsx`) exists to scatter decorative images in the page gutters at wide viewports (xl+), but the sticker list is currently empty — no stickers are live yet.

## Product Principles

- Content stays live and editable — the admin-edited model is core to the "living, current" positioning, not an implementation detail to route around.
- Personal and professional content share equal weight — bookshelf/quotes are not secondary to work/projects.
- Every surface must hold up on mobile, not just desktop — the audience is explicitly cross-device.
- Prefer restraint and craft over generic patterns — a recurring theme this project has actively pushed back on (e.g. avoiding fonts/layouts that read as generic "AI-generated" defaults).
