# Aggie Wranglers Website Redesign Plan

> Replatform aggiewranglers.com off Wix into a modern, low-maintenance, conversion-focused site driven by a Google Sheet CMS so the team can keep content current without touching code.

---

## 1. Research summary

### Current site (audited 2026-05-10 via aggiewranglers.com)

**Confirmed URLs (preserve all of these for SEO):**

- `/` (Home)
- `/public-lessons`
- `/private-lessons`
- `/private-lesson-request`
- `/performances-information`
- `/performance-request`
- `/requirements` (Tryouts info)
- `/merchandise`
- `/sponsorships`
- `/meet-the-team`
- `/history`
- `/our-building`
- `/faq`
- `/alumni`
- `/current-team`
- `/banquet`

**Brand / voice anchors already present:**

- Tagline: *"High Flyin', Death Defyin'"*
- Mission: spreading love for Texas A&M through country-western dance
- Core values: commitment, humility, integrity, respect, partnership, excellence
- Contact: president@wranglers.tamu.edu · 8827 Gauge Dr, College Station, TX 77845
- Socials: TikTok, Instagram, Facebook, YouTube, X — all `@aggiewranglers` / `@AggieWranglers`
- Sponsors currently featured: Expressions Dance Studio, Tailwind, Buff City Soaps

**Problems observed:**

- Public lessons page still shows Spring 2 schedule with stale 2/15–3/4 dates (no year visible) — classic staleness symptom
- `/requirements` (Tryouts) page references an "Important Dates" link but no actual dates are listed
- `/private-lessons` returns a "Blank" page in Google's index — placeholder content from launch never filled in
- Performance request flow buried behind a tutorial video
- No first-class YouTube presence even though the team's video content (Ella Langley "Choosin' Texas" music video, viral routines) is one of their biggest assets

### Why the team can't keep it current today

Wix's editor requires logging into a shared account, navigating a WYSIWYG, and remembering where each field lives. There's no one designated for it, so it rots. The fix is **not** to find a more committed maintainer — it's to make updates take 30 seconds in a tool the team already lives in (Google Sheets / Drive).

---

## 2. Goals & non-goals

### Goals

1. **Three conversion paths, ruthlessly prioritized** above all else:
   - Sign up for **public lessons**
   - Request a **performance**
   - Get current info & get hyped about **tryouts**
2. **Sheet-driven content** for everything that changes more than once a year (lesson schedule, tryout dates, roster, YouTube playlist, sponsors, FAQ, announcements).
3. **Preserve every existing URL** so SEO equity transfers.
4. **Visually polished, on-brand** (Aggie maroon + white, modern typography, real photos, video-first).
5. **Cheap to run** (target: $0–$10/mo) and easy to hand off to future team members.
6. **AI-assisted content workflows** so a non-writer team member can paste rough notes and get publish-ready copy.

### Non-goals (intentionally out of scope)

- Member portal / login (still email + Google Drive for internal stuff)
- Native app
- E-commerce (merch can keep pointing to existing store)
- Replacing Flywire lesson signup or the current payment processor
- Migrating banquet RSVP infra (low-volume, can stay as-is)

---

## 3. Recommended architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Google Sheet ("AW Website CMS")                            │
│  Tabs: site, lessons, tryouts, performances, team,          │
│        alumni, sponsors, videos, faq, announcements         │
│  Edited by: team officers (Drive permissions)               │
└────────────────┬────────────────────────────────────────────┘
                 │  (1) Apps Script onEdit → POST webhook
                 │  (2) Cloudflare Worker reads via Sheets API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Worker: "aw-content-api"                        │
│  - Reads sheet via Google Sheets API v4 (service account)   │
│  - Normalizes rows → JSON                                   │
│  - Caches in Workers KV (TTL 5 min, hard-purge on webhook)  │
│  - Exposes /api/lessons, /api/tryouts, /api/videos, etc.    │
└────────────────┬────────────────────────────────────────────┘
                 │  fetch() at build-time + runtime
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Astro site on Cloudflare Pages (aggiewranglers.com)        │
│  - Static-first, hydrates only interactive islands          │
│  - Tailwind, Aggie-maroon design system                     │
│  - All legacy routes preserved                              │
│  - Forms POST to Worker → Resend → president@wranglers...   │
└─────────────────────────────────────────────────────────────┘
```

### Why this stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Astro** | Content-heavy, mostly static, ships ~0 JS by default, MDX support, easy SEO/sitemap, fast builds. Better fit than Next for this. |
| Hosting | **Cloudflare Pages** | Free tier covers this traffic easily; great DX; integrated with Workers. |
| Styling | **Tailwind CSS** | Fastest way to enforce the Aggie design system consistently. |
| CMS | **Google Sheet** | Team already uses Drive; zero-cost; no new auth; spreadsheet UX is more familiar than a "real" CMS. |
| API layer | **Cloudflare Worker + KV** | Avoid hitting Google API on every page view; cheap; lets us rebuild only when content changes. |
| Forms | **Worker → Resend** | Forwards to president@wranglers.tamu.edu and logs to a "submissions" tab in the sheet for record. |
| Email | **Resend** (free 3k/mo) | Better deliverability than Workers email API alone; trivial to swap later. |
| Analytics | **Cloudflare Web Analytics** | Free, privacy-respecting, no cookie banner needed. |
| Domain | Keep `aggiewranglers.com` | Update DNS to Cloudflare; preserve TAMU subdomain reference if used elsewhere. |

### Why not just Wix again, or Squarespace, or Webflow?

- All of them put content edits behind a WYSIWYG and a paid editor seat — same root problem.
- None give us a single source of truth a phone-using student can edit on a couch.
- A spreadsheet beats a CMS for this team because the team's content *is* tabular (schedule of classes, roster of members, ordered list of videos).

---

## 4. Information architecture

Top nav (matches today's structure to preserve SEO and muscle memory):

```
Home  |  Lessons ▾  |  Performances ▾  |  Tryouts  |  About ▾  |  Watch
                                                                  ↑ new
   Public Lessons      Request a Performance     History
   Private Lessons     Performance Info          Meet the Team
   Private Request                               Current Team
                                                 Alumni
                                                 Our Building
                                                 FAQ
                                                 Sponsorships
                                                 Banquet
                                                 Merchandise
```

**New page: `/watch`** — YouTube playlist page ordered by the team via the sheet. This is high-leverage: the team's best marketing artifact is its videos, and right now they live one click away on YouTube with no on-site funnel back into "now sign up for a lesson."

**Homepage layout** (above the fold, mobile-first):

1. Hero image/video loop + tagline.
2. **Three giant CTAs**: "Sign up for lessons" · "Request a performance" · "Try out for the team."
3. Next public-lesson session card (pulled live from sheet — "Next class: Wed Feb 18, 5:30 PM at our building").
4. Featured YouTube embed (top video from sheet).
5. Quick proof: recent performances / press (Ella Langley music video, KBTX feature).
6. Social strip + email signup.

Every page below the fold uses a consistent footer with contact, socials, and a mini-CTA back to the three primary actions.

---

## 5. Google Sheet schema (the "CMS")

One workbook, multiple tabs. Each tab has a header row; the Worker maps headers → JSON keys.

**`site_settings`** (key/value pairs)
- `contact_email`, `address`, `tagline`, `mission_statement`, `instagram_url`, `tiktok_url`, `youtube_channel_url`, `facebook_url`, `x_url`, `next_tryout_date`, `tryouts_open`, `lessons_open`

**`public_lessons`** (one row per class session)
- `class_name`, `level` (CW1/CW2/Jitt1/Jitt2), `day`, `start_time`, `end_time`, `dates` (comma-separated), `instructors`, `signup_url` (Flywire), `active` (TRUE/FALSE), `notes`

**`tryouts`** (one row per upcoming tryout cycle)
- `cycle_name` (e.g., "Spring 2027"), `prep_lesson_dates`, `tryout_date`, `eligibility_notes`, `signup_url`, `active`

**`team_members`**
- `name`, `role` (President, Captain, Member, etc.), `class_year`, `hometown`, `major`, `headshot_url` (Drive link), `bio`, `display_order`, `current` (TRUE/FALSE)

**`alumni`** (lightweight — just year + names, optional bio)
- `class_year`, `name`, `notes`

**`youtube_videos`**
- `video_id` (YouTube ID), `title_override` (optional), `display_order`, `category` (Top/Press/Performance/Behind-the-scenes), `featured` (TRUE for homepage)

**`sponsors`**
- `name`, `tier` (Gold/Silver/Bronze/Partner), `logo_url`, `website_url`, `display_order`, `active`

**`faq`**
- `question`, `answer` (markdown allowed), `category` (Lessons/Tryouts/Performances/General), `display_order`

**`announcements`** (homepage banner / news strip)
- `headline`, `body`, `link_url`, `start_date`, `end_date`, `active`

**`form_submissions`** (write-only from Worker — audit trail)
- `timestamp`, `form_type`, `name`, `email`, `phone`, `payload_json`, `forwarded_to`

The Worker is tolerant of extra columns and reorders — the team can add notes columns without breaking the site.

---

## 6. Forms & lead capture

Three forms, each a Worker endpoint:

1. **Performance request** — name, org, event date, location, audience size, notes. Posts to `/api/forms/performance`. Worker validates, writes a row to `form_submissions`, emails president@wranglers.tamu.edu via Resend, returns a thank-you redirect.
2. **Private lesson request** — same pattern, different fields.
3. **General contact** — same pattern.

Public lessons continue to use the existing Flywire links (just surfaced from the sheet). No need to rebuild payment flow.

Spam protection: Cloudflare Turnstile (free, invisible) on each form.

---

## 7. SEO migration plan

This is the most failure-prone part of any replatform, so it gets its own checklist.

- [ ] Crawl current site (Screaming Frog free tier or `wget --mirror`) → export every URL, title, meta description, H1.
- [ ] Map every legacy URL 1:1 to a new URL. If a path changes, add a 301 in `_redirects`.
- [ ] Preserve `<title>`, meta description, and primary H1 wording on each page during launch; iterate after.
- [ ] Generate `sitemap.xml` and `robots.txt` at build.
- [ ] Add JSON-LD structured data: `Organization`, `Event` (for tryouts/lessons), `VideoObject` (for YouTube embeds), `FAQPage` for `/faq`.
- [ ] Open Graph + Twitter card images per page (auto-generated via Satori at build).
- [ ] Verify in Google Search Console before flipping DNS; re-submit sitemap after.
- [ ] Keep TAMU/Maroon Link/`thebatt.com` backlinks intact — they point to the apex, which we keep.
- [ ] Monitor Search Console for 404s for 30 days post-launch.

---

## 8. Design system

**Color palette** (aligned with TAMU brand standards):

- `--aw-maroon`: `#500000` (Aggie Maroon — primary)
- `--aw-maroon-dark`: `#3D0000` (hovers, deep accents)
- `--aw-white`: `#FFFFFF`
- `--aw-cream`: `#F8F4EC` (warm off-white for sections, retains western feel)
- `--aw-charcoal`: `#1A1A1A` (body text)
- `--aw-gold-accent`: `#C8A951` (very sparing — buckle/trophy accent only, not primary)

**Typography:**

- Headlines: a strong serif or western-leaning slab (e.g., **Playfair Display** or **Roboto Slab**) to nod to the heritage without going full novelty-western.
- Body: a clean humanist sans (**Inter** or **Source Sans 3**) for readability.
- Tagline / accent: small caps treatment of headline font.

**Imagery rules:**

- Real performance and lesson photos, never stock cowboy clichés.
- Video > static on the homepage hero.
- Maroon is a dominant background; cream and white provide breathing room; gold is a garnish.

**Components to build:**

- `<CTAButton variant="primary|secondary">`
- `<LessonCard>` (renders from `public_lessons` row)
- `<TryoutCallout>` (state-aware: "Tryouts open" / "Tryouts closed — next cycle in...")
- `<MemberCard>`, `<VideoCard>`, `<SponsorRow>`, `<FAQItem>`
- `<RequestForm>` (shared structure, swap fields per type)

---

## 9. AI-assisted content workflows

The team should never stare at a blank page. Three concrete tools, all run by anyone with a Claude or ChatGPT account — no engineering required:

1. **"Polish this announcement" prompt** — paste rough notes, get a homepage announcement and an Instagram caption. Living in the team's Notion / Drive.
2. **Bio generator** — paste a new member's hometown/major/fun fact, get a 2-sentence bio in the team voice. Saved as a Google Doc template with the team's tone-of-voice guide embedded.
3. **Performance recap generator** — paste event details and a few photos, get a short recap for the announcements tab + a social caption.

(Optional, later: a `/api/draft` Worker endpoint that lets the team submit notes from a Sheet column and writes back AI-drafted copy to an adjacent column. Nice-to-have, not required.)

---

## 10. Build phases & timeline

Each phase is shippable on its own.

### Phase 0 — Setup & content audit (2–3 days)
- Create repo structure (Astro + Tailwind + Wrangler).
- Set up Cloudflare Pages project + preview deploys.
- Crawl current site, export full content inventory.
- Take stock of usable assets (photos, videos) and identify gaps.

### Phase 1 — Design system + static skeleton (3–5 days)
- Tailwind theme, typography, component library on a Storybook-lite page.
- Build every page with hardcoded content, all legacy URLs in place.
- Lighthouse pass: 95+ across the board.

### Phase 2 — Sheet CMS wiring (3–4 days)
- Create the master Google Sheet from §5 schema.
- Service account + Sheets API access.
- `aw-content-api` Worker with KV caching.
- Astro pages fetch from Worker at build-time; key pages also do client-side revalidation.
- Apps Script `onEdit` trigger → POST to Worker → purge KV → trigger Pages rebuild via deploy hook.

### Phase 3 — Forms + automation (2–3 days)
- Three Worker form endpoints with Turnstile.
- Resend integration → president@wranglers.tamu.edu.
- Submissions logged back to the sheet.
- Confirmation emails to submitters.

### Phase 4 — YouTube watch page + homepage polish (1–2 days)
- `/watch` page reads `youtube_videos` tab, renders ordered embeds.
- Homepage featured video + announcements strip live.
- OG image generation for shareable links.

### Phase 5 — SEO migration + launch (2–3 days)
- Full redirect map, sitemap, structured data.
- Stage on `staging.aggiewranglers.com` for current team review.
- DNS cutover during low-traffic window (summer break).
- Search Console + Analytics verification.

### Phase 6 — Team handoff (1 day)
- Screen recording: "How to add a new public lesson."
- Screen recording: "How to add a tryout cycle."
- Screen recording: "How to reorder the YouTube playlist."
- One-page printable cheat sheet pinned to the sheet's first tab.

**Total: ~3 weeks of focused work**, easily parallelizable.

---

## 11. Costs

| Service | Tier | Monthly |
|---|---|---|
| Cloudflare Pages + Workers + KV | Free | $0 |
| Cloudflare Web Analytics | Free | $0 |
| Resend | Free (3k emails/mo) | $0 |
| Google Workspace / Sheets API | Existing TAMU acct | $0 |
| Domain renewal | Existing | ~$1 |
| **Total ongoing** | | **~$0–$1/mo** |

Headroom: if traffic grows past Worker free tier (100k req/day), it's $5/mo. Resend paid is $20/mo for 50k.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| SEO drop during migration | Strict 1:1 redirect map; preserve titles/H1s; pre-stage and verify in Search Console |
| Sheet breaks the site (bad row) | Worker validates row shape; falls back to last-known-good KV snapshot; never 500s the page |
| Team abandons updating again | Updates are 1 cell; cheat sheet + 90-sec videos; auto-reminder cron emails officers monthly with stale-date warnings |
| Form spam | Cloudflare Turnstile + honeypot + rate limit per IP |
| Photo/video rights | Audit existing assets at Phase 0; flag anything that's not clearly team-owned |
| Officer transitions lose access | Use a shared `wranglers.tamu.edu` group as the sheet owner, not an individual; document service account credentials in the team's secure password manager |

---

## 13. Open questions for the team

Things to confirm before Phase 1:

1. Who is the current website point person? Who should be on the sheet's edit list?
2. Is the Flywire e-store URL pattern stable across semesters, or does it change every cycle? (Affects whether the team pastes a new URL each semester or just toggles `active=TRUE`.)
3. Do we want a member-only area (password-protected resources, music library, etc.) or is that staying in Drive?
4. Banquet — does it need a real page, or just a one-pager that goes live in the weeks before?
5. Merchandise — keep pointing to the external store, or build an embedded gallery?
6. Any pending sponsor commitments that need to launch with the site?

---

## 14. What "done" looks like

- [ ] All legacy URLs respond 200, with content matching or improving on the old site.
- [ ] Three primary CTAs visible above the fold on mobile.
- [ ] A team officer can add a new public lesson session in under 60 seconds, with no code or deploy.
- [ ] Performance request form delivers to president@wranglers.tamu.edu and logs to the sheet.
- [ ] `/watch` shows the team's top videos in the order the team chose.
- [ ] Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO on `/`.
- [ ] Search Console shows no new 404s after 14 days post-launch.
- [ ] Three short Loom videos handed to the team showing the most common edits.
