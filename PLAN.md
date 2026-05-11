# Aggie Wranglers Website Redesign Plan

> Replatform aggiewranglers.com off Wix into a modern, low-maintenance, conversion-focused site backed by **Airtable** as the CMS so the team can keep content current — and automate the operational workflows (performance bookings, private lesson requests, team availability polling) that today eat hours of officer time every week.

**Stack at a glance:** Astro on **Vercel** · **Airtable** for content and ops · Vercel Functions for forms, automation, and webhooks · Resend + Gmail API for outbound email.

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
- No first-class YouTube presence even though the team's video content is one of their biggest assets — including major music-video features (Midland *"Burnout,"* Randy Rogers Band *"I'll Never Get Over You,"* Ella Langley *"Choosin' Texas"*)

### Why the team can't keep it current today

Wix's editor requires logging into a shared account, navigating a WYSIWYG, and remembering where each field lives. There's no one designated for it, so it rots. The fix is **not** to find a more committed maintainer — it's to make updates take 30 seconds in a tool that feels familiar (a spreadsheet-style grid with photo drag-and-drop).

---

## 2. Goals & non-goals

### Goals

1. **Four conversion paths**, prioritized in this order:
   1. Sign up for **public lessons**
   2. Get current info & get hyped about **tryouts**
   3. Request a **performance**
   4. Request a **private lesson**
2. **Spreadsheet-easy content management** for everything that changes more than once a year (lesson schedule, tryout dates, roster + member photos, YouTube playlist, sponsors, FAQ, announcements).
3. **Automate the team's operational workflows** that the website touches:
   - Performance request → team availability poll → confirm-or-decline draft email
   - Private lesson request → assign instructor → confirmation draft email
   - General inquiry → instant templated auto-reply
4. **Preserve every existing URL** so SEO equity transfers.
5. **Visually polished, on-brand** (Aggie maroon + white, modern typography, real photos, video-first).
6. **Cheap to run** ($0–$25/mo) and easy to hand off to future officer slates.
7. **AI-assisted content + email drafting** so officers paste rough notes and get publish-ready output.

### Non-goals (intentionally out of scope)

- Member portal / login (still email + Google Drive for internal stuff)
- Native app
- E-commerce (merch can keep pointing to existing store)
- Replacing Flywire lesson signup or the current payment processor
- Migrating banquet RSVP infra (low-volume, can stay as-is)
- Sending outbound emails *without* officer review — every external-facing email is drafted, not auto-sent

---

## 3. Recommended architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Airtable workspace "Aggie Wranglers"                            │
│  ┌────────────────────────┐  ┌────────────────────────────────┐ │
│  │ Base: Website CMS      │  │ Base: Operations               │ │
│  │  - members             │  │  - performance_requests        │ │
│  │  - public_lessons      │  │  - private_lesson_requests     │ │
│  │  - tryouts             │  │  - general_inquiries           │ │
│  │  - videos              │  │  - availability_polls          │ │
│  │  - sponsors            │  │  - availability_responses      │ │
│  │  - faq                 │  │  - email_drafts                │ │
│  │  - announcements       │  │                                │ │
│  │  - site_settings       │  │                                │ │
│  └────────────────────────┘  └────────────────────────────────┘ │
│  Edited by: officers (Airtable web + mobile, photos drag/drop)   │
└────────────────┬─────────────────────────────────────────────────┘
                 │  Airtable webhooks on record change
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  Astro site on Vercel (aggiewranglers.com)                       │
│                                                                  │
│  Pages (ISR, revalidate on Airtable webhook):                    │
│   /, /public-lessons, /private-lessons, /requirements,           │
│   /performance-request, /private-lesson-request, /watch, ...     │
│                                                                  │
│  API routes (Vercel Functions):                                  │
│   POST /api/forms/performance-request                            │
│   POST /api/forms/private-lesson-request                         │
│   POST /api/forms/general-contact                                │
│   POST /api/availability/start         (officer triggers poll)   │
│   POST /api/availability/respond       (member RSVPs)            │
│   POST /api/availability/finalize      (compute & draft email)   │
│   POST /api/webhooks/airtable          (revalidate ISR pages)    │
│   GET  /api/cron/staleness-check       (daily, see §7)           │
│                                                                  │
│  Storage: Vercel KV for rate limiting + cache; Airtable for data │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  Email layer                                                     │
│   - Resend: instant transactional (auto-replies, RSVP links)     │
│   - Gmail API: creates DRAFTS in officer mailboxes for human     │
│     review before sending external confirmations / declines      │
└──────────────────────────────────────────────────────────────────┘
```

### Why this stack (and the changes from v1)

| Concern | Choice | Reason / what changed |
|---|---|---|
| Hosting | **Vercel** | Per your call. Native Astro/Next support, ISR + on-demand revalidation, easy serverless functions, generous Hobby tier. |
| Framework | **Astro** | Content-heavy, mostly static, ships ~0 JS by default. Could swap to Next if we want React for the officer-facing dashboards — but Astro pages can mount React islands where needed, so we get both. |
| Styling | **Tailwind CSS** | Fastest way to enforce the Aggie design system consistently. |
| **CMS** | **Airtable** (changed from Google Sheets) | See decision matrix below. |
| Caching / KV | **Vercel KV** (Upstash) | Rate limiting + dedup of webhook events; Airtable is the source of truth. |
| Forms | **Vercel Functions → Airtable + Resend** | Forms write a row to Airtable Operations base AND fire instant auto-reply via Resend. |
| Confirmation emails | **Gmail API drafts** | Drafts land in the officer's Gmail Drafts folder, prefilled with details from the request — they review and hit send. No risk of the bot speaking on behalf of the team. |
| Spam | **Cloudflare Turnstile** (free even off-Cloudflare) | Invisible captcha on each public form. |
| Analytics | **Vercel Web Analytics** | Free privacy-friendly tier; or swap Plausible for $9/mo if we want more. |
| Domain | Keep `aggiewranglers.com` | Update DNS to Vercel; preserve TAMU subdomain reference if used elsewhere. |

### CMS decision: Airtable vs Google Sheets vs Notion

You asked whether Sheets/Drive is the right call. I think no — **Airtable is the better fit** specifically because of images and ops workflows.

| | Google Sheets + Drive | Airtable | Notion |
|---|---|---|---|
| Spreadsheet-like familiarity | ✅ Best | ✅ Very close | ❌ Doc-like |
| Images / member headshots | ❌ URL strings → Drive | ✅ **Native attachment field, drag & drop** | ✅ Inline |
| Mobile editing UX | 😐 Awkward | ✅ Purpose-built mobile app | ✅ Good |
| Structured fields (dates, links, dropdowns) | 😐 Free-text, easy to break | ✅ Typed fields, validation | ✅ Typed fields |
| Built-in forms (for internal availability polls) | ❌ Google Forms is separate | ✅ One click | 😐 Limited |
| Built-in automations (email on new row, etc.) | 😐 Apps Script | ✅ No-code automations | ❌ Needs API |
| Views (Calendar for events, Kanban for requests) | ❌ | ✅ | ✅ |
| Free tier covers AW volume? | ✅ Yes | ✅ Yes (1,000 records/base, 1GB attachments) | ✅ Yes |
| Cost if we outgrow it | $0 | $20/seat/mo | $10/seat/mo |
| Risk if vendor changes pricing | None | Some | Some |

**Recommendation: Airtable**, with one mitigation — we keep a nightly export of all bases to a Google Drive folder owned by the team's `wranglers.tamu.edu` group, so we can fall back to Sheets in days if needed. Airtable's free plan (1,000 records per base) is plenty for this team's needs (~30 members, dozens of videos, dozens of sponsors, ~50 active form submissions/yr). Headshots and partner photos drop straight into attachment fields with no Drive juggling.

If you have a strong preference for Sheets despite the above (e.g., team is uneasy about a new SaaS), the architecture still works — we'd just lose the native image fields and have to recreate the no-code automations as Apps Script triggers. Worth ~3–5 extra days of build time.

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

**`/watch` (new) — the team's videos as a real funnel.**

Three subsections, all reorderable from Airtable's `videos` table via the `category` and `display_order` fields:

1. **Top Routines** — fan-favorite live performances.
2. **Music Videos We've Been In** — featured artist appearances. Seeded with:
   - Midland — *Burnout*
   - Randy Rogers Band — *I'll Never Get Over You*
   - Ella Langley — *Choosin' Texas*
3. **Behind the Scenes / Press** — practice clips, news features (KBTX, Maroon Magazine), Yell Leaders crossover, etc.

Each video card has a "Want to dance like this? → Public Lessons" CTA underneath, closing the loop from "saw a cool video" to "signed up for a class."

**Homepage layout** (above the fold, mobile-first):

1. Hero image/video loop + tagline.
2. **Four CTAs** in a 2×2 mobile / 4-across desktop grid, weighted by visual prominence:
   - **Sign up for Lessons** (largest)
   - **Tryouts** (state-aware: "Tryouts open!" badge when active)
   - **Request a Performance**
   - **Request a Private Lesson**
3. Next public-lesson session card (pulled live from Airtable — "Next class: Wed Feb 18, 5:30 PM at our building").
4. Featured video (top of `videos` table where `featured = TRUE`).
5. Quick proof: recent performances / press (Ella Langley music video, KBTX feature).
6. Social strip + email signup.

---

## 5. Airtable schema

Two bases, separating "what the public sees" from "what officers operate on."

### Base 1: **Website CMS**

**`site_settings`** (single record)
- contact_email, address, tagline, mission_statement, instagram_url, tiktok_url, youtube_channel_url, facebook_url, x_url, tryouts_open (toggle), lessons_open (toggle), homepage_announcement
- **auto_send_weekly_survey** (toggle, default ON)
- **weekly_survey_day** (single-select Sun–Sat, default Sunday)
- **weekly_survey_time** (time, default 6:00 PM CT)
- **default_polling_window_days** (number, default 30) — how far into the future event_date can be and still be eligible for the survey
- **default_min_couples_required** (number, default 4) — applied to new performance requests as a starting threshold
- **default_response_deadline_days** (number, default 5) — how long members have to respond after a survey goes out

**`public_lessons`** (one row per class session)
- class_name, level (single-select: CW1/CW2/Jitt1/Jitt2), day, start_time, end_time, dates (multiple dates), instructors (link → members), signup_url (Flywire), active (toggle), notes

**`tryouts`** (one row per cycle)
- cycle_name (e.g., "Spring 2027"), prep_lesson_dates, tryout_date, eligibility_notes, signup_url, active

**`members`** (current team + pipeline)
- name, role (single-select: President, VP, Performance Officer, Lessons Officer, Captain, Member, ...), class_year, hometown, major, **headshot** (attachment), **partner_photo** (attachment), partner (link → members), bio, display_order, status (single-select: Current, Alumni, Tryout)

**`videos`**
- video_id (YouTube ID), title_override (optional), display_order, **category** (single-select: Top Routines, Music Videos, Behind the Scenes & Press), featured (toggle for homepage), source_artist (text — for music videos)

**`sponsors`**
- name, tier (single-select: Title, Gold, Silver, Partner), **logo** (attachment), website_url, display_order, active

**`faq`**
- question, answer (long text, markdown), category (single-select), display_order

**`announcements`**
- headline, body, link_url, start_date, end_date, active

### Base 2: **Operations**

**`performance_requests`** — one row per inbound form
- created_at, requester_name, requester_email, requester_phone, organization, event_date, event_time, location, audience_size, performance_type, notes
- **urgency** (single-select: *Standard — 2–3 weeks notice is fine* / *Quick answer needed* / *Hard deadline*) — set by the requester on the intake form
- **needs_answer_by** (date, optional) — only populated when urgency ≠ Standard
- **status** (single-select: *New* → *Under Review* → *Ready to Poll* → *Polling* → *Threshold Met* / *Threshold Not Met* → *Confirmed* / *Declined* → *Completed*)
- **polling_window_days** (number, default = `site_settings.default_polling_window_days`) — only included in surveys when `event_date` is within this many days of "now." PR officer can override per-request (e.g., bump to 90 for a high-profile bowl game way out).
- **include_in_next_survey** (toggle, default ON when status = Ready to Poll) — manual override to skip a specific request in the upcoming survey without changing its status
- **min_couples_required** (number, default = `site_settings.default_min_couples_required`)
- **response_deadline** (date — computed when first added to a survey)
- **assigned_officer** (link → members)
- **review_notes** (long text — PR officer's internal notes from the review step)
- **poll** (link → availability_polls)

**`private_lesson_requests`**
- created_at, requester_name, email, phone, group_size, preferred_dates, dance_type, experience_level, notes
- **urgency** (single-select: *Standard* / *Quick answer needed* / *Hard deadline*)
- **needs_answer_by** (date, optional)
- **status** (single-select: *New* → *Under Review* → *Ready to Poll* → *Polling* → *Assigned* → *Confirmed* / *Declined* → *Completed*)
- **polling_window_days** (number, default from `site_settings`)
- **include_in_next_survey** (toggle, default ON when status = Ready to Poll)
- **response_deadline** (date)
- **assigned_instructors** (link → members)
- **price_quoted**
- **review_notes** (long text)

**`general_inquiries`**
- created_at, name, email, subject, message, auto_reply_sent (toggle), needs_human (toggle), assigned_to (link → members)

**`availability_polls`** (one per performance request that needs polling)
- request (link → performance_requests), poll_url_token, deadline, min_couples_required, status (Open / Met / Did Not Meet / Closed)

**`availability_responses`**
- poll (link → availability_polls), member (link → members), available (single-select: Yes / No / Maybe), notes, responded_at

**`survey_runs`** — one row per weekly batch or ad-hoc send
- run_at, run_type (single-select: *Weekly auto* / *Manual*), triggered_by (link → members), included_performance_requests (link), included_private_lesson_requests (link), member_count, response_count, response_deadline, notes

**`email_drafts`** (audit trail of what we drafted into Gmail)
- created_at, draft_type (Confirmation / Decline / Quote / Follow-up), related_request, gmail_draft_id, prefilled_subject, prefilled_body, sent (toggle, updated by Gmail webhook)

The Operations base also gets two **Airtable Interfaces** (no-code dashboards): "Performance Officer Dashboard" and "Lessons Officer Dashboard" — Kanban boards over `performance_requests` and `private_lesson_requests` respectively, so officers don't have to learn the raw tables.

---

## 6. Forms & lead capture

Four public-facing forms, each a Vercel Function:

| Form | Fields | What happens |
|---|---|---|
| **Performance request** | name, org, event date/time, location, audience size, performance type, notes, **urgency** (radio, default "Standard — 2–3 weeks notice is fine"; "Quick answer needed" reveals a `needs_answer_by` date field) | Writes to `performance_requests` (status=*New*) → templated auto-reply via Resend that reflects the requester's urgency choice → notifies performance officer → enters review queue (§7.1) |
| **Private lesson request** | name, email, phone, group size, preferred dates, dance type, experience, notes, **urgency** (same as above) | Writes to `private_lesson_requests` (status=*New*) → auto-reply → notifies lessons officer (§7.2) |
| **General contact** | name, email, subject, message | Writes to `general_inquiries` → fires AI-assisted auto-reply that reflects what the user asked about (§7.3) → flags `needs_human` if AI can't answer |
| **Newsletter signup** | email | Adds to a simple list (Mailchimp free, or just an Airtable table to start) |

Public lessons themselves continue to use Flywire — we just surface the Flywire URLs from Airtable. No payment-flow rebuild.

Spam: Cloudflare Turnstile (free, invisible) + per-IP rate limit in Vercel KV.

---

## 7. Operations & automation workflows

This section is the biggest delta from v1 and the biggest leverage for the team.

### 7.1 Performance request → review → batched weekly survey → confirm-or-decline

The workflow has four distinct phases. Each one's behavior is overridable per-request by the PR officer.

```
PHASE A: Intake & officer review (manual gate)
─────────────────────────────────────────────
[Site form submitted, including urgency choice]
       │
       ▼
[Airtable: performance_requests.status = "New"]
       │
       ├──► Auto-reply to requester (reflects urgency: "we usually respond
       │    in 2–3 weeks" vs. "we'll prioritize this and get back fast")
       │
       └──► PR officer notified; opens dashboard
              │
              ▼
       [PR officer reviews each new request and decides:]
         · Reject outright   → status = Declined → draft decline email
         · Need more info    → email requester (drafted) → keep at Under Review
         · Approve to poll   → status = Ready to Poll
              │
              │  When approving, officer confirms or overrides:
              │   - polling_window_days   (default 30)
              │   - min_couples_required  (default 4)
              │   - include_in_next_survey (default ON)
              ▼

PHASE B: Inclusion rules (automatic, every survey send)
───────────────────────────────────────────────────────
A performance request is INCLUDED in a survey send IFF all are true:
  1. status ∈ { Ready to Poll, Polling }
  2. include_in_next_survey = TRUE
  3. event_date is within polling_window_days from "now"
  4. (per member) that member has no availability_response for this request yet

PHASE C: Survey delivery (weekly auto or manual ad-hoc)
──────────────────────────────────────────────────────
[Weekly Vercel cron at site_settings.weekly_survey_day/time]
   OR
[PR officer clicks "Send survey now" in dashboard]
       │
       │  (if auto): only runs when site_settings.auto_send_weekly_survey = ON
       │
       ▼
[Compute, per member, the list of requests that pass Phase B]
[Also include any one-offs the officer explicitly added to this run
 via "Add to next survey" — bypasses the window rule for special cases]
       │
       ▼
[Create one survey_runs row; for each member with ≥1 item, send ONE email
 with a tokenized link to their consolidated survey page]
       │
       ▼
[Member opens link → sees every open request they haven't answered yet
 → marks Yes/No/Maybe (+optional notes) for each → submits once]
       │
       ▼
[POST /api/availability/respond writes one availability_responses row per item;
 each performance_request flips to status = Polling on first response]

PHASE D: Threshold check → email draft (per-request)
────────────────────────────────────────────────────
[After each response AND on a daily cron at response_deadline]
       │
       ▼
[For each request currently in Polling:]
   yes_count >= min_couples_required          → status = Threshold Met
   past response_deadline & yes_count too low → status = Threshold Not Met
       │
       ▼
[Gmail draft created in PR officer's inbox:
   - Threshold Met   → CONFIRMATION draft (requester details + who's attending + next steps)
   - Threshold Not Met → POLITE DECLINE draft (apology + invitation to ask again)
 Officer reviews, edits, sends. On send → status flips to Confirmed / Declined.]
```

**Why batched & weekly, not per-request:** members get pinged at most once a week, so they don't tune out. One email, one click, all open performances in one place. The PR officer can still hit "Send now" any week for urgent items.

**Per-request overrides the PR officer can use:**

| Lever | Where it lives | Use case |
|---|---|---|
| `polling_window_days` | per request | High-profile gig 2 months out: bump to 90 to start gathering availability early. Tiny local request 6 weeks out: leave default, it'll auto-include later. |
| `include_in_next_survey` | per request, toggle | "Skip this one for the upcoming Sunday survey, I'm still waiting on the requester to confirm details." |
| `min_couples_required` | per request | Big stage performance: bump to 8. Small private event: drop to 3. |
| `response_deadline` | per request | Quick-answer requests get a tight 48h deadline. |
| Manual add to survey | per request, button | Pull in something just outside the window because the officer wants to ask anyway. |

**Global toggles** (in `site_settings`, editable by officers without code):

- `auto_send_weekly_survey` — flip OFF during slow periods (summer break, exam weeks) so no robotic emails go out.
- `weekly_survey_day` / `weekly_survey_time` — when the auto-send happens.
- `default_polling_window_days` / `default_min_couples_required` / `default_response_deadline_days` — defaults applied to new requests at approval time.

**Why drafts not auto-send:** the team's voice and judgment are part of their brand. The system saves the 90% of work (collecting availability, looking up requester details, drafting standard language) but the officer signs off on every external email.

**Draft generation:** Claude API call with a system prompt that includes the team's tone-of-voice guide + the request payload + the poll outcome. Returns subject + body. Vercel Function calls Gmail API (`users.drafts.create`) to insert the draft into the assigned officer's mailbox. OAuth happens once per officer at onboarding.

**Member survey UX:** mobile-friendly, no login. Each member's link is a signed token bound to their member record. The page renders something like:

```
Hey Sarah — here's this week's availability check.
You have 3 open performances to weigh in on. Deadline: Fri 5/15.

──────────────────────────────────────────────────
1. Wedding reception · Sat May 23, 7 PM · Brenham, TX
   Audience ~150. Performance type: full show.
   Notes from PR officer: "Easy gig, 1hr drive."
   [ ✅ Yes  ❌ No  🤔 Maybe ]  Optional notes: ___________

2. Aggie Mom's Club gala · Fri Jun 6, 8 PM · College Station
   ...

3. Corporate event · Thu Jun 19, 6 PM · Houston
   ...

[ Save all responses ]
```

### 7.2 Private lesson request → review → instructor availability → quote → confirm

Same review gate and survey mechanics as performance, but the audience is small (instructor pool, not the whole team).

```
PHASE A: Intake & officer review
[Site form, including urgency] → status = New
       → Auto-reply to requester (urgency-aware copy)
       → Lessons officer reviews:
            · Reject outright   → status = Declined → draft decline
            · Approve to poll   → status = Ready to Poll, set polling_window_days

PHASE B–C: Inclusion in weekly survey
Same rules as §7.1, but the consolidated weekly email to each member
shows BOTH performances and private lessons that pass the rules.
The "Add to next survey" button works the same way.
Lessons officer can also bypass the survey and directly DM 1–2 instructors
when it's a small, low-friction request — toggle `include_in_next_survey = OFF`
and the system stays out of the way.

PHASE D: Assignment & quote
Once a Yes response comes in (or officer assigns directly):
       → status = Assigned, lessons officer sets price_quoted
       → Click "Draft confirmation"
       → Gmail draft: confirmation w/ price, instructor names, location,
         what to bring, payment instructions
       → Officer reviews + sends → status = Confirmed
```

**Same urgency lever on the intake form** (Standard / Quick answer / Hard deadline). The auto-reply copy adapts: a "Quick answer" request gets a confirmation that it's been flagged and someone will be in touch shortly, while a Standard one sets expectations for 2–3 weeks.

### 7.3 General inquiry auto-reply (good business practice)

Two-tier:

1. **Instant templated reply** ("Thanks — we received your message about `<subject>` and will respond within 3–5 business days. Common questions are answered at /faq.").
2. **AI-augmented suggestion** for the officer: when the inquiry maps cleanly to an FAQ entry, the system sends a richer auto-reply that links the relevant FAQ + offers next steps. If the AI isn't confident, it falls back to the templated reply and flags `needs_human = TRUE` in Airtable.

### 7.4 Daily staleness check (preventive, not reactive)

A Vercel Cron job runs nightly:

- If no `public_lessons` rows are `active` and any session date is < 7 days from now → email officers "Looks like the public lesson schedule may be out of date."
- If `tryouts.tryout_date` has passed and no new cycle is `active` → email officers "Time to set up next year's tryout cycle."
- If `announcements` has `end_date` in the past → auto-archive.

This is the antidote to the current "no one notices the site is stale" problem.

### 7.5 What still requires a human

To set expectations clearly:

- Every external email goes out as a **draft**, reviewed by an officer.
- Initial OAuth for Gmail is per-officer and needs re-consent yearly.
- Setting `min_couples_required`, the poll deadline, and the assigned officer is manual per request (sensible defaults provided).
- Accepting/declining is the officer's call — the system computes "you have enough yes responses," not "the answer is yes."

---

## 8. SEO migration plan

This is the most failure-prone part of any replatform, so it gets its own checklist.

- [ ] Crawl current site (Screaming Frog free tier or `wget --mirror`) → export every URL, title, meta description, H1.
- [ ] Map every legacy URL 1:1 to a new URL. If a path changes, add a 301 in `vercel.json` redirects.
- [ ] Preserve `<title>`, meta description, and primary H1 wording on each page during launch; iterate after.
- [ ] Generate `sitemap.xml` and `robots.txt` at build.
- [ ] Add JSON-LD structured data: `Organization`, `Event` (for tryouts/lessons), `VideoObject` (for YouTube embeds), `FAQPage` for `/faq`.
- [ ] Open Graph + Twitter card images per page (auto-generated via Satori at build).
- [ ] Verify in Google Search Console before flipping DNS; re-submit sitemap after.
- [ ] Keep TAMU/Maroon Link/`thebatt.com` backlinks intact — they point to the apex, which we keep.
- [ ] Monitor Search Console for 404s for 30 days post-launch.

---

## 9. Design system

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

- `<CTAButton variant="primary|secondary">` — the workhorse for the four CTAs.
- `<HeroCTAGrid>` — 2×2 mobile / 4-across desktop, state-aware ("Tryouts open!" badge).
- `<LessonCard>` (renders from `public_lessons` row).
- `<TryoutCallout>` — state-aware: "Tryouts open" / "Tryouts closed — next cycle in...".
- `<MemberCard>` with headshot + partner photo + bio.
- `<VideoCard>` + `<VideoSection>` (used three times on `/watch`).
- `<SponsorRow>`, `<FAQItem>`, `<AnnouncementBanner>`.
- `<RequestForm>` — shared structure, swap fields per type.
- `<AvailabilityResponseCard>` — the member-facing RSVP page (§7.1).

---

## 10. AI usage

Two distinct surfaces:

### 10.1 Officer-facing: email drafting

The thing we'd never want to skip a human on. Claude API call per draft (cheap — pennies per draft) takes the request payload + poll outcome + voice guide and returns a subject + body. Drafts go into Gmail for review. Voice guide lives in Airtable's `site_settings` so officers can refine it over time without code changes.

### 10.2 Content-marketing assistance (no engineering required)

Three ready-to-use prompt templates the team keeps in their Drive:

1. **"Polish this announcement"** — paste rough notes, get a homepage announcement + Instagram caption.
2. **"Write a member bio"** — paste hometown/major/fun fact, get a 2-sentence bio in team voice.
3. **"Performance recap"** — paste event details + a few photos, get a recap for the announcements tab + a social caption.

Optional later: a `/api/draft` endpoint that lets an officer paste notes into an Airtable field and get AI-drafted copy back into an adjacent field.

---

## 11. Build phases & timeline

Each phase is shippable on its own. Now ~4 weeks of focused work given the added automation scope.

### Phase 0 — Setup & content audit (2–3 days)
- Repo scaffold (Astro + Tailwind + Vercel CLI).
- Vercel project + preview deploys + custom domain on a staging subdomain.
- Crawl current site, export full content inventory.
- Asset audit (photos/videos), flag rights gaps.
- Create the two Airtable bases with the §5 schema; seed with current data.

### Phase 1 — Design system + static skeleton (3–5 days)
- Tailwind theme, typography, component library.
- Build every legacy page with hardcoded content; all URLs in place.
- Lighthouse target: 95+ across the board.

### Phase 2 — Airtable CMS wiring (3–4 days)
- Airtable API client + typed schema.
- Astro pages fetch at build via getStaticPaths/getStaticProps equivalent.
- Airtable webhook → POST `/api/webhooks/airtable` → on-demand revalidation per affected route.
- Image handling: proxy attachment URLs through `/api/img/[id]` with caching, or pre-fetch at build.

### Phase 3 — Public forms + auto-replies (2 days)
- Three form endpoints with Turnstile + rate limit.
- Resend templated auto-replies.
- Airtable rows created with correct status/assignment.

### Phase 4 — `/watch` page + homepage polish (1–2 days)
- Three video subsections with reorderable playlist from Airtable.
- Music Videos section seeded with Midland, Randy Rogers, Ella Langley.
- Homepage 4-CTA grid + featured video + announcement banner.
- OG image generation for shareable links.

### Phase 5 — Operations automation (4–6 days, the big one)
- Performance availability poll workflow end-to-end (§7.1).
- Member RSVP page.
- Gmail OAuth flow for officers + draft creation.
- Private lesson workflow (§7.2).
- AI auto-reply for general inquiries (§7.3).
- Airtable Interfaces for officer dashboards.
- Daily staleness cron (§7.4).

### Phase 6 — SEO migration + launch (2–3 days)
- Full redirect map, sitemap, structured data.
- Stage on `staging.aggiewranglers.com` for current officers to review.
- DNS cutover during low-traffic window (summer break).
- Search Console + Analytics verification.

### Phase 7 — Officer handoff (1–2 days)
- Loom recordings for each officer role: lessons officer, performance officer, president.
- One-page printable cheat sheet pinned to each Airtable interface.
- Documented OAuth re-consent process for new officer slates.

**Total: ~4 weeks of focused work**, easily parallelizable.

---

## 12. Costs

| Service | Tier | Monthly |
|---|---|---|
| Vercel | Hobby (sufficient) or Pro if we want more bandwidth | $0 or $20 |
| Airtable | Free (1k records/base, 1GB attachments) | $0 |
| Vercel KV (Upstash) | Free tier | $0 |
| Resend | Free (3k emails/mo) | $0 |
| Gmail API | Free | $0 |
| Cloudflare Turnstile | Free | $0 |
| Claude API (email drafts) | Pay-as-you-go, est. <500 calls/mo | ~$1–$5 |
| Domain renewal | Existing | ~$1 |
| **Total ongoing** | | **~$2–$25/mo** |

If Airtable's free tier becomes constraining (most likely if attachments grow past 1GB), the Team plan is $20/seat/mo and we'd only need 1–2 seats since most officers can use the public Interfaces without a paid seat.

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| SEO drop during migration | Strict 1:1 redirect map; preserve titles/H1s; pre-stage and verify in Search Console |
| Airtable changes pricing or shuts free tier | Nightly export to Drive (Sheets format); architecture is CMS-agnostic — swap in 1–2 days |
| Bad Airtable row breaks the site | API client validates schema; falls back to last-known-good cached data; never 500s the page |
| Officer Gmail OAuth expires / officer graduates | Yearly re-consent reminder via cron; new officer onboarding doc includes OAuth step |
| AI drafts a tone-deaf email | Drafts only — officer always reviews before send |
| Form spam | Cloudflare Turnstile + honeypot + rate limit per IP |
| Photo/video rights | Audit existing assets at Phase 0; flag anything that's not clearly team-owned |
| Officer transitions lose access | Airtable workspace owned by `wranglers.tamu.edu` group, not an individual; service account credentials in the team's secure password manager; documented in handoff docs |
| Availability poll URL leaks | URL is a signed token tied to a specific member; non-recognized tokens get a generic "ask the officer for your link" page |
| Team abandons updating again | Updates are 1 cell or 1 photo drop; cheat sheet + 90-sec videos; daily staleness cron warns officers proactively |

---

## 14. Open questions for the team

Things to confirm before Phase 1:

1. **Officer point person.** Who owns the Airtable workspace and serves as primary site contact?
2. **Communication channel for the team.** GroupMe, iMessage, Discord? (Determines how poll URLs get shared — manual paste vs. integration.)
3. **Performance availability defaults.** What's "enough" — 4 couples? 6? Does it vary by performance type?
4. **Weekly survey defaults.** What day/time should the auto-send run (Sunday 6 PM CT is my placeholder)? Default polling window in days (placeholder: 30)? Default response deadline (placeholder: 5 days)?
5. **Urgency policy.** What does "Quick answer needed" actually mean operationally — does it bump the request into the *next* survey regardless of the day-of-week schedule, or just shorten the response deadline? My current spec leaves it to the officer's review step.
6. **Flywire URL stability.** Do public-lesson signup URLs change every semester or stay stable? (Affects whether officers paste a new URL each cycle or just toggle `active`.)
7. **Member-only area.** Password-protected resources (music library, choreography notes) on the site, or staying in Drive?
8. **Banquet page.** Permanent page or one that goes live in the weeks before each year's banquet?
9. **Merchandise.** Keep pointing to the external store, or build an embedded gallery?
10. **Sponsor commitments.** Any pending agreements that need to launch with the new site?
11. **Email "from" address.** Should drafts come from `president@`, individual officers, or a shared `bookings@` alias?

---

## 15. What "done" looks like

- [ ] All legacy URLs respond 200 with content matching or improving on the old site.
- [ ] Four primary CTAs visible above the fold on mobile, ordered by importance.
- [ ] An officer can add a new public lesson session in under 60 seconds — no code, no deploy.
- [ ] A new performance request triggers an instant auto-reply that reflects the requester's urgency choice, lands in the PR officer's review queue, and after officer approval becomes eligible for the next weekly survey per the inclusion rules.
- [ ] The weekly batched survey auto-sends on schedule, includes only requests that pass the inclusion rules, and can be toggled off or triggered ad-hoc by the PR officer.
- [ ] PR officer can override per-request: polling window, min couples, response deadline, "include in next survey," and add one-offs that fall outside the default window.
- [ ] Once a request's threshold is met (or deadline passes), a confirmation-or-decline draft lands in the officer's Gmail.
- [ ] A new private lesson request follows the same review → survey → draft pipeline (with a smaller instructor-pool audience).
- [ ] A general inquiry triggers an FAQ-aware auto-reply.
- [ ] `/watch` shows three subsections (Top Routines, Music Videos, Behind the Scenes) seeded with Midland, Randy Rogers, and Ella Langley.
- [ ] Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO on `/`.
- [ ] Search Console shows no new 404s after 14 days post-launch.
- [ ] Loom videos handed to each officer role showing their most common workflows.
- [ ] Daily staleness cron is live and has sent at least one nudge in testing.
