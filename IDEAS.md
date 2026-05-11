# Aggie Wranglers — Ideas & Backlog

A living scratchpad. Anything goes here — half-baked ideas, things to investigate, follow-up questions, future features. We can sort and prioritize later. Add freely; don't wait until something is "ready."

**Convention for entries:**
- `[idea]` — not yet validated
- `[exploring]` — actively figuring out
- `[decided]` — direction is set, just not built
- `[v1.1]` — explicitly deferred from v1; revisit after the first launch
- `[building]` — in progress
- `[shipped]` — done
- `[parked]` — looked at and set aside (with a note on why, so we don't re-litigate)

---

## Next-iteration to-do (after v1 launches)

These were considered for v1, scoped out, and earmarked for the next round of work.

### Social media management tab `[v1.1]`

**Goal:** consolidate the team's social-media work (Instagram, TikTok, YouTube, Facebook, X) into one place so the performance/PR officer doesn't have to juggle five separate apps.

**Two layers of value:**
1. **Embedding latest social content on the public site.** Easy — iframe embeds from each platform on the homepage / `/watch`. Could ship in v1 if a small piece; deferring to keep v1 scope tight.
2. **Cross-platform posting from one place.** This is the bigger workstream. Three rough approaches:
   - **Buffer / SaaS** — ~$30/mo for 5 channels. Easiest, zero dev work, can launch immediately. Just link to it from the portal. Officer composes in Buffer, posts to all platforms. Downside: monthly cost + officer learns a separate tool.
   - **Portal-native Social Drafter tab with AI variant generation** — officer writes one post; AI generates platform-specific variants (IG caption, TikTok caption, X tweet, FB post, YT description); officer reviews and posts. Direct posting via each platform's API where available; TikTok stays manual (their Content Publishing API is gated). ~$10/mo AI cost, more dev work upfront. Re-opens the "AI in production system" question from v6, but in a low-stakes context (drafting marketing, not client emails).
   - **Self-hosted open source** (Mixpost, Postiz) — free but requires hosting + ongoing maintenance.

**Decision deferred.** Most likely path is "team picks Buffer or similar in the interim while we build the portal-native version when scope allows."

### Online courses + Aggie Wranglers Coaching `[v1.1]`

Captured as their own product workstream below. **Not part of the website/portal v1.** Build the portal first; tackle commerce + content production separately once the team has bandwidth.

Key facts that affect the future build:
- TAMU SOFC handles ALL payments — no Stripe direct. Marketplace eStore (sofctamu.estore.flywire.com) is the channel.
- For online courses sold via Marketplace: **course platform must be locked to only-enroll-with-code**, so people can't bypass SOFC by paying the course platform directly. Two viable approaches:
  - **Course price = $0 on Teachable + enrollment-code required.** SOFC sells the codes for $99. Direct purchase impossible since direct purchase is $0 and the course won't load without a code.
  - **Course price set to absurdly high ($99,999) + 100%-off codes.** Direct purchase technically possible but priced out of reality. Backup if "free + code required" isn't supported by the chosen platform.
  - **Self-host inside the team portal** under a special "customer" user role. Most control; most work; revisit if third-party platforms cause friction.
- **SOFC does NOT process donations.** Donations remain a separate, team-handled channel. Portal captures intent + post-event status only.

---

---

## Big new ideas

### Online course on Teachable/Thinkific (or similar): country-western dance fundamentals `[v1.1]`

**The pitch.** Package the team's expertise into a self-paced online course that anyone in the country can buy. Detaches lesson revenue from the constraint of "students have to live in College Station and show up at the building Tuesday night." If it works at any scale, it's effectively passive revenue for the org from a one-time production effort.

**Why this could be huge:**
- Lesson revenue today is bounded by physical class capacity and the size of the local market. An online course has zero marginal cost to add another student.
- The team already has the teaching content, the on-camera comfort (Midland video, Randy Rogers, Ella Langley), and the credibility ("Aggie Wranglers — competition team / nationally recognized" reads well in a course description).
- Production effort is front-loaded: once filmed and edited, the course earns indefinitely with only periodic updates.
- Builds the brand nationally, which feeds public-lesson interest, performance booking inquiries from out-of-state events, and future merch/content.

**Course concepts (two distinct products):**
1. **Country-Western Dance Fundamentals** — two-step, jitterbug basics, partner work, social-dance etiquette, popular variations. Target audience: country music fans who want to learn to dance, people moving to Texas, casual social dancers. 4-8 hours of content.
2. **Wedding First-Dance Prep** — see separate entry below; sufficiently different audience and structure that it's worth its own course.

**Platforms (winnowed via v6 research):**
- **Teachable / Thinkific / Kajabi** — Self-hosted course platforms. Team controls pricing. **Required configuration: course locked to enrollment-code-only access** so direct purchase on the platform is impossible. SOFC Marketplace sells the codes. ~$30-50/mo platform cost; codes generated in bulk. **This is the likely target.**
- **Coursera** — Highest prestige but requires institutional partnership (TAMU faculty/department co-branding). Not a fit for a student org acting independently. Park unless a faculty advisor is on board.
- **Udemy** — Doesn't support "code-required enrollment" cleanly; their model pushes aggressive discounting to $10-15. Doesn't fit the SOFC-routed-only requirement. Skip.
- **Self-host inside the team portal** — Highest control, most build work. Customers get a special user role that unlocks the course module. No third-party content host. Revisit if Teachable-class platforms cause friction.
- **YouTube + Patreon hybrid** — Park; doesn't route through SOFC and doesn't fit the team's payment constraints.

**Things to investigate (revised post-v6 research):**
1. **Course-platform lockdown configuration.** Confirm the chosen platform supports either "free course + required enrollment code" or "absurd base price + 100%-off promo codes" as a mechanism to force all purchases through SOFC Marketplace. Most do.
2. **SOFC Marketplace "access code" SKU type.** Marketplace sells merchandise, dues, event registration, and donations natively. Selling an access code is closest to a "merchandise" SKU. Worth a confirmation conversation with sofcecommerce@tamu.edu before committing to production effort — but parking that conversation for now.
3. **IP ownership of choreography + instructional content.** Who owns it — the team as an org, the individual instructors on camera, TAMU? Matters because graduating instructors might have claims, and TAMU may have policies about content produced under the student-org umbrella.
4. **Risk of brand dilution if a course is bad.** Production quality has to match the team's existing video work. Bad lighting / muddy audio / shaky framing would undercut the credibility the team has earned.
5. **Officer-transition durability.** If the course depends on specific instructors being on camera, what happens when they graduate? Does the course need to be re-shot every 2-3 years, or is the curriculum format-agnostic enough that new instructors can be swapped in?
6. **Marketing channel.** Without paid acquisition, who finds the course? Plausible channels: the team's existing social presence (Instagram/TikTok/YouTube — real reach already), country-music influencer cross-promotion, partnership with country radio stations, the music-video collaborations.
7. **Refund/support policy.** Who handles "I can't access my course" emails? Folds into the same operational-burden question as everything else.

**What would need to be true for it to work:**
- TAMU's finance rules permit this kind of revenue (or can be worked around — e.g., partnering with a separate entity that handles commerce).
- Production budget and time investment is realistic for officer schedules — likely a single multi-week filming push, then editing.
- The team has 2-3 strong on-camera instructors willing to commit to the project.
- Marketing-by-default through social channels actually moves units (no point in a course nobody finds).

**Rough revenue math (very speculative):**
- Fundamentals course at $99, 100 sales/year via organic reach = $9,900/yr.
- Wedding course at $249, 100 sales/year = $24,900/yr.
- Both together at modest scale = ~$35k/yr passive. At ambitious scale (1,000 sales of each, plausible if the team's social reach converts) = $350k/yr.
- These numbers are pulled from thin air — real data would come from a soft launch with the smaller course first.

**Next step:** the meaningful blocker is the TAMU finance/SOFC piece. Worth a single conversation with whoever advises the team financially (faculty advisor, SOFC contact) to understand what's allowed before we invest production effort.

---

### Online course #2: Wedding first-dance prep `[v1.1]`

**The pitch.** Couples spend a *lot* on wedding lessons — typically $50-150/hr for in-person instruction over 4-8 sessions, often $400-1200 total per couple. Many couples are anxious about their first dance and motivated to invest. An online course at $199-399 priced below the cost of even one in-person session, accessible from anywhere, hits a clear market.

**Why this is potentially bigger than the fundamentals course:**
- Wedding spending psychology: couples will buy a $299 course without flinching because everything else at the wedding costs more.
- Specific, time-bound goal: "I have a wedding in 4 months and need to not look bad doing my first dance." Easier marketing message than general "learn to dance."
- Recurring market: ~2 million weddings/year in the US.
- Less competition than general dance courses; the existing wedding-prep online offerings are mostly poor production quality.

**Course structure — three styles, pick yours.**

The course is built around three foundational country-western styles: **polka, two-step, and waltz.** Each is its own module. Couples sample all three to figure out which one fits their song and their comfort level, then commit to one and learn the full choreographed first dance in that style. The "pick your style" framing is the unique value-add — most couples have no idea which dance their first-dance song actually is, and just teaching styles in isolation doesn't solve that problem. *This* does.

**Module 1 — Polka**
- *Style teaching:* characteristic bounce, hold variations, count pattern, the "feel" of polka vs. the other two.
- *Recommended song list:* curated across traditional Texas-German polka, classic country polkas (George Strait's *Adalida*, Brave Combo, Texas Tornados), and contemporary country tracks in polka time. Actual list to be assembled by team instructors who know the catalog cold.
- *Move vocabulary:* 6-10 named moves graded by difficulty.
- *Transitions:* how to flow from one move into the next without the "reset" gaps that look awkward on wedding video.
- *Routine at three difficulty levels:*
  - **Beginner** (~4 weeks of practice realistic, no prior dance) — minimal moves, lots of structured repetition, simple footwork.
  - **Intermediate** (~6-8 weeks) — fuller move vocabulary, a signature moment the photographer can anticipate.
  - **Advanced** (12+ weeks, some dance background) — turns, a dip or small lift, a more demanding floor pattern.
- The routine framework is **song-flexible:** same structural skeleton, adaptable across any song in the recommended list of similar tempo. Couples can use it for their first dance and then re-deploy it at another wedding or anniversary later.

**Module 2 — Two-step**
- Same structure: style teaching, recommended songs, move vocabulary, transitions, three-level routine.
- Likely the most-used module — two-step is the safest default for country first dances, and most modern country first-dance songs (*Neon Moon*, *Check Yes or No*, *I Cross My Heart*, *Tennessee Whiskey*, *Marry Me*) map cleanly to it. Deepest song catalog of the three.

**Module 3 — Waltz**
- Same structure. 3/4 time changes everything — this module spends extra time on the "feel" of waltz vs. the four-count dances. Connection and frame matter more here than in the other two.
- Recommended song list focuses on classic country waltzes (*Tennessee Waltz*, *Could I Have This Dance*, *Amarillo by Morning*, *Waltz Across Texas*) plus contemporary 3/4 country tracks couples might not realize are waltzable.
- The "looks cinematic for the photos" angle — waltzes are arguably the most photogenic of the three on still photography, and it's worth telling couples that explicitly.

**Pre-module: the "which style is my song?" diagnostic**
A short module before the three style modules. Two paths:
- *They already have a song* → "Here's how to tell what style it is" — counting tempo, spotting the time signature, recognizing the beat pattern. A 5-minute test of "play your song and follow along" lands on a style recommendation.
- *They haven't picked a song* → "Here's a flowchart: vibe you want → style → song shortlist" using the curated lists from each module.

This diagnostic is the magic of the structure. It's not three dance lessons — it's *the system for picking your first dance.* That's what justifies the price.

**Cross-style fundamentals (taught once, applies to all three):**
- Connection and frame without looking robotic.
- Looking good in slow movement — most first-dance songs are slower than couples expect, and slow is hard.
- The big moments wedding photos capture: entrance, the dip, the spin, the kiss timing, exit.
- Camera awareness — where to face for the photographer and videographer.
- "Recovery moves" — how to fix a missed beat or a stumble without it being visible.

**Optional premium add-on: personalized video review.** Couples submit a clip of their practice for personalized feedback from a team instructor. This has enough strategic potential on its own that it's broken out into its own entry below — see *Aggie Wranglers Coaching* — but it should be sold prominently as a checkout add-on to course buyers, since that's the highest-converting audience.

**Differentiators vs. other wedding-dance content online:**
- Production quality matching the team's existing video work.
- Real performance credibility (we're not random instructors — we've performed in music videos people have seen).
- Country-western aesthetic for the rapidly growing country-themed-wedding market specifically. ("Boots and lace weddings" is its own category now.)
- Could partner with country wedding venues, photographers, and wedding planners for cross-promotion.

**Strategic angle:** the wedding course funnels into the existing performance-request flow. A couple buying the course and discovering "wait, they actually perform at weddings?" becomes a high-quality performance lead. The course pays for itself AND generates booking inquiries.

**Production thought:** could potentially film both courses in the same multi-week push since the production setup (cameras, lighting, location, instructors) is the same. Economies of scale.

**Same investigation list as fundamentals course** — the TAMU finance/SOFC piece is the gating question for both.

---

### Aggie Wranglers Coaching — personalized video review service `[v1.1]`

**The pitch.** A standalone service: pay to send the team a video of you dancing and get back personalized, expert feedback. Initially marketed to wedding couples as an add-on to the wedding first-dance course, but the underlying service has room to grow into its own product line that survives independent of the courses entirely.

**Why this is the most defensible product in the lineup.** Random instructors on Udemy and YouTube can produce a course that mimics ours; nobody can credibly claim "personalized feedback from a nationally recognized competition team that's been in Midland's, Randy Rogers', and Ella Langley's music videos." That credential is the moat. Couches up against "AI dance coach" too — the personal-touch, "real humans on a real team watched your video" framing is a durable advantage. **This is the one product where the Aggie Wranglers brand does irreplaceable work.**

**Service tiers (rough):**

| Tier | Format | Turnaround | Price | Notes |
|---|---|---|---|---|
| **Single review** | Async — couple uploads clip; instructor records voice/video commentary over it | 48-72 hrs | $99-149 | The entry-level offering; most-bought tier |
| **Three-pack** | Three async reviews bookable over up to 3 months | 48-72 hrs each | $249-349 | Encourages couples to track progress; revenue multiplier |
| **Live 1:1 session** | 45-min video call with an instructor; real-time feedback | Scheduled slot | $199-249 | Highest-value, most-bookable for the run-up to a wedding |
| **Coaching package** | 4 async reviews + 2 live sessions over a month | 4-week program | $799-999 | For couples committing seriously |
| **Text-only review** | Written feedback, no video commentary | 48 hrs | $49 | Low-friction entry tier; converts to higher tiers later |

A monthly **group office hours** at $25-50 drop-in for course buyers to ask questions live could work as an audience-builder once the service has a base.

**Expansion paths beyond wedding couples** (the reason this is its own entry, not just a course add-on):
- **Performance prep.** Individuals or groups preparing for any kind of performance — corporate events, country bar showcases, college dance teams from other schools.
- **Competition couples.** Real money here. Competitive country-Western dance couples pay serious coaching fees and the Wranglers' competition background is exactly the credential that warrants it. Could become the highest-margin segment.
- **Social dancers leveling up.** People who already two-step at bars but want to get good. Lower price point, higher volume potential.
- **Other dance teams.** Choreography critique, routine cleanup, "we have a regional in three weeks" emergency consults.
- **Choreographer reviews.** Sister-team dance leaders sending their work for a second opinion.

Each of those markets justifies its own landing page eventually. Wedding couples is just the most obvious starting wedge.

**Operational pieces to build (mostly inside the existing portal):**
- **Intake.** Form with video upload (Mux or Cloudflare Stream for storage; size + length caps), what they want feedback on, wedding/event date if applicable, song link, dance style.
- **Review queue.** A new tab in the portal (or surfaced inside the existing performance/lesson management pattern). Instructors see open submissions, claim one, get a 48-hour SLA timer.
- **Feedback delivery.** Instructor records voice/video commentary (Loom-style overlay on the couple's video, or a side-by-side response video). Feedback delivered as an unlisted YouTube link in a confirmation email or as a portal-hosted private page.
- **Quality control.** First N reviews per new instructor are reviewed by a senior instructor before delivery. Standard rubric for what to give feedback on so couples get a consistent experience regardless of reviewer.
- **Capacity management.** Surface "next available slot" date on the buy page so we don't oversell. Cap weekly submissions.
- **Scheduling for live sessions.** Calendly-style booking against instructor availability; integrates with the portal calendar.
- **Payments.** Stripe — same payment integration that unblocks the courses generally.

**Staffing: current team only; all revenue stays with the team org.** Reviewers are current Wranglers. Alumni are not paid reviewers in this model. This keeps things clean:
- **No individual compensation.** Revenue is program revenue to the org, not paid labor for the people doing the work. Funds team activities (travel, costumes, equipment, banquet, recruiting, etc.). Removes one whole class of SOFC / tax / employment-status questions.
- **No payments flowing to non-current-members.** Sidesteps the additional SOFC complexity that would come with compensating people off the active roster.
- **Service capacity is naturally capped at active-roster size.** That's a feature, not a bug — it prevents over-promising, keeps reviewer quality concentrated in the people who are actively training together, and makes capacity planning a function of the current team's bandwidth rather than a growing instructor pool that needs to be managed.
- **Only edge case worth naming:** if demand ever runs so far ahead of what the current team can deliver that the cap becomes a real revenue ceiling (unlikely at any plausible scale), revisit then. Default is no.

**Pilot path (before investing in course production):**
1. Soft-launch coaching alone via the team's social channels — Instagram/TikTok posts inviting wedding couples to try it. Cap at 10-20 reviews in the first month.
2. Tests demand, pricing sensitivity, operational workflow, and reviewer training all without committing to course filming.
3. Generates real testimonials and case studies that become the marketing for the actual courses when they launch.
4. Reveals the operational bottlenecks (turnaround, quality consistency, capacity) at small scale before they become production-level problems.

**Risks:**
- *Quality drift across reviewers.* The rubric + senior-review-on-first-N pattern is the mitigation; needs discipline.
- *Capacity bottleneck if it takes off faster than the instructor pool grows.* Surface "next slot" prominently; cap weekly intake.
- *Brand risk from a bad review.* A coach saying something tone-deaf about someone's first dance is a recoverable mistake; one that goes viral is not. Senior review of first-N submissions per new reviewer mitigates.
- *Liability around feedback on personal video.* Standard "we may use clips with your permission for marketing" plus a privacy guarantee in the intake. Don't store videos beyond what's needed.
- *Cannibalizing in-person private lesson revenue locally.* Probably not — different customer segment, different price point — but worth checking once both exist.

**Strategic positioning summary:** the Coaching service is the *defensive* product. The courses are the *scalable* product. They reinforce each other — courses drive coaching upsells, coaching testimonials drive course sales. **Worth piloting coaching first** because it's lower production cost, validates demand, and de-risks the course investment.

---

## Brand refresh `[exploring]`

Separate workstream from the website build. Web/portal launches on a placeholder theme; brand refresh swaps in via theme tokens whenever it's ready.

- **Name** — open question. Does "Aggie Wranglers" stay, or is there appetite for a refreshed name? If it stays, the name still benefits from a wordmark/logo refresh.
- **Color palette** — Aggie maroon is a strong anchor, but the supporting palette has room. Cream/warm white as breathing room, gold or amber as accent, charcoal as text. Avoid the "Bootstrap maroon-on-white admin panel" feel.
- **Typography** — current site has no real type system. Direction: a serif or slab-serif for headlines (gives the country-western feel without leaning on cliché Western fonts), a clean sans for body. Variable weights to handle hero / body / caption / data-table needs in the portal.
- **Logo direction** — needs a wordmark that works at favicon size AND on a tour-style merch shirt AND embroidered. Single-color and full-color versions.
- **Voice** — confident but not boastful. Warm, Texan-without-cosplay, low-jargon. The team's actual social presence already lands here; the website should match.
- **Photography style** — real performances, real lessons, real members. No stock cowboy clichés. Hero shots that move (loops on the homepage), action shots throughout.
- **Open question:** is there a TAMU design student or alumnus who'd take this on for portfolio credit, or is this a hired-out engagement?

---

## Open product questions from plan v5

Mirroring the §16 list from `PLAN.md` here so they stay top-of-mind and we can update status as answers come in.

- [ ] **System point person + admin successor.** Who owns the system on launch and inherits when they graduate.
- [ ] **Team comms channel.** GroupMe / iMessage / Discord — affects digest and alert copy.
- [ ] **Bootstrap officer whitelist.** Email addresses of the current officer slate so they can sign in immediately on launch day.
- [ ] **Sending domain.** Resend authenticated on `wranglers.tamu.edu` (TAMU IT involvement) or on a team-owned domain?
- [ ] **Role aliases.** Confirmed list — `performance@`, `lessons@`, `bookings@`? Or do confirmations come from `president@`?
- [ ] **Outlook BCC mailbox.** Single team archive mailbox or per-officer?
- [ ] **Inbound forwarding setup.** Office 365 admin available to set up per-mailbox forwarding rules into the portal?
- [ ] **Flywire URL stability.** Same URL every semester or new one each cycle?
- [ ] **YouTube channel admin for Move Library.** Who manages access; alumni get invited how.
- [ ] **Photo/video rights audit.** Anything from the legacy site we shouldn't republish.
- [ ] **Brand refresh timing.** Launch on placeholder and swap in later (recommended) vs. delay launch for brand.
- [ ] **Twilio rollout (v1.1).** Opt-in default + which events trigger texts.

---

## Deferred to v1.1+ (from plan v5)

Things explicitly cut from launch scope to keep the build focused. Each is a separate post-launch effort.

- **Twilio SMS** — day-of reminder texts, RSVP last-call. Phone numbers collected in v1 so this is unblocked.
- **Microsoft Graph two-way calendar sync** — confirmed events write into officers' Outlook calendars; RSVP from phone calendar apps.
- **Microsoft Graph mail polling** — replace per-mailbox forwarding rules with native inbox sync.
- **Google Calendar two-way sync** — for members who prefer Google.
- **Stripe payments** — at the next natural pricing change; Flywire stays until then.
- **Embedded merch gallery** — currently link-out only.
- **Move Library: in-portal video upload + alumni contribution queue** — if the YouTube-channel model proves insufficient.
- **Banquet RSVP infrastructure** — currently `/banquet` is a static-content page; no RSVP/ticketing flow built in v1.

---

## Smaller ideas / nice-to-haves

Things that don't justify their own section yet — capture here, promote when they earn it.

- **Anonymous performance feedback form** — for couples to give the team feedback after a performance without it feeling awkward. Captures testimonials too. Could feed into Site Content.
- **Practice attendance tracker** — light bookkeeping in the portal for who's making practices. Useful for officer decisions about performance assignments.
- **Sponsor tier visibility on the public site** — currently sponsors are just a logo strip. Tiered display (presenting / supporting / friends-of-the-team) gives sponsors more for their money.
- **Press / media kit page** — for the rare reporter or venue that wants high-res photos, the team's bio, performance reel link. Currently lives in officer DMs.
- **Alumni "where are they now"** — periodic featured-alumnus post pulled from the alumni directory's "what I'm up to" field. Auto-suggestions surfaced to webmaster.
- **Performance recap auto-template** — after a confirmed performance, the system nudges the PR officer to add a post-event note (anything noteworthy, photo links). Becomes the seed of an Instagram caption or website recap.
- **Member spotlight rotation** — homepage shows a randomly featured current member from the roster. Drives the team to keep bios fresh.
- **Public lesson waitlist** — when a session is full, capture interested students for the next cycle. Low effort; converts well.
- **Bus/charter logistics block on confirmed performance pages** — call time, departure point, expected return. Lives on the calendar event detail.
- **Donation collection workflow research** — portal captures donation interest at request time and post-event status (Received / Declined / No response / Pending) for institutional memory. Actual collection is handled offline by the current team. Worth a follow-up: what channel does the team currently use, and is there friction worth solving with portal tooling? (Reminder/follow-up emails to donors? Standardized "donation requested" note in the confirmation email?)
- **Embed social media on public site** — Instagram / TikTok / YouTube / X / Facebook all have iframe embeds. Latest 3-6 posts on the homepage; embedded videos on `/watch`. Smaller piece of the broader v1.1 social tab; could ship independently if a few hours' work justifies it.

---

## Things to revisit periodically

Calendar reminders for the team to check on — not "do this once," but "look at this every N months."

- **Yearly officer transition** — admin role transfer, OAuth re-consent, contact-list audit, public-site officer photos refresh. Run a transition checklist (lives in Resources).
- **Quarterly content freshness audit** — sponsors current? FAQ accurate? Member roster matches reality? Built into the staleness cron but worth a human eye too.
- **Yearly Wix archive review** — is there content on the (now sunset) Wix site worth pulling forward that we missed in migration?
- **Yearly free-tier headroom check** — are we approaching Supabase/Resend/Vercel limits? Currently sitting at <20% on all, but worth glancing at as the team grows or content scales.

---

## Parked (with reasons)

So we don't re-debate things that were already considered.

- **AI-generated email drafts in the production system** `[parked]` — considered in v4, deliberately pulled in v5. Reasons: tone-deaf AI emails to paying clients are a real risk; predictability + officer judgment matter; one fewer vendor dependency for future officer slates. Templates + officer edits cover the use case. Easy to add later if we change our minds.
- **Native mobile app** `[parked]` — portal is a mobile-friendly web app instead. Native gives us nothing the PWA doesn't, costs significantly more to maintain across officer transitions.
- **Replacing Flywire entirely** `[parked]` — works for the team currently; switch costs > switch benefits until the next natural pricing change. Revisit when Stripe is on the table.
- **Auto-confirming performance bookings when threshold is met** `[parked]` — considered, pulled. Officer judgment about conflicts, requester history, edge cases matters more than process automation. System surfaces the data; officer makes the call.
- **Paying alumni as reviewers in the Coaching service** `[parked]` — considered, pulled. Staffing is current-team-only; all revenue stays with the team org rather than being split with individuals. Avoids SOFC complexity around non-current-member compensation, removes tax/employment-status questions entirely, and keeps the model clean: org earns the revenue, revenue funds team activities, current team does the work. Service capacity is naturally capped at active-roster size — a feature, not a bug. Only revisit if demand ever runs so far ahead of current-team capacity that it becomes a real revenue ceiling.
