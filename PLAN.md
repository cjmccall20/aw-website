# Aggie Wranglers Website Redesign Plan

> Replatform aggiewranglers.com off Wix into a unified system with two surfaces:
> a polished public site at **aggiewranglers.com** and an authenticated team portal at **team.aggiewranglers.com** that doubles as the CRUD app, ops console, and source of truth for everything the public site shows.

**Stack at a glance:** Next.js on **Vercel** · **Postgres** (Neon) as source of truth · NextAuth with Google OAuth (TAMU-domain restricted) for the portal · Role-based access control · Resend + Gmail API for outbound email · Google Calendar API for team scheduling.

---

## 0. TL;DR — what changed in v3

- **Dropped Airtable.** The team portal is now a custom app, so Airtable's "lite CRUD UI" value goes away. Postgres becomes the single source of truth; the portal is the CMS, ops console, and surveys tool; the public site is a thin read-only view over the same DB.
- **Added `team.aggiewranglers.com`** — authenticated portal with role-based tabs: Performance Management, Lessons Management, Members, Site Content, Calendar, Constitution, Alumni Directory, Settings.
- **Added Google Calendar integration** — confirmed performances and scheduled lessons populate the team calendar; each event lists the team members assigned; members get a weekly Monday digest of where they're expected.
- **Added scheduled-publish for public content** — officers can schedule a full semester of lessons in advance, hidden from the public site, then publish on a date or via toggle.
- **Trade-off, explicit:** this is significantly more to build (~6–8 weeks instead of ~4) and more to maintain across officer turnover. The payoff is one coherent system instead of three half-integrated SaaS tools, and the team's day-to-day work happens inside an interface they control.

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
   - Manage performance requests end-to-end (intake → review → batched availability survey → confirmation/decline drafts).
   - Manage lesson scheduling (public sessions for the semester, private lesson requests, instructor assignments).
   - Maintain member roster (current, alumni, tryout pipeline) with photos.
   - Manage site content (everything the public site shows).
   - View team calendar; auto-sync to Google Calendar.
   - Provide member-facing resources (constitution, alumni directory).
3. **Preserve every existing URL** so SEO equity transfers.
4. **Visually polished, on-brand** (Aggie maroon + white, modern typography, real photos, video-first).
5. **Email automation** for every outbound team email: auto-replies are sent; confirmations and declines are *drafted* into officer Gmail for review.
6. **Google Calendar integration** with weekly per-member digest of upcoming commitments.
7. **Cheap to run** ($0–$30/mo) and durable across officer transitions.
8. **AI-assisted content + email drafting** so non-writers can paste rough notes and get publish-ready output.

### Non-goals

- Native app (the portal is a mobile-friendly PWA).
- E-commerce / merch fulfillment (keep pointing to external store).
- Replacing Flywire for public lesson payments.
- Migrating banquet RSVP infra unless the team wants it.
- Auto-sending external emails. Every outbound email to a non-member goes via a *drafted* Gmail message reviewed by an officer.
- Doing anything the team can't take over within an officer transition cycle.

---

## 3. Recommended architecture

```
                            ┌──────────────────────────┐
                            │  Postgres (Neon)         │
                            │  Single source of truth  │
                            └──────────┬───────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                                             │
                ▼                                             ▼
   ┌────────────────────────────┐         ┌────────────────────────────────┐
   │  aggiewranglers.com        │         │  team.aggiewranglers.com       │
   │  PUBLIC SITE               │         │  TEAM PORTAL (auth required)   │
   │  ──────────────────────    │         │  ──────────────────────────    │
   │  Static + ISR pages        │         │  Next.js App Router            │
   │  - / home (4 CTAs)         │         │  - Dashboard                   │
   │  - /public-lessons         │         │  - Performance management      │
   │  - /private-lessons        │         │  - Lessons management          │
   │  - /performance-request    │         │  - Members & roster            │
   │  - /private-lesson-request │         │  - Site content (CMS)          │
   │  - /requirements (tryouts) │         │  - Team calendar               │
   │  - /meet-the-team          │         │  - Constitution                │
   │  - /watch (videos)         │         │  - Alumni directory            │
   │  - + every legacy URL      │         │  - Surveys                     │
   │                            │         │  - Settings                    │
   │  Forms POST to /api/forms  │         │                                │
   │  Read from DB (revalidate  │         │  Auth: NextAuth + Google OAuth │
   │    via webhook on write)   │         │    restricted to @tamu.edu     │
   └────────────────────────────┘         │  RBAC: roles[] on user record  │
                                          └──────────────┬─────────────────┘
                                                         │
        ┌────────────────────────────────────────────────┼─────────────────────────────┐
        │                          │                     │                  │           │
        ▼                          ▼                     ▼                  ▼           ▼
 ┌──────────────┐         ┌────────────────┐    ┌────────────────┐  ┌────────────┐ ┌────────────┐
 │ Resend       │         │ Gmail API      │    │ Google Cal API │  │ Vercel     │ │ Vercel     │
 │ (auto-reply, │         │ (drafts into   │    │ (team calendar │  │ Cron       │ │ Blob       │
 │  RSVP links, │         │  officer inbox │    │  events + per- │  │ (weekly    │ │ (photos,   │
 │  digests)    │         │  for review)   │    │  member feed)  │  │  surveys,  │ │  logos,    │
 │              │         │                │    │                │  │  digests,  │ │  PDFs)     │
 │              │         │                │    │                │  │  staleness)│ │            │
 └──────────────┘         └────────────────┘    └────────────────┘  └────────────┘ └────────────┘
```

### Why this stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | One app, two domains via middleware. Public pages render static/ISR; portal pages render dynamically with auth. Future maintainers (likely students) only learn one stack. |
| Hosting | **Vercel** | Per request. Hobby tier is borderline-sufficient for one of these projects — we'll likely need Pro ($20/mo) once we have the portal + cron + functions. |
| Database | **Neon Postgres** (or Supabase if we want their auth/storage too) | Cheap, generous free tier, branching for preview deploys, serverless-friendly. |
| ORM | **Drizzle** (or Prisma) | Drizzle is leaner for serverless; Prisma is more familiar. Either is fine. |
| Auth | **NextAuth.js (Auth.js)** + Google OAuth | Domain-restrict to `@tamu.edu`; first-login = pending approval; president approves and assigns roles. |
| RBAC | **roles[] on user** + route middleware | Simple, transparent, easy to audit. |
| UI | **shadcn/ui + Tailwind** | Lifts the portal from "Bootstrap admin panel" to "professional product" with little effort. |
| File storage | **Vercel Blob** | Headshots, sponsor logos, constitution PDF. No separate S3 setup. |
| Cache / KV | **Upstash Redis** via Vercel KV | Rate limits, survey response idempotency, session sidecar. |
| Email — transactional | **Resend** | Auto-replies, survey emails, weekly digests. |
| Email — officer drafts | **Gmail API** | Insert drafts into officer mailboxes for human review. |
| Calendar | **Google Calendar API** | Shared "Aggie Wranglers" calendar + per-member iCal feeds. |
| Background jobs | **Vercel Cron** + Upstash QStash for delayed | Weekly surveys, digests, staleness checks. |
| Analytics | **Vercel Web Analytics** (or Plausible $9/mo) | Privacy-friendly. |
| Domain | `aggiewranglers.com` apex + `team.aggiewranglers.com` subdomain | Both point to the same Vercel project; middleware routes by host. |

### Why drop Airtable

Airtable was attractive as "lite CRUD UI for the team," but once we're building a real portal with role-based tabs and custom workflows, that value goes away. A second SaaS to learn and pay for, with a worse permissions model than what we can build, isn't worth it. The portal we build *is* the CRUD app.

What we lose: Airtable's no-code automations, mobile app, and "I can edit a row in 5 seconds" UX. We get all of those back via well-built portal screens — and the portal can do things Airtable can't (workflow approvals, calendar sync, weekly digests, etc.).

---

## 4. The team portal (`team.aggiewranglers.com`)

The portal is structured as nine tabs, each with role-gated access. Anyone signed in sees a personalized Dashboard; everything else depends on roles.

### 4.1 Tabs & features

**1. Dashboard** *(all roles)*
- "Where you're expected this week" — next 7 days of personal calendar.
- Open surveys to respond to.
- Action items for your role (e.g., PR officer: "3 requests waiting for your review").
- System banners (staleness alerts targeted to relevant officer).

**2. Performance Management** *(PR Officer, President, Member view-only)*
- Inbox: all `performance_requests` with status filters.
- Per-request detail page: review notes, urgency, poll history, draft history.
- Buttons: Approve to Poll, Decline, Send survey now, Add to next weekly survey, Draft confirmation, Draft decline.
- Settings: weekly survey day/time, default polling window, default min couples.

**3. Lessons Management** *(Lessons Officer, President)*
- **Public sessions**: schedule a semester of sessions at once. Each session has `visible_to_public` toggle (default OFF) and optional `publish_at` date. Officer can plan ahead, then flip on (or auto-publish) when ready.
- **Private lesson requests**: same shape as Performance Management (review gate → optional survey → assign instructors → draft confirmation).
- **Instructor pool**: which members are eligible to teach which class types.

**4. Members** *(President, Webmaster; Members view-only)*
- CRUD on member records (name, role, class year, hometown, major, headshot, partner photo, partner link, bio, status).
- Drag-drop photos directly (no Drive juggling).
- Officer transitions: bulk role updates at year-end.
- Approval queue for new logins (TAMU email present but not yet on team).

**5. Site Content** *(Webmaster, President)*
- Edit homepage announcement, site-wide tagline, contact info.
- Manage `/watch` videos: reorder, set category (Top Routines / Music Videos / BTS & Press), toggle `featured`.
- Manage sponsors: add/edit/order, upload logos.
- Manage FAQ: add/edit/order.
- Manage tryout cycle: dates, eligibility, signup URL, `active` toggle.
- **Preview button**: opens public site in a new tab with draft content via cookie.

**6. Team Calendar** *(all roles)*
- Embedded view of the shared Google Calendar.
- Member-specific "my events" filter.
- Personal iCal feed URL (one-click copy).

**7. Constitution** *(all members + alumni)*
- View current constitution (markdown rendered, or PDF embed — pick one in §16).
- Version history.
- Officers can propose amendments; president approves to publish a new version.

**8. Alumni Directory** *(members + alumni)*
- Searchable by graduation year, hometown, current city.
- Each alumnus controls their own opt-in/opt-out and contact-permissions.
- Self-service registration with email verification.

**9. Settings** *(President, scoped subsets for other officers)*
- Global ops settings: `auto_send_weekly_survey`, `weekly_survey_day`, `weekly_survey_time`, `default_polling_window_days`, `default_min_couples_required`, `default_response_deadline_days`.
- Email "from" / signature config per officer role.
- Calendar integration (which Google Calendar to write to).
- Webhook secrets, API keys (admin only).

### 4.2 Roles & RBAC

| Role | Granted to | Can read | Can write |
|---|---|---|---|
| `admin` | Build maintainer (you/me, then handed to president) | All | All, including settings & user roles |
| `president` | Current president | All | All except admin-only settings |
| `officer:performance` | PR officer | Members, performances, calendar, site content | Performance management, surveys |
| `officer:lessons` | Lessons officer | Members, lessons, calendar, site content | Lessons management, surveys |
| `officer:webmaster` | Webmaster / social media officer | Members, site content, videos, FAQ | Site content tab |
| `member` | Current team member | Their assignments, calendar, constitution, alumni | RSVP to surveys, edit own bio + photos |
| `alumni` | Verified alumni | Constitution, alumni directory | Edit their own alumni profile |

A user can hold multiple roles (president is usually also an officer of something). Role checks live in Next.js middleware and in API routes; UI hides tabs the user can't access.

### 4.3 Login flow

1. User clicks "Sign in" on `team.aggiewranglers.com`.
2. NextAuth Google OAuth, restricted to `@tamu.edu` at first (configurable).
3. First login: user record created with role `member` and `status = pending_approval`. They land on a "waiting for officer approval" page.
4. President sees a notification on their dashboard, opens Members → Approval queue, grants roles (or rejects with a reason).
5. Alumni use a separate registration path that requires graduation year and a verification step (officer confirms or matches against the members table).

Bootstrap: at launch, we whitelist the current officer slate by email so they can log in immediately without manual approval.

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

- **users**: `email` (unique), `google_sub`, `name`, `avatar_url`, `roles[]` (text[]), `status` (`pending_approval` / `active` / `disabled`), `member_id` (FK → members, nullable for non-member logins)
- **sessions / accounts**: managed by NextAuth tables.
- **audit_log**: who did what when (RBAC-sensitive actions only).

### 6.2 Site content

- **site_settings** (single row): tagline, mission, contact_email, address, socials, `tryouts_open`, `lessons_open`, `homepage_announcement`, `auto_send_weekly_survey`, `weekly_survey_day`, `weekly_survey_time`, `default_polling_window_days`, `default_min_couples_required`, `default_response_deadline_days`, `weekly_digest_day`, `weekly_digest_time`.
- **public_lessons**: `class_name`, `level`, `day`, `start_time`, `end_time`, `dates[]`, `instructor_ids[]`, `signup_url`, `visible_to_public`, `publish_at` (nullable), `active`, `notes`.
- **tryouts**: `cycle_name`, `prep_lesson_dates[]`, `tryout_date`, `eligibility_notes`, `signup_url`, `active`.
- **members**: `name`, `role_title` (display), `class_year`, `hometown`, `major`, `headshot_url`, `partner_photo_url`, `partner_id` (FK self), `bio`, `display_order`, `status` (`current` / `alumni` / `tryout` / `inactive`), `email`, `phone` (private).
- **videos**: `youtube_id`, `title_override`, `display_order`, `category` (enum), `featured`, `source_artist` (for music videos).
- **sponsors**: `name`, `tier`, `logo_url`, `website_url`, `display_order`, `active`.
- **faq**: `question`, `answer` (markdown), `category`, `display_order`.
- **announcements**: `headline`, `body`, `link_url`, `start_date`, `end_date`, `active`.

### 6.3 Operations

- **performance_requests**:
  - intake: `requester_name`, `requester_email`, `requester_phone`, `organization`, `event_date`, `event_time`, `location`, `audience_size`, `performance_type`, `notes`, `urgency` (enum), `needs_answer_by`
  - workflow: `status` (`new` → `under_review` → `ready_to_poll` → `polling` → `threshold_met` / `threshold_not_met` → `confirmed` / `declined` → `completed`), `assigned_officer_id`, `review_notes`, `polling_window_days`, `min_couples_required`, `response_deadline`, `include_in_next_survey`
  - outcome: `confirmation_sent_at`, `gcal_event_id`
- **private_lesson_requests**: same shape, minus `audience_size`, plus `group_size`, `dance_type`, `experience_level`, `preferred_dates`, `price_quoted`, `assigned_instructor_ids[]`.
- **general_inquiries**: intake fields, `auto_reply_sent_at`, `needs_human`, `assigned_to_id`.
- **survey_runs**: `run_at`, `run_type` (`weekly_auto` / `manual`), `triggered_by_id`, `performance_request_ids[]`, `private_lesson_request_ids[]`, `member_count`, `response_count`, `response_deadline`, `notes`.
- **survey_responses**: `survey_run_id`, `member_id`, `target_type` (`performance` / `private_lesson`), `target_id`, `available` (`yes` / `no` / `maybe`), `notes`, `responded_at`. Unique on (survey_run_id, member_id, target_type, target_id).
- **email_drafts**: `created_at`, `draft_type`, `related_type`, `related_id`, `assigned_officer_id`, `gmail_draft_id`, `prefilled_subject`, `prefilled_body`, `sent_at`.

### 6.4 Member-facing

- **constitution_versions**: `version_number`, `title`, `body_markdown`, `pdf_url` (optional), `published_at`, `published_by_id`, `summary_of_changes`.
- **alumni_profiles**: `member_id` (FK), `graduation_year`, `current_city`, `current_role`, `what_im_up_to`, `contact_permission` (enum), `verified_at`, `verified_by_id`.

---

## 7. Public forms & lead capture

Four public forms. Each Vercel Function writes to Postgres and triggers the auto-reply.

| Form | Fields | What happens |
|---|---|---|
| **Performance request** | name, org, event date/time, location, audience size, performance type, notes, **urgency** (default "Standard — 2–3 weeks notice is fine") | Inserts `performance_requests` row, status=`new` → Resend auto-reply with urgency-aware copy → PR officer notified in portal |
| **Private lesson request** | name, email, phone, group size, preferred dates, dance type, experience, notes, **urgency** | Inserts row → auto-reply → lessons officer notified |
| **General contact** | name, email, subject, message | Inserts `general_inquiries` → templated auto-reply, FAQ-aware if the AI is confident, else generic + `needs_human=TRUE` |
| **Newsletter signup** | email | Adds to a simple `newsletter_subscribers` table |

Spam: Cloudflare Turnstile + per-IP rate limit (Upstash).

---

## 8. Operations & automation (inside the portal)

### 8.1 Performance request lifecycle

Same workflow as v2 (review gate → batched weekly survey → threshold check → Gmail draft), now executed inside the portal rather than across Airtable + Vercel Functions.

```
PHASE A: Intake & officer review
[Form] → status=new → auto-reply
[PR officer review tab]:
   - Reject → status=declined → Draft decline email button
   - Need info → email requester (drafted) → keep under_review
   - Approve to poll → status=ready_to_poll
        with overridable: polling_window_days, min_couples_required,
                          include_in_next_survey

PHASE B: Inclusion rules (run at each survey send)
A request goes in a survey for a member IFF:
  1. status ∈ {ready_to_poll, polling}
  2. include_in_next_survey = TRUE
  3. event_date is within polling_window_days from now
  4. that member has no survey_response for this target yet

PHASE C: Survey delivery
[Vercel cron at site_settings.weekly_survey_day/time]
   OR
[Officer clicks "Send survey now"]
   → compute per-member item lists
   → create survey_runs row
   → send ONE consolidated email per member via Resend with a
     signed-token link to their RSVP page (no login required)
   → also exposes the same survey inside the portal for logged-in members

PHASE D: Threshold check
[On response + daily cron at response_deadline]
   yes_count >= min_couples_required          → status=threshold_met
   past deadline & yes too low                → status=threshold_not_met
   → AI drafts confirmation or decline → Gmail draft in officer inbox
   → Officer reviews, sends → status=confirmed / declined
   → On confirmation: write event to Google Calendar with attendees
```

**Officer overrides:**

| Lever | Where | Use case |
|---|---|---|
| `polling_window_days` | per request | Big gig 60 days out: bump to 90. Small local in 4 weeks: leave default. |
| `include_in_next_survey` | per request toggle | "Don't ask this Sunday, still negotiating with requester." |
| `min_couples_required` | per request | Big stage: 8. Small private: 3. |
| `response_deadline` | per request | Quick-answer requests get 48h. |
| Manual add | per request | Pull in something outside the window. |
| `auto_send_weekly_survey` | global | Flip OFF during breaks. |
| `weekly_survey_day` / `time` | global | When the auto-send runs. |

### 8.2 Private lesson request lifecycle

Same review gate + survey inclusion rules. Audience for the survey is the instructor pool, not the whole team. Lessons officer can bypass the survey for low-friction asks (`include_in_next_survey = OFF`, direct DM to one instructor).

### 8.3 General inquiry auto-reply

Templated by default. If AI can map the inquiry to an FAQ entry with confidence, send a richer auto-reply that links the FAQ; otherwise fall back to the generic reply and flag `needs_human`.

### 8.4 Staleness detection (daily cron)

- No `active` public lessons scheduled in next 7 days → ping lessons officer.
- Tryout cycle past date with no new `active` cycle → ping president.
- Performance request stuck in `under_review` >7 days → ping PR officer.
- Polling request past its `response_deadline` → ping PR officer to finalize.
- Sponsor logo or member headshot missing → ping webmaster.

Each alert appears as a banner in the relevant officer's dashboard and as an email if unresolved after 48 hours.

### 8.5 Email policy (unchanged)

Every external email is a *draft* in an officer's Gmail. Auto-replies are the one exception (templated, low-stakes, and acknowledged-not-committal).

---

## 9. Google Calendar integration

**One shared calendar** owned by `wranglers.tamu.edu` (the team's Google Workspace group), edited via a service account.

**Event sources:**
- Confirmed performances → calendar event with start/end, location, description (requester + notes), attendees = members who said Yes.
- Public lesson sessions where `visible_to_public = TRUE` → calendar event with instructor attendees.
- Private lessons confirmed → calendar event with assigned instructor(s).
- Tryout cycle dates → calendar events (no attendees).

**Sync direction:** portal → Calendar (one-way for now). Edits in Google Calendar don't sync back; the portal is source of truth.

**Per-member personalized iCal feed:**
- Each member's dashboard shows a "Subscribe to my schedule" URL.
- The URL is a signed token endpoint that returns an `.ics` feed of only the events that member is assigned to.
- They subscribe once in Apple Calendar / Google Calendar / Outlook and stay in sync forever.

**Weekly digest email (Monday 8 AM CT, configurable):**
- For each `current` member: gather their assigned events for the next 7 days.
- Send a single Resend email: "Here's where you're expected this week — Sat 5/16 wedding in Brenham (3 PM call), Wed 5/20 CW1 class at the building (5:15 PM call)..."
- Members can opt out per-account.

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

**Portal styling:** same palette, more whitespace, denser data tables. shadcn/ui components themed with Aggie maroon as the primary color. The portal feels like a serious internal tool, not a recolored Bootstrap admin.

---

## 12. AI usage

### 12.1 Officer-facing email drafting

Claude API call per draft: system prompt = team tone-of-voice guide (stored in `site_settings`, editable) + structured payload (request details + outcome). Returns subject + body. Vercel Function inserts via Gmail API into the assigned officer's inbox. Pennies per draft. Officer always reviews before send.

### 12.2 Content-marketing assistance

Three ready-to-use prompt templates in the team's Drive (no engineering required):
1. **Polish this announcement** — paste rough notes → homepage announcement + IG caption.
2. **Write a member bio** — paste hometown/major/fun fact → 2-sentence bio in team voice.
3. **Performance recap** — paste event details + photos → recap + caption.

Optional later: an in-portal "draft this for me" button next to bios, announcements, recaps.

### 12.3 Inquiry triage

When a general inquiry comes in, AI checks whether it maps to an FAQ entry. If high confidence: auto-reply with a tailored response linking the FAQ. If low confidence: generic auto-reply + flag for human.

---

## 13. Build phases & timeline

Now ~6–8 weeks of focused work. Each phase is shippable on its own; deliver value continuously.

### Phase 0 — Foundation (3–4 days)
- Repo + Next.js scaffold + Tailwind + shadcn/ui + Drizzle/Prisma.
- Neon Postgres project; schema migrations.
- Vercel project with both domains attached.
- NextAuth + Google OAuth + TAMU domain restriction.
- Bootstrap officer whitelist.
- CI: Vercel previews per PR with branched DB.

### Phase 1 — Public site shell + design system (4–5 days)
- Tailwind theme, typography, component library.
- All legacy URLs in place with hardcoded content.
- Lighthouse target: 95+ across the board.

### Phase 2 — Portal foundation (5–6 days)
- Auth-gated layout, role-aware navigation.
- Dashboard skeleton.
- Members CRUD (with photo uploads to Vercel Blob).
- Site Content CMS tab covering site_settings, FAQ, sponsors, announcements.
- Public site reads from DB; on-demand revalidate via webhook from portal saves.

### Phase 3 — Public forms + auto-replies (2 days)
- Four forms (performance, private lesson, contact, newsletter) writing to DB.
- Resend auto-replies (urgency-aware copy).
- Officer notifications in portal.

### Phase 4 — Performance management + weekly survey (5–7 days)
- Performance Management tab end-to-end.
- Review gate, status transitions, per-request overrides.
- Weekly Vercel cron computes inclusion, sends consolidated emails.
- Member RSVP page (token-based, also accessible logged-in).
- Threshold check + AI email draft + Gmail API integration.

### Phase 5 — Lessons management + scheduling (4–5 days)
- Public sessions: schedule semester ahead, visibility toggle, publish_at.
- Private lesson workflow (review → optional survey → assignment → quote → draft).
- Instructor pool management.

### Phase 6 — Calendar integration + weekly digest (3–4 days)
- Service-account Google Calendar writes.
- Per-member iCal feed.
- Monday weekly digest cron.

### Phase 7 — Member resources (3 days)
- Constitution viewer + versioning.
- Alumni directory + self-registration + verification flow.

### Phase 8 — `/watch` + homepage polish (1–2 days)
- Three video subsections from DB.
- Music Videos seeded with Midland / Randy Rogers / Ella Langley.
- 4-CTA hero, featured video, announcement banner.

### Phase 9 — SEO migration + launch (2–3 days)
- Redirects, sitemap, structured data, OG images.
- Stage on `staging.aggiewranglers.com` for officer review.
- DNS cutover during low-traffic window.
- Search Console verification.

### Phase 10 — Officer handoff (2 days)
- Loom recordings per officer role.
- Printable cheat sheets.
- Documented OAuth re-consent process for officer transitions.

**Total: ~6–8 weeks** of focused work, parallelizable across phases that don't depend on each other (e.g., Phases 4 and 5 are parallel).

---

## 14. Costs

| Service | Tier | Monthly |
|---|---|---|
| Vercel | Pro (likely needed for the portal + cron + functions) | $20 |
| Neon Postgres | Free tier (3 GB, 100 hr compute/mo) — pay $19 if we outgrow | $0–$19 |
| Vercel Blob | First 1 GB free | $0 |
| Upstash Redis | Free tier | $0 |
| Resend | Free 3k/mo, $20 for 50k | $0–$20 |
| Gmail API | Free | $0 |
| Google Calendar API | Free | $0 |
| Cloudflare Turnstile | Free | $0 |
| Claude API (drafts + FAQ triage) | Pay-as-you-go | ~$2–$10 |
| Domain renewal | Existing | ~$1 |
| **Total ongoing** | | **~$23–$70/mo** |

Realistic baseline: **~$25–$30/mo**. Worst case at scale: ~$70/mo. Big jump from v2 but justified by the operational leverage.

---

## 15. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Scope creep — portal becomes never-ending | Strict phase gates; portal ships in stages, each is independently useful. |
| Maintenance burden across officer transitions | Yearly handoff docs; admin role transferred at officer turnover; clear "you can disable the portal and still run a public site" exit. |
| SEO drop during migration | 1:1 redirect map; preserve titles/H1s; stage and verify in Search Console. |
| Bad DB migration breaks portal *and* site | Migrations gated on staging; preview deploys use branched DB; nightly DB backups (Neon includes branching). |
| Officer Gmail OAuth expires | Yearly re-consent reminder via cron; new officer onboarding doc includes step. |
| AI drafts tone-deaf email | Drafts only — officer reviews before send. |
| Form spam | Turnstile + honeypot + rate limit. |
| Photo/video rights | Audit at Phase 0; flag anything not clearly team-owned. |
| Survey email fatigue | Once/week max, opt-out per member, no per-request blasts. |
| Calendar integration drift (member edits in GCal that don't reflect in portal) | Portal is source of truth; document this to officers; consider 2-way sync only if real demand emerges. |
| Vendor lock-in (Neon, Vercel) | Standard Postgres + standard Next.js — both portable. Yearly DB export to a Drive folder for paranoid backup. |
| Team abandons updating again | Daily staleness cron pings the right officer proactively; "publish on date X" feature lets officers batch work. |

---

## 16. Open questions for the team

1. **Officer point person & admin successor.** Who owns the system and who inherits admin if they graduate?
2. **Communication channel for the team.** GroupMe / iMessage / Discord? (For sharing survey links and informal coordination.)
3. **Performance availability defaults.** "Enough" = 4 couples? Varies by performance type?
4. **Weekly survey defaults.** Day/time for auto-send? Default polling window? Default response deadline?
5. **Urgency policy.** Does "Quick answer needed" bump into the *next* survey regardless of day-of-week, or just shorten the response deadline?
6. **Weekly digest day/time.** Monday 8 AM CT a good default?
7. **Constitution format.** Markdown rendered in-app (with version diffs) or PDF embed?
8. **Alumni verification.** Who confirms an alumni signup is legit — president? A dedicated alumni officer? Match against members table?
9. **Auth domain.** Restrict to `@tamu.edu` only, or also allow `@gmail.com` for alumni who've graduated and lost their TAMU email?
10. **Flywire URL stability.** Do public-lesson signup URLs change every semester?
11. **Banquet.** Permanent page or one that goes live in the weeks before each year's banquet?
12. **Merchandise.** Keep external store or build embedded gallery?
13. **Email "from" address.** Drafts come from `president@`, individual officers, or a shared `bookings@` alias?
14. **Calendar ownership.** New shared `wranglers.tamu.edu` calendar, or reuse an existing one?

---

## 17. What "done" looks like

**Public site:**
- [ ] All legacy URLs respond 200 with content matching or improving on the old site.
- [ ] Four primary CTAs visible above the fold on mobile.
- [ ] `/watch` shows Top Routines, Music Videos (Midland / Randy Rogers / Ella Langley seeded), and Behind the Scenes.
- [ ] Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO on `/`.
- [ ] Search Console shows no new 404s after 14 days post-launch.

**Public forms:**
- [ ] All four forms write to DB, fire urgency-aware auto-replies, and surface in the portal for the right officer.

**Team portal:**
- [ ] Officers can sign in with Google (TAMU domain restricted); president approves new members.
- [ ] Performance Management: review gate works, weekly survey auto-sends on schedule, per-request overrides work, confirmation/decline drafts land in officer Gmail.
- [ ] Lessons Management: a semester of public sessions can be scheduled in advance and published on a chosen date; private lesson workflow produces quote drafts.
- [ ] Members CRUD with photo uploads.
- [ ] Site Content tab: officers can update homepage, FAQ, sponsors, videos, tryout cycle without code.
- [ ] Constitution and alumni directory visible to authenticated members.

**Calendar & comms:**
- [ ] Confirmed performances and active lessons appear in the shared Google Calendar with attendees.
- [ ] Each member can subscribe to their personal iCal feed.
- [ ] Weekly digest email goes out Monday mornings with personal upcoming events.

**Operations:**
- [ ] Daily staleness cron is live and has sent at least one nudge in testing.
- [ ] Officer handoff Loom videos delivered per role.
