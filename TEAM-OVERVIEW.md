# The New Aggie Wranglers Website — What It Is & Why

**Preview it:** https://aw-website-eta.vercel.app · passphrase: `wranglers`
Click around freely — it's a demo, nothing you do is permanent, and there's a reset button.

---

## The big idea

One system, two faces:

1. **A public website** that replaces the Wix site — faster, better-looking, accurate, and built to convert visitors into lesson signups, performance bookings, and tryout interest.
2. **A private team portal** behind a login — the ops tool that runs the team: performance requests, lesson scheduling, contacts, calendar, rosters, and institutional memory that survives officer turnover.

The two are connected. When someone submits the performance request form on the public site, it lands in the portal inbox with the requester's history attached. When an officer updates the lesson schedule in the portal, the public site updates instantly — no developer, no Wix editor, no stale pages.

---

## The public site (what visitors see)

**Structure:** Home · Lessons (Public / Private / Request) · Performances (Info / Request) · Tryouts · About (Team / History / Alumni / FAQ / Sponsorships / Banquet / Contact) · Watch

What's better than the current site:

- **Real information, up front.** Lesson pricing ($60/couple), partner requirement, spring tryout process, "performances are free — donations welcome" — all the stuff people currently have to dig for or email about.
- **Four clear paths** on the homepage: sign up for lessons, tryouts info, book the team, private lessons. Every page funnels toward one of them.
- **Working forms.** Performance requests, private lesson requests, general contact, and "notify me" lists all actually go somewhere (the portal), with automatic confirmations.
- **Partner search built in** — the #1 lesson signup blocker gets its own helper section.
- **Real videos** (Midland, Randy Rogers Band, Ella Langley + team performances), real photos, real history (1984, the Battalion ad, the Calvert County Fair).
- **Never goes stale.** Dates, rosters, sponsors, FAQ, banquet info — all editable by officers in the portal, live immediately.

---

## The team portal (what members and officers see)

Sign in at `/portal`. Use "Demo: sign in as a specific role" to explore as different people.

**For every member:**
- **Dashboard** — what needs your attention, your action items, what's coming up
- **Surveys** — answer availability polls (Yes / Maybe / No) right in the portal
- **Team Calendar** — practices, performances, lessons, meetings
- **Move Library** — every jitt and stunt move cataloged with videos
- **Resources** — constitution, choreography notes, contracts
- **Alumni Directory** — searchable, with privacy controls per person

**For officers (by role):**
- **Performance Management** — the marquee feature. Requests come in from the website → review → send availability survey → see who's in → confirm or decline (always your call, never automatic). Confirming creates the calendar event and roster automatically. Donation interest and follow-through tracked per event.
- **Lessons Management** — schedule sessions, publish/hide them on the public site, handle private-lesson requests, assign instructors, and email the "notify me" list when new sessions drop.
- **Contacts (CRM)** — every person and organization the team has ever talked to, with full request history, email history, and notes. **This is the officer-transition superpower:** the next PR officer inherits everything instead of starting from a blank inbox.
- **Members** — add new members (they get an invite to set up their account), and marking someone graduated automatically creates their alumni profile.
- **Webmaster** — edit the public site (announcements, videos, sponsors, FAQ, tryout dates, banquet info) with no technical skills. If you can fill in a form, you can update the website.
- **Meeting Notes / Long-Term Goals / Stats** — secretary's notes with assignable action items, the president's goals doc with revision history, and attendance stats computed from real rosters.

**Permissions are tiered and adjustable.** President/VP see everything; each officer gets edit rights over their area; members get the member view; alumni get the directory only. The matrix lives in Settings — you can change who sees what, or add new roles (say, "Practice Captain"), without touching code. Every change is logged.

---

## Honest fine print (current demo state)

- **Data lives in your own browser** for now — two people don't see each other's changes yet. The real shared database + real email sending is the next build phase (already architected, ~$15/yr to run).
- **Any password works** on the demo login, and emails are simulated (logged in the CRM instead of sent).
- Everything else — every page, button, form, workflow, and permission rule — is real and tested (17 automated end-to-end tests run on every change).

---

## Try this 3-minute demo

1. On the public site, submit a **performance request** for a made-up event.
2. Go to `/portal` → sign in as **Elena Cruz (President)** → it's waiting in your dashboard.
3. Open it → **Approve to poll** → **Send survey** → answer **Yes** in the Surveys tab → **Close polling** → **Confirm**.
4. Check the **Team Calendar** and **Performance Stats** — your event is there with a roster.
5. Bonus: **Webmaster** → type a homepage announcement → save → look at the public homepage.

Questions and feedback welcome — that's what this review is for.
