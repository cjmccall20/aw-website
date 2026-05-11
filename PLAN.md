# Aggie Wranglers Website Redesign Plan

> Replatform aggiewranglers.com off Wix into a unified system with two surfaces:
> a polished public site at **aggiewranglers.com** and an authenticated team portal at **team.aggiewranglers.com** that doubles as the CRUD app, ops console, and source of truth for everything the public site shows.

**Stack at a glance:** Next.js on **Vercel** · **Supabase** (Postgres + Auth + Storage) as the single source of truth · **Magic-link email + Microsoft Entra SSO + Google OAuth** for portal sign-in · Role-based access control · **Resend** for all outbound email (sent from in-portal composer; BCCs the relevant team Outlook mailbox for institutional record) · **In-portal calendar with per-member iCal feeds** (Google/Microsoft Graph two-way sync deferred to a later phase).

---

## 0. TL;DR — what's new in v5 (from team Q&A clarifications)

v5 locks in the open architectural questions from v4 and adds the workflow nuances surfaced by the team. The big shifts: **email lives inside the portal** (not as Gmail drafts), **the calendar is in-portal in v1** (Google Calendar integration deferred), and **officers always manually confirm** (no automatic confirmation, ever).

### Auth & branding
- **Magic-link email + Microsoft Entra SSO (Office 365 team accounts) + Google OAuth (TAMU + personal Gmail).** Not Google-only. Magic link is the always-works fallback so a new alumnus or external collaborator never gets locked out. SSO is preferred for officers who already use team Outlook credentials; personal TAMU Gmail accounts can use Google OAuth.
- **Brand work is deferred.** Site name, color palette, typography, and logo treatment are a separate brand refresh. v1 ships with a neutral but on-team-feel theme; the design system uses theme tokens so the brand refresh later is a single config flip, not a rebuild. The "Aggie Maroon" palette in §11 is a placeholder, not a commitment.

### Email is in-portal, not Gmail drafts
- **Officers compose and send from inside the portal.** Outbound goes via Resend, sent from authenticated role aliases on the team domain (`performance@`, `lessons@`, `bookings@`, etc.). The system BCCs the relevant team Outlook mailbox so a sent record still lands in the officer's inbox.
- **Threads are stored in the portal as the canonical record.** Inbound replies (forwarded into the portal via per-inbox forwarding rules in v1; Microsoft Graph polling can replace forwarding in a later phase) attach to the conversation. This is what turns the email composer into an institutional-memory tool — every email the team has ever sent a contact is one click away.
- **Contacts are a first-class entity.** Every form submitter becomes a `contacts` row. From any contact's profile you see every past request (performance, private lesson, general inquiry), every email exchanged, every officer note. Notes survive officer transitions — this is the real moat: a future PR officer can see that a Houston wedding planner has booked the team three times, what their tendencies were, and who their florist usually is.

### Calendar is in-portal, not Google Calendar API (in v1)
- **A custom calendar inside the portal** is the source of truth. It's populated by confirmed performances, scheduled lessons, tryout cycles, and ad-hoc team events. Members and officers see it natively.
- **Per-member personal iCal feed.** One subscription URL per member that returns only their assigned events; subscribers (Apple/Google/Outlook) stay synced forever. This is the v1 export path to external calendars.
- **Microsoft Graph (Outlook) and Google Calendar two-way sync is a planned later phase.** Officers can already plan in the portal and let members subscribe via iCal; if real demand for write-back emerges, we add it.

### Workflow: no auto-confirmation, ever
- **The officer always makes the call.** Threshold-met / threshold-not-met is informational, not automatic. Even when 8 of 8 couples say Yes, the PR officer reviews the actual responses (which couples, possible conflicts with other gigs that night, prior history with the requester) and clicks Confirm or Decline themselves. There is no path in the system where an email leaves the portal without an officer's explicit click.
- **Default min couples: 3.** Configurable globally and per-request.
- **Default response deadline: 3 days.** Configurable globally in the Performance Management Settings sub-tab AND per-request when the officer approves a request to poll.
- **Default survey send time: Sunday 6 PM CT.** Configurable; PR officer can also disable auto-send entirely (e.g., during winter break or finals).
- **Urgency stays a visual flag, not a workflow branch.** Requests marked urgent surface prominently in the inbox; no automated bumping into the next survey or shortened deadline. Officer reads the flag and decides.

### Notifications are email-only in v1; phone numbers collected from day one
- **Email is the only outbound channel in v1.** Twilio SMS is a planned later phase ("day-of reminder texts to assigned members," "RSVP last call"). To unblock that later, **we collect phone numbers on every member profile and every contact record starting now.** Members opt in/out per channel.

### Image migration
- **Greenfield image migration.** Pull originals from the current Wix site at the best resolution available and re-host to Supabase Storage with stable, team-owned URLs. No proxying through Wix. Anything that comes out blurry gets a "needs rephoto" flag handed to the social media officer.

### Members → alumni flow
- **Alumni live in a sibling table linked to members by `member_id`.** When a member is marked `graduated` in the Members tab, the system creates a draft `alumni_profiles` row with grad year and known info; the alumnus completes or confirms it on their next portal visit. The original `members` row stays linked so historical assignments and bios stay intact.
- **Self-service alumni signup** still exists for alumni who graduated before the portal existed (no `members` row to link to). They submit grad year + verification info; president (or a designate) approves.

### Move Library scoped down
- **Catalog only in v1; videos live on the team's private YouTube channel(s).** Each move row has name, aliases, originator, era, difficulty, written description, and a YouTube link (or list of links). Access to the videos is governed by YouTube channel membership, not portal logic — which means **v1 doesn't need an alumni contribution queue, per-move public-safe toggles, video upload, or officer review infrastructure.**
- **Editing model: officers edit move entries directly.** No contribution queue. If an alumnus wants to add a move, they tell an officer.

### Other clarified defaults
- **Banquet:** permanent page with annual updates via Site Content tab. Preserves `/banquet` URL year-round.
- **Merchandise:** link out to the existing external store. No embedded gallery in v1.
- **Stripe / payments:** not in v1. Public lessons keep Flywire; Stripe gets integrated at the next natural pricing change.

### Launch strategy
- **One big launch.** Full v1 ships together — public site + portal cut over on the same day. ~6–8 weeks of focused build. No incremental public-facing rollout.

### What this changes about cost / dependencies
- **Removed dependencies:** Gmail API, Google Calendar API (still optional in a later phase, not v1).
- **Added dependencies:** nothing material. Microsoft Entra OAuth is free; magic-link emails ride the existing Resend allowance.
- **Net ongoing cost is still ~$15/yr for the domain.**

### Carryovers from v4 (still the plan)

- **No AI in the production system.** Email composer is plain text + templates with variable substitution. Officers edit before send. Anyone can still use external ChatGPT/Claude for marketing copy — that's a workflow choice, not a system dependency.
- **Drive-time-aware availability surveys** via Google Maps Platform. Performance request form uses Google Places autocomplete; backend calls Distance Matrix to compute drive time from the building (8827 Gauge Dr) and stores it on the request. Each survey item shows members their *real* time commitment ("7 PM performance in Brenham — 1h 15m drive — you'd need to be free roughly 4:45 PM to 10:45 PM"). Officer can override drive time, call time (default 60 min), and return buffer (default 15 min) per request.
- **Supabase as single source of truth** for Postgres + auth + file storage.
- **Cost stays at ~$15/yr** for the domain; every service stays on its free tier at AW scale.

### Carryovers from v3 (still the plan)

- Public site at `aggiewranglers.com` with four conversion CTAs and preserved legacy URLs.
- Authenticated team portal at `team.aggiewranglers.com` with role-gated tabs.
- Performance review gate → batched weekly survey → officer manual confirm/decline.
- Schedule-ahead-and-hide for public lessons.

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

- Public lessons page still shows Spring 2 schedule with stale 2/15–3/4 dates — staleness symptom.
- `/requirements` (Tryouts) references an "Important Dates" link but no actual dates listed.
- `/private-lessons` returns a "Blank" page — placeholder never filled in.
- Performance request flow buried behind a tutorial video.
- No first-class YouTube presence even though the team's video work — Midland *"Burnout,"* Randy Rogers Band *"I'll Never Get Over You,"* Ella Langley *"Choosin' Texas"* — is huge.
- **No system for operational coordination.** Performance availability, lesson scheduling, who's-where-this-week all happen in GroupMe and individual heads.

---

## 2. Goals & non-goals

### Goals

1. **Public site** with four conversion paths, ordered by importance:
   1. Sign up for **public lessons**
   2. Get current info & get hyped about **tryouts**
   3. Request a **performance**
   4. Request a **private lesson**
2. **Team portal** that handles the team's actual operational life:
   - Manage performance requests end-to-end (intake → review → batched availability survey → officer manual confirm/decline via in-portal composer).
   - Manage lesson scheduling (public sessions for the semester, private lesson requests, instructor assignments).
   - Maintain member roster (current, tryouts, graduated) with photos and phone-on-record for future SMS.
   - **Contacts (CRM)** entity with full email + request + notes history across officer transitions — the institutional-memory feature.
   - **In-portal email composer + thread store** so every outbound and inbound message is part of the contact's record forever.
   - Manage site content (everything the public site shows).
   - View an in-portal team calendar; export to personal calendars via signed iCal feeds.
   - Provide member-facing resources (constitution, move library, alumni directory).
3. **Preserve every existing URL** so SEO equity transfers.
4. **Visually polished**, theme-token-driven so the deferred brand refresh is a config change.
5. **Email policy:** auto-replies are sent immediately for form acknowledgments and magic-link sign-ins; everything else is composed in the portal by an officer and sent from a role alias via Resend with team Outlook BCC.
6. **In-portal calendar with per-member iCal feeds**; Microsoft Graph / Google Calendar two-way sync is a deferred later phase.
7. **Free to run** (~$15/yr domain — every other service stays on free tier for AW's volume; see §14) and durable across officer transitions.

### Non-goals

- Native app (the portal is a mobile-friendly PWA).
- E-commerce / merch fulfillment (keep pointing to external store).
- Replacing Flywire for public lesson payments.
- Migrating banquet RSVP infra unless the team wants it.
- Auto-sending non-trivial external emails. Confirmations, declines, quotes, and other client-facing emails are always composed (with template prefill) and sent by an officer from the in-portal composer. Auto-replies for form acknowledgments and magic-link sign-ins are the only no-human-in-the-loop sends.
- Doing anything the team can't take over within an officer transition cycle.

---

## 3. Recommended architecture

```
                            ┌──────────────────────────┐
                            │  Supabase                │
                            │  Postgres + Auth + Files │
                            │  Single source of truth  │
                            └──────────┬───────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                                             │
                ▼                                             ▼
   ┌────────────────────────────┐         ┌────────────────────────────────────┐
   │  aggiewranglers.com        │         │  team.aggiewranglers.com           │
   │  PUBLIC SITE               │         │  TEAM PORTAL (auth required)       │
   │  ──────────────────────    │         │  ────────────────────────────────  │
   │  Static + ISR pages        │         │  Next.js App Router                │
   │  - / home (4 CTAs)         │         │  - Dashboard                       │
   │  - /public-lessons         │         │  - Performance management          │
   │  - /private-lessons        │         │  - Lessons management              │
   │  - /performance-request    │         │  - Contacts (CRM)                  │
   │  - /private-lesson-request │         │  - Email composer + threads        │
   │  - /requirements (tryouts) │         │  - Members & roster                │
   │  - /meet-the-team          │         │  - Site content (CMS)              │
   │  - /watch (videos)         │         │  - Team calendar (in-portal)       │
   │  - + every legacy URL      │         │  - Resources / Move Library        │
   │                            │         │  - Alumni directory                │
   │  Forms POST to /api/forms  │         │  - Surveys                         │
   │  Read from DB (revalidate  │         │  - Settings                        │
   │    via webhook on write)   │         │                                    │
   │                            │         │  Auth: Supabase Auth               │
   │                            │         │    · magic-link email              │
   │                            │         │    · Microsoft Entra (Office 365)  │
   │                            │         │    · Google OAuth (TAMU + Gmail)   │
   └────────────────────────────┘         │  RBAC: roles[] on user record      │
                                          └──────────────┬─────────────────────┘
                                                         │
        ┌────────────────────────────────────────────────┼─────────────────────────────┐
        │                          │                     │                  │           │
        ▼                          ▼                     ▼                  ▼           ▼
 ┌──────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐
 │ Resend       │  │ In-portal      │  │ In-portal      │  │ Google Maps    │  │ Vercel     │
 │ (auto-reply, │  │ email composer │  │ calendar       │  │ (Places auto-  │  │ Cron       │
 │  survey      │  │ + thread store │  │ + per-member   │  │  complete +    │  │ (weekly    │
 │  emails,     │  │ (send via      │  │ iCal feeds     │  │  Distance      │  │  surveys,  │
 │  digests,    │  │  Resend, BCC   │  │ (Google/MS     │  │  Matrix → real │  │  digests,  │
 │  magic       │  │  team Outlook  │  │  Graph sync    │  │  drive times)  │  │  staleness,│
 │  links)      │  │  for inbox     │  │  deferred to   │  │                │  │  Monday    │
 │              │  │  record)       │  │  later phase)  │  │                │  │  digest)   │
 └──────────────┘  └────────────────┘  └────────────────┘  └────────────────┘  └────────────┘
```

### Why this stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | One app, two domains via middleware. Public pages render static/ISR; portal pages render dynamically with auth. Future maintainers (likely students) only learn one stack. |
| Hosting | **Vercel** | Hobby tier covers AW's scale. Free + GitHub-native deploys. |
| Database + Auth + Files | **Supabase** | One vendor for Postgres, auth (magic link + OAuth providers), and file storage for headshots/logos/PDFs. RLS gives RBAC at the DB layer. |
| Auth providers | **Supabase Auth**: magic-link email + **Microsoft Entra (Office 365)** OAuth + **Google OAuth** (TAMU + personal Gmail) | Magic link is the always-works fallback for alumni / external collaborators. Entra SSO for officers on team Outlook accounts. Google OAuth for personal TAMU Gmail accounts. Domain allow-listing handled by RBAC + approval queue, not by restricting the OAuth provider. |
| ORM | **Drizzle** | Lean for serverless; great Postgres support; portable SQL. |
| RBAC | **roles[] on user** + route middleware + RLS | Simple, transparent, defense in depth. |
| UI | **shadcn/ui + Tailwind** | Token-driven theming so the brand refresh later is a config change. Looks like a serious product, not an admin panel. |
| Cache / KV | **Upstash Redis** | Rate limits, survey response idempotency, Distance Matrix cache. |
| Email — outbound | **Resend** | All outbound email goes through Resend: form auto-replies, magic-link sign-in, survey invitations, weekly digest, AND officer-composed messages sent from the in-portal composer (from authenticated role aliases on the team domain). |
| Email — inbound + thread record | **Per-mailbox forwarding rules → portal ingest endpoint** | Each role mailbox (`performance@`, `lessons@`, `bookings@`) forwards inbound messages to a per-alias webhook that attaches the message to the right thread + contact. Microsoft Graph polling can replace forwarding later if officers want richer inbox features. |
| Calendar | **In-portal calendar + per-member iCal feeds** | Source of truth lives in Postgres. Members subscribe to a signed iCal URL from any calendar app (Apple/Google/Outlook). Google Calendar / Microsoft Graph two-way sync is a deferred later phase, not in v1. |
| Maps / drive time | **Google Maps Platform** (Places + Distance Matrix) | Address autocomplete on the performance form; compute real drive time from the building to the venue. |
| Background jobs | **Vercel Cron** (consolidated daily entry point) | One daily cron that branches by weekday handles weekly survey send, weekly digest, response-deadline checks, and daily staleness checks — fits Hobby tier's 2-cron limit. |
| SMS (planned) | **Twilio** — not v1, but reserve schema | Phone numbers collected on member + contact records from day one so day-of reminder texts and "RSVP last call" are unblocked when we add Twilio. |
| Analytics | **Vercel Web Analytics** | Privacy-friendly, no cookie banner needed. |
| Domain | `aggiewranglers.com` apex + `team.aggiewranglers.com` subdomain | Both point to the same Vercel project; middleware routes by host. Email aliases (`*@wranglers.tamu.edu` or new team-owned domain) authenticated in Resend for sending. |

### Database choice: settled on Supabase

Supabase covers Postgres, auth, and file storage in a single free-tier vendor. Officers who want a raw-table editor can use the Supabase dashboard directly; the portal is the easy CRUD UI for everything else. Free-tier limits (500 MB DB, 1 GB storage, 50K MAU) sit at >5× AW's projected v1 usage, so we won't outgrow it within the first year+.

---

## 4. The team portal (`team.aggiewranglers.com`)

The portal is structured as twelve tabs, each with role-gated access. Anyone signed in sees a personalized Dashboard; everything else depends on roles.

### 4.1 Tabs & features

**1. Dashboard** *(all roles)*
- "Where you're expected this week" — next 7 days of personal calendar.
- Open surveys to respond to.
- Action items for your role (e.g., PR officer: "3 requests past their response deadline waiting for your decision").
- System banners (staleness alerts targeted to the relevant officer).
- Unread thread count for any role aliases you own.

**2. Performance Management** *(PR Officer, President, Member view-only)*
- Inbox: all `performance_requests` with status filters and prominent visual badge on `urgency = quick_answer` rows.
- Per-request detail page: review notes, urgency flag, contact link (jumps to the requester's contact profile and full history), poll history, survey response breakdown, message thread.
- Workflow buttons:
  - **Approve to poll** (set polling window + min couples + response deadline + survey inclusion)
  - **Decline** (jumps to email composer with the decline template)
  - **Send survey now** / **Add to next weekly survey**
  - **Compose confirmation** / **Compose decline** (opens in-portal composer prefilled from template — see Tab 4 below)
- **No auto-send anywhere.** Threshold-met is a status badge that prompts officer action; nothing leaves the portal until the officer clicks Send in the composer.
- Settings sub-tab: `weekly_survey_day`/`time`, `auto_send_weekly_survey` on/off, `default_polling_window_days`, `default_min_couples_required` (default **3**), `default_response_deadline_days` (default **3**), default `call_time_minutes_before` (60), default `return_buffer_minutes` (15).

**3. Lessons Management** *(Lessons Officer, President)*
- **Public sessions:** schedule a semester of sessions at once. Each session has `visible_to_public` toggle (default OFF) and optional `publish_at` date. Officer can plan ahead, then flip on (or auto-publish) when ready.
- **Private lesson requests:** same shape as Performance Management (review gate → optional survey → assign instructors → manual confirm via in-portal composer).
- **Instructor pool:** which members are eligible to teach which class types.

**4. Contacts (CRM)** *(all officers; member view-only for their own threads)*
- **Single contact entity for every external person the team interacts with.** Auto-created from every form submission (performance, private lesson, general inquiry, newsletter); manually creatable by any officer.
- Contact profile shows:
  - Identity: name, organization, email, phone, address, social links, contact-permission preferences (email OK / phone OK / SMS OK once Twilio is added).
  - **All past requests** (performance + private lesson + general inquiry) with status, outcome, dates.
  - **Full email thread history** across years and officer transitions — every message sent to or received from this contact, surfaced in chronological order, with which officer sent it.
  - **Officer notes** (markdown). New officers can read what previous officers learned: "Always wants the team for their Houston gala. Florist is Stems by Sarah. Pays via wire from their corporate account. Loves the Midland video."
  - Tags (lightweight free-text), follow-up date (optional reminder on the officer dashboard).
- Search across name, organization, email, phone, notes, and past request notes.
- Merge tool for de-duplicating contacts (same email, different forms; or marriage name changes).
- **This tab is the institutional-memory feature.** A new PR officer landing in this tab on day one can pick up where the last one left off.

**5. Email** *(officers, scoped to threads they have access to)*
- In-portal composer + thread view, scoped to the role aliases the officer owns (`performance@`, `lessons@`, `bookings@`, etc.).
- Inbox per alias with unread counts; threads grouped by contact.
- Compose flow:
  1. Pick template (or write from scratch).
  2. System fills variables from the related request/contact.
  3. Officer edits freely.
  4. Hit Send → Resend delivers from the role alias to the recipient, BCCs the team Outlook mailbox so the sent record lands in the officer's regular inbox too, stores the message + thread in Postgres.
- Inbound replies: per-mailbox forwarding rules send incoming messages to a portal webhook; we match to the thread by `Message-ID` / `In-Reply-To` headers or by sender email and attach.
- **Every message is automatically linked to its contact** so the conversation history stays threaded across years.

**6. Members** *(President, Webmaster; Members view-only)*
- CRUD on member records: name, role title, class year, hometown, major, headshot, partner photo, partner link, bio, **phone (private, opt-in for future SMS)**, email, status (`current` / `tryout` / `graduated` / `inactive`).
- Drag-drop photo uploads to Supabase Storage.
- Officer transitions: bulk role updates at year-end.
- Approval queue for new sign-ins (TAMU/Gmail email present but not yet on team).
- **Graduation flow:** marking a member `graduated` auto-creates a draft `alumni_profiles` row linked by `member_id`; the alumnus completes it on their next sign-in.

**7. Site Content** *(Webmaster, President)*
- Edit homepage announcement, site-wide tagline, contact info.
- Manage `/watch` videos: reorder, set category (Top Routines / Music Videos / BTS & Press), toggle `featured`.
- Manage sponsors: add/edit/order, upload logos.
- Manage FAQ: add/edit/order.
- Manage tryout cycle: dates, eligibility, signup URL, `active` toggle.
- Manage **Banquet** content (annual update — page stays live year-round at `/banquet`).
- Manage **Merchandise** external store link (link-out only in v1).
- **Preview button:** opens public site in a new tab with draft content via cookie.

**8. Team Calendar** *(all roles)*
- **In-portal calendar view** (month / week / day / agenda). Source is Postgres, not Google.
- Event types: confirmed performances, scheduled public lessons, confirmed private lessons, tryout cycle dates, custom team events.
- Member-specific "my events" filter.
- Personal iCal feed URL (one-click copy) for Apple / Google / Outlook subscription.
- Microsoft Graph / Google Calendar two-way sync is **deferred to a later phase**; v1 ships iCal-only.

**9. Resources** *(all members + alumni; officers can upload)*
- Library of team files: **constitution PDF**, choreography notes, contracts/templates, historical photos by year, music library catalog (links), important contact lists, sponsor decks, etc.
- Each file: title, description, category, uploaded_by, uploaded_at, visibility (`members_only` / `members_and_alumni` / `officers_only`).
- Drag-drop upload to Supabase Storage; previews for PDFs and images.

**10. Move Library** *(all members; officers can edit)*
- **Catalog of every jitt / stunt move the team knows; videos hosted on the team's private YouTube channel(s).** The portal stores metadata + links, not the video files themselves.
- Each move record:
  - `name` + `aliases[]` (alumni often know moves by different names)
  - `category` (Spin / Lift / Throw / Dip / Combination / Footwork / Aerial)
  - `difficulty` (Beginner / Intermediate / Advanced / Expert)
  - `description` (markdown — counts, step-by-step, safety notes, partner requirements)
  - `originated_by`, `originated_year` (lore — "first done by X in '02")
  - `video_links[]` — one or more YouTube URLs (typically private/unlisted on the team channel)
  - `status` (Draft / Published / Archived)
- Filterable by category, difficulty, era.
- **No alumni contribution queue in v1.** Officers edit entries directly. If an alumnus wants to add a move, they tell an officer who adds it. Access to the YouTube videos themselves is governed by YouTube channel membership, not portal logic — which keeps the portal simple and the access control where alumni are already used to it.

**11. Alumni Directory** *(members + alumni)*
- Searchable by graduation year, hometown, current city.
- Each alumnus controls their own opt-in/opt-out and contact permissions.
- Self-service registration for alumni who graduated before the portal existed (no `members` row to link to); president (or designate) approves.

**12. Settings** *(President, scoped subsets for other officers)*
- **Auth:** allowed sign-in providers (magic link / Entra / Google), TAMU domain restriction for member-tier roles.
- **Email:** Resend domain verification status, role alias configuration, signature defaults per role, inbound forwarding addresses per alias.
- **Calendar:** event color scheme; iCal feed token rotation.
- **Site:** site name (placeholder until brand refresh), tagline, contact address, social links.
- **Webhooks / API keys:** admin only.
- **Ops defaults** (mirrored in Performance Management Settings sub-tab for PR officer): survey day/time, polling window, min couples, response deadline, digest day/time.

### 4.2 Roles & RBAC

| Role | Granted to | Can read | Can write |
|---|---|---|---|
| `admin` | Build maintainer (handed to president on transition) | All | All, including settings & user roles |
| `president` | Current president | All | All except admin-only settings; approves new sign-ins and alumni registrations |
| `officer:performance` | PR officer | Members, performances, contacts, threads on `performance@`, calendar, site content | Performance management, surveys, composer on `performance@` |
| `officer:lessons` | Lessons officer | Members, lessons, contacts, threads on `lessons@`, calendar, site content | Lessons management, surveys, composer on `lessons@` |
| `officer:webmaster` | Webmaster / social media officer | Members, site content, videos, FAQ | Site content tab |
| `member` | Current team member | Their assignments, calendar, resources, move library, alumni directory | RSVP to surveys, edit own bio + photos, opt in/out of phone-on-record |
| `alumni` | Verified alumni | Resources flagged `members_and_alumni`, alumni directory, move library metadata (videos via YouTube channel access, not portal) | Edit their own alumni profile |

A user can hold multiple roles (president is usually also an officer of something). Role checks live in Next.js middleware and in API routes; UI hides tabs the user can't access.

### 4.3 Login flow

User picks one of three sign-in methods on `team.aggiewranglers.com`:

1. **Magic link** — email address only. Resend delivers a one-tap signed link. Always-works fallback for alumni, external collaborators, or anyone whose SSO isn't set up.
2. **Microsoft Entra (Office 365)** — for officers signed in with their team Outlook account.
3. **Google OAuth** — covers both `@tamu.edu` and personal Gmail.

Behind any of the three, Supabase Auth resolves to a single canonical `users` row keyed by primary email. A user can later link additional providers from their profile.

**First sign-in for an unknown email:**
1. Account is created with role `member` and `status = pending_approval`. Lands on a "waiting for officer approval" page.
2. President (or whoever holds the approver role) sees a notification on their dashboard, opens Members → Approval queue, grants roles (or rejects with a reason).
3. The approver can match the email to an existing `members` row (for a member who is just claiming their portal account) or create a new `members` row from the sign-in info.

**Alumni sign-in:** alumni whose `members` record was already migrated land in their alumni profile directly on approval. Alumni who graduated before the portal existed go through the self-service registration path (grad year + verification info) and the same approval queue.

**Bootstrap:** at launch we whitelist the current officer slate by email so they can sign in immediately without manual approval. Initial admin is the build maintainer; ownership transfers to the president at officer transition.

---

## 5. Information architecture — public site

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

**`/watch` (new) — videos as a real funnel.** Three subsections, reorderable from the portal:

1. **Top Routines** — fan-favorite live performances.
2. **Music Videos We've Been In** — seeded with:
   - Midland — *Burnout*
   - Randy Rogers Band — *I'll Never Get Over You*
   - Ella Langley — *Choosin' Texas*
3. **Behind the Scenes / Press** — practice clips, news features, Yell Leaders crossover.

Each video card has a "Want to dance like this? → Public Lessons" CTA.

**Homepage layout** (mobile-first):

1. Hero image/video loop + tagline.
2. **Four CTAs** in a 2×2 mobile / 4-across desktop grid:
   - Sign up for Lessons (largest)
   - Tryouts (state-aware "Tryouts open!" badge when active)
   - Request a Performance
   - Request a Private Lesson
3. Next public-lesson session card (live from DB).
4. Featured video (top of videos where `featured = TRUE`).
5. Quick proof: recent performances / press.
6. Social strip + email signup.

---

## 6. Database schema (Postgres)

Grouped by domain. All tables have `id`, `created_at`, `updated_at`.

### 6.1 Identity & access

- **users**: `email` (unique), `name`, `avatar_url`, `roles[]` (text[]), `status` (`pending_approval` / `active` / `disabled`), `member_id` (FK → members, nullable for non-member logins), `phone` (optional, opt-in for future SMS).
- **auth providers / sessions**: managed by Supabase Auth (`auth.users`, `auth.identities`, `auth.sessions`). A given `users` row can have multiple linked identities (magic link + Entra + Google) that all resolve to the same canonical user.
- **audit_log**: who did what when (RBAC-sensitive actions only — role grants, sends, deletes, settings changes).

### 6.2 Site content

- **site_settings** (single row): `site_name` (placeholder until brand refresh), `tagline`, `mission`, `contact_email`, `address`, `socials`, `tryouts_open`, `lessons_open`, `homepage_announcement`, `auto_send_weekly_survey`, `weekly_survey_day` (default Sunday), `weekly_survey_time` (default 18:00 CT), `default_polling_window_days`, `default_min_couples_required` (default 3), `default_response_deadline_days` (default 3), `weekly_digest_day` (default Monday), `weekly_digest_time` (default 08:00 CT), `default_call_time_minutes_before` (60), `default_return_buffer_minutes` (15), `theme_tokens_json` (brand-refresh-ready theme overrides).
- **public_lessons**: `class_name`, `level`, `day`, `start_time`, `end_time`, `dates[]`, `instructor_ids[]`, `signup_url`, `visible_to_public`, `publish_at` (nullable), `active`, `notes`.
- **tryouts**: `cycle_name`, `prep_lesson_dates[]`, `tryout_date`, `eligibility_notes`, `signup_url`, `active`.
- **members**: `name`, `role_title` (display), `class_year`, `hometown`, `major`, `headshot_url`, `partner_photo_url`, `partner_id` (FK self), `bio`, `display_order`, `status` (`current` / `tryout` / `graduated` / `inactive`), `email`, `phone` (private, opt-in for future SMS), `sms_opt_in` (bool), `graduation_date` (nullable).
- **videos**: `youtube_id`, `title_override`, `display_order`, `category` (enum), `featured`, `source_artist` (for music videos).
- **sponsors**: `name`, `tier`, `logo_url`, `website_url`, `display_order`, `active`.
- **faq**: `question`, `answer` (markdown), `category`, `display_order`.
- **announcements**: `headline`, `body`, `link_url`, `start_date`, `end_date`, `active`.
- **banquet_content** (single row, or merge into site_settings): year, dates, venue, ticket info, links — updated annually.

### 6.3 Operations

- **contacts**: `name`, `organization`, `email` (indexed), `phone`, `address`, `social_links_json`, `tags[]`, `email_opt_in` (default true), `sms_opt_in` (default false), `notes_markdown`, `follow_up_date` (nullable), `created_by_id`, `merged_into_id` (nullable self-FK for merges). Every form submission resolves to a contact by email; manual create supported.
- **performance_requests**:
  - link: `contact_id` (FK → contacts, auto-resolved by requester_email)
  - intake snapshot: `requester_name`, `requester_email`, `requester_phone`, `organization`, `event_date`, `event_start_time`, `event_end_time`, `audience_size`, `performance_type`, `notes`, `urgency` (enum: `standard` / `quick_answer`), `needs_answer_by`
  - venue (from Google Places): `venue_name`, `venue_formatted_address`, `venue_place_id`, `venue_lat`, `venue_lng`
  - travel (computed via Distance Matrix at intake, override-able): `drive_time_minutes`, `drive_distance_miles`, `call_time_minutes_before` (default 60), `return_buffer_minutes` (default 15)
  - derived (read-only views): `availability_window_start = event_start_time - call_time_minutes_before - drive_time_minutes`, `availability_window_end = event_end_time + drive_time_minutes + return_buffer_minutes`
  - workflow: `status` (`new` → `under_review` → `ready_to_poll` → `polling` → `polling_closed` → `confirmed` / `declined` → `completed`), `assigned_officer_id`, `review_notes`, `polling_window_days`, `min_couples_required`, `response_deadline`, `include_in_next_survey`
  - **`polling_closed` is informational, not auto-actioning.** It means "the response window expired" and shows a per-couple yes/no/maybe breakdown. The officer reads it and clicks Confirm or Decline; nothing leaves the portal until they do.
  - outcome: `confirmed_at`, `confirmed_by_id`, `calendar_event_id` (FK → calendar_events)
- **private_lesson_requests**: same shape as performance_requests with `contact_id`, minus `audience_size`, plus `group_size`, `dance_type`, `experience_level`, `preferred_dates`, `price_quoted`, `assigned_instructor_ids[]`.
- **general_inquiries**: `contact_id`, intake fields, `auto_reply_sent_at`, `needs_human`, `assigned_to_id`.
- **survey_runs**: `run_at`, `run_type` (`weekly_auto` / `manual`), `triggered_by_id`, `performance_request_ids[]`, `private_lesson_request_ids[]`, `member_count`, `response_count`, `response_deadline`, `notes`.
- **survey_responses**: `survey_run_id`, `member_id`, `target_type` (`performance` / `private_lesson`), `target_id`, `available` (`yes` / `no` / `maybe`), `notes`, `responded_at`. Unique on (survey_run_id, member_id, target_type, target_id).

### 6.4 Email composer + threads

- **email_threads**: `contact_id` (FK), `subject`, `role_alias` (the team-side participating alias, e.g., `performance@`), `related_type` (`performance_request` / `private_lesson_request` / `general_inquiry` / null), `related_id` (nullable), `last_message_at`, `last_message_direction` (`inbound` / `outbound`), `unread_for_role` (bool).
- **email_messages**: `thread_id` (FK), `direction` (`inbound` / `outbound`), `from_address`, `to_addresses[]`, `cc_addresses[]`, `bcc_addresses[]` (records the Outlook BCC for outbound), `subject`, `body_html`, `body_text`, `message_id_header` (RFC Message-ID for thread matching), `in_reply_to_header`, `resend_id` (nullable, for outbound), `sent_by_id` (nullable user_id for outbound), `received_at` / `sent_at`, `template_slot` (nullable, which template was used), `attachments_json`.
- **email_templates**: `slot` (enum: `perf_request_received`, `perf_confirmation`, `perf_decline`, `private_lesson_received`, `private_lesson_quote`, `private_lesson_decline`, `general_inquiry_ack`, `survey_invitation`, `weekly_digest`, `staleness_alert`, `magic_link_signin`, etc.), `variant` (`default` / `warm` / `formal`), `subject_template`, `body_template` (Handlebars with `{{contact.name}}`, `{{request.event_date}}`, etc.), `is_active`, `updated_by_id`, `updated_at`. Officers pick the active variant per slot in Settings.

### 6.5 Member-facing resources, moves, alumni

- **resources**: `title`, `description`, `category` (`Constitution` / `Choreography` / `Contracts` / `Historical` / `Sponsor Decks` / `Other`), `file_url` (Supabase Storage), `file_type`, `visibility` (`members_only` / `members_and_alumni` / `officers_only`), `uploaded_by_id`, `uploaded_at`. The current constitution is just one row with `category = Constitution`; older versions stay in the same table with version notes in the title.
- **moves**: `name`, `aliases[]`, `category`, `difficulty`, `description_markdown` (incorporates step-by-step, safety notes, partner requirements), `originated_by`, `originated_year`, `video_links[]` (YouTube URLs — typically private/unlisted on the team channel), `status` (`draft` / `published` / `archived`), `display_order`, `created_by_id`, `updated_by_id`. **No `public_safe` toggle and no separate video/contribution tables in v1** — access to videos is governed by YouTube channel membership; alumni contributions happen offline.
- **alumni_profiles**: `member_id` (FK, nullable for pre-portal alumni who self-registered), `graduation_year`, `current_city`, `current_role`, `what_im_up_to`, `contact_permission` (enum: `visible_to_members_only` / `visible_to_alumni_too` / `private`), `email`, `phone` (opt-in), `status` (`draft_auto_created` / `active` / `unverified`), `verified_at`, `verified_by_id`. Auto-created as `draft_auto_created` when a member is moved to `graduated`; the alumnus completes it on next sign-in and the system marks it `active`.

### 6.6 Calendar

- **calendar_events**: `event_type` (`performance` / `public_lesson` / `private_lesson` / `tryout` / `team_event` / `rehearsal`), `title`, `description_markdown`, `location_name`, `location_address`, `start_at` (timestamptz), `end_at`, `all_day` (bool), `source_type` (`performance_request` / `public_lessons` / etc., nullable for ad-hoc), `source_id` (nullable), `color`, `is_public` (bool — eligible for public site display if true), `created_by_id`.
- **calendar_attendees**: `calendar_event_id`, `member_id`, `role` (`performer` / `instructor` / `optional` / `partner`), `rsvp_status` (`going` / `not_going` / `tentative` / `unset`).
- **ical_tokens**: `user_id`, `token` (random, signed), `created_at`, `revoked_at`. The personal iCal feed endpoint accepts a token and returns events for that user's `member_id`.

---

## 7. Public forms & lead capture

Four public forms. Each Vercel Function writes to Postgres and triggers the auto-reply.

| Form | Fields | What happens |
|---|---|---|
| **Performance request** | name, org, email, phone, event date, **start + end time**, **venue address (Google Places autocomplete + validation)**, audience size, performance type, notes, **urgency** flag (default Standard) | Resolves/creates `contacts` row. Inserts `performance_requests` row, status=`new`. Backend immediately calls Distance Matrix to compute `drive_time_minutes` and `drive_distance_miles` and store on the row. Resend auto-reply sent from `performance@` (BCC team Outlook), persisted as first message of an email_thread on the contact. PR officer notified in portal. |
| **Private lesson request** | name, email, phone, group size, preferred dates, dance type, experience, notes, urgency flag | Resolves/creates contact → inserts row → auto-reply via composer thread → lessons officer notified |
| **General contact** | name, email, phone (optional), subject, message | Resolves/creates contact → inserts `general_inquiries` → keyword-matched auto-reply (links matching FAQ entry if found, else generic) → `needs_human=TRUE` flag for officer follow-up |
| **Newsletter signup** | email | Adds to `newsletter_subscribers` table (still resolves to a contact if one exists by that email) |

Spam: Cloudflare Turnstile + per-IP rate limit (Upstash).

---

## 8. Operations & automation (inside the portal)

### 8.1 Performance request lifecycle

Review gate → batched weekly survey → response window closes → **officer manual confirm/decline via in-portal composer**. The portal is the entire stage; no Gmail drafts, no auto-confirmation.

```
PHASE A: Intake & officer review
[Form submitted with venue from Places autocomplete]
   → backend resolves/creates contact by requester_email
   → calls Distance Matrix: origin=building, dest=venue
   → drive_time_minutes, drive_distance_miles persisted on the row
   → performance_requests row inserted with contact_id, status=new
   → templated auto-reply ("we got your request") sent via Resend
     from performance@ to requester, BCC team Outlook mailbox,
     persisted as the first message of an email_thread bound to the contact
[PR officer review tab]:
   - Decline → Compose decline button → composer opens prefilled
     from perf_decline template → officer edits → Send
     → status=declined
   - Need info → Compose follow-up button → prefilled template → Send
     → keep status=under_review
   - Approve to poll → status=ready_to_poll
        with overridable:
          polling_window_days, min_couples_required (default 3),
          response_deadline_days (default 3, per-request overrideable),
          include_in_next_survey,
          drive_time_minutes, call_time_minutes_before, return_buffer_minutes

PHASE B: Inclusion rules (run at each survey send)
A request goes in a survey for a member IFF:
  1. status ∈ {ready_to_poll, polling}
  2. include_in_next_survey = TRUE
  3. event_date is within polling_window_days from now
  4. that member has no survey_response for this target yet

PHASE C: Survey delivery
[Vercel cron Sunday 18:00 CT, configurable via site_settings]
   OR
[Officer clicks "Send survey now"]
   IFF auto_send_weekly_survey = TRUE (officer can disable)
   → compute per-member item lists
   → create survey_runs row with response_deadline = now + response_deadline_days
   → send ONE consolidated email per member via Resend with a
     signed-token link to their RSVP page (no login required)
   → each survey item shows the REAL availability window:
       "Wedding · Sat May 23 · Brenham, TX · 1h 15m drive
        You'd need to be available roughly 4:45 PM to 10:45 PM."
   → also exposes the same survey inside the portal for logged-in members
   → status flips ready_to_poll → polling on first send

PHASE D: Response window closes (informational only)
[Daily cron checks response_deadline]
   When response_deadline has passed:
     → status flips to polling_closed
     → dashboard surfaces the request to PR officer with a per-couple
       yes/no/maybe breakdown:
         "Polling closed · 5 of 8 yes · 2 no · 1 no response · review needed"
   → NOTHING is sent. The officer is the only thing that triggers an email.

PHASE E: Officer manual decision
[PR officer reviews actual responses + any conflicts + other context]
   - Confirm → Compose confirmation button → in-portal composer opens
     prefilled from perf_confirmation template (substituting confirmed couples,
     call time, drive time, location) → officer edits → Send
     → status=confirmed
     → calendar_events row created with attendees = couples who said yes
   - Decline → Compose decline button → composer opens prefilled
     from perf_decline template → officer edits → Send
     → status=declined
   - Need to renegotiate → Compose follow-up → keeps status=polling_closed
     until officer reaches a decision
```

**Officer overrides:**

| Lever | Where | Use case |
|---|---|---|
| `polling_window_days` | per request | Big gig 60 days out: bump to 90. Small local in 4 weeks: leave default. |
| `min_couples_required` | per request | Big stage: 8. Small private: 3. Default 3. |
| `response_deadline_days` | global default + per request | Default 3 days. Quick-answer requests: shorten to 24h. Sleepy summer survey: extend to 5 days. |
| `include_in_next_survey` | per request toggle | "Don't ask this Sunday, still negotiating with requester." |
| `auto_send_weekly_survey` | global | Flip OFF during breaks / finals. |
| `weekly_survey_day` / `time` | global | When the auto-send runs (default Sunday 18:00 CT). |
| Manual add | per request | Pull in something outside the window. |
| Urgency flag | per request | Surfaces visually in the inbox; no automated workflow branch. |

### 8.2 Private lesson request lifecycle

Same review gate, contact resolution, response window, and manual confirm/decline as performances. Audience for the survey is the instructor pool, not the whole team. Lessons officer can bypass the survey for low-friction asks (`include_in_next_survey = OFF`) and reach out directly via the in-portal composer.

### 8.3 General inquiry auto-reply

Templated auto-reply via Resend from the relevant role alias. Keyword match against active FAQ entries; if a confident match is found, the auto-reply links the FAQ. Otherwise a generic acknowledgement goes out and `needs_human = TRUE` flags it for officer follow-up. No AI in this path — straight keyword/lookup.

### 8.4 Staleness detection (daily cron)

- No `active` public lessons scheduled in next 7 days → ping lessons officer.
- Tryout cycle past date with no new `active` cycle → ping president.
- Performance request stuck in `under_review` >7 days → ping PR officer.
- Polling request past its `response_deadline` → ping PR officer to finalize.
- Sponsor logo or member headshot missing → ping webmaster.

Each alert appears as a banner in the relevant officer's dashboard and as an email if unresolved after 48 hours.

### 8.5 Drive-time computation

Triggered when a performance request is created (and re-triggerable on demand from the officer's review screen if the venue is edited).

```
inputs:  origin = "8827 Gauge Dr, College Station, TX"  (from site_settings)
         destination = venue_formatted_address (from Places autocomplete)
         depart_time = event_start - call_time_minutes_before  (for traffic estimate)

calls:   Google Distance Matrix API
returns: drive_time_minutes (with traffic), drive_distance_miles

stored on performance_requests row; not re-fetched per page render.
```

The derived availability window then drives:
- The text shown on each survey item ("you'd need to be free X to Y").
- The duration of the calendar event when the performance is confirmed.
- The Monday weekly digest entry for assigned members.

**Officer overrides per request** if the API got it wrong or special circumstances apply (chartered bus, overnight stay, early load-in):

| Field | Default | Override use case |
|---|---|---|
| `drive_time_minutes` | computed from API | Manual fix if API picks a weird route or there's a bus. |
| `call_time_minutes_before` | 60 | Big productions: 90–120. Pickup gigs: 30. |
| `return_buffer_minutes` | 15 | Overnight stays: set to 0 and add a separate return event. |

**Cost guardrails:** cache results per `(origin, place_id)` pair in Upstash for 30 days. Distance Matrix is ~$5 per 1,000 elements; even 200 requests/year is well under $1.

### 8.6 Email policy

**All external email lives inside the portal.** Two paths:

1. **Auto-sent (no human in the loop)** — Resend delivers immediately on a system event. Used for: form submission acknowledgments, magic-link sign-in, RSVP-link delivery, weekly Monday digest, staleness alerts to officers. All templated; nothing personal in the wording that warrants review.
2. **Officer-composed (always reviewed before send)** — Officer opens the in-portal composer from a request detail page or a contact profile. Template is selected; variables are substituted; officer edits freely; officer hits Send. Resend delivers from the role alias to the recipient and BCCs the team Outlook mailbox so a sent record lands in their normal inbox. The full message + thread is stored in Postgres and shown on the contact's profile forever.

**Inbound mail** is handled by per-mailbox forwarding rules (one rule per role alias) that POST the message to a portal webhook. The webhook matches to an existing thread (by `Message-ID` / `In-Reply-To` headers, then by sender email + recent subject), or creates a new thread on the relevant contact.

Templates are editable in the portal Settings tab. We ship with sensible defaults (one warm-casual variant and one formal variant per slot) and the team can revise wording without code changes. No AI generation — the templates are plain Handlebars-style variable substitution; the officer's edits are the personalization layer.

**Why in-portal instead of Gmail drafts:** the team is on Office 365, not Gmail; sending from `performance@` (with Outlook BCC) gives officers the sent record they expect without anchoring the system to a specific mail provider; and storing every message in Postgres is what makes the Contacts tab into institutional memory. The Gmail-draft-API approach in v4 would have lost both the cross-officer thread history and the contact-centric view.

---

## 9. Calendar (in-portal, with iCal export)

The calendar lives in Postgres and renders natively in the portal. Google Calendar / Microsoft Graph two-way integration is deferred to a later phase; v1 ships iCal feeds for external subscription.

**Source-of-truth event creation:**
- Confirmed performances → `calendar_events` row with start/end derived from the availability window, location from venue, attendees = couples who said Yes.
- Public lesson sessions where `visible_to_public = TRUE` → events with instructor attendees.
- Private lessons confirmed → events with assigned instructor(s).
- Tryout cycle dates → events (no attendees).
- Ad-hoc team events created by any officer (rehearsals, socials, meetings).

**Portal calendar view:** month / week / day / agenda views (FullCalendar or similar), filterable by event type, "show only my events" toggle, color-coded by type. RSVP buttons inline on events that need attendance.

**Per-member personalized iCal feed:**
- Each member's dashboard shows a "Subscribe to my schedule" URL.
- The URL is a signed token endpoint (`/api/ical/[token].ics`) that returns an `.ics` feed of only the events that member is assigned to.
- They subscribe once in Apple Calendar / Google Calendar / Outlook and stay in sync forever; updates flow on every cache TTL refresh.
- Token rotation supported from Settings if a feed leaks.

**Weekly digest email (default Monday 08:00 CT, configurable):**
- For each `current` member: gather their assigned events for the next 7 days from `calendar_events`.
- Send a single Resend email: "Here's where you're expected this week — Sat 5/16 wedding in Brenham (3 PM call), Wed 5/20 CW1 class at the building (5:15 PM call)…"
- Members can opt out per-account.

**Deferred to a later phase — two-way sync:**
- Microsoft Graph integration for Outlook calendar write-back (officers see assigned events in their team Outlook calendar without an iCal subscription).
- Google Calendar service-account writes for members who prefer Google.
- Justification for deferral: iCal feeds cover the read use case; the only thing two-way buys is "RSVP from your phone calendar app instead of opening the portal," which is nice-to-have, not core. We can layer it on without schema changes.

---

## 10. SEO migration plan

- [ ] Crawl current site (Screaming Frog / `wget --mirror`) → export every URL, title, meta description, H1.
- [ ] Map every legacy URL 1:1 to a new URL; 301 in `next.config.js` redirects for any deltas.
- [ ] Preserve `<title>`, meta description, primary H1 at launch; iterate after.
- [ ] Generate `sitemap.xml` and `robots.txt` at build.
- [ ] JSON-LD: `Organization`, `Event` (tryouts/lessons), `VideoObject` (videos), `FAQPage`.
- [ ] OG / Twitter cards per page (auto-generated via `@vercel/og`).
- [ ] Verify in Google Search Console before DNS flip; re-submit sitemap after.
- [ ] Monitor Search Console for 404s for 30 days post-launch.

---

## 11. Design system

**Color palette:**
- `--aw-maroon`: `#500000` (primary)
- `--aw-maroon-dark`: `#3D0000` (hovers, accents)
- `--aw-white`: `#FFFFFF`
- `--aw-cream`: `#F8F4EC` (warm off-white sections)
- `--aw-charcoal`: `#1A1A1A` (body text)
- `--aw-gold-accent`: `#C8A951` (very sparing)

**Typography:**
- Headlines: serif/slab (e.g., Playfair Display or Roboto Slab).
- Body: Inter / Source Sans 3.
- Tagline: small caps treatment of headline font.

**Imagery rules:** real performance and lesson photos, never stock cowboy clichés. Video > static on the homepage hero. Maroon dominant; cream/white for breathing room; gold as garnish.

**Brand-refresh-ready theming:** the v1 palette and typography above are a **placeholder** so the team has something coherent for launch. The brand refresh (new name and/or logo, refined palette, typography upgrade) is a separate workstream. The design system uses CSS variables / Tailwind theme tokens so the brand refresh later is a config change — no component-by-component rewrite.

**Portal styling:** same palette as the public site, more whitespace, denser data tables. shadcn/ui components themed via the same tokens. The portal feels like a serious internal tool, not a recolored Bootstrap admin.

---

## 12. AI usage

**Deliberately none in the system itself.** All outbound emails are templated. All inquiry triage is keyword-based against FAQ entries. The portal has no Claude/OpenAI API key.

**Why:** predictability, zero ongoing API spend, no risk of a tone-deaf AI-drafted email going to a paying client, and one fewer vendor dependency for future officer slates to manage.

**External AI use is encouraged for content marketing** — anyone on the team can paste rough notes into ChatGPT/Claude to draft an Instagram caption, polish a member bio, or write a performance recap. Three prompt templates kept in the team's Drive cover the common cases. None of this touches the production system.

If we later decide we *want* AI-generated email drafts (e.g., for non-standard responses), we can add a single "✨ Draft with AI" button on a draft screen that overrides the template path. Easy to add later, hard to take away once shipped — so we ship without it.

---

## 13. Build phases & timeline

~6–8 weeks of focused work; **single launch day** (public site + portal cut over together). Phases below are sequencing for the build, not incremental ship dates.

### Phase 0 — Foundation (3–4 days)
- Repo + Next.js scaffold + Tailwind + shadcn/ui + Drizzle + theme-token system.
- Supabase project: Postgres schema, Auth providers (magic link + Microsoft Entra + Google OAuth), Storage buckets.
- Resend domain verification on the team-owned sending domain (DKIM/SPF/DMARC).
- Vercel project with both domains attached.
- Bootstrap officer whitelist; first-login pending-approval flow.
- CI: Vercel previews per PR with Supabase branches.

### Phase 1 — Public site shell + design system (4–5 days)
- Tailwind theme tokens, typography, component library (placeholder brand, refresh-ready).
- All legacy URLs in place with hardcoded content.
- Greenfield image migration from current Wix site → Supabase Storage; "needs rephoto" flag list handed off.
- Lighthouse target: 95+ across the board.

### Phase 2 — Portal foundation + Contacts + Members (5–6 days)
- Auth-gated layout, role-aware navigation, sign-in screen with all three providers.
- Dashboard skeleton.
- **Members CRUD** with photo uploads to Supabase Storage; phone field collected from day one for future SMS.
- **Contacts entity** end-to-end: auto-create-on-form-submit, manual create, profile view, search, merge, notes, tags, follow-up date. (Email thread history attaches in Phase 4.)
- Site Content CMS tab covering site_settings, FAQ, sponsors, announcements, banquet content.
- Public site reads from DB; on-demand revalidate via webhook from portal saves.

### Phase 3 — Public forms + auto-replies (2 days)
- Four forms (performance, private lesson, contact, newsletter) writing to DB and resolving/creating contacts.
- Resend auto-replies sent from the role aliases; persisted as first message of an email_thread on the contact.
- Officer notifications in portal.

### Phase 4 — Email composer + thread store + Performance management + weekly survey + drive-time (8–10 days)

This is the longest phase because the in-portal composer is foundational for everything downstream (declines, confirmations, follow-ups, private lesson quotes) and the contact/thread storage is what makes the Contacts tab earn its keep.

- **Email composer + thread storage:**
  - `email_threads` / `email_messages` schema + RLS.
  - Resend outbound from role aliases (`performance@`, `lessons@`, `bookings@`) with team Outlook BCC.
  - Per-mailbox inbound forwarding rules → webhook → match-to-thread / new-thread logic.
  - Template selection + variable substitution UI; officer free-edit; Send.
- **Performance Management tab end-to-end:**
  - Review gate, status transitions, per-request overrides.
  - Google Places autocomplete on intake form + Distance Matrix call to compute drive time + officer overrides.
  - Email templates table + admin UI to edit them.
  - Weekly Vercel cron at Sunday 18:00 CT (configurable) computes inclusion, sends consolidated survey emails.
  - Member RSVP page (token-based, also accessible logged-in) showing real availability windows.
  - **Response window closes** → request surfaces on PR officer dashboard with response breakdown.
  - **Manual confirm / decline buttons** → open in-portal composer prefilled from template → officer edits → Send.
  - Confirmed performances create `calendar_events` rows with attendees.

### Phase 5 — Lessons management + scheduling (4–5 days)
- Public sessions: schedule semester ahead, visibility toggle, `publish_at`.
- Private lesson workflow (review → optional survey → assignment → quote via in-portal composer).
- Instructor pool management.
- Confirmed lessons create `calendar_events` rows.

### Phase 6 — Calendar (in-portal) + iCal feeds + weekly digest (3–4 days)
- In-portal calendar view (FullCalendar or similar) sourced from `calendar_events`.
- Per-member signed iCal feed at `/api/ical/[token].ics`.
- Monday 08:00 CT (configurable) weekly digest cron via Resend.
- **Note:** Microsoft Graph / Google Calendar two-way sync is **NOT in this phase**; it's a deferred later phase.

### Phase 7 — Resources, Move Library, Alumni (3–4 days)
- Resources tab: file uploads to Supabase Storage, categories, visibility rules. Constitution PDF lands here.
- **Move Library (scoped):** moves CRUD with YouTube link list, filters/search. Officers edit directly. **No alumni contribution queue, no public-safe per-move toggle, no in-portal video uploads** — videos live on the team's private YouTube channel(s); access governed by YouTube channel membership.
- Alumni directory: graduation flow auto-creates draft alumni_profiles, self-registration path for pre-portal alumni, president (or designate) approval queue.

### Phase 8 — `/watch` + homepage polish (1–2 days)
- Three video subsections from DB.
- Music Videos seeded with Midland / Randy Rogers / Ella Langley.
- 4-CTA hero, featured video, announcement banner.

### Phase 9 — SEO migration + launch (2–3 days)
- Redirects (every legacy URL → new equivalent), sitemap, structured data, OG images.
- Stage on `staging.aggiewranglers.com` for officer review.
- **Single-day cutover:** public site + portal both go live; Wix DNS flipped, Search Console verified.

### Phase 10 — Officer handoff (2 days)
- Loom recordings per officer role.
- Printable cheat sheets.
- Documented re-consent / token-rotation process for officer transitions.

### Deferred to "v1.1" (planned, not in launch)
- **SMS via Twilio** — day-of reminders, RSVP last-call. Schema and opt-in collection are in v1.
- **Microsoft Graph two-way calendar sync** — write events into officers' Outlook calendars and reflect inbound RSVP changes.
- **Microsoft Graph mail polling** to replace per-mailbox forwarding rules with native inbox sync.
- **Stripe payments** — when next pricing change happens; until then Flywire stays.
- **Embedded merch gallery** — currently link-out only.
- **Move Library video upload + alumni contribution queue** — if YouTube-channel model proves insufficient.

**Total: ~6–8 weeks** of focused work. Phases 2, 4 are critical path; everything else can be parallelized once the schema is locked.

---

## 14. Costs

For AW's actual scale, **everything except the domain runs free**.

Rough usage we're sizing for:
- ~500–2,000 public site visitors/month
- ~35 active portal users (members + officers + occasional alumni logins)
- ~20–50 form submissions/month
- ~300 outbound emails/month (surveys + digests + auto-replies)
- <100 MB DB + ~200 MB file storage (mostly member headshots)

| Service | Free tier limit | What we'll use | Cost |
|---|---|---|---|
| Vercel Hobby | 100 GB bandwidth, 100 GB-hr compute, 1M edge req/mo, 2 cron schedules | <5% of any of these | $0 |
| Supabase Free | 500 MB DB, 1 GB storage, 50K MAU, Auth (magic link + OAuth providers) + RLS included | <20% on every axis | $0 |
| Upstash Redis | 10K commands/day, 256 MB | <1K commands/day | $0 |
| Resend Free | 3,000 emails/mo, 100/day | ~400/mo (auto-replies + magic links + survey + digest + composer sends), ~50 peak/day | $0 |
| Microsoft Entra OAuth | Free with M365 tenant | — | $0 |
| Google OAuth | Free | — | $0 |
| Google Maps Platform | $200/mo free credit via Google Cloud | <$1 of usage | $0 |
| Cloudflare Turnstile | Free, unlimited | — | $0 |
| Domain renewal | — | ~$15/yr | ~$1.25/mo |
| **Total ongoing** | | | **~$1.25/mo** |

### Two gotchas worth naming

1. **Vercel Hobby is "non-commercial."** Student orgs that charge for lessons sit in a gray area; in practice Vercel doesn't enforce against legitimate club / non-profit use, but if they ever do, the upgrade is Pro at $20/mo.
2. **Vercel Hobby cron is limited** to 2 schedules at most daily. Two ways to stay on Hobby:
   - Consolidate into a single daily cron that branches on `weekday` inside the function (handles weekly survey, weekly digest, and daily staleness checks all from one entry point).
   - Use Upstash QStash as an external scheduler for any cadence — free tier covers our needs.

### Where this could become non-free later

- Supabase project pauses after 1 week of total inactivity on Free; trivially solved by any real traffic, but worth a uptime ping if we go quiet.
- Member photos and uploaded resources blow past Supabase's 1 GB storage if the team uploads HD videos directly instead of using YouTube unlisted links. We default to unlisted YouTube for move videos for exactly this reason.
- If Resend's daily 100-email cap ever bites (e.g., we send to a much larger alumni list one day), it's $20/mo for 50K monthly.

None of these are likely within the first year+. The plan is **free + $15/yr domain**.

---

## 15. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Scope creep — single launch makes everything blocking | Strict feature freeze before Phase 9; anything that surfaces late goes to v1.1 list, not the launch list. |
| Maintenance burden across officer transitions | Yearly handoff docs; admin role transferred at officer turnover; clear "you can disable the portal and still run a public site" exit. |
| SEO drop during migration | 1:1 redirect map; preserve titles/H1s; stage and verify in Search Console. |
| Bad DB migration breaks portal *and* site | Migrations gated on staging; preview deploys use branched DB; Supabase nightly backups (free tier: 7-day point-in-time). |
| Inbound mail forwarding fragile | Per-mailbox forwarding rules are simple but break if an officer changes their Outlook settings. Mitigation: documented setup, monitoring dashboard for unmatched inbound, plan to replace with Graph polling in v1.1. |
| Auth provider issue locks officers out | Three providers (magic link + Entra + Google) — magic link is the always-works fallback if one provider misconfigures. |
| Form spam | Turnstile + honeypot + rate limit. |
| Photo/video rights | Audit during Phase 1 image migration; flag anything not clearly team-owned. |
| Survey email fatigue | Once/week max, opt-out per member, no per-request blasts. |
| Manual confirmation bottleneck (officer doesn't decide quickly) | Dashboard surfaces `polling_closed` requests prominently; staleness cron pings PR officer after 24h of inaction; deadlines visible. |
| Brand-refresh churn after launch | Theme tokens isolate the design system; refreshing colors/type/logo is a config change, not a rebuild. |
| Vendor lock-in | Standard Postgres + standard Next.js + portable email (Resend → any SMTP). Yearly DB export to Drive for paranoid backup. |
| Team abandons updating again | Daily staleness cron pings the right officer proactively; "publish on date X" feature lets officers batch work. |

---

## 16. Open questions for the team

Most of the v4 questions are resolved by the v5 clarifications. What's still open:

1. **Officer point person & admin successor.** Who owns the system on launch day, and who inherits admin if they graduate? Build maintainer holds it until handoff; we need a named president (or designated officer) to receive admin.
2. **Team communication channel.** GroupMe / iMessage / Discord? Not architectural — but the team needs a place where "I just sent the weekly survey, please respond" lands. Affects the digest copy and the staleness alert wording.
3. **Bootstrap officer whitelist.** Exact email addresses of the current officer slate (president, PR, lessons, webmaster, etc.) so they sign in immediately without manual approval. Needed at Phase 0 / launch.
4. **Sending domain.** Do we authenticate Resend on `wranglers.tamu.edu` (TAMU-controlled — may need IT approval for DKIM/SPF/DMARC records) or buy/use a separate team-owned domain (e.g., `aggiewranglers.com` itself, or `mail.aggiewranglers.com`) for sending? The latter is faster; the former feels more official.
5. **Role aliases.** Confirmed list of sending aliases: `performance@`, `lessons@`, `bookings@`? Or do confirmations come from `president@`? Affects email composer setup and recipient perception.
6. **Outlook BCC mailbox(es).** A single team `team-archive@` mailbox that receives every BCC, or BCC the specific officer's individual mailbox? Single mailbox is simpler and survives officer turnover.
7. **Inbound forwarding setup.** Each role alias needs a forwarding rule into the portal — does the team have an Office 365 admin who can set those up, or do we configure forwarding per-mailbox manually with each officer at Phase 4?
8. **Flywire URL stability.** Same URL every semester (just toggle `active` on session rows) or new URL each semester? Affects officer workflow at Phase 5.
9. **YouTube channel access for Move Library.** Who administrates the team's private YouTube channel(s)? Officers grant alumni access how — by invitation through the channel UI, or via a managed Google Group? Determines what we tell alumni when they ask "how do I see the videos?"
10. **Photo/video rights audit.** Anything currently on the Wix site (or in legacy archives) we should NOT republish? Needs a quick review during Phase 1 image migration.
11. **Brand refresh timing.** Are we ok launching v1 on the placeholder theme, or do we want to delay launch until the brand work lands? (Recommended: launch on placeholder, swap in brand refresh after — it's a config change.)
12. **Twilio rollout (v1.1).** Once SMS is added later: opt-in default? What events trigger texts (day-of reminder only, or also "RSVP last call" 24h before deadline)?

---

## 17. What "done" looks like

**Public site:**
- [ ] All legacy URLs respond 200 with content matching or improving on the old site.
- [ ] Four primary CTAs visible above the fold on mobile.
- [ ] `/watch` shows Top Routines, Music Videos (Midland / Randy Rogers / Ella Langley seeded), and Behind the Scenes.
- [ ] Images migrated from Wix and served from Supabase Storage; "needs rephoto" list handed to social media officer.
- [ ] Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO on `/`.
- [ ] Search Console shows no new 404s after 14 days post-launch.

**Public forms:**
- [ ] All four forms write to DB, resolve/create contacts, fire auto-replies attached to a thread on the contact, and surface in the portal for the right officer.

**Team portal — auth & access:**
- [ ] Magic-link, Microsoft Entra, and Google OAuth all work; a user can link multiple providers to one account.
- [ ] Pending-approval queue works; bootstrap officer whitelist signs in immediately.

**Team portal — workflows:**
- [ ] **Contacts tab** shows every contact with full request + email + notes history. New officers can read previous officers' notes.
- [ ] **Email composer** sends from role aliases via Resend with team Outlook BCC; threads are persisted in Postgres and attached to contacts.
- [ ] Per-mailbox inbound forwarding rules deliver replies to the portal and they attach to the right thread.
- [ ] **Performance Management:** review gate works, weekly survey auto-sends Sunday 18:00 CT (configurable + disable-able), per-request overrides including response deadline work, **drive time auto-computed and shown to members in real availability windows**, response window closes with breakdown on dashboard, **manual confirm/decline via in-portal composer produces the only outbound email path**.
- [ ] **No automatic external emails exist** for confirmation/decline workflows — verified by reading the cron code.
- [ ] **Lessons Management:** a semester of public sessions can be scheduled in advance and published on a chosen date; private lesson workflow produces templated quote drafts via composer.
- [ ] Members CRUD with photo uploads; phone field captured; graduation flow auto-creates draft alumni profile.
- [ ] Site Content tab: officers can update homepage, FAQ, sponsors, videos, tryout cycle, banquet, merch link without code.
- [ ] Email templates are editable in Settings; default warm + formal variants ship with the system.
- [ ] Resources tab: constitution PDF + other team files uploadable with visibility controls.
- [ ] Move Library: at least 5 seed moves published with YouTube links; officers can edit directly.
- [ ] Alumni directory visible to authenticated members; self-registration flow approves through president (or designate).

**Calendar & comms:**
- [ ] In-portal calendar renders confirmed performances, scheduled lessons, tryouts, and ad-hoc events.
- [ ] Each member can subscribe to their personal iCal feed and see events in Apple/Google/Outlook within one sync cycle.
- [ ] Weekly digest email goes out Monday 08:00 CT (configurable) with personal upcoming events.

**Operations:**
- [ ] Daily staleness cron is live and has sent at least one nudge in testing.
- [ ] Officer handoff Loom videos delivered per role.
