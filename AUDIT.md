# Repo Audit — July 2026

Full audit of the repo (webapp + docs + CI), cross-checked against fresh research
on the Aggie Wranglers and the live aggiewranglers.com. Everything in
"Fixed" shipped in commit `e90a842` on `claude/aggie-wranglers-audit-rebuild-wweg5x`.

## Fixed — code bugs

| # | Bug | Impact |
|---|-----|--------|
| 1 | Tailwind referenced `var(--font-geist)` but the geist package registers `--font-geist-sans` | The self-hosted Geist font never loaded anywhere; entire site silently fell back to system fonts |
| 2 | `formatDate(new Date("YYYY-MM-DD"))` parsed date-only strings as UTC midnight | Every event date (lessons, performances, deadlines) rendered one day early for US visitors |
| 3 | Two TS errors in `performance-management/[id]/view.tsx` hidden by `typescript.ignoreBuildErrors: true` | Type safety was off for the whole app; both flags now re-enabled and the build is clean |
| 4 | No `.eslintrc` despite `eslint-config-next` in devDeps | `npm run lint` hung on an interactive setup prompt; lint never ran anywhere |
| 5 | Classes `text-green`, `bg-green`, `bg-green-pale`, `border-green/30` used but never defined | Success pills, survey yes-buttons, and permission-matrix "edit" cells silently unstyled |
| 6 | `Math.random()` inside render in performance-stats | Server HTML ≠ client render → React hydration errors |
| 7 | Footer linked `/privacy` — page didn't exist | 404 from every page footer |
| 8 | Dashboard showed performance/lesson/CRM queues to every role | Members/alumni saw officer data and links they'd get "No access" on; now permission-gated |
| 9 | Desktop nav dropdowns opened on hover only | Keyboard users couldn't reach 11 of 16 nav destinations (README claimed keyboard a11y) |
| 10 | Mobile nav flatMapped parents + children | Duplicate links (`Lessons` and `Public Lessons` → same URL); now grouped with headers |
| 11 | Form labels not associated with inputs (perf request + private lesson forms) | Screen readers announced unlabeled fields; click-to-focus broken |
| 12 | No `package-lock.json` committed; CI used `npm install` | Non-reproducible deploys; lockfile now committed, workflow uses `npm ci` |
| 13 | Hardcoded/fallback survey deadlines (`2026-05-22`) | Stale dates shown regardless of data |
| 14 | Default unbranded 404 | Now a branded not-found page with recovery CTAs |

## Fixed — factual errors (vs. research on the real org)

| # | Was | Actually |
|---|-----|----------|
| 1 | "Founded 1981" (footer, history, metadata) | **Founded 1984** — Battalion ad → 1984 Calvert County Fair, 20 showed up, 7 couples chosen. History page now tells the real story |
| 2 | "Tryouts each fall, no partner required" | **Spring tryouts, partner required** — info meeting → mock tryouts → April tryout (dancing + interview) |
| 3 | "Drop-in weekly classes, no partner needed" | **Couple-based 4-week sessions, $60/couple, 1.5 hr classes, six sessions/year, partner required** — page now shows pricing up front + partner-search help (@AW_DancePartnerSearch) |
| 4 | Generic class names (Two-Step 1…) | Real structure: **CW 1–2, Jitterbug 1–2**, Sunday evening slots |
| 5 | Performances "5–15 min" | **Free of charge; 5–20 min, 3–10 couples, arrive 1 hr early, ~5 sq ft/couple, 12-ft ceiling for jitterbug** |
| 6 | Merch → `teespring.com`; 3 of 6 videos were rickroll placeholders, other IDs fake | Real Flywire Marketplace store ($25 tees); **verified YouTube IDs** for Midland "Burn Out", RRB, Ella Langley + real team-channel performance videos |
| 7 | Sponsorships page had no giving mechanics | Real instructions: Texas A&M Foundation (501c3), memo "Aggie Wranglers — SOFC 954450", Koldus mailing address; corporate contact vicepresident@ |
| 8 | Banquet page showed a passed date with no pricing | Evergreen "10th annual — date TBA" + real $45 ticket / $600 table pricing, banquet@ contact |
| 9 | No general contact page ("Contact Us" on the old site loops to homepage) | New `/contact` with general-inquiry form (PLAN §7) + role-email directory |
| 10 | Mock dates throughout read as stale (banquet past, "polling" on past events, campaign "sent" in the future) | All dates refreshed to read current as of July 2026 |

## Recommended next (not built)

1. **Wire the real backend** (Supabase + forms + Resend per PLAN.md) — everything is still mock data; this is the gap between demo and tool.
2. **Partner-matching flow** — the single most common signup blocker; today it's three disconnected systems (NetID database, an Instagram account, a Google Form). Build it into `/public-lessons` + a portal review queue.
3. **Tryout application portal** — the current site references an "AW Tryout Couple Portal"; fold couple applications into the portal's Members tab (status `tryout` already exists).
4. **Waivers + incident reports** — liability waiver e-sign at lesson signup, incident report form in the portal Resources area.
5. **Lesson roster/payment reconciliation** — Flywire stays the payment rail, but the portal should track who's registered per session (capacity, waitlist, substitute-partner fees).
6. **Sponsor tiers with real amounts/benefits** — tiers exist in the UI but have no dollar amounts; the old site's biggest fundraising gap.
7. **Real photography** — member cards and heroes are initials placeholders; pull best-resolution originals from the Wix site (PLAN's image-migration step).
8. **Server-side preview gating** — the current passphrase gate is client-side by design; move to Vercel/Cloudflare Access before adding anything sensitive.
9. **Staleness cron** — the #1 disease of the old site is stale dates; PLAN's staleness checks should ship with v1.

## Verification

- `npx tsc --noEmit` — clean (strict mode, no ignores)
- `npm run lint` — no errors (2 acceptable `<img>` warnings for YouTube thumbnails; images are unoptimized in static export anyway)
- `NODE_ENV=production npm run build` — all 40 routes export, with typecheck + lint enforced
- Exported HTML spot-checked: Geist wired, 1984 copy, real video IDs, Flywire links, `/contact` + `/privacy` present

---

## Addendum — build-out (same branch, July 2026)

The "wire the real backend" gap above is now half-closed: the whole app runs
against a swappable client-side data layer (`webapp/lib/store.ts`) with every
button, form, workflow, permission rule, and CMS editor functional, plus a
17-test Playwright e2e suite and CI. See `webapp/README.md` (architecture +
migration steps) and `DEMO.md` (team review script). Remaining for production:
Supabase + Resend + Google APIs behind the store, per PLAN.md.
