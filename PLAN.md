# Aggie Wranglers Website Redesign Plan

> Replatform aggiewranglers.com off Wix into a unified system with two surfaces:
> a polished public site at **aggiewranglers.com** and an authenticated team portal at **team.aggiewranglers.com** that doubles as the CRUD app, ops console, and source of truth for everything the public site shows.

**Stack at a glance:** Next.js on **Vercel** · **Supabase** (Postgres + Auth + Storage) as the single source of truth · **Magic-link email + invite-link account setup** for portal sign-in (no SSO providers needed) · **Runtime-configurable permission matrix** (statuses × tabs → none/view/edit) · **Team-owned sending domain** (e.g., `aggiewranglers.com`) authenticated on **Resend** for outbound · **Cloudflare Email Routing** (free) forwards inbound at the team domain to existing TAMU Outlook role mailboxes; an `archive@` route captures officer-sent mail for CRM history · **Direct Google Calendar 2-way sync** for the team's existing calendar.

---

## 0. TL;DR — what's new in v6 (operational reality check)

v6 absorbs a round of clarifications from the team that reshape several big architectural calls. v5 over-engineered around A&M IT cooperation; v6 routes around it.

### Email architecture: domain-owned, Outlook-composed, BCC-archived
- **A&M IT involvement is no longer required for any of this.** We don't authenticate Resend on `wranglers.tamu.edu` — we authenticate on the **team-owned domain** (e.g., `aggiewranglers.com`) which the team controls directly.
- **Inbound mail uses Cloudflare Email Routing** (free, unlimited aliases). Replies to `performance@aggiewranglers.com` forward to the existing TAMU Outlook `performance@wranglers.tamu.edu` mailbox. **No new inboxes for officers to check.**
- **Outbound:** auto-replies (form acks, magic links, survey invites, weekly digests) sent via Resend from the team domain. Officer-composed emails are **drafted in their existing TAMU Outlook**, not in a portal composer — the portal generates `mailto:` links with prefilled subject/body for common reply types (confirmation, decline, follow-up).
- **CRM capture via auto-BCC:** each officer sets up a one-time Outlook rule to BCC `archive@aggiewranglers.com` on all sent mail. That archive route delivers messages to a portal webhook (via Cloudflare Worker or a free Gmail account polled via IMAP). The portal attaches each message to the right thread + contact. **We get full CRM history without API access to anyone's mailbox and without an in-portal composer.**
- The in-portal email composer from v5 is **removed**. Microsoft Entra SSO is **removed**. Threads are reconstructed from BCC'd messages alone.

### Permissions: runtime-configurable matrix
- v5 hardcoded "PR Officer owns Performance Management, Lessons Coordinator owns Lessons, etc." v6 makes this **configurable in Settings**.
- **Permission Statuses** (e.g., `president`, `vp`, `performance_officer`, `lessons_coordinator`, `secretary`, `member`, `alumni`, plus admin) are defined as data, not hardcoded.
- For each status × each tab, the access level is one of: `none` / `view` / `edit`.
- **Multiple users can hold the same status** (useful during officer turnover — outgoing and incoming PR officer both have access during transition).
- A user can hold multiple statuses (the VP is also typically an officer of something).
- Defaults ship with sensible matrix; team reconfigures in Settings as needed across years.
- **Default starting permissions:** all team members get view access to most tabs + edit access to the resources / move library; alumni get view access to the alumni directory only.

### Calendar: real Google Calendar 2-way sync
- v5 had an in-portal calendar with iCal export only; Graph/Google sync deferred. v6 **integrates directly with the team's existing Google Calendar** as source of truth.
- Add an event in the portal → writes to Google Calendar via API.
- Edit in Google Calendar → portal reflects via push webhook.
- Recurring events (practices, officer meetings) supported natively (RRULE rules on Calendar).
- One-time events (workshops, retreats, banquets) supported.
- **Calendar ownership transfers with president handover** — same calendar, same events, new owner.

### Webmaster tab: CMS layer for public site content
- Most public-page wording, profiles, video lists, sponsor info pulls from Postgres. The portal has a **Webmaster tab** that's the CRUD frontend for that content.
- Trade-off acknowledged: lose Wix's easy drag-edit of page *structure*; gain stable, code-managed structure + a content layer the team can edit without touching code.
- **Dynamic layouts** for places where content count varies (the current-team profile grid auto-expands when you add a new member; the video gallery reorders when you reorder rows in the portal).
- Webmaster is a **tab, not a title.** The PR officer historically does this work but anyone with the right permission status can edit content.

### Public availability survey: Wednesdays, combined performance + lessons
- Default flips from Sunday 6 PM to **Wednesday 6 PM CT** (configurable, disable-able).
- **Performance availability + private-lesson instructor availability merged into ONE weekly email** per member — no longer two separate surveys.
- Adjudication happens Friday-Sunday so the Monday morning digest reflects confirmed assignments.

### Performance request form: adds a donation interest field
- New field: **"Would you be willing to give a donation when we perform?"** with options $250 / $500 / $750 / $1,000 / Other / Not at this time.
- **Donations are NOT processed by the portal** (SOFC doesn't process donations). The portal captures interest only.
- Officer can mark "donation received" / "declined" / "no response" after the gig for institutional memory. Actual collection happens through whatever channel the current team uses.

### Contact matching: org-level and person-level
- Contacts can be people OR organizations (e.g., a sorority that books the team every year — different chair each time, same org).
- Matching logic on new form submissions: any of (first+last name fuzzy match) OR organization OR phone OR email → suggest as duplicate; officer chooses merge or create-new.
- Adds `annual_reminders` so the team can flag "Houston Livestock Show — reach out every October" against an org contact.

### Statistics dashboard
- Per-member performance attendance percentage.
- Per-performance roster (who's confirmed, with one-click add/remove).
- Individual performance history per member.
- Confirmed performance rosters stay editable — drop-outs and additions are one click; affected members auto-notified.

### Out of v1 scope (moved to IDEAS.md backlog)
- **Social media management tab** (cross-posting, AI variant generation). Team can use Buffer or similar separately. Captured as a future iteration.
- **Online courses + Coaching service** — separate workstream from website/portal v1.
- **Payments / Stripe** — completely removed from v1. SOFC Marketplace handles future commerce.
- **SMS via Twilio** — still in v1.1+ backlog.
- **`/our-building`** — removed (the team no longer has that building). 301 redirect to homepage.

### What carries from v5 (still in the plan)
- Public site at `aggiewranglers.com`, four primary CTAs, preserved legacy URLs, `/watch` destination for videos.
- Authenticated team portal at `team.aggiewranglers.com`.
- Performance review gate → batched weekly survey → **officer manually confirms or declines** (no auto-send, ever).
- Drive-time-aware availability surveys (Google Maps Places + Distance Matrix).
- Move Library scoped to a metadata catalog with YouTube links; officers edit directly; no alumni contribution queue.
- Alumni profile auto-created on member's graduation.
- Resources library (constitution PDF, choreography notes, contracts, etc.).
- ~$15/yr total cost (just the domain).

---

## 0.5. TL;DR — what was new in v5

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
- `/our-building` — **no longer applicable in v6** (team no longer has that building); 301 redirect to `/`
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
   - Manage performance requests end-to-end (intake → review → batched Wednesday-evening availability survey → officer manual confirm/decline).
   - Manage lesson scheduling (public sessions for the semester, private lesson requests, instructor assignments). Lesson availability surveys merged into the same weekly email.
   - Maintain member roster (current, tryouts, graduated) with photos and phone-on-record for future SMS.
   - **Contacts (CRM)** entity (people + organizations) with full email + request + notes history across officer transitions. Email history populated by an auto-BCC archive flow — no in-portal composer required.
   - **Webmaster tab** that CRUDs everything the public site shows.
   - Sync to the team's existing **Google Calendar** (2-way); recurring events supported.
   - Provide member-facing resources (constitution, move library, alumni directory).
   - **Performance statistics dashboard** — per-member attendance %, per-performance roster (with one-click editing), individual performance history.
   - **Annual reminders** on contacts (year-over-year gigs).
3. **Preserve every existing URL** so SEO equity transfers. **Exception:** `/our-building` no longer applies; 301 redirect to `/`.
4. **Visually polished**, theme-token-driven so the deferred brand refresh is a config change.
5. **Email policy:** auto-replies sent immediately from a team-owned domain via Resend. Officer-composed emails happen in their existing TAMU Outlook (where they already work); the portal opens prefilled drafts via `mailto:` links and captures sent mail via an auto-BCC archive route on the team domain.
6. **Direct Google Calendar 2-way sync** for the team's existing calendar; ownership transfers cleanly between presidents.
7. **Runtime-configurable permissions** (statuses × tabs → none/view/edit) so the team can reshape access over time without code changes.
8. **Free to run** (~$15/yr domain — every other service stays on free tier for AW's volume; see §14) and durable across officer transitions.

### Non-goals

- Native app (the portal is a mobile-friendly PWA).
- E-commerce / merch fulfillment (keep pointing to external store).
- Replacing Flywire for public lesson payments.
- Migrating banquet RSVP infra unless the team wants it.
- Auto-sending non-trivial external emails. Confirmations, declines, quotes, and other client-facing emails are always composed and sent by an officer from their TAMU Outlook (the portal generates prefilled `mailto:` drafts). Auto-replies for form acknowledgments and magic-link sign-ins are the only no-human-in-the-loop sends.
- Hosting paid mailboxes on the team-owned domain. We use Cloudflare Email Routing to forward inbound at the team domain to existing TAMU Outlook accounts; no Google Workspace seats, no new inboxes for anyone to check.
- Replacing the team's existing Google Calendar. We integrate with whatever calendar they're already using.
- Processing payments inside the portal. SOFC Marketplace handles any future commerce; donations are tracked as interest only.
- A social media management tab in v1. Captured in IDEAS.md as a future iteration.
- Selling courses or coaching services. Captured in IDEAS.md as a separate workstream.
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
   │  - /performance-request    │         │  - Contacts (CRM, people + orgs)   │
   │  - /private-lesson-request │         │  - Members & roster                │
   │  - /requirements (tryouts) │         │  - Webmaster (site content CRUD)   │
   │  - /meet-the-team          │         │  - Team calendar (= Google Cal)    │
   │  - /watch (videos)         │         │  - Resources / Move Library        │
   │  - + every legacy URL      │         │  - Alumni directory                │
   │  - /our-building → /       │         │  - Meeting notes (Secretary tab)   │
   │                            │         │  - Long-term goals (President)     │
   │  Forms POST to /api/forms  │         │  - Performance stats dashboard     │
   │  Read from DB (revalidate  │         │  - Settings (permissions matrix)   │
   │    via webhook on write)   │         │                                    │
   │                            │         │  Auth: Supabase magic link +       │
   │                            │         │    invite-link account setup       │
   │                            │         │  Permissions: runtime matrix       │
   │                            │         │    (statuses × tabs → access lvl)  │
   └────────────────────────────┘         └──────────────┬─────────────────────┘
                                                         │
   ┌─────────────────────────────────────────────────────┴─────────────────────────────┐
   │                                                                                   │
   ▼                          ▼                     ▼                  ▼               ▼
┌──────────────┐  ┌────────────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐
│ Resend       │  │ Cloudflare Email   │  │ Google Calendar │  │ Google Maps  │  │ Vercel     │
│ (auto-reply, │  │ Routing (free)     │  │ API             │  │ (Places +    │  │ Cron       │
│  survey      │  │  · *@aggiewranglers│  │  2-way sync     │  │  Distance    │  │ (Wednesday │
│  emails,     │  │    .com → TAMU     │  │  with existing  │  │  Matrix →    │  │  surveys,  │
│  digests,    │  │    Outlook         │  │  team calendar  │  │  drive       │  │  Monday    │
│  magic       │  │  · archive@ →      │  │  (one-time      │  │  times)      │  │  digest,   │
│  links;      │  │    Worker → portal │  │  service-       │  │              │  │  staleness │
│  sends from  │  │    webhook (CRM    │  │  account auth)  │  │              │  │  checks)   │
│  team domain)│  │    ingest)         │  │                 │  │              │  │            │
└──────────────┘  └────────────────────┘  └─────────────────┘  └──────────────┘  └────────────┘
```

### Why this stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js (App Router)** | One app, two domains via middleware. Public pages render static/ISR; portal pages render dynamically with auth. Future maintainers (likely students) only learn one stack. |
| Hosting | **Vercel** | Hobby tier covers AW's scale. Free + GitHub-native deploys. |
| Database + Auth + Files | **Supabase** | One vendor for Postgres, auth (magic link), and file storage for headshots/logos/PDFs. RLS gives a defense-in-depth layer beneath the application permission matrix. |
| Auth | **Supabase Auth — magic link only**, with officer-issued invite links | Officers create new member/alumni profiles from the portal; system sends an invite link with one-time setup. After setup, users sign in via magic-link to their email on file or a password they set. No SSO providers — keeps the system independent of A&M IT and Microsoft tenancy. |
| Permissions | **Runtime-configurable matrix in Settings** | Statuses (president, vp, performance_officer, lessons_coordinator, secretary, member, alumni, admin) × tabs → none/view/edit. Multiple users can hold same status; users can hold multiple statuses. Reconfigurable without code changes. RLS enforces at the DB layer. |
| ORM | **Drizzle** | Lean for serverless; great Postgres support; portable SQL. |
| UI | **shadcn/ui + Tailwind** | Token-driven theming so the brand refresh later is a config change. Looks like a serious product, not an admin panel. |
| Cache / KV | **Upstash Redis** | Rate limits, survey response idempotency, Distance Matrix cache. |
| Email — outbound | **Resend** (authenticated on team-owned domain) | All outbound email goes through Resend from `*@aggiewranglers.com`: form auto-replies, magic-link sign-in, weekly survey invites, Monday digest. Officer-composed emails happen in TAMU Outlook (not in the portal) — the portal generates `mailto:` link drafts for common reply types. |
| Email — inbound forwarding | **Cloudflare Email Routing** (free) | Free, unlimited aliases. Routes `performance@aggiewranglers.com` → `performance@wranglers.tamu.edu` etc. so replies land in the officer's existing TAMU Outlook with no new inboxes to check. |
| Email — CRM archive | **Outlook auto-BCC rule → `archive@aggiewranglers.com` → Cloudflare Worker → portal webhook** | Each officer sets up a one-time BCC rule in their TAMU Outlook. Every sent message lands at the archive route, gets POSTed to the portal, attached to the right contact + thread. Provides CRM history without an in-portal composer or any API access to anyone's mailbox. |
| Calendar | **Google Calendar API — 2-way sync with the team's existing calendar** | Service account on a Google Cloud project (one-time setup, no A&M involvement) gets shared write access to the team's calendar. Portal writes confirmed performances/lessons/tryouts as events; webhook subscription reflects external edits back into the portal. Calendar ownership transfers to the next president on handover — same calendar, new admin. |
| Maps / drive time | **Google Maps Platform** (Places + Distance Matrix) | Address autocomplete on the performance form; compute real drive time from the practice location to the venue. Officer can override per request. |
| Background jobs | **Vercel Cron** (consolidated daily entry point) | One daily cron branches by weekday: Wednesday → send combined performance + private-lesson availability survey; Monday → send weekly digest; daily → response-deadline + staleness checks. Fits Hobby tier's 2-cron limit. |
| SMS (planned) | **Twilio** — not v1, but reserve schema | Phone numbers collected on member + contact records from day one so day-of reminder texts and RSVP nudges are unblocked when we add Twilio. |
| Analytics | **Vercel Web Analytics** | Privacy-friendly, no cookie banner needed. |
| Domains | `aggiewranglers.com` apex + `team.aggiewranglers.com` subdomain + `*@aggiewranglers.com` email aliases | All on the team-owned domain. Both web subdomains point to the same Vercel project; middleware routes by host. Cloudflare provides DNS (free) and Email Routing. |

### Database choice: settled on Supabase

Supabase covers Postgres, auth, and file storage in a single free-tier vendor. Officers who want a raw-table editor can use the Supabase dashboard directly; the portal is the easy CRUD UI for everything else. Free-tier limits (500 MB DB, 1 GB storage, 50K MAU) sit at >5× AW's projected v1 usage, so we won't outgrow it within the first year+.

---

## 4. The team portal (`team.aggiewranglers.com`)

The portal is structured as the tabs below. **Access to each is governed by the runtime permission matrix** (§4.2) — there are no hardcoded role-to-tab mappings in code. Anyone signed in sees a personalized Dashboard; the rest depends on what statuses they hold.

### 4.1 Tabs & features

**1. Dashboard**
- "Where you're expected this week" — next 7 days of the user's assigned calendar events.
- Open surveys awaiting their response.
- Action items keyed to the user's statuses (e.g., for a performance officer: "3 requests past their response deadline waiting for your decision").
- **Annual-reminder pings** (e.g., "Houston Livestock Show — last booked Oct 2025, want to reach out?").
- System banners (staleness alerts targeted to the relevant role).

**2. Performance Management**
- Inbox: all `performance_requests` with status filters and prominent visual badge on `urgency = quick_answer` rows.
- Per-request detail page: review notes, urgency flag, **donation interest** ($250 / $500 / $750 / $1,000 / Other / Not at this time), contact link (jumps to the requester's contact profile and full history), poll history, survey response breakdown, full email history.
- Workflow buttons:
  - **Approve to poll** (set polling window + min couples + response deadline + survey inclusion)
  - **Decline** (opens TAMU Outlook via `mailto:` with the decline template prefilled)
  - **Send survey now** / **Add to next weekly survey**
  - **Compose confirmation** / **Compose decline** / **Compose follow-up** (each opens TAMU Outlook with a prefilled draft from the relevant template — officer reviews, edits, sends from Outlook; auto-BCC archive captures it for the CRM record)
- **Confirmed performances stay editable.** Add/remove members from the lineup with one click; added members get a notification "you're on for X," removed members get "you've been taken off X."
- **Donation tracking** (informational only — portal doesn't process payments): officer can mark donation status after the gig as Received / Declined / No response / Pending.
- **No auto-send anywhere.** Threshold-met is an informational status badge; nothing leaves the system until the officer drafts in Outlook and clicks send.
- Settings sub-tab: `weekly_survey_day`/`time` (default **Wednesday 6 PM CT**), `auto_send_weekly_survey` on/off, `default_polling_window_days`, `default_min_couples_required` (default **3**), `default_response_deadline_days` (default **3**), default `call_time_minutes_before` (60), default `return_buffer_minutes` (15).

**3. Lessons Management**
- **Public sessions:** schedule a semester of sessions at once. Each session has `visible_to_public` toggle (default OFF) and optional `publish_at` date.
- **Private lesson requests:** same shape as Performance Management (review gate → optional inclusion in the weekly combined availability survey → assign instructors → manual confirm via TAMU Outlook draft).
- **Instructor pool:** which members are eligible to teach which class types. Drives inclusion in the combined Wednesday survey.

**4. Contacts (CRM)**
- **Two contact types: people and organizations.** A sorority that books the team annually is an organization-contact with a rotating "current contact person" field; individuals are person-contacts; both link to requests independently.
- Auto-created from every form submission (performance, private lesson, general inquiry, newsletter); manually creatable by any officer.
- **Matching logic on intake:** if any of (fuzzy first+last name) OR organization OR phone OR email matches an existing contact, the officer is prompted with "looks like this might be [X] — merge, attach to org, or create new." Officer chooses.
- Contact profile shows:
  - Identity: name (or org name), email, phone, address, social links, contact-permission preferences.
  - **All past requests** (performance + private lesson + general inquiry) with status, outcome, dates.
  - **Full email history** — every message sent to or received from this contact, threaded chronologically, with which officer sent it. Populated by the auto-BCC archive flow (§8.6), not by an in-portal composer.
  - **Officer notes** (markdown) that survive officer transitions.
  - **Annual reminders** — e.g., "remind in October every year" for a recurring gig. Surfaces on the relevant officer's dashboard 4–6 weeks before the reminder date.
  - Tags (lightweight free-text), one-off follow-up date.
- Search across name, organization, email, phone, notes, request notes.
- Merge tool for de-duplicating contacts.

**5. Members**
- CRUD on member records: name, role title, class year, hometown, major, headshot, partner photo, partner link, bio, **TAMU email**, **personal email**, **phone (private, opt-in for future SMS)**, status (`current` / `tryout` / `graduated` / `inactive`).
- Drag-drop photo uploads to Supabase Storage.
- **Account creation flow:** officer creates the profile from this tab → portal sends an invite email with a setup link → user sets a password or uses magic-link going forward.
- Personal email field on every profile. **On graduation, system flips primary email from TAMU to personal** (TAMU expires).
- Officer transitions: bulk status updates at year-end.
- **Graduation flow:** marking a member `graduated` auto-creates a draft `alumni_profiles` row linked by `member_id`; the alumnus completes it on their next sign-in.

**6. Webmaster (Site Content CRUD)**
- **The CMS layer for the public site.** Most page wording, profiles, video listings, sponsor info, and FAQ entries pull from Postgres. This tab is the CRUD frontend.
- Edit homepage announcement, taglines, contact info, history-page wording, etc.
- Manage member profile cards (the public `/meet-the-team` grid auto-expands as profiles are added — dynamic layout, no per-profile dev change).
- Manage `/watch` videos: reorder, set category (Top Routines / Music Videos / BTS & Press), toggle `featured`.
- Manage sponsors: add/edit/order, upload logos.
- Manage FAQ: add/edit/order.
- Manage tryout cycle: dates, eligibility, signup URL, `active` toggle.
- Manage **Banquet** content (annual update — page stays live year-round at `/banquet`).
- Manage **Merchandise** external store link (link-out only).
- **Preview button:** opens public site in a new tab with draft content via cookie.
- **Trade-off:** page structure is code-managed (not click-edit like Wix) but the content layer is fully editable by the team without a developer. "Webmaster" is a tab, not a title — historically the PR officer has done this work, but anyone granted edit access in the permission matrix can use it.

**7. Team Calendar**
- **Backed by the team's existing Google Calendar via 2-way sync.** Portal renders a calendar UI (month / week / day / agenda) that reads from Google Calendar and writes back to it.
- Event types: confirmed performances, scheduled public lessons, confirmed private lessons, tryout cycle dates, **recurring practices, officer meetings**, retreats, workshops, ad-hoc team events.
- Member-specific "my events" filter.
- Adding an event in the portal writes to Google Calendar; editing in Google Calendar reflects back in the portal (push webhook from Google).
- **Recurring events** (weekly practices, biweekly officer meetings) supported natively via Google Calendar RRULE rules.
- Personal iCal export still available (for members who want only their assigned events on their phone calendar) — but most members will just subscribe to the team Google Calendar directly.
- Calendar ownership: stays with the team Google account that already owns it; transferred to next president on handover via Google's calendar ownership transfer flow.

**8. Resources** *(default: every team member has view + edit access; alumni get view-only on `members_and_alumni`-tagged files)*
- Library of team files: **constitution PDF**, choreography notes, contracts/templates, historical photos by year, music library catalog (links), important contact lists, sponsor decks, etc.
- Each file: title, description, category, uploaded_by, uploaded_at, visibility tag (`members_only` / `members_and_alumni` / `officers_only`).
- Drag-drop upload to Supabase Storage; previews for PDFs and images.

**9. Move Library** *(default: every team member has view + edit access; officers can publish/archive)*
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

**10. Alumni Directory** *(default: every team member + alumni has view access; admin / approver-status edits)*
- Searchable by graduation year, hometown, current city.
- Stores current contact info (email, optional phone, current address or city) for every alumnus on record.
- Each alumnus controls their own opt-in/opt-out and contact permissions.
- Self-service registration for alumni who graduated before the portal existed (no `members` row to link to); approver-status user approves.

**11. Meeting Notes** *(default: Secretary edits, all officers view, members view)*
- Lightweight tab for team meeting notes — date, attendees (linked to members), agenda, decisions, action items.
- Action items can have assignees (linked to members) and a due date that surfaces on the assignee's dashboard.
- Searchable across past meetings.

**12. Long-Term Goals** *(default: President + VP edit, all officers view)*
- A tab where the president captures multi-year goals, strategic priorities, things to revisit next semester / next year.
- Survives officer transition — next president inherits the doc and edits forward.
- Free-form structured doc; no rigid schema.

**13. Performance Statistics Dashboard** *(default: all team members view; officers see additional drill-downs)*
- Per-member performance attendance percentage (e.g., "made 17 of 23 confirmed performances this year — 74%").
- Per-performance roster view: who's confirmed for each upcoming performance, with one-click add/remove for officers.
- Individual performance history per member: every performance they've been part of, ordered chronologically.
- Team-wide stats: confirmed performances per month, total drive hours, drop-out rate, response rate on surveys.
- Sensitive views (drop-out rate per member) restricted to officers by default.

**14. Surveys** *(default: all members view their own; officers view all responses)*
- Member-facing view of any open availability survey (also delivered by email Wednesday evening).
- Combined performance + private-lesson availability in one form.
- Past responses visible (member's own history; officers see everyone).

**15. Settings** *(default: President + admin edit; other statuses scoped subsets)*
- **Permissions matrix** (the big one — see §4.2). Grid editor: rows = statuses, columns = tabs, cells = none / view / edit dropdowns. Plus a CRUD for the list of statuses themselves.
- **Email config:** Resend domain verification status, role alias list, signature defaults per alias, archive-route configuration.
- **Calendar config:** linked Google Calendar ID + sync state, event color scheme.
- **Site config:** site name (placeholder until brand refresh), tagline, contact address, social links.
- **Ops defaults:** survey day/time (default Wed 6 PM CT), polling window, min couples, response deadline, digest day/time.
- **Webhooks / API keys:** admin only.

### 4.2 Permissions: runtime-configurable matrix

The v6 access model is **data, not code.** There are no hardcoded role-to-tab mappings in the portal. Instead, the Settings tab exposes a grid editor where the team configures who can do what — and it can be reconfigured over time as the team's structure changes.

**Concepts:**

- **Permission Status** — a named bucket of access (e.g., `president`, `vp`, `performance_officer`, `lessons_coordinator`, `secretary`, `member`, `alumni`, `admin`). Defined as data in a `permission_statuses` table. Team can add new statuses (e.g., `practice_captain`, `social_media_lead`) without code changes.
- **Tab** — a portal section. Statically declared in code (one row per tab in a `tabs` registry).
- **Permission** — a row joining `status_id × tab_key → access_level`. `access_level` is one of `none` / `view` / `edit`.
- **User-Status** — many-to-many link: a user can hold multiple statuses, and a status can be held by multiple users. **Critical for officer turnover** — both the outgoing and incoming PR officer can hold `performance_officer` status during a transition month.

**Effective access for a user on a tab:** highest access level across all of the user's statuses. (If a user is both `secretary` and `vp`, and `secretary` has `view` on Performance Management while `vp` has `edit`, the user gets `edit`.)

**Default starting matrix shipped with the system:**

| Status | Default access pattern |
|---|---|
| `admin` | edit on all tabs (build maintainer; transfers to president at handover) |
| `president` | edit on all tabs except admin-only Settings sub-sections |
| `vp` | edit on all tabs except admin-only Settings sub-sections |
| `performance_officer` | edit on Performance Management + Surveys; view on everything else (incl. Webmaster, Contacts shared) |
| `lessons_coordinator` | edit on Lessons Management + Surveys; view on everything else |
| `secretary` | edit on Meeting Notes; view on everything else |
| `member` | view on Dashboard, Members (own profile edit), Resources (edit), Move Library (edit), Team Calendar, Alumni Directory, Performance Stats (own data), Surveys (own responses) |
| `alumni` | view on Alumni Directory (edit own profile); no other access |

Officers can override any cell from Settings → Permissions Matrix. Status names are also editable for terminology fit (e.g., rename `performance_officer` to `pr_officer` if that's the team's vocabulary).

**Enforcement layers** (defense in depth):
- UI: tabs the user has `none` on are hidden from navigation.
- API routes: every endpoint checks effective access for the requesting user on the relevant tab.
- Database: Supabase RLS policies key off the same matrix as a backstop.

### 4.3 Account creation & login flow

**Accounts are created by officers, not by self-signup.** This is a deliberate inversion of the v5 flow — instead of "user signs in with SSO, lands on a pending-approval queue," v6 does "officer creates the profile, system invites the user."

**Account creation:**
1. Officer opens Members tab → "Add member" or "Add alumni."
2. Fills in name + email (TAMU email for current members; personal email for alumni / pre-existing).
3. System creates the `users` row + `members` row, assigns default `member` (or `alumni`) status, and sends an invite email with a setup link.
4. User clicks the link, picks a password (or just uses magic-link going forward), and lands on their dashboard.

**Returning sign-in:**
- **Magic link** — email address only. Resend delivers a one-tap signed link to whatever email is on file. Always works.
- **Password** — for users who set one during setup. Standard email + password.

No SSO providers in v6. Magic link is the simplest mechanism that works without any third-party identity integration; password login is the cover for users who prefer it.

**Email-on-file lifecycle:**
- Current members default to their TAMU Gmail.
- Each profile has an optional `personal_email` field.
- When a member is marked `graduated`, the system flips primary email from TAMU to personal (since TAMU expires post-graduation). User is reminded to confirm on next sign-in.

**Alumni self-signup** (for alumni who graduated before the portal existed and have no `members` row):
- Self-service form on `team.aggiewranglers.com/alumni-signup`: name, graduation year, contact info.
- Lands in an approval queue handled by a user with approver-status (default: president). Approver can match against legacy records or create fresh.

**Bootstrap at launch:** the current officer slate gets pre-created profiles + setup links so they can sign in immediately on day one. Initial admin is the build maintainer; admin status transfers to the president at officer transition.

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

- **users**: `primary_email` (unique), `name`, `avatar_url`, `status` (`pending_setup` / `active` / `disabled`), `member_id` (FK → members, nullable for non-member logins), `phone` (optional, opt-in for future SMS), `password_set` (bool — false until user completes setup), `last_signed_in_at`.
- **auth identities / sessions**: managed by Supabase Auth (`auth.users`, `auth.identities`, `auth.sessions`). Provider is `email` (magic link) only in v6.
- **permission_statuses**: `key` (unique slug like `performance_officer`), `display_name`, `description`, `is_system` (bool — system statuses like `admin` can't be deleted), `created_by_id`, `updated_by_id`. Team can add/rename statuses via Settings.
- **permissions**: `status_id` (FK → permission_statuses), `tab_key` (string matching the tab registry in code), `access_level` (enum: `none` / `view` / `edit`). Unique on `(status_id, tab_key)`.
- **user_statuses**: `user_id`, `status_id`, `granted_at`, `granted_by_id`, `expires_at` (nullable — useful for outgoing-officer access windows during turnover).
- **audit_log**: who did what when (permission-sensitive actions, settings changes, role grants/revokes, contact merges, performance roster edits).

### 6.2 Site content

- **site_settings** (single row): `site_name` (placeholder until brand refresh), `tagline`, `mission`, `contact_email`, `address` (practice location, used for drive-time origin), `socials`, `tryouts_open`, `lessons_open`, `homepage_announcement`, `auto_send_weekly_survey`, `weekly_survey_day` (default **Wednesday**), `weekly_survey_time` (default **18:00 CT**), `default_polling_window_days`, `default_min_couples_required` (default 3), `default_response_deadline_days` (default 3), `weekly_digest_day` (default Monday), `weekly_digest_time` (default 08:00 CT), `default_call_time_minutes_before` (60), `default_return_buffer_minutes` (15), `theme_tokens_json` (brand-refresh-ready theme overrides), `google_calendar_id` (the team calendar ID for 2-way sync), `team_email_domain` (default `aggiewranglers.com`), `archive_email_address` (default `archive@aggiewranglers.com`).
- **public_lessons**: `class_name`, `level`, `day`, `start_time`, `end_time`, `dates[]`, `instructor_ids[]`, `signup_url`, `visible_to_public`, `publish_at` (nullable), `active`, `notes`.
- **tryouts**: `cycle_name`, `prep_lesson_dates[]`, `tryout_date`, `eligibility_notes`, `signup_url`, `active`.
- **members**: `name`, `role_title` (display), `class_year`, `hometown`, `major`, `headshot_url`, `partner_photo_url`, `partner_id` (FK self), `bio`, `display_order`, `status` (`current` / `tryout` / `graduated` / `inactive`), `email`, `phone` (private, opt-in for future SMS), `sms_opt_in` (bool), `graduation_date` (nullable).
- **videos**: `youtube_id`, `title_override`, `display_order`, `category` (enum), `featured`, `source_artist` (for music videos).
- **sponsors**: `name`, `tier`, `logo_url`, `website_url`, `display_order`, `active`.
- **faq**: `question`, `answer` (markdown), `category`, `display_order`.
- **announcements**: `headline`, `body`, `link_url`, `start_date`, `end_date`, `active`.
- **banquet_content** (single row, or merge into site_settings): year, dates, venue, ticket info, links — updated annually.

### 6.3 Operations

- **contacts**: `kind` (`person` / `organization`), `name` (person name or org name), `parent_org_contact_id` (nullable FK self — for "Sarah is a contact who works for [Kappa Kappa Gamma]"), `email` (indexed), `phone`, `address`, `social_links_json`, `tags[]`, `email_opt_in` (default true), `sms_opt_in` (default false), `notes_markdown`, `follow_up_date` (nullable), `created_by_id`, `merged_into_id` (nullable self-FK for merges).
  - **Match resolution on intake** uses any of: (fuzzy first+last name) OR org-name fuzzy OR phone OR email. Multiple candidates → officer picks merge / attach-to-org / create-new.
- **annual_reminders**: `contact_id`, `reminder_month` (1-12), `reminder_day_of_month` (nullable, defaults to 1 if missed), `note`, `assignee_status_key` (optional — e.g., `performance_officer` so the right role gets pinged), `lead_time_weeks` (default 4-6 — how early the reminder surfaces), `last_acted_on_at` (nullable). Surfaces on dashboards.
- **performance_requests**:
  - link: `contact_id` (FK → contacts, auto-resolved at intake; org-contact and/or person-contact)
  - intake snapshot: `requester_first_name`, `requester_last_name`, `requester_email`, `requester_phone`, `organization`, `event_date`, `event_start_time`, `event_end_time`, `audience_size`, `performance_type`, `notes`, `urgency` (enum: `standard` / `quick_answer`), `needs_answer_by`
  - **donation interest** (captured on form, NOT processed by portal): `donation_interest` (enum: `none` / `250` / `500` / `750` / `1000` / `other`), `donation_interest_other_text` (nullable).
  - venue (from Google Places): `venue_name`, `venue_formatted_address`, `venue_place_id`, `venue_lat`, `venue_lng`
  - travel (computed via Distance Matrix at intake, override-able): `drive_time_minutes`, `drive_distance_miles`, `call_time_minutes_before` (default 60), `return_buffer_minutes` (default 15)
  - workflow: `status` (`new` → `under_review` → `ready_to_poll` → `polling` → `polling_closed` → `confirmed` / `declined` → `completed`), `assigned_officer_id`, `review_notes`, `polling_window_days`, `min_couples_required`, `response_deadline`, `include_in_next_survey`
  - **`polling_closed` is informational, not auto-actioning.** It means "the response window expired" and shows a per-couple yes/no/maybe breakdown. The officer reads it and clicks Confirm or Decline; the system opens an Outlook draft via `mailto:` for the officer to send.
  - outcome: `confirmed_at`, `confirmed_by_id`, `gcal_event_id` (the Google Calendar event ID for the confirmed performance — see §6.6)
  - **donation post-performance:** `donation_status` (enum: `pending` / `received` / `declined` / `no_response`), `donation_actual_amount` (nullable, free-form for institutional memory), `donation_notes` (nullable).
- **performance_roster**: `performance_request_id`, `member_id`, `role` (`performer` / `lead` / `partner` / `alternate`), `added_at`, `added_by_id`, `removed_at`, `removed_by_id`. Captures who's on the lineup; editable post-confirmation. Each insert/delete generates a notification to the affected member.
- **private_lesson_requests**: same shape as performance_requests with `contact_id`, minus `audience_size`, plus `group_size`, `dance_type`, `experience_level`, `preferred_dates`, `price_quoted`, `assigned_instructor_ids[]`.
- **general_inquiries**: `contact_id`, intake fields, `auto_reply_sent_at`, `needs_human`, `assigned_to_id`.
- **survey_runs**: `run_at`, `run_type` (`weekly_auto` / `manual`), `triggered_by_id`, `performance_request_ids[]`, `private_lesson_request_ids[]`, `member_count`, `response_count`, `response_deadline`, `notes`.
- **survey_responses**: `survey_run_id`, `member_id`, `target_type` (`performance` / `private_lesson`), `target_id`, `available` (`yes` / `no` / `maybe`), `notes`, `responded_at`. Unique on (survey_run_id, member_id, target_type, target_id).

### 6.4 Email history (BCC-archive ingest)

v6 has **no in-portal composer.** Officers compose in their existing TAMU Outlook. The portal observes via a BCC archive route. Threads are reconstructed from inbound webhooks.

- **email_threads**: `contact_id` (FK), `subject_normalized` (subject minus `Re:` / `Fwd:` for matching), `last_message_at`, `last_message_direction` (`inbound` / `outbound`), `participants_emails[]`, `related_type` (nullable: `performance_request` / `private_lesson_request` / `general_inquiry`), `related_id` (nullable). Threads are reconstructed from `Message-ID` / `In-Reply-To` headers when available; fallback to subject + participant matching.
- **email_messages**: `thread_id` (FK), `direction` (`inbound` / `outbound` — outbound when received via the archive BCC; inbound when received via Cloudflare-routed forwards from a team alias), `from_address`, `to_addresses[]`, `cc_addresses[]`, `subject`, `body_html`, `body_text`, `message_id_header` (RFC Message-ID), `in_reply_to_header`, `references_header`, `received_at`, `attachments_json`, `raw_headers_json`, `sent_by_user_id` (nullable — resolved from `from_address` against `users.primary_email` when possible).
- **email_templates**: `slot` (enum: `perf_request_received`, `perf_confirmation`, `perf_decline`, `perf_followup`, `private_lesson_received`, `private_lesson_quote`, `private_lesson_decline`, `general_inquiry_ack`, `survey_invitation`, `weekly_digest`, `staleness_alert`, `magic_link_signin`, `invite_setup`, etc.), `variant` (`default` / `warm` / `formal`), `subject_template`, `body_template` (Handlebars with `{{contact.name}}`, `{{request.event_date}}`, etc.), `is_active`, `updated_by_id`, `updated_at`.
  - **Auto-sent templates** (form acks, survey invites, magic links, weekly digest) → rendered server-side, delivered by Resend.
  - **Officer-composed templates** (confirmation, decline, follow-up, quote) → rendered server-side into a `mailto:` URL with prefilled subject + body that opens the officer's default mail client (TAMU Outlook). Officer reviews, edits, sends. Auto-BCC rule captures the sent message into the archive.

### 6.5 Member-facing resources, moves, alumni, notes, goals

- **resources**: `title`, `description`, `category` (`Constitution` / `Choreography` / `Contracts` / `Historical` / `Sponsor Decks` / `Other`), `file_url` (Supabase Storage), `file_type`, `visibility` (`members_only` / `members_and_alumni` / `officers_only`), `uploaded_by_id`, `uploaded_at`.
- **moves**: `name`, `aliases[]`, `category`, `difficulty`, `description_markdown`, `originated_by`, `originated_year`, `video_links[]` (YouTube URLs — typically private/unlisted on the team channel), `status` (`draft` / `published` / `archived`), `display_order`, `created_by_id`, `updated_by_id`.
- **alumni_profiles**: `member_id` (FK, nullable for pre-portal alumni who self-registered), `graduation_year`, `current_city`, `current_address` (optional, alumnus-controlled), `current_role`, `what_im_up_to`, `contact_permission` (enum: `visible_to_members_only` / `visible_to_alumni_too` / `private`), `email`, `phone` (opt-in), `status` (`draft_auto_created` / `active` / `unverified`), `verified_at`, `verified_by_id`. Auto-created as `draft_auto_created` when a member is moved to `graduated`.
- **meeting_notes**: `meeting_date`, `meeting_type` (free-text — "Officer meeting" / "All-team" / etc.), `attendees_member_ids[]`, `agenda_markdown`, `decisions_markdown`, `notes_markdown`, `created_by_id`, `updated_by_id`.
- **action_items**: `meeting_note_id` (nullable), `description`, `assignee_member_id`, `due_date`, `completed_at` (nullable), `created_by_id`. Surfaces on assignee's dashboard.
- **long_term_goals** (single document, structured): `body_markdown`, `updated_by_id`, `updated_at`. Free-form president-maintained doc; revision history kept in `long_term_goals_revisions` snapshot table for handover continuity.

### 6.6 Calendar (Google Calendar 2-way sync)

Google Calendar is the source of truth for events. Postgres stores **sync state and portal-side metadata** that doesn't fit in a Google Calendar event.

- **calendar_events** (portal-side cache + metadata): `gcal_event_id` (unique, the Google Calendar event ID — this is the join key), `gcal_calendar_id` (which calendar — typically just the one team calendar), `event_type` (`performance` / `public_lesson` / `private_lesson` / `tryout` / `practice` / `officer_meeting` / `retreat` / `workshop` / `other`), `source_type` (`performance_request` / `public_lessons` / etc., nullable for ad-hoc), `source_id` (nullable), `last_synced_at`, `etag` (Google's etag for conflict detection). All other fields (title, time, recurrence, attendees, location, description) live in Google Calendar itself — fetched/written via the API.
- **calendar_event_member_links**: `gcal_event_id`, `member_id`, `role` (`performer` / `instructor` / `optional` / `partner`). Tracks the team-internal roster for events Google Calendar's attendee field doesn't fully capture (e.g., partner pairings, fallback alternates).
- **gcal_sync_state**: `last_sync_token` (Google's incremental sync token), `last_full_sync_at`, `watch_channel_id`, `watch_expiration` (Google Calendar push notification channel — refreshed before expiration).
- **ical_tokens**: `user_id`, `token` (random, signed), `created_at`, `revoked_at`. The personal iCal feed endpoint accepts a token and returns the user's assigned events (filtered from calendar_events + member_links) — kept as an alternative for members who don't want to subscribe to the full team calendar.

---

## 7. Public forms & lead capture

Four public forms. Each Vercel Function writes to Postgres and triggers the auto-reply.

| Form | Fields | What happens |
|---|---|---|
| **Performance request** | **first name, last name**, organization, email, phone, event date, **start + end time**, **venue address (Google Places autocomplete + validation)**, audience size, performance type, notes, **urgency** flag (default Standard), **donation interest** ($250 / $500 / $750 / $1,000 / Other / Not at this time) | Resolves/creates `contacts` row (matches on first+last name OR org OR phone OR email — officer prompted to merge if ambiguous). Inserts `performance_requests` row, status=`new`. Backend immediately calls Distance Matrix for drive time. Resend auto-reply sent from `performance@aggiewranglers.com`, persisted as first message of an email_thread on the contact. Performance officer notified in portal. |
| **Private lesson request** | first name, last name, email, phone, group size, preferred dates, dance type, experience, notes, urgency flag | Same contact resolution → inserts row → auto-reply sent from `lessons@aggiewranglers.com` → lessons coordinator notified |
| **General contact** | first name, last name, email, phone (optional), subject, message | Same contact resolution → inserts `general_inquiries` → keyword-matched auto-reply (links matching FAQ entry if found, else generic) → `needs_human=TRUE` flag for officer follow-up |
| **Newsletter signup** | email | Adds to `newsletter_subscribers` table; resolves/creates contact |

Spam: Cloudflare Turnstile + per-IP rate limit (Upstash).

---

## 8. Operations & automation (inside the portal)

### 8.1 Performance request lifecycle

Review gate → **Wednesday combined availability survey** → response window closes → officer manual confirm/decline via TAMU Outlook (portal opens prefilled draft via `mailto:`). No auto-send for client-facing emails, ever.

```
PHASE A: Intake & officer review
[Form submitted with venue from Places autocomplete]
   → backend resolves/creates contact (matches on first+last, org,
     phone, or email; officer prompted if multiple candidates)
   → calls Distance Matrix: origin=practice location, dest=venue
   → drive_time_minutes, drive_distance_miles persisted on the row
   → donation interest captured (informational; not processed)
   → performance_requests row inserted with contact_id, status=new
   → templated auto-reply ("we got your request") sent via Resend
     from performance@aggiewranglers.com to requester; archive route
     captures it as the first message in the contact's email thread
[Performance officer review tab]:
   - Decline → "Compose decline" → opens TAMU Outlook with prefilled
     subject/body via mailto: → officer edits, sends from Outlook
     → status=declined
     → auto-BCC rule captures sent message into the contact's thread
   - Need info → "Compose follow-up" → same mailto: flow
     → keep status=under_review
   - Approve to poll → status=ready_to_poll
        with overridable:
          polling_window_days, min_couples_required (default 3),
          response_deadline_days (default 3, per-request overrideable),
          include_in_next_survey,
          drive_time_minutes, call_time_minutes_before, return_buffer_minutes

PHASE B: Inclusion rules (run at each survey send)
A performance request goes in the survey for a member IFF:
  1. status ∈ {ready_to_poll, polling}
  2. include_in_next_survey = TRUE
  3. event_date is within polling_window_days from now
  4. that member has no survey_response for this target yet

A private lesson goes in the survey for an instructor pool member
under the same rules (see §8.2).

PHASE C: Combined Wednesday survey delivery
[Vercel cron Wednesday 18:00 CT, configurable via site_settings]
   OR
[Officer clicks "Send survey now"]
   IFF auto_send_weekly_survey = TRUE
   → compute per-member item lists (performances + private lessons
     combined into ONE email per member)
   → create survey_runs row with response_deadline = now + response_deadline_days
   → send ONE consolidated email per member via Resend with a
     signed-token link to their RSVP page (no login required)
   → each survey item shows the REAL availability window:
       "Wedding · Sat May 23 · Brenham, TX · 1h 15m drive
        You'd need to be available roughly 4:45 PM to 10:45 PM."
   → also exposes the same survey inside the portal for logged-in members
   → status flips ready_to_poll → polling on first send

PHASE D: Response window closes (informational only)
[Daily cron checks response_deadline; e.g., Saturday for a Wednesday send]
   When response_deadline has passed:
     → status flips to polling_closed
     → dashboard surfaces the request to the performance officer with
       a per-couple yes/no/maybe breakdown:
         "Polling closed · 5 of 8 yes · 2 no · 1 no response · review needed"
   → NOTHING is sent. The officer is the only thing that triggers an email.

PHASE E: Officer manual decision (weekend before Monday digest)
[Officer reviews actual responses + conflicts + history]
   - Confirm → "Compose confirmation" → opens TAMU Outlook draft
     prefilled with confirmed couples, call time, drive time, location
     → officer edits, sends from Outlook
     → status=confirmed
     → Google Calendar event created via API with confirmed members as
       attendees; performance_roster rows persisted
     → auto-BCC rule captures sent confirmation into the contact's thread
   - Decline → "Compose decline" → same mailto: flow → status=declined
   - Need to renegotiate → "Compose follow-up" → keeps status=polling_closed

PHASE F: Post-performance follow-up
[After event_date passes]
   - Officer can mark donation status (Received / Declined / No response / Pending)
   - Officer can add post-event notes that surface on the contact's profile
```

**Officer overrides:**

| Lever | Where | Use case |
|---|---|---|
| `polling_window_days` | per request | Big gig 60 days out: bump to 90. Small local in 4 weeks: leave default. |
| `min_couples_required` | per request | Big stage: 8. Small private: 3. Default 3. |
| `response_deadline_days` | global default + per request | Default 3 days. Quick-answer requests: shorten to 24h. Sleepy summer survey: extend to 5 days. |
| `include_in_next_survey` | per request toggle | "Don't ask this Sunday, still negotiating with requester." |
| `auto_send_weekly_survey` | global | Flip OFF during breaks / finals. |
| `weekly_survey_day` / `time` | global | When the auto-send runs (default **Wednesday 18:00 CT**). |
| Manual add | per request | Pull in something outside the window. |
| Urgency flag | per request | Surfaces visually in the inbox; no automated workflow branch. |

### 8.2 Private lesson request lifecycle

Same review gate, contact resolution, response window, and manual confirm/decline as performances — and **merged into the same Wednesday email** to members rather than sent as a second survey. Audience for the private-lesson items is the instructor pool only; the same member sees both performance and private-lesson asks in the one weekly message.

Lessons coordinator can bypass the survey for low-friction asks (`include_in_next_survey = OFF`) and reach out directly via the Outlook draft flow.

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

**No in-portal composer.** Officers compose in their existing TAMU Outlook (where they already live). The portal observes and captures.

Three flows handle everything:

**1. Auto-sent (no human in the loop) — Resend delivers immediately on a system event.** Used for: form submission acknowledgments, magic-link sign-in, invite-link emails, RSVP-link delivery, weekly Wednesday survey, weekly Monday digest, staleness alerts to officers. All templated; nothing personal in the wording that warrants review.

- FROM addresses: `wranglers@aggiewranglers.com` (generic system mail), `performance@aggiewranglers.com` (performance form acks), `lessons@aggiewranglers.com` (lessons form acks). All authenticated on the team-owned domain in Resend.

**2. Officer-composed (always reviewed before send) — drafted in TAMU Outlook via portal `mailto:` link.**

- Officer clicks a "Compose confirmation" / "Compose decline" / "Compose follow-up" / etc. button in the portal.
- The button generates a `mailto:` URL with prefilled subject and body, substituting variables from the related request, contact, and survey results.
- Officer's default mail client (TAMU Outlook on their computer/phone) opens with the draft. They edit freely and hit Send from Outlook.
- **Sent from their own TAMU Outlook account** (`performance@wranglers.tamu.edu` etc.) — recipient sees a real human's TAMU email, replies land in the officer's real inbox.

**3. Inbound + thread reconstruction — Cloudflare Email Routing + auto-BCC archive.**

- **Inbound to team-domain aliases** (e.g., a requester replies to the Resend auto-reply from `performance@aggiewranglers.com`): Cloudflare Email Routing forwards to the officer's TAMU Outlook (`performance@wranglers.tamu.edu`). Officer sees and handles in Outlook.
- **CRM capture of all officer-sent mail:** each officer sets up a **one-time auto-BCC rule** in their TAMU Outlook: "always BCC `archive@aggiewranglers.com` on sent mail." Cloudflare Email Routing forwards that archive address to a Cloudflare Worker → portal webhook. The webhook parses headers (Message-ID, In-Reply-To, References, From, To, CC, subject, body), matches to an existing thread or creates a new one, attaches to the right contact.
- **Inbound replies captured the same way** — the auto-BCC sees forwarded inbound mail when the officer replies to it, since the reply quotes the original.

**Why this approach:**
- **No A&M IT involvement.** All email infrastructure lives on the team-owned domain. Resend authenticates on `aggiewranglers.com`; Cloudflare Email Routing is free; archive ingest is a single Cloudflare Worker.
- **No new inboxes for officers to check.** Replies forward straight to their existing TAMU Outlook.
- **No in-portal composer to learn or maintain.** Officers work in Outlook where they already work.
- **Institutional memory still happens.** The BCC archive captures every officer-sent message, stitches threads together by RFC headers, attaches to the contact, and surfaces on the Contacts tab forever — across officer transitions.

Templates editable in Settings. Ship with sensible defaults (warm + formal variants per slot). No AI generation in v6 — templates are plain variable substitution; the officer's edits in Outlook are the personalization.

---

## 9. Calendar (Google Calendar 2-way sync)

**The team's existing Google Calendar is source of truth.** The portal is a UI layer that reads from and writes to it via the Google Calendar API. No in-portal calendar duplicates the data.

**Setup:** a one-time Google Cloud project with Calendar API enabled + a service account that has write access to the team's calendar. The service account credential lives as a secret in Vercel. No A&M IT involvement; no Google Workspace seat required (works with a personal Google account that owns the calendar).

**Event lifecycle:**

- **Confirmed performances** → portal POSTs a calendar event with start = `event_start - call_time - drive_time`, end = `event_end + drive_time + return_buffer`, location = venue address, description = requester notes + assigned roster, attendees = members' emails (Calendar sends them an invite they can RSVP from anywhere).
- **Public lesson sessions** where `visible_to_public = TRUE` → events with instructor attendees, recurring per session schedule.
- **Confirmed private lessons** → events with assigned instructor(s).
- **Tryout cycle dates** → events (no attendees).
- **Recurring practices, officer meetings, retreats, workshops, ad-hoc team events** → created in the portal's Team Calendar tab; recurrence rules (RRULE) supported natively.

**2-way sync mechanics:**
- Portal → Calendar: every create/update/delete in the portal writes to Calendar via the API. Etag-based optimistic concurrency.
- Calendar → Portal: Google's push notification (`watch`) on the calendar fires a webhook to the portal on every change. Portal fetches incremental updates via `events.list` with the saved `syncToken`. Watch channel is refreshed before expiration (7-day rotation).
- Conflict resolution: last-writer-wins for content fields; portal-side metadata (event_type, source_type/id, roster links) is never touched by the Calendar.

**Subscriptions on member phones:**
- Most members will subscribe directly to the team Google Calendar (sharing setting: "see all event details" for current members, "free/busy only" for the public).
- Per-member personal iCal feed remains available as a filtered alternative for members who only want their assigned events (kept from v5).

**Calendar ownership transfer on president handover:**
- Google Calendar supports transferring ownership of a shared calendar to another Google account.
- Outgoing president runs the transfer; incoming president becomes the owner. Service account stays attached. Same calendar, no event loss, no event duplication.

**Weekly digest email (default Monday 08:00 CT, configurable):**
- For each `current` member: gather assigned events for the next 7 days from the synced calendar_events cache.
- Send a single Resend email: "Here's where you're expected this week — Sat 5/16 wedding in Brenham (3 PM call), Wed 5/20 CW1 class at the building (5:15 PM call)…"
- Members can opt out per-account.

---

## 10. SEO migration plan

- [ ] Crawl current site (Screaming Frog / `wget --mirror`) → export every URL, title, meta description, H1.
- [ ] Map every legacy URL 1:1 to a new URL; 301 in `next.config.js` redirects for any deltas. **`/our-building` → `/` (301)** since the team no longer has that building.
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

## 13. Build phases

**Single launch day** — public site + portal cut over together. Phases below are sequencing for the build, not incremental ship dates. No time estimates intentionally — work is parallelizable once the schema is locked.

### Phase 0 — Foundation
- Repo + Next.js scaffold + Tailwind + shadcn/ui + Drizzle + theme-token system.
- Supabase project: Postgres schema (including `permission_statuses`, `permissions`, `user_statuses`), Auth (magic-link email), Storage buckets.
- Domain setup: team-owned domain on Cloudflare DNS; Resend authenticated (DKIM/SPF/DMARC); Cloudflare Email Routing aliases configured (`performance@`, `lessons@`, `wranglers@`, `archive@`).
- Google Cloud project + service account with shared write access to the team's existing Google Calendar.
- Vercel project with both domains attached.
- Bootstrap: pre-create officer profiles + setup links so they can sign in day one.
- CI: Vercel previews per PR with Supabase branches.

### Phase 1 — Public site shell + design system
- Tailwind theme tokens, typography, component library (placeholder brand, refresh-ready).
- All legacy URLs in place with hardcoded content; `/our-building` 301 → `/`.
- Greenfield image migration from current Wix site → Supabase Storage; "needs rephoto" flag list handed off.
- Lighthouse target: 95+ across the board.

### Phase 2 — Portal foundation + Permissions + Members + Contacts
- Auth-gated layout, magic-link sign-in screen, invite-link setup flow.
- **Permission matrix** end-to-end: status CRUD, matrix grid editor, user-status assignment, runtime enforcement in middleware + RLS.
- Dashboard skeleton (action items keyed off user statuses).
- **Members CRUD** with photo uploads to Supabase Storage; phone field collected from day one.
- **Contacts entity** end-to-end: person + organization types, auto-create on form submit with matching logic, manual create, profile view, search, merge, notes, tags, annual reminders. (Email history attaches in Phase 4.)

### Phase 3 — Public forms + auto-replies
- Four forms (performance with **donation field**, private lesson, contact, newsletter) writing to DB and resolving/creating contacts via matching logic.
- Resend auto-replies sent from team-domain aliases; queued for archive-thread attachment in Phase 4.

### Phase 4 — Email archive ingest + Webmaster + Performance management + Wednesday survey + drive-time
- **Email infrastructure:**
  - Cloudflare Worker on `archive@aggiewranglers.com` route → portal webhook.
  - Thread reconstruction by `Message-ID` / `In-Reply-To` / subject + participant heuristics.
  - Attach to contact, persist in `email_messages`.
  - `mailto:` link generator for officer-composed templates (confirmation, decline, follow-up).
- **Webmaster (site-content CRUD) tab** — covering site_settings, FAQ, sponsors, announcements, banquet content, video listings, profile cards, tryout cycle.
- Public site reads from DB; on-demand revalidate via webhook from portal saves.
- **Performance Management tab end-to-end:**
  - Review gate, status transitions, per-request overrides, donation interest + donation status tracking.
  - Google Places autocomplete on intake form + Distance Matrix call.
  - Email templates table + admin UI to edit them.
  - Wednesday 18:00 CT (configurable) cron computes inclusion, sends combined performance + private-lesson availability emails.
  - Member RSVP page (token-based, also accessible logged-in) showing real availability windows.
  - **Response window closes** → request surfaces on dashboard with response breakdown.
  - **Manual confirm / decline buttons** → open Outlook draft via `mailto:` → officer sends → BCC archive captures.
  - **Editable performance rosters** post-confirmation; notifications to affected members.

### Phase 5 — Lessons management + scheduling
- Public sessions: schedule semester ahead, visibility toggle, `publish_at`.
- Private lesson workflow integrated into the same Wednesday survey (merged with performance availability per member).
- Instructor pool management.

### Phase 6 — Google Calendar 2-way sync + weekly digest
- Service-account Google Calendar writes for confirmed performances, lessons, tryouts, ad-hoc events.
- Recurring events (practices, officer meetings) via RRULE.
- Push notification (watch channel) → portal webhook → incremental sync.
- Personal iCal feed available for members who want filtered subscriptions.
- Monday 08:00 CT (configurable) weekly digest cron via Resend.

### Phase 7 — Resources, Move Library, Alumni, Meeting Notes, Long-Term Goals
- Resources tab: file uploads to Supabase Storage, categories, visibility rules. Constitution PDF lands here.
- **Move Library (scoped):** moves CRUD with YouTube link list, filters/search. Officers edit directly.
- Alumni directory: graduation flow auto-creates draft `alumni_profiles`, self-registration path for pre-portal alumni, approval queue.
- Meeting Notes tab: date, attendees, agenda, decisions, action items with assignees + due dates.
- Long-Term Goals tab: free-form markdown doc with revision history.

### Phase 8 — Performance Stats Dashboard + `/watch` + homepage polish
- Per-member attendance %, per-performance roster view, individual performance history, team-wide stats.
- Three video subsections from DB; Music Videos seeded with Midland / Randy Rogers / Ella Langley.
- 4-CTA hero, featured video, announcement banner.

### Phase 9 — SEO migration + launch
- Redirects (every legacy URL → new equivalent including `/our-building` → `/`), sitemap, structured data, OG images.
- Stage on `staging.aggiewranglers.com` for officer review.
- **Single-day cutover:** public site + portal both go live; Wix DNS flipped, Search Console verified.

### Phase 10 — Officer handoff
- Loom recordings per officer role.
- Printable cheat sheets including the one-time auto-BCC rule setup in TAMU Outlook for each officer.
- Documented re-consent / token-rotation process for officer transitions.
- Documented Google Calendar ownership-transfer process for president handover.

### Deferred to "v1.1" (planned, not in launch)
- **Social media management tab** — cross-platform posting + AI variant generation. Team can use Buffer or similar separately until then. See IDEAS.md.
- **Online courses + Coaching service** — separate workstream from website/portal. See IDEAS.md.
- **Payments via SOFC Marketplace** — when the team is ready to consolidate or expand commerce.
- **SMS via Twilio** — day-of reminders, RSVP last-call. Schema and opt-in collection are in v1.
- **Microsoft Graph mail polling** — could replace the BCC-archive approach for richer inbox features. Currently no need.
- **Move Library video upload + alumni contribution queue** — if YouTube-channel model proves insufficient.

Phases 2, 4 are critical path. Phases 5–8 can run in parallel once schema is locked.

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
| Supabase Free | 500 MB DB, 1 GB storage, 50K MAU, Auth (magic link) + RLS included | <20% on every axis | $0 |
| Upstash Redis | 10K commands/day, 256 MB | <1K commands/day | $0 |
| Resend Free | 3,000 emails/mo, 100/day | ~300/mo (auto-replies + magic links + survey + digest), ~40 peak/day | $0 |
| Cloudflare Email Routing | Free, unlimited aliases | All inbound team-domain forwards + archive route | $0 |
| Cloudflare Workers | 100K requests/day free | Archive ingest worker | $0 |
| Google Calendar API | Free with generous quotas | 2-way sync; well under quota | $0 |
| Google Maps Platform | $200/mo free credit | <$1 of usage | $0 |
| Cloudflare Turnstile | Free, unlimited | Spam protection on public forms | $0 |
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
| Inbound mail forwarding fragile | Cloudflare Email Routing is simple but depends on the team-owned domain's MX records staying correct. Auto-BCC rule on each officer's TAMU Outlook depends on the officer setting it once during onboarding. Mitigation: documented setup, monitoring dashboard for unmatched archive ingest, occasional test message to verify the round-trip works. |
| Auth issue locks officers out | Magic-link email is the only sign-in path — if Supabase Auth or Resend has an outage, all sign-ins fail. Mitigation: admin can issue a one-time password reset for any user; the build maintainer's account stays valid via Supabase dashboard. |
| Form spam | Turnstile + honeypot + rate limit. |
| Photo/video rights | Audit during Phase 1 image migration; flag anything not clearly team-owned. |
| Survey email fatigue | Once/week max, opt-out per member, no per-request blasts. |
| Manual confirmation bottleneck (officer doesn't decide quickly) | Dashboard surfaces `polling_closed` requests prominently; staleness cron pings PR officer after 24h of inaction; deadlines visible. |
| Brand-refresh churn after launch | Theme tokens isolate the design system; refreshing colors/type/logo is a config change, not a rebuild. |
| Vendor lock-in | Standard Postgres + standard Next.js + portable email (Resend → any SMTP). Yearly DB export to Drive for paranoid backup. |
| Team abandons updating again | Daily staleness cron pings the right officer proactively; "publish on date X" feature lets officers batch work. |

---

## 16. Open questions for the team

What's still open after the v6 round:

1. **Bootstrap officer whitelist.** Exact email addresses of the current officer slate so they get pre-created profiles + setup links at launch. Needed at Phase 0.
2. **Team comms channel.** GroupMe / iMessage / Discord? Not architectural — but affects digest copy and staleness-alert wording.
3. **Outlook auto-BCC rules on `*@wranglers.tamu.edu`.** Need to verify these are allowed on TAMU's Exchange tenant. If they are, the CRM archive flow works as designed. If not, fallback is a server-side forwarding rule per role mailbox (slightly noisier).
4. **Flywire URL stability for public lessons.** Same URL every semester or new each cycle? Affects Phase 5 officer workflow.
5. **YouTube channel access for Move Library.** Who administrates the team's private channel? How are alumni invited — direct invite or managed Google Group?
6. **Photo/video rights audit.** Anything from the Wix site we should NOT republish? Brief review during Phase 1 image migration.
7. **Brand refresh timing.** Launch on the placeholder theme and swap in brand refresh after (recommended), or delay launch until the brand lands?
8. **Donations handling outside the portal.** The portal captures donation interest on the form and tracks status after the gig, but does NOT process donations. How does the team currently collect donations (cash/check at the event? Venmo? something else)? Affects the post-performance officer prompt copy.

### Things deferred to v1.1+ that need their own input cycle
- **Social media management approach** (Buffer SaaS vs portal-native AI drafter vs self-hosted).
- **Online courses / Coaching pricing + SOFC sales flow.**
- **Twilio SMS opt-in defaults + trigger events.**
- **Long-Term Goals tab schema** — does the president want freeform markdown or something more structured (OKRs / quarterly goals / etc.)?

---

## 17. What "done" looks like

**Public site:**
- [ ] All legacy URLs respond 200 with content matching or improving on the old site; `/our-building` 301s to `/`.
- [ ] Four primary CTAs visible above the fold on mobile.
- [ ] **Performance request form includes donation interest field.**
- [ ] `/watch` shows Top Routines, Music Videos (Midland / Randy Rogers / Ella Langley seeded), and Behind the Scenes.
- [ ] Images migrated from Wix and served from Supabase Storage.
- [ ] Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO on `/`.
- [ ] Search Console shows no new 404s after 14 days post-launch.

**Public forms:**
- [ ] All four forms write to DB, resolve/create contacts with the matching logic (first+last OR org OR phone OR email), fire auto-replies from the team domain, and surface in the portal for the right role.

**Team portal — auth & access:**
- [ ] Magic-link sign-in works; officer-issued invite links create accounts.
- [ ] **Permissions matrix is editable** in Settings; defaults ship per §4.2; multiple users can hold the same status.
- [ ] Bootstrap officer profiles sign in immediately on launch day.

**Team portal — workflows:**
- [ ] **Contacts tab** supports people + organization types; matches incoming requests against any of (first+last name fuzzy, org, phone, email); shows full request + email + notes history; annual reminders surface on relevant dashboards.
- [ ] **Email archive ingest** (Cloudflare Worker on `archive@aggiewranglers.com` → portal webhook) attaches sent mail to the right contact + thread; the contact profile shows years of correspondence.
- [ ] **`mailto:` link generator** opens TAMU Outlook with prefilled subject + body for confirmations, declines, follow-ups, and quotes.
- [ ] **Performance Management:** review gate works; **Wednesday 18:00 CT** weekly combined availability survey (configurable + disable-able); per-request overrides including response deadline work; drive time auto-computed and shown to members in real availability windows; response window closes with breakdown on dashboard; **manual confirm/decline buttons open Outlook drafts via `mailto:`**; **no automatic external emails exist** for confirmation/decline (verified in cron code).
- [ ] **Editable performance rosters** post-confirmation; affected members notified.
- [ ] **Donation interest captured on form; donation status trackable post-event** (Received / Declined / No response / Pending).
- [ ] **Lessons Management:** semester scheduling works; private lesson workflow merged into the Wednesday survey.
- [ ] Members CRUD with photo uploads; phone field captured; **personal email field on every profile; primary email auto-flips to personal on graduation**; graduation flow auto-creates draft alumni profile.
- [ ] **Webmaster tab** lets officers update homepage, FAQ, sponsors, videos, profile cards, tryout cycle, banquet, merch link without code; dynamic profile-grid layout auto-expands as profiles are added.
- [ ] Email templates editable in Settings; default warm + formal variants ship.
- [ ] Resources tab: constitution PDF + other team files uploadable with visibility controls.
- [ ] Move Library: at least 5 seed moves published with YouTube links.
- [ ] Alumni directory visible to authenticated members; self-registration approval queue works.
- [ ] **Meeting Notes** tab works: date, attendees, agenda, decisions, action items with assignees.
- [ ] **Long-Term Goals** tab works: free-form markdown with revision history.
- [ ] **Performance Statistics Dashboard:** per-member attendance %, per-performance roster, individual history.

**Calendar & comms:**
- [ ] **Google Calendar 2-way sync** with the team's existing calendar: portal writes confirmed performances/lessons/tryouts/recurring events; external edits reflect back via push webhook.
- [ ] Recurring events (practices, officer meetings) work.
- [ ] Per-member iCal feed available for filtered subscription.
- [ ] Weekly digest email goes out Monday 08:00 CT (configurable).

**Operations:**
- [ ] Daily staleness cron is live and has sent at least one nudge in testing.
- [ ] Officer handoff Loom videos delivered per role.
- [ ] **One-time Outlook auto-BCC rule** documented per officer for the CRM archive flow.
