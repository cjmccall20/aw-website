# Aggie Wranglers — Webapp

The redesigned aggiewranglers.com (public site) plus the team portal — a working, fully interactive review build. Every button, form, and workflow functions end-to-end against a client-side data layer; swapping that layer for Supabase turns this into the production system without touching the UI.

## Run it locally

```bash
cd webapp
npm install
npm run dev        # http://localhost:3000
```

Checks (all enforced by `npm run build` and CI):

```bash
npx tsc --noEmit   # typecheck (strict)
npm run lint       # eslint (next/core-web-vitals)
npm test           # Playwright end-to-end suite (17 tests)
```

## How it works right now (no server yet)

- **`lib/store.ts`** is the single source of truth: a typed in-memory DB seeded from `lib/mock-data/`, persisted to `localStorage`, with subscribe/notify so React re-renders on every write. One collection per Postgres table from `../PLAN.md` §6.
- **`lib/actions.ts`** holds the write-actions shared by public forms and the portal (contact matching, request intake, notify-list signup) — each maps 1:1 to a future API route.
- **Every mutation goes through `update()`** and lands in an audit log (Settings → Audit log).
- Data is per-browser. "Reset demo data" (Webmaster → Homepage → Danger zone) restores the seed.

### What that means for the demo

Submit the performance-request form on the public site, then sign into the portal as the performance officer: the request is in the inbox with an auto-reply already logged on the requester's CRM record. Approve it, send the survey, answer it as a member, close polling, confirm — a calendar event and roster appear, and stats update. Edit the homepage announcement in Webmaster and it's live on the public homepage.

## Sign-in (simulated auth, real permission enforcement)

- **Magic link** — enter a known email (e.g. `elena.cruz@tamu.edu`), then click the simulated "email" link.
- **Password** — any password works in the demo.
- **Invite** — officers add members from the Members tab; the new member finishes setup via "I have an invite."
- **Demo role picker** — jump straight into any of the 8 seeded roles.

Permissions are a runtime matrix (statuses × tabs → none/view/edit) stored in the DB and editable in Settings — changes take effect immediately, enforced in the sidebar, per-tab gate, and per-button. Alumni get a tiered, directory-only view.

## Project shape

```
webapp/
├── app/                     ← public site (16 routes) + portal (15 tabs)
│   ├── */view.tsx           ← client views reading the live store
│   ├── */form.tsx           ← public forms writing through lib/actions
│   └── portal/              ← auth-gated tabs, all CRUD-complete
├── components/portal/ui.tsx ← Modal/fields primitives used by every editor
├── lib/store.ts             ← THE data layer (swap point for Supabase)
├── lib/actions.ts           ← form intake + contact matching
├── lib/mock-data/           ← seed data (real videos, corrected facts)
├── e2e/                     ← Playwright suite (public, auth/permissions, lifecycle)
└── public/images/           ← real team photos (manifest.json has sources)
```

Legacy URLs (`/our-building` → `/`, `/current-team` → `/meet-the-team`) are preserved as client redirects because `output: "export"` strips `next.config.js` redirects; replace with real 301s on Vercel.

Entity detail pages use query params (`/portal/contacts/detail?id=…`) rather than `[id]` segments so records created at runtime work on a static export.

## Migration to the real backend (PLAN.md §3)

1. Stand up Supabase; generate tables from `lib/types.ts` (they mirror PLAN.md §6).
2. Replace `lib/store.ts` internals with Supabase queries + realtime; keep the exported API (`useStore`, `update`, `useAccess`, `useSessionUser`) so ~40 call sites stay untouched.
3. Replace the simulated auth in `app/portal/sign-in.tsx` with Supabase magic-link auth.
4. Move `lib/actions.ts` bodies into route handlers; wire Resend for the auto-replies the store currently just records.
5. Add Google Calendar sync, Distance Matrix drive times, and Cloudflare email routing per PLAN.md.

## See also

- `../PLAN.md` — the technical plan (v6)
- `../AUDIT.md` — July 2026 audit: bugs fixed + factual corrections
- `../IDEAS.md` — backlog (social tab, online courses, coaching)
