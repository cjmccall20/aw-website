// Mock data seeded for the MVP. Replace with Supabase queries when backend lands.
// Types align with /lib/types.ts (which mirrors PLAN.md §6 schema).

import type {
  Member, AlumniProfile, Contact, AnnualReminder,
  PerformanceRequest, PrivateLessonRequest, PublicLesson,
  TryoutCycle, CalendarEvent, ResourceFile, Move,
  EmailThread, EmailMessage, Video, Sponsor, FAQ,
  PermissionStatus, PermissionMatrixEntry, MeetingNote,
  NotifyList, NotifyListSubscriber, NotifyListCampaign, User,
} from "@/lib/types";

// ---------------- Permission system ----------------

export const STATUSES: PermissionStatus[] = [
  { id: "s_admin",   key: "admin",                display_name: "Admin",                 is_system: true,  description: "Build maintainer; full access." },
  { id: "s_pres",    key: "president",            display_name: "President",             is_system: true },
  { id: "s_vp",      key: "vp",                   display_name: "Vice President",        is_system: true },
  { id: "s_perf",    key: "performance_officer",  display_name: "Performance Officer",   is_system: true },
  { id: "s_less",    key: "lessons_coordinator",  display_name: "Lessons Coordinator",   is_system: true },
  { id: "s_sec",     key: "secretary",            display_name: "Secretary",             is_system: true },
  { id: "s_mem",     key: "member",               display_name: "Team Member",           is_system: true },
  { id: "s_alum",    key: "alumni",               display_name: "Alumni",                is_system: true },
];

const TABS: { key: string; label: string }[] = [
  { key: "dashboard",              label: "Dashboard" },
  { key: "performance_management", label: "Performance Management" },
  { key: "lessons_management",     label: "Lessons Management" },
  { key: "contacts",               label: "Contacts" },
  { key: "members",                label: "Members" },
  { key: "webmaster",              label: "Webmaster" },
  { key: "team_calendar",          label: "Team Calendar" },
  { key: "resources",              label: "Resources" },
  { key: "move_library",           label: "Move Library" },
  { key: "alumni_directory",       label: "Alumni Directory" },
  { key: "meeting_notes",          label: "Meeting Notes" },
  { key: "long_term_goals",        label: "Long-Term Goals" },
  { key: "performance_stats",      label: "Performance Stats" },
  { key: "surveys",                label: "Surveys" },
  { key: "settings",               label: "Settings" },
];

export const ALL_TABS = TABS;

// Default permissions matrix matching PLAN.md §4.2
function buildDefaultPermissions(): PermissionMatrixEntry[] {
  const entries: PermissionMatrixEntry[] = [];
  // Overwrite on repeat (status, tab) pairs — duplicate rows would make
  // lookups (which take the first match) return the wrong access level.
  const set = (s: string, t: string, a: "none" | "view" | "edit") => {
    const existing = entries.find(e => e.status_key === s && e.tab_key === (t as PermissionMatrixEntry["tab_key"]));
    if (existing) existing.access = a;
    else entries.push({ status_key: s, tab_key: t as PermissionMatrixEntry["tab_key"], access: a });
  };

  const ALL = TABS.map(t => t.key);

  // admin + president + vp: edit everything
  for (const s of ["admin", "president", "vp"]) {
    for (const t of ALL) set(s, t, "edit");
  }

  // performance_officer: edit perf + surveys; view everything else
  for (const t of ALL) {
    set("performance_officer", t,
      t === "performance_management" || t === "surveys" || t === "webmaster" ? "edit" : "view");
  }
  set("performance_officer", "settings", "view");

  // lessons_coordinator: edit lessons + surveys; view rest
  for (const t of ALL) {
    set("lessons_coordinator", t,
      t === "lessons_management" || t === "surveys" ? "edit" : "view");
  }
  set("lessons_coordinator", "settings", "view");

  // secretary: edit meeting notes; view rest
  for (const t of ALL) {
    set("secretary", t, t === "meeting_notes" ? "edit" : "view");
  }
  set("secretary", "settings", "view");

  // member: view most things; edit own profile via members tab
  for (const t of ALL) {
    if (["dashboard", "members", "resources", "move_library", "team_calendar",
         "alumni_directory", "performance_stats", "surveys"].includes(t)) set("member", t, "view");
    else set("member", t, "none");
  }
  set("member", "resources", "edit");
  set("member", "move_library", "edit");

  // alumni: only alumni_directory
  for (const t of ALL) set("alumni", t, "none");
  set("alumni", "alumni_directory", "view");

  return entries;
}

export const PERMISSION_MATRIX = buildDefaultPermissions();

export function effectiveAccess(
  userStatusKeys: string[], tabKey: string,
): "none" | "view" | "edit" {
  let best: "none" | "view" | "edit" = "none";
  const rank = (a: string) => a === "edit" ? 2 : a === "view" ? 1 : 0;
  for (const status of userStatusKeys) {
    const row = PERMISSION_MATRIX.find(e => e.status_key === status && e.tab_key === tabKey);
    if (row && rank(row.access) > rank(best)) best = row.access;
  }
  return best;
}

// ---------------- Mock users (for demo sign-in) ----------------

export const DEMO_USERS: User[] = [
  { id: "u_admin", primary_email: "admin@aggiewranglers.com", name: "System Admin",        status: "active", status_keys: ["admin"] },
  { id: "u_pres",  primary_email: "elena.cruz@tamu.edu",      name: "Elena Cruz",          status: "active", status_keys: ["president", "performance_officer"], member_id: "m_001" },
  { id: "u_vp",    primary_email: "jordan.harlow@tamu.edu",   name: "Jordan Harlow",       status: "active", status_keys: ["vp"], member_id: "m_002" },
  { id: "u_perf",  primary_email: "maya.gonzalez@tamu.edu",   name: "Maya González",       status: "active", status_keys: ["performance_officer"], member_id: "m_003" },
  { id: "u_less",  primary_email: "tyler.bowman@tamu.edu",    name: "Tyler Bowman",        status: "active", status_keys: ["lessons_coordinator"], member_id: "m_004" },
  { id: "u_sec",   primary_email: "ana.delgado@tamu.edu",     name: "Ana Delgado",         status: "active", status_keys: ["secretary"], member_id: "m_005" },
  { id: "u_mem",   primary_email: "chase.atkinson@tamu.edu",  name: "Chase Atkinson",      status: "active", status_keys: ["member"], member_id: "m_006" },
  { id: "u_alum",  primary_email: "rachel.kim@gmail.com",     name: "Rachel Kim '22",      status: "active", status_keys: ["alumni"] },
];

// ---------------- Members ----------------

export const MEMBERS: Member[] = [
  { id: "m_001", name: "Elena Cruz",        role_title: "President",            class_year: 2026, hometown: "San Antonio, TX",  major: "Business",            bio: "Joined the team in 2023.", status: "current", tamu_email: "elena.cruz@tamu.edu" },
  { id: "m_002", name: "Jordan Harlow",     role_title: "Vice President",       class_year: 2026, hometown: "Plano, TX",        major: "Mechanical Engineering", status: "current", tamu_email: "jordan.harlow@tamu.edu" },
  { id: "m_003", name: "Maya González",     role_title: "Performance Officer",  class_year: 2027, hometown: "El Paso, TX",      major: "Marketing",           status: "current", tamu_email: "maya.gonzalez@tamu.edu" },
  { id: "m_004", name: "Tyler Bowman",      role_title: "Lessons Coordinator",  class_year: 2026, hometown: "Magnolia, TX",     major: "Animal Science",      status: "current", tamu_email: "tyler.bowman@tamu.edu" },
  { id: "m_005", name: "Ana Delgado",       role_title: "Secretary",            class_year: 2027, hometown: "Houston, TX",      major: "Education",           status: "current", tamu_email: "ana.delgado@tamu.edu" },
  { id: "m_006", name: "Chase Atkinson",                                        class_year: 2026, hometown: "Lubbock, TX",      major: "Agribusiness",        status: "current", tamu_email: "chase.atkinson@tamu.edu" },
  { id: "m_007", name: "Hannah Reyes",                                          class_year: 2027, hometown: "Austin, TX",       major: "Communications",      status: "current" },
  { id: "m_008", name: "Brody Mitchell",                                        class_year: 2026, hometown: "Bryan, TX",        major: "Construction Science", status: "current" },
  { id: "m_009", name: "Sophia Park",                                           class_year: 2028, hometown: "Frisco, TX",       major: "Biology",             status: "current" },
  { id: "m_010", name: "Wyatt Coleman",                                         class_year: 2027, hometown: "Midland, TX",      major: "Petroleum Engineering", status: "current" },
  { id: "m_011", name: "Lila Hayes",                                            class_year: 2028, hometown: "Galveston, TX",    major: "Psychology",          status: "current" },
  { id: "m_012", name: "Derek Mathews",                                         class_year: 2026, hometown: "Tyler, TX",        major: "Finance",             status: "current" },
  { id: "m_013", name: "Sienna Powell",                                         class_year: 2028, hometown: "Waco, TX",         major: "Architecture",        status: "current" },
  { id: "m_014", name: "Garrett Boone",                                         class_year: 2027, hometown: "Amarillo, TX",     major: "Kinesiology",         status: "current" },
];

// Partner pairings (samples)
MEMBERS[0].partner_id = "m_002";
MEMBERS[1].partner_id = "m_001";
MEMBERS[2].partner_id = "m_006";
MEMBERS[5].partner_id = "m_003";

// ---------------- Alumni ----------------

export const ALUMNI: AlumniProfile[] = [
  { id: "a_001", name: "Rachel Kim",       graduation_year: 2022, current_city: "Dallas, TX",    current_role: "Marketing Manager",   what_im_up_to: "Working at a major fashion retailer; still teaching dance on weekends.", contact_permission: "visible_to_alumni_too", email: "rachel.kim@gmail.com", status: "active" },
  { id: "a_002", name: "Drew Henderson",   graduation_year: 2021, current_city: "Houston, TX",   current_role: "Software Engineer",   what_im_up_to: "Building things at a tech startup. Looking to host a Wranglers reunion this summer.", contact_permission: "visible_to_alumni_too", status: "active" },
  { id: "a_003", name: "Mara Stevens",     graduation_year: 2020, current_city: "Austin, TX",    current_role: "Physician's Assistant", contact_permission: "visible_to_members_only", status: "active" },
  { id: "a_004", name: "Cole Wright",      graduation_year: 2019, current_city: "Fort Worth, TX", current_role: "Cattle Rancher",     what_im_up_to: "Running the family ranch outside Fort Worth. Always looking for tour-eligible members to mentor.", contact_permission: "visible_to_alumni_too", status: "active" },
  { id: "a_005", name: "Bella Carter",     graduation_year: 2023, current_city: "Nashville, TN", current_role: "Music Industry",     what_im_up_to: "Working A&R at a country label; the Wranglers connections opened every door.", contact_permission: "visible_to_alumni_too", status: "active" },
  { id: "a_006", name: "Hunter Reeves",    graduation_year: 2018, current_city: "Lubbock, TX",   current_role: "High School Coach",  contact_permission: "visible_to_members_only", status: "active" },
];

// ---------------- Contacts (people + organizations) ----------------

export const CONTACTS: Contact[] = [
  { id: "c_001", kind: "person",       name: "Linda Whitfield",   email: "linda@stevensgala.com", phone: "713-555-0102", address: "Houston, TX", tags: ["wedding", "houston"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Booked us for the Stevens-Hill wedding (June 2022), the Reyes corporate gala (Sept 2023), and the Patel reception (May 2024). Always wants 90 min of call time. Pays via wire from corporate account. Florist is Stems by Sarah. Said our Midland video is what convinced her boss.", follow_up_date: "2026-06-15", created_at: "2022-05-10" },
  { id: "c_002", kind: "organization", name: "Kappa Kappa Gamma — Texas A&M Chapter", email: "kkg.tamu@example.com", tags: ["greek", "annual"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Recurring booking every spring for their formal. Current contact rotates — ask for the social chair each year. Last year: Madison T.", created_at: "2021-03-08" },
  { id: "c_003", kind: "organization", name: "Houston Livestock Show & Rodeo", email: "events@hlsr.com", tags: ["rodeo", "annual", "high-value"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Annual entertainment slot, typically March. Need to confirm 6-9 months out. Tight load-in window; production-managed.", created_at: "2019-11-04" },
  { id: "c_004", kind: "person",       name: "Marcus Patel",      email: "marcus.patel@gmail.com", phone: "832-555-0144", tags: ["wedding"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Husband of bride at Patel/Reyes reception May 2024. Mentioned daughter is also engaged for late 2026.", follow_up_date: "2026-09-01", created_at: "2024-03-14" },
  { id: "c_005", kind: "person",       name: "Sarah Chen",        email: "sarah.chen.evt@gmail.com", phone: "512-555-0177", tags: ["corporate", "austin"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Events lead at an Austin tech company; booked the team for a 2024 client appreciation event. Asked about repeating it.", created_at: "2024-08-22" },
  { id: "c_006", kind: "organization", name: "Texas Country Music Awards", email: "production@txcma.com", tags: ["press", "music-industry"], email_opt_in: true, sms_opt_in: false, created_at: "2023-04-11" },
  { id: "c_007", kind: "person",       name: "James Ortega",      email: "jortega@example.com", tags: ["lesson-inquiry"], email_opt_in: true, sms_opt_in: false, notes_markdown: "Asked about private lessons for upcoming wedding; quoted standard package.", created_at: "2026-04-20" },
  { id: "c_008", kind: "person",       name: "Avery Lin",         email: "avery.lin@gmail.com", tags: ["lesson-inquiry", "wedding"], email_opt_in: true, sms_opt_in: false, created_at: "2026-05-02" },
];

// ---------------- Annual reminders ----------------

export const ANNUAL_REMINDERS: AnnualReminder[] = [
  { id: "ar_001", contact_id: "c_003", reminder_month: 10, note: "Reach out to HLSR re: next spring slot",     assignee_status_key: "performance_officer", lead_time_weeks: 6 },
  { id: "ar_002", contact_id: "c_002", reminder_month: 1,  note: "Ping KKG social chair for spring formal",    assignee_status_key: "performance_officer", lead_time_weeks: 6 },
  { id: "ar_003", contact_id: "c_006", reminder_month: 2,  note: "TXCMA invite/production check",              assignee_status_key: "performance_officer", lead_time_weeks: 6 },
];

// ---------------- Performance requests (mixed states) ----------------

export const PERFORMANCE_REQUESTS: PerformanceRequest[] = [
  {
    id: "pr_001",
    contact_id: "c_001",
    requester_first_name: "Linda", requester_last_name: "Whitfield",
    requester_email: "linda@stevensgala.com", requester_phone: "713-555-0102",
    organization: "Stevens Gala Events",
    event_date: "2026-08-22", event_start_time: "19:00:00", event_end_time: "20:00:00",
    audience_size: 280, performance_type: "Wedding reception",
    notes: "Outdoor reception under tent. Bride loves the Midland routine.",
    urgency: "standard",
    donation_interest: "1000",
    venue_name: "Five Pines Ranch",
    venue_formatted_address: "1240 Pines Rd, Brenham, TX 77833",
    drive_time_minutes: 78, drive_distance_miles: 64,
    call_time_minutes_before: 90, return_buffer_minutes: 15,
    status: "polling_closed",
    polling_window_days: 45, min_couples_required: 4,
    response_deadline: "2026-07-08",
    include_in_next_survey: true,
    created_at: "2026-06-12",
    review_notes: "Strong client (3rd booking). Plus-1 photographer asked for.",
  },
  {
    id: "pr_002",
    contact_id: "c_005",
    requester_first_name: "Sarah", requester_last_name: "Chen",
    requester_email: "sarah.chen.evt@gmail.com", requester_phone: "512-555-0177",
    organization: "TechFlow Inc.",
    event_date: "2026-09-19", event_start_time: "20:30:00", event_end_time: "21:15:00",
    audience_size: 150, performance_type: "Corporate client event",
    urgency: "quick_answer",
    donation_interest: "750",
    venue_name: "The Driskill Hotel",
    venue_formatted_address: "604 Brazos St, Austin, TX 78701",
    drive_time_minutes: 115, drive_distance_miles: 105,
    call_time_minutes_before: 60, return_buffer_minutes: 15,
    status: "polling",
    polling_window_days: 30, min_couples_required: 3,
    response_deadline: "2026-07-17",
    include_in_next_survey: true,
    created_at: "2026-06-28",
  },
  {
    id: "pr_003",
    contact_id: "c_002",
    requester_first_name: "Madison", requester_last_name: "Thornton",
    requester_email: "social.chair@kkgtamu.example.com",
    organization: "Kappa Kappa Gamma — Texas A&M",
    event_date: "2026-08-30", event_start_time: "21:00:00", event_end_time: "21:30:00",
    audience_size: 220, performance_type: "Sorority formal",
    urgency: "standard",
    donation_interest: "500",
    venue_name: "The George Conference Center",
    venue_formatted_address: "180 Spence St, College Station, TX 77840",
    drive_time_minutes: 8, drive_distance_miles: 3,
    call_time_minutes_before: 60, return_buffer_minutes: 10,
    status: "ready_to_poll",
    polling_window_days: 30, min_couples_required: 3,
    response_deadline: "2026-07-22",
    include_in_next_survey: true,
    created_at: "2026-06-30",
  },
  {
    id: "pr_004",
    contact_id: "c_006",
    requester_first_name: "Tom", requester_last_name: "Fields",
    requester_email: "production@txcma.com",
    organization: "Texas Country Music Awards",
    event_date: "2026-09-12", event_start_time: "20:00:00", event_end_time: "20:08:00",
    audience_size: 2500, performance_type: "Awards show feature",
    urgency: "standard",
    donation_interest: "none",
    venue_name: "Moody Theater",
    venue_formatted_address: "310 W Willie Nelson Blvd, Austin, TX 78701",
    drive_time_minutes: 110, drive_distance_miles: 102,
    call_time_minutes_before: 120, return_buffer_minutes: 30,
    status: "new",
    polling_window_days: 60, min_couples_required: 6,
    include_in_next_survey: false,
    created_at: "2026-07-06",
  },
  {
    id: "pr_005",
    contact_id: "c_001",
    requester_first_name: "Linda", requester_last_name: "Whitfield",
    requester_email: "linda@stevensgala.com",
    organization: "Stevens Gala Events",
    event_date: "2026-03-14", event_start_time: "20:00:00", event_end_time: "20:30:00",
    audience_size: 180, performance_type: "Wedding reception",
    urgency: "standard",
    donation_interest: "750",
    donation_status: "received",
    donation_notes: "Wire transfer received 3/20.",
    venue_name: "Lakeside Estate",
    venue_formatted_address: "8400 Lakeside Dr, Houston, TX 77024",
    drive_time_minutes: 95, drive_distance_miles: 78,
    call_time_minutes_before: 90, return_buffer_minutes: 15,
    status: "completed",
    polling_window_days: 60, min_couples_required: 5,
    include_in_next_survey: false,
    confirmed_at: "2026-02-20",
    created_at: "2026-01-10",
  },
];

// ---------------- Private lesson requests ----------------

export const PRIVATE_LESSON_REQUESTS: PrivateLessonRequest[] = [
  { id: "plr_001", contact_id: "c_007", requester_first_name: "James", requester_last_name: "Ortega", requester_email: "jortega@example.com", group_size: 2, dance_type: "Wedding first dance", experience_level: "Beginner", preferred_dates: "Weeknights in May", price_quoted: 350, urgency: "standard", status: "polling", assigned_instructor_ids: ["m_003", "m_006"], created_at: "2026-04-20" },
  { id: "plr_002", contact_id: "c_008", requester_first_name: "Avery", requester_last_name: "Lin", requester_email: "avery.lin@gmail.com", group_size: 2, dance_type: "Two-step", experience_level: "Beginner", urgency: "standard", status: "new", assigned_instructor_ids: [], created_at: "2026-05-02" },
];

// ---------------- Public lessons ----------------

// Real class structure: Country & Western 1-2 and Jitterbug 1-2, 1.5-hour classes,
// 4-week sessions, $60/couple, partner required. Six sessions per year.
export const PUBLIC_LESSONS: PublicLesson[] = [
  { id: "pl_001", class_name: "Country & Western 1", level: "Beginner",     day: "Sunday", start_time: "17:30", end_time: "19:00", dates: ["2026-09-13","2026-09-20","2026-09-27","2026-10-04"], instructor_ids: ["m_004","m_003"], price_per_couple: 60, signup_url: "https://tamu.estore.flywire.com", visible_to_public: true, active: true, notes: "Two-step, waltz, and polka basics plus transitions. Partner required to sign up." },
  { id: "pl_002", class_name: "Country & Western 2", level: "Intermediate", day: "Sunday", start_time: "17:30", end_time: "19:00", dates: ["2026-09-13","2026-09-20","2026-09-27","2026-10-04"], instructor_ids: ["m_001","m_002"], price_per_couple: 60, signup_url: "https://tamu.estore.flywire.com", visible_to_public: true, active: true, notes: "Faster patterns, turns, and styling on top of CW 1. Partner required." },
  { id: "pl_003", class_name: "Jitterbug 1",         level: "Beginner",     day: "Sunday", start_time: "19:30", end_time: "21:00", dates: ["2026-09-13","2026-09-20","2026-09-27","2026-10-04"], instructor_ids: ["m_007","m_010"], price_per_couple: 60, signup_url: "https://tamu.estore.flywire.com", visible_to_public: true, active: true, notes: "Get your feet off the ground — and safely back down. Partner required." },
  { id: "pl_004", class_name: "Jitterbug 2",         level: "Intermediate", day: "Sunday", start_time: "19:30", end_time: "21:00", dates: ["2026-09-13","2026-09-20","2026-09-27","2026-10-04"], instructor_ids: ["m_001","m_003"], price_per_couple: 60, signup_url: "https://tamu.estore.flywire.com", visible_to_public: true, active: true, notes: "Bigger flips, dips, and lifts. Jitterbug 1 (or equivalent) recommended. Partner required." },
];

// ---------------- Tryouts ----------------

// Tryouts run in the SPRING (informational meeting → mock tryouts → April tryout day).
export const TRYOUT_CYCLES: TryoutCycle[] = [
  {
    id: "t_001",
    cycle_name: "Spring 2027 Tryouts",
    prep_lesson_dates: ["2027-02-01","2027-03-16","2027-03-30"],
    tryout_date: "2027-04-24",
    eligibility_notes: "Open to all currently enrolled Texas A&M students. You must try out with a partner — the tryout has a dancing portion (creativity + technique) and an interview portion. Completing the prep events is strongly recommended.",
    signup_url: "/requirements#signup",
    active: true,
  },
];

// ---------------- Calendar events ----------------

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce_001", gcal_event_id: "g_001", event_type: "performance", title: "Wedding · Stevens-Whitfield", description: "Outdoor reception in Brenham.", location_name: "Five Pines Ranch", location_address: "Brenham, TX", start_at: "2026-08-22T16:30:00-05:00", end_at: "2026-08-22T22:15:00-05:00", source_type: "performance_request", source_id: "pr_001", attendee_member_ids: ["m_001","m_002","m_003","m_006","m_007","m_010"] },
  { id: "ce_002", gcal_event_id: "g_002", event_type: "performance", title: "Corporate · TechFlow",        description: "Client appreciation evening.", location_name: "The Driskill", location_address: "Austin, TX", start_at: "2026-09-19T18:35:00-05:00", end_at: "2026-09-19T23:30:00-05:00", source_type: "performance_request", source_id: "pr_002", attendee_member_ids: ["m_001","m_002","m_003","m_006"] },
  { id: "ce_003", gcal_event_id: "g_003", event_type: "practice", title: "Team practice", location_name: "Practice space", start_at: "2026-07-13T19:30:00-05:00", end_at: "2026-07-13T21:30:00-05:00", recurrence: "FREQ=WEEKLY;BYDAY=MO", attendee_member_ids: MEMBERS.map(m => m.id) },
  { id: "ce_004", gcal_event_id: "g_004", event_type: "officer_meeting", title: "Officer meeting", start_at: "2026-07-15T17:00:00-05:00", end_at: "2026-07-15T18:30:00-05:00", recurrence: "FREQ=WEEKLY;BYDAY=WE", attendee_member_ids: ["m_001","m_002","m_003","m_004","m_005"] },
  { id: "ce_005", gcal_event_id: "g_005", event_type: "public_lesson", title: "Country & Western 1 — Sunday class", location_name: "Practice space", start_at: "2026-09-13T17:30:00-05:00", end_at: "2026-09-13T19:00:00-05:00", source_type: "public_lesson", source_id: "pl_001", attendee_member_ids: ["m_004","m_003"], recurrence: "FREQ=WEEKLY;BYDAY=SU;COUNT=4" },
  { id: "ce_006", gcal_event_id: "g_006", event_type: "tryout", title: "Spring 2027 Tryouts", start_at: "2027-04-24T08:00:00-05:00", end_at: "2027-04-24T14:00:00-05:00", source_type: "tryout", source_id: "t_001", attendee_member_ids: [] },
];

// ---------------- Resources ----------------

export const RESOURCES: ResourceFile[] = [
  { id: "r_001", title: "Constitution (current)",  description: "Updated Spring 2025.", category: "Constitution", file_url: "#",   file_type: "pdf", visibility: "members_and_alumni", uploaded_at: "2025-05-12" },
  { id: "r_002", title: "Standard Performance Contract", category: "Contracts",        file_url: "#", file_type: "pdf", visibility: "officers_only", uploaded_at: "2024-09-01" },
  { id: "r_003", title: "Choreography — Midland 'Burnout'", category: "Choreography", file_url: "#", file_type: "pdf", visibility: "members_only", uploaded_at: "2023-08-14" },
  { id: "r_004", title: "Historical Photos — 2010s",       category: "Historical",     file_url: "#", file_type: "zip", visibility: "members_and_alumni", uploaded_at: "2024-03-20" },
  { id: "r_005", title: "Sponsor Deck (2024-25)",          category: "Sponsor Decks",  file_url: "#", file_type: "pdf", visibility: "officers_only", uploaded_at: "2024-08-30" },
];

// ---------------- Moves ----------------

export const MOVES: Move[] = [
  { id: "mv_001", name: "Aggie Spin",        aliases: ["Maroon spin"],   category: "Spin",       difficulty: "Beginner",    description_markdown: "Foundational spin, taught in public Jitterbug. Counts: 1-2-3.", originated_by: "Class of '88", originated_year: 1988, video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_002", name: "Texas Tornado",     aliases: ["Tornado"],       category: "Combination", difficulty: "Advanced",    description_markdown: "Multi-rotation combo with overhead. Requires strong connection.", originated_by: "Class of '02", originated_year: 2002, video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_003", name: "Reverse Star",      aliases: ["Star inverted"], category: "Spin",       difficulty: "Intermediate", description_markdown: "Variation on the standard star with reversed footwork.", video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_004", name: "Sky Dip",           aliases: [],                category: "Dip",        difficulty: "Advanced",     description_markdown: "Performance signature dip. Safety notes: belt support, head-clear lane required.", originated_by: "Class of '07", originated_year: 2007, video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_005", name: "Cradle Catch",      aliases: ["The cradle"],    category: "Lift",       difficulty: "Expert",       description_markdown: "Lift into cradle; competition only. Spotter required during learn.", video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_006", name: "Two-Step Basic",    aliases: ["Walking step"],  category: "Footwork",   difficulty: "Beginner",     description_markdown: "Quick-quick-slow-slow. Foundation for everything.", video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
  { id: "mv_007", name: "Helicopter",        aliases: [],                category: "Aerial",     difficulty: "Expert",       description_markdown: "Lifted rotation. Performance only — never social.", originated_year: 1994, video_links: ["https://youtube.com/watch?v=demo"], status: "published" },
];

// ---------------- Email threads ----------------

export const EMAIL_THREADS: EmailThread[] = [
  { id: "et_001", contact_id: "c_001", subject: "Performance request — Stevens-Whitfield wedding", last_message_at: "2026-06-15T14:22:00Z", last_message_direction: "inbound", participants_emails: ["linda@stevensgala.com", "performance@wranglers.tamu.edu"], related_type: "performance_request", related_id: "pr_001" },
  { id: "et_002", contact_id: "c_001", subject: "RE: 2024 Patel reception thank-you",              last_message_at: "2024-05-19T09:10:00Z", last_message_direction: "outbound", participants_emails: ["linda@stevensgala.com", "performance@wranglers.tamu.edu"] },
  { id: "et_003", contact_id: "c_001", subject: "Booking — Reyes Corporate Gala",                  last_message_at: "2023-09-22T18:00:00Z", last_message_direction: "outbound", participants_emails: ["linda@stevensgala.com", "performance@wranglers.tamu.edu"] },
  { id: "et_004", contact_id: "c_002", subject: "KKG Spring Formal — confirmed",                   last_message_at: "2025-02-12T11:45:00Z", last_message_direction: "outbound", participants_emails: ["social.chair@kkgtamu.example.com"] },
];

export const EMAIL_MESSAGES: EmailMessage[] = [
  { id: "em_001", thread_id: "et_001", direction: "inbound",  from_address: "linda@stevensgala.com",            to_addresses: ["performance@wranglers.tamu.edu"], subject: "Performance request — Stevens-Whitfield wedding", body_text: "Hi y'all — we'd love to have the Wranglers at the Stevens-Whitfield wedding on August 22. Five Pines Ranch in Brenham, outdoor reception under a tent. 280 guests, audience loves the Midland video. Open to $1k donation. Let me know what you need from us.", received_at: "2026-06-12T17:14:00Z" },
  { id: "em_002", thread_id: "et_001", direction: "outbound", from_address: "performance@wranglers.tamu.edu",   to_addresses: ["linda@stevensgala.com"], subject: "Re: Performance request — Stevens-Whitfield wedding", body_text: "Linda — great to hear from you again. We have your request and are polling the team for availability. Drive time looks like ~78 min from College Station, so we'd need about a 4:30 PM call. Will confirm by July 8. Excited!", received_at: "2026-06-13T15:02:00Z", sent_by_user_id: "u_perf" },
  { id: "em_003", thread_id: "et_001", direction: "inbound",  from_address: "linda@stevensgala.com",            to_addresses: ["performance@wranglers.tamu.edu"], subject: "Re: Performance request — Stevens-Whitfield wedding", body_text: "Perfect — sounds great. The bride wants the Midland routine if at all possible. Florist is Stems by Sarah, photographer is Bayou Studios. Anything else you need?", received_at: "2026-06-15T14:22:00Z" },
  { id: "em_004", thread_id: "et_002", direction: "outbound", from_address: "performance@wranglers.tamu.edu",   to_addresses: ["linda@stevensgala.com"], subject: "RE: 2024 Patel reception thank-you", body_text: "Linda — sending a thank-you from the whole team. The Patel reception was a blast. Looking forward to working with you again next year. — Maya, PR Officer 2024", received_at: "2024-05-19T09:10:00Z", sent_by_user_id: "u_perf" },
];

// ---------------- Videos ----------------

// Real, verified YouTube IDs (official uploads).
export const VIDEOS: Video[] = [
  { id: "v_001", youtube_id: "YBCrkFB8nvc", title_override: "Midland — Burn Out (Official Music Video)",                    display_order: 1, category: "Music Videos", featured: true,  source_artist: "Midland" },
  { id: "v_002", youtube_id: "-PzF01wQYPs", title_override: "Randy Rogers Band — I'll Never Get Over You (Official Video)", display_order: 2, category: "Music Videos", featured: false, source_artist: "Randy Rogers Band" },
  { id: "v_003", youtube_id: "nUsrYVxrDwI", title_override: "Ella Langley — Choosin' Texas (Official Video)",               display_order: 3, category: "Music Videos", featured: false, source_artist: "Ella Langley" },
  { id: "v_004", youtube_id: "oDKwE88B4vI", title_override: "Tea and Two Step performance (2025)",                          display_order: 1, category: "Top Routines",   featured: false },
  { id: "v_005", youtube_id: "aEHLWpntcm8", title_override: "4th of July performance (2024)",                               display_order: 2, category: "Top Routines",   featured: false },
  { id: "v_006", youtube_id: "pCjjNu9oI9g", title_override: "Disney World — full performance",                              display_order: 3, category: "Top Routines",   featured: false },
  { id: "v_007", youtube_id: "z_zBDxGpWcU", title_override: "Aggie Wrangler promo video",                                   display_order: 1, category: "Behind the Scenes", featured: false },
];

// ---------------- Sponsors ----------------

export const SPONSORS: Sponsor[] = [
  { id: "sp_001", name: "Expressions Dance Studio", tier: "Presenting", website_url: "https://example.com", display_order: 1, active: true },
  { id: "sp_002", name: "Tailwind",                 tier: "Supporting", website_url: "https://example.com", display_order: 2, active: true },
  { id: "sp_003", name: "Buff City Soaps",          tier: "Supporting", website_url: "https://example.com", display_order: 3, active: true },
  { id: "sp_004", name: "Aggie Sports Boutique",    tier: "Friends",    website_url: "https://example.com", display_order: 4, active: true },
];

// ---------------- FAQ ----------------

export const FAQS: FAQ[] = [
  { id: "f_001", question: "How do public lessons work?",   answer: "Classes meet once a week for 1.5 hours, four weeks per session, and we run six sessions a year (two each in spring, summer, and fall). A session is $60 per couple for all four weeks — about $5 per person per hour. Sign-ups open roughly a month in advance and are first-come, first-served.", category: "Lessons", display_order: 1 },
  { id: "f_002", question: "Do I need a partner for lessons?", answer: "Yes — public lessons are couple-based, so you must sign up with a partner (line-dance workshops are the exception). Don't have one? Use our partner search to get matched with another solo dancer before the session starts.", category: "Lessons", display_order: 2 },
  { id: "f_003", question: "What if my partner can't make a week?", answer: "You can bring a substitute partner for a $30 fee, or come 30 minutes early the following week for a free make-up. Make-up time is also available right before or after class.", category: "Lessons", display_order: 3 },
  { id: "f_004", question: "What styles do you teach?",     answer: "Country & Western 1-2 covers two-step, waltz, and polka. Jitterbug 1-2 covers the Aggie-style jitterbug — flips, dips, and lifts, always challenge-by-choice. Private lessons can also cover country swing and line dances.", category: "Lessons", display_order: 4 },
  { id: "f_005", question: "Can I take a private lesson?",  answer: "Yes — we offer private lessons for couples (especially wedding first dances), groups, and organizations. Request one through the form on the Private Lessons page and the lessons coordinator will follow up with availability and a quote.", category: "Lessons", display_order: 5 },
  { id: "f_006", question: "When are tryouts?",             answer: "Tryouts happen each spring — an informational meeting early in the semester, mock tryouts in March, and the real thing in April. You must try out with a partner. Check the Tryouts page for the current cycle's dates.", category: "Tryouts", display_order: 6 },
  { id: "f_007", question: "Do you charge for performances?", answer: "Performances are completely free of charge — we're a student organization, not a commercial act. We gladly accept donations, which fund travel, uniforms, and team operations; the request form lets you signal what your organization is comfortable with.", category: "Performances", display_order: 7 },
  { id: "f_008", question: "How far in advance should I book a performance?", answer: "Requests are evaluated 6-8 weeks before the event date and answered within about a week, first-come first-served. For larger events or specific venues, submitting 3-6 months out is ideal so we can poll the team properly.", category: "Performances", display_order: 8 },
  { id: "f_009", question: "What does a performance look like?", answer: "A typical show runs 5-20 minutes with 3-10 couples: polka routines plus our High Flyin', Death Defyin' Aggie-style jitterbug. We arrive an hour early, and we need roughly 5 square feet per couple — a 12-foot ceiling is recommended for jitterbug.", category: "Performances", display_order: 9 },
];

// ---------------- Meeting notes ----------------

export const MEETING_NOTES: MeetingNote[] = [
  { id: "mn_001", meeting_date: "2026-07-08", meeting_type: "Officer meeting", attendee_member_ids: ["m_001","m_002","m_003","m_004","m_005"], agenda_markdown: "- Stevens-Whitfield polling close\n- TechFlow Austin\n- Fall lesson session schedule\n- Sponsor follow-ups", decisions_markdown: "- Confirm Stevens-Whitfield if we hit 4 couples by Friday\n- Tyler will draft TechFlow follow-up\n- Fall Session 1 lessons: Sundays 9/13-10/4, publish by 8/15", notes_markdown: "Maya raised the question of whether to bring back the Midland routine for Stevens. General agreement: yes if at least 5 couples can run it." },
  { id: "mn_002", meeting_date: "2026-06-24", meeting_type: "All-team", attendee_member_ids: MEMBERS.slice(0, 12).map(m => m.id), agenda_markdown: "- Summer practice schedule\n- Banquet recap\n- Upcoming performances", notes_markdown: "Discussed which members are around for summer. About 8 confirmed staying in College Station; 6 traveling/interning." },
];

// ---------------- Notify lists ----------------

export const NOTIFY_LISTS: NotifyList[] = [
  { id: "nl_001", key: "public_lessons", display_name: "Public Lessons", description: "We'll let you know when a new round of public lessons is scheduled.", from_alias: "lessons@aggiewranglers.com", active: true },
  { id: "nl_002", key: "tryouts",        display_name: "Tryouts",        description: "Get notified when the next tryout cycle is announced.",              from_alias: "info@aggiewranglers.com",    active: true },
];

export const NOTIFY_SUBSCRIBERS: NotifyListSubscriber[] = [
  { id: "ns_001", list_id: "nl_001", email: "jenna@example.com",     first_name: "Jenna",   subscribed_at: "2026-04-12", source: "/public-lessons signup form" },
  { id: "ns_002", list_id: "nl_001", email: "trevor.h@example.com",  first_name: "Trevor",  subscribed_at: "2026-04-18", source: "/public-lessons signup form" },
  { id: "ns_003", list_id: "nl_001", email: "andre.cuevas@example.com", first_name: "Andre", subscribed_at: "2026-05-01", source: "/public-lessons signup form" },
  { id: "ns_004", list_id: "nl_002", email: "blake.harper@example.com", first_name: "Blake", subscribed_at: "2026-04-20", source: "/requirements signup form" },
  { id: "ns_005", list_id: "nl_002", email: "casey.flores@example.com", first_name: "Casey", subscribed_at: "2026-05-04", source: "/requirements signup form" },
];

export const NOTIFY_CAMPAIGNS: NotifyListCampaign[] = [
  { id: "nc_001", list_id: "nl_001", subject: "New session of Wranglers public lessons — Summer 2026", body_text: "Hi y'all — we just published the Summer 2026 lesson schedule…", composed_by_id: "u_less", sent_at: "2026-05-18", recipient_count: 184, bounce_count: 2, unsubscribe_count_from_this_send: 1 },
];

// ---------------- Lookups ----------------

export const byId = <T extends { id: string }>(rows: T[], id: string) => rows.find(r => r.id === id);
