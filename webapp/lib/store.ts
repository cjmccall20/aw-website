"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Client-side data layer.
//
// This is the single source of truth for the whole app while it runs without a
// server: a typed in-memory DB seeded from lib/mock-data, persisted to
// localStorage, with a subscribe/notify core so React re-renders on writes
// (via useStore / useSyncExternalStore).
//
// It is deliberately shaped like the future backend: one collection per
// Postgres table from PLAN.md §6, and every mutation goes through update().
// Migrating to Supabase = replacing update()/useStore() internals with
// queries + realtime, keeping every call site unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useSyncExternalStore } from "react";
import {
  STATUSES, PERMISSION_MATRIX, DEMO_USERS, MEMBERS, ALUMNI, CONTACTS,
  ANNUAL_REMINDERS, PERFORMANCE_REQUESTS, PRIVATE_LESSON_REQUESTS,
  PUBLIC_LESSONS, TRYOUT_CYCLES, CALENDAR_EVENTS, RESOURCES, MOVES,
  EMAIL_THREADS, EMAIL_MESSAGES, VIDEOS, SPONSORS, FAQS, MEETING_NOTES,
  NOTIFY_LISTS, NOTIFY_SUBSCRIBERS, NOTIFY_CAMPAIGNS,
} from "@/lib/mock-data";
import type {
  User, PermissionStatus, PermissionMatrixEntry, Member, AlumniProfile,
  Contact, AnnualReminder, PerformanceRequest, PerformanceRosterEntry,
  PrivateLessonRequest, PublicLesson, TryoutCycle, CalendarEvent,
  ResourceFile, Move, EmailThread, EmailMessage, Video, Sponsor, FAQ,
  MeetingNote, ActionItem, NotifyList, NotifyListSubscriber,
  NotifyListCampaign, GeneralInquiry, SurveyResponse, LongTermGoals,
  LongTermGoalsRevision, SiteContent, AuditEntry, AccessLevel,
} from "@/lib/types";

export interface DB {
  users: User[];
  permissionStatuses: PermissionStatus[];
  permissions: PermissionMatrixEntry[];
  members: Member[];
  alumni: AlumniProfile[];
  contacts: Contact[];
  annualReminders: AnnualReminder[];
  performanceRequests: PerformanceRequest[];
  performanceRoster: PerformanceRosterEntry[];
  privateLessonRequests: PrivateLessonRequest[];
  publicLessons: PublicLesson[];
  /** Member ids eligible to teach lessons (drives survey inclusion). */
  instructorPool: string[];
  tryoutCycles: TryoutCycle[];
  calendarEvents: CalendarEvent[];
  resources: ResourceFile[];
  moves: Move[];
  emailThreads: EmailThread[];
  emailMessages: EmailMessage[];
  videos: Video[];
  sponsors: Sponsor[];
  faqs: FAQ[];
  meetingNotes: MeetingNote[];
  actionItems: ActionItem[];
  notifyLists: NotifyList[];
  notifySubscribers: NotifyListSubscriber[];
  notifyCampaigns: NotifyListCampaign[];
  inquiries: GeneralInquiry[];
  surveyResponses: SurveyResponse[];
  longTermGoals: LongTermGoals;
  goalsRevisions: LongTermGoalsRevision[];
  siteContent: SiteContent;
  auditLog: AuditEntry[];
}

// Bump when the seed shape changes incompatibly — stored data from older
// versions is discarded in favor of the fresh seed.
const DB_VERSION = 1;
const KEY = `aw.db.v${DB_VERSION}`;

export const DEFAULT_SITE_CONTENT: SiteContent = {
  tagline: "High Flyin', Death Defyin'",
  hero_headline_top: "High flyin',",
  hero_headline_accent: "death defyin'.",
  hero_subhead:
    "Texas A&M's premier country-western exhibition dance team since 1984. We teach ~3,000 people a year. We perform high-speed polka and the internationally famous Aggie-style jitterbug. We've been in music videos with Midland, Randy Rogers Band, and Ella Langley. And we'd love to dance at your event — for free.",
  announcement_text: "",
  announcement_link: "",
  announcement_active: false,
  mission:
    "Our mission is to spread our love for Texas A&M by teaching and performing our distinctive style of Country-Western Dance.",
  merch_url: "https://tamu.estore.flywire.com",
  banquet_eyebrow: "10th annual banquet · Spring 2027",
  banquet_title: "Date to be announced",
  banquet_body:
    "The 2027 date and tickets will be posted here in the fall. Last year's banquet — our 9th — filled the Hildebrand Equine Center with a meal, a silent auction, an open dance floor, a year recap, and a team performance.",
  banquet_tickets_line: "$45 per person · $600 sponsors a table of eight",
  banquet_dress_line: "Sunday Best — jeans and boots encouraged",
  banquet_contact_email: "banquet@wranglers.tamu.edu",
};

const SEED_GOALS: LongTermGoals = {
  body_markdown: `## Multi-year priorities

1. **Reach 25+ confirmed performances/year** sustainably without burning out members.
2. **Build the alumni-engagement pipeline.** Annual reunion + monthly featured-alumnus post.
3. **Brand refresh.** Coordinate with student design talent for new logo, palette, and wordmark by Spring 2027.
4. **Course product**. Build the online country-western fundamentals course (deferred to v1.1 — see IDEAS.md).

## What we tried that didn't stick
- Weekly social posts on Twitter/X (audience moved to TikTok).

## Open questions for the next president
- Do we want to formalize the captain role?
- Should sponsorships move to multi-year contracts?

## Inheritance log
- 2026-05: Goals doc started by Elena.
- 2025-09: Previous officer transition — handed off from Drew.`,
  updated_at: "2026-05-12",
  updated_by_name: "Elena Cruz",
};

// Seed roster rows so Performance Stats has real data to derive from.
function seedRoster(): PerformanceRosterEntry[] {
  const rows: PerformanceRosterEntry[] = [];
  const add = (reqId: string, memberIds: string[]) =>
    memberIds.forEach(m =>
      rows.push({ performance_request_id: reqId, member_id: m, role: "performer", added_at: "2026-06-01" }));
  // completed March wedding
  add("pr_005", ["m_001", "m_002", "m_003", "m_006", "m_007", "m_010", "m_008", "m_009", "m_011", "m_012"]);
  // polling-closed August wedding — provisional lineup
  add("pr_001", ["m_001", "m_002", "m_003", "m_006", "m_007", "m_010"]);
  return rows;
}

const SEED_ACTION_ITEMS: ActionItem[] = [
  { id: "ai_001", meeting_note_id: "mn_001", description: "Draft TechFlow follow-up email", assignee_member_id: "m_004", due_date: "2026-07-17" },
  { id: "ai_002", meeting_note_id: "mn_001", description: "Publish Fall Session 1 lesson schedule", assignee_member_id: "m_004", due_date: "2026-08-15" },
  { id: "ai_003", meeting_note_id: "mn_001", description: "Send sponsor deck to Buff City Soaps", assignee_member_id: "m_002", due_date: "2026-07-24" },
];

function buildSeed(): DB {
  return structuredClone({
    users: DEMO_USERS,
    permissionStatuses: STATUSES,
    permissions: PERMISSION_MATRIX,
    members: MEMBERS,
    alumni: ALUMNI,
    contacts: CONTACTS,
    annualReminders: ANNUAL_REMINDERS,
    performanceRequests: PERFORMANCE_REQUESTS,
    performanceRoster: seedRoster(),
    privateLessonRequests: PRIVATE_LESSON_REQUESTS,
    publicLessons: PUBLIC_LESSONS,
    instructorPool: MEMBERS.filter(m => m.status === "current").slice(0, 8).map(m => m.id),
    tryoutCycles: TRYOUT_CYCLES,
    calendarEvents: CALENDAR_EVENTS,
    resources: RESOURCES,
    moves: MOVES,
    emailThreads: EMAIL_THREADS,
    emailMessages: EMAIL_MESSAGES,
    videos: VIDEOS,
    sponsors: SPONSORS,
    faqs: FAQS,
    meetingNotes: MEETING_NOTES,
    actionItems: SEED_ACTION_ITEMS,
    notifyLists: NOTIFY_LISTS,
    notifySubscribers: NOTIFY_SUBSCRIBERS,
    notifyCampaigns: NOTIFY_CAMPAIGNS,
    inquiries: [],
    surveyResponses: [],
    longTermGoals: SEED_GOALS,
    goalsRevisions: [],
    siteContent: DEFAULT_SITE_CONTENT,
    auditLog: [],
  });
}

// ---- subscribe/notify core ----

let cache: DB = buildSeed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

export function getDB(): DB {
  return cache;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/**
 * Load persisted state. Deliberately NOT run at module init: the first client
 * render must match the server-rendered HTML (seed data) to avoid hydration
 * mismatches. useStore() calls this from an effect, after which any persisted
 * state re-renders in.
 */
export function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      // Guard against partial/legacy blobs: seed keys must all exist.
      const seed = buildSeed();
      cache = { ...seed, ...parsed };
      emit();
    }
  } catch {
    // Corrupted storage — keep seed.
  }
  // Cross-tab sync: another tab's write refreshes this one.
  window.addEventListener("storage", e => {
    if (e.key === KEY && e.newValue) {
      try {
        cache = { ...buildSeed(), ...(JSON.parse(e.newValue) as DB) };
        emit();
      } catch { /* ignore */ }
    }
  });
}

/** All writes go through here: clone → mutate → persist → notify. */
export function update(mutator: (db: DB) => void, auditAction?: string) {
  const next = structuredClone(cache);
  mutator(next);
  if (auditAction) {
    next.auditLog.unshift({
      id: uid("log"),
      at: new Date().toISOString(),
      actor_name: getSessionUser()?.name ?? "Public visitor",
      action: auditAction,
    });
    next.auditLog = next.auditLog.slice(0, 200);
  }
  cache = next;
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage full/unavailable — stay in-memory */ }
  emit();
}

/** Wipe demo edits and restore the seed. */
export function resetDemoData() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  cache = buildSeed();
  emit();
}

/** Reactive read of the whole DB. Select what you need from the result. */
export function useStore(): DB {
  const db = useSyncExternalStore(subscribe, () => cache, () => cache);
  useEffect(() => { hydrateFromStorage(); }, []);
  return db;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- session (per-browser, separate from the shared DB) ----

const SESSION_KEY = "aw.session.user_id";
const sessionListeners = new Set<() => void>();
let sessionUserId: string | null = null;
let sessionHydrated = false;

function emitSession() {
  for (const l of Array.from(sessionListeners)) l();
}

function hydrateSession() {
  if (sessionHydrated || typeof window === "undefined") return;
  sessionHydrated = true;
  try {
    sessionUserId = window.localStorage.getItem(SESSION_KEY);
    if (sessionUserId) emitSession();
  } catch { /* ignore */ }
}

export function getSessionUser(): User | null {
  if (!sessionUserId) return null;
  return cache.users.find(u => u.id === sessionUserId) ?? null;
}

export function signIn(userId: string) {
  sessionUserId = userId;
  try { window.localStorage.setItem(SESSION_KEY, userId); } catch { /* ignore */ }
  emitSession();
}

export function signOut() {
  sessionUserId = null;
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  emitSession();
}

/** Reactive session user. null = signed out. Also re-renders on DB changes (status grants, name edits). */
export function useSessionUser(): User | null {
  const user = useSyncExternalStore(
    fn => {
      sessionListeners.add(fn);
      const unsubDb = subscribe(fn);
      return () => { sessionListeners.delete(fn); unsubDb(); };
    },
    () => getSessionUser(),
    () => null,
  );
  useEffect(() => { hydrateSession(); hydrateFromStorage(); }, []);
  return user;
}

// ---- permissions ----

const rank = (a: AccessLevel) => (a === "edit" ? 2 : a === "view" ? 1 : 0);

export function accessFor(db: DB, statusKeys: string[] | undefined, tabKey: string): AccessLevel {
  if (!statusKeys) return "none";
  let best: AccessLevel = "none";
  for (const status of statusKeys) {
    const row = db.permissions.find(e => e.status_key === status && e.tab_key === tabKey);
    if (row && rank(row.access) > rank(best)) best = row.access;
  }
  return best;
}

/** Convenience hook: current user's access level on a tab, live. */
export function useAccess(tabKey: string): AccessLevel {
  const db = useStore();
  const user = useSessionUser();
  return accessFor(db, user?.status_keys, tabKey);
}
