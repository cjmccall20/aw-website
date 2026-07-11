# Aggie Wranglers site — 10-minute review script

For the team review. The preview runs entirely in your browser (no server yet),
so everything you do persists on your machine only — click around fearlessly.
Reset anytime: Portal → Webmaster → Homepage → Danger zone → **Reset demo data**.

**Preview URL:** the GitHub Pages link (passphrase: `wranglers`).
Local: `cd webapp && npm install && npm run dev` → http://localhost:3000.

## 1. The public site (2 min)

- Homepage: real photos, real videos, four conversion paths. Facts are fixed —
  est. 1984, spring tryouts, $60/couple lessons with partner required,
  free donation-supported performances.
- Visit **Public Lessons** (pricing up front + partner search),
  **Tryouts**, **Watch** (real YouTube embeds), **Sponsorships** (real
  Texas A&M Foundation giving instructions), **Contact** (new page).

## 2. The magic demo: a booking travels the whole pipeline (4 min)

1. On the public site, submit **Request a Performance** (any made-up event).
2. Go to **/portal** → "Demo: sign in as a specific role" → **Elena Cruz (President)**.
3. Dashboard shows the new request under "Needs your attention" — open it.
   Notice the auto-reply already logged in Email history, and the requester
   auto-created in Contacts (open their profile — full CRM record).
4. Click **Approve to poll** → **Send availability survey now**.
5. Open **Surveys** in the sidebar → answer **Yes, I'm in**.
6. Back in the request: **Close polling → decide** — see the live yes/maybe/no
   breakdown by member — then **Confirm**. A calendar event and roster are
   created; check **Team Calendar** and **Performance Stats**.

## 3. The CMS (2 min)

1. Portal → **Webmaster** → Homepage: type an announcement, check "Show
   announcement banner," Save.
2. Open the public homepage — your banner is live. Same story for videos,
   sponsors, FAQ, tryout dates, banquet details, and team profiles: the
   public site is fully team-editable, no developer needed.

## 4. Permissions & the tiered portal (2 min)

1. Sign out → sign in as **Chase Atkinson (Team Member)**: sidebar shrinks to
   member tabs; officer pages are blocked even by direct URL.
2. Sign in as **Rachel Kim (Alumni)**: directory-only view.
3. Sign in as President → **Settings → Permissions matrix**: change any cell,
   Save, and it takes effect instantly. Add a custom status (e.g. "Practice
   Captain") and grant it tabs. Settings → Audit log shows every change.

Also try: magic-link sign-in with `elena.cruz@tamu.edu` (simulated email),
and Members → **Add member** (invite flow: the invitee finishes at
/portal → "I have an invite").

## What's real vs. simulated

| Real now | Simulated (until the backend) |
|---|---|
| Every screen, button, form, workflow, and permission rule | Emails don't actually send (they're logged in the CRM instead) |
| Data persists and flows between public site ↔ portal | Data lives in your browser, not a shared database |
| 17 automated end-to-end tests + CI on every push | Sign-in accepts any password (demo) |
| Real photos, videos, prices, dates, contacts | Drive times entered by officer (Google Maps API later) |

Production path (PLAN.md): Supabase (shared DB + real auth) swaps in behind
`lib/store.ts`; Resend sends the emails the portal already drafts; Google
Calendar syncs the events the portal already creates. ~$15/yr to run.
