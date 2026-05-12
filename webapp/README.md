# Aggie Wranglers — Webapp MVP

A working proof-of-concept of the redesigned aggiewranglers.com (public site) and the team portal at team.aggiewranglers.com.

This is the **first-draft MVP** — front-end + mock data + design system + portal architecture. No real backend yet; data is hardcoded in `lib/mock-data/` so the UI feels real. When Supabase + the integrations come online, the swap is surgical — types and data shapes already match the schema defined in the top-level `PLAN.md`.

## Run it locally

```bash
cd webapp
npm install
npm run dev
```

Then open <http://localhost:3000>.

## What's in here

### Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a refresh-ready theme-token system
- **Geist Sans / Geist Mono** + **Fraunces** via `next/font` (self-hosted, optimized)
- **Lucide** icons
- **SEO infrastructure**: full metadata API, sitemap, robots, JSON-LD structured data (Organization, FAQPage, VideoObject)

### Project shape

```
webapp/
├── app/                          ← Next.js App Router pages
│   ├── (public site, 15+ routes)
│   ├── portal/                   ← team-only routes
│   │   ├── page.tsx              ← sign-in / role picker
│   │   ├── dashboard/
│   │   ├── performance-management/
│   │   │   └── [id]/             ← per-request detail (the marquee workflow)
│   │   ├── lessons-management/
│   │   ├── contacts/
│   │   │   └── [id]/             ← contact detail w/ email history
│   │   ├── members/
│   │   ├── webmaster/            ← CMS for public-site content
│   │   ├── team-calendar/
│   │   ├── resources/
│   │   ├── move-library/
│   │   ├── alumni-directory/
│   │   ├── meeting-notes/
│   │   ├── long-term-goals/
│   │   ├── performance-stats/
│   │   ├── surveys/
│   │   └── settings/             ← permission matrix UI
│   ├── sitemap.ts                ← Next.js Metadata sitemap
│   ├── robots.ts                 ← /robots.txt
│   ├── layout.tsx                ← root layout (fonts, metadata, JSON-LD)
│   └── globals.css               ← design tokens + component primitives
├── components/
│   ├── site-nav.tsx              ← public site sticky nav with dropdowns
│   ├── site-footer.tsx
│   ├── site-shell.tsx            ← public site wrapper
│   ├── page-header.tsx           ← shared eyebrow + title + description
│   ├── notify-form.tsx           ← reusable lesson/tryout notify signup
│   └── portal/
│       └── portal-shell.tsx      ← portal layout with sidebar + perm gating
├── lib/
│   ├── types.ts                  ← TypeScript types matching PLAN.md §6 schema
│   ├── mock-data/index.ts        ← seeded mock data + permission matrix
│   ├── auth.ts                   ← localStorage-backed demo "auth"
│   └── utils.ts                  ← cn, date formatters, placeholderColor
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js                ← incl. /our-building → / redirect
└── postcss.config.js
```

## Demo sign-in

The portal has no real auth in the MVP. On `/portal`, click "Demo: sign in as a specific role" to pick from 8 demo users (admin, president, VP, performance officer, lessons coordinator, secretary, member, alumni). The portal sidebar will hide/show tabs based on that user's permission matrix.

To test the permission matrix: sign in as a member, notice the limited sidebar. Sign out, sign in as president, notice everything is visible. Open Settings → Permissions matrix to see the grid editor.

## What's mock vs. wired

| Feature | Status |
|---|---|
| All 15+ public site pages | **Built**, real layout + content |
| Notify-list signup widgets | **UI works**; submission is a stub (TODO comment) |
| Performance request form | **UI works**, including donation interest + opt-in checkbox; submit is a stub |
| Private lesson request form | **UI works**; submit is a stub |
| Demo role-picker sign-in | **Works** (localStorage) |
| Permission gating in the portal | **Works** — hides tabs the user has `none` access to |
| Permission matrix grid editor in Settings | **Local-state edits work**; save is a stub |
| All 15 portal tabs | **Built** with mock data and interactive UI |
| Performance Management detail page | **Full marquee workflow**: status badges, drive-time, polling breakdown, mailto: confirm/decline actions, email history |
| Contact detail page | **Full**: people/org distinction, request history, email thread display, annual reminders |
| Outlook `mailto:` link generation | **Works** (clicking Compose opens the mail client with a prefilled draft) |
| Google Calendar 2-way sync | UI is built; real sync requires Google Cloud + service account |
| Resend auto-replies | Form submissions are stubs |
| BCC archive ingest | UI displays mock email threads; real ingest requires the Cloudflare Worker setup |

## Design choices worth noting

- **Server components by default**. Forms and stateful UI are explicitly client components (`"use client"`).
- **Theme tokens isolate the brand**. The current palette is the placeholder Aggie maroon (`#500000` anchor) — swap the values in `tailwind.config.ts` to do the brand refresh later. No component-level color hard-coding.
- **`text-balance` and `text-pretty`** applied to display headings and lede paragraphs for better wrapping.
- **Accessibility**: skip-to-content link, semantic landmark elements, focus rings via `:focus-visible`, reduced-motion support, dropdown nav keyboard-accessible.
- **SEO**: per-page metadata, OG/Twitter cards, canonical URLs, sitemap.xml, robots.txt, JSON-LD schemas where useful, semantic HTML, image alt text.
- **Performance**: `next/font` for self-hosted fonts (no FOIT), YouTube embeds use `youtube-nocookie.com` and `loading="lazy"`, no blocking JS on public pages.

## Migration to real backend

When Supabase comes online:

1. Replace `lib/mock-data/index.ts` arrays with Supabase queries (Drizzle ORM recommended per PLAN.md).
2. Replace `lib/auth.ts` with Supabase Auth client (magic-link).
3. Wire up form submissions in `app/(forms)/*/form.tsx` to actual route handlers.
4. Set up Resend domain authentication on `aggiewranglers.com` and the Cloudflare Email Routing aliases described in PLAN.md §3 stack table.
5. Set up a Google Cloud project with the Calendar API + service account for the team calendar.
6. The Cloudflare Worker for the `archive@aggiewranglers.com` BCC route — see PLAN.md §8.6.

Most components require zero changes. The data fetching layer is the swap.

## See also

- `../PLAN.md` — the technical plan (v6)
- `../OVERVIEW.html` — the non-technical visual overview
- `../IDEAS.md` — backlog: notify lists, social media tab (v1.1), online courses, brand refresh
