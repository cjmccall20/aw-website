// Type definitions aligned with PLAN.md §6 schema.
// When Supabase + Drizzle come online, these become the inferred types from the schema.

export type ID = string;
export type ISODate = string;

// ---- Identity & access ----
export type PermissionStatusKey =
  | "admin" | "president" | "vp"
  | "performance_officer" | "lessons_coordinator" | "secretary"
  | "member" | "alumni";

export type TabKey =
  | "dashboard" | "performance_management" | "lessons_management"
  | "contacts" | "members" | "webmaster" | "team_calendar"
  | "resources" | "move_library" | "alumni_directory"
  | "meeting_notes" | "long_term_goals" | "performance_stats"
  | "surveys" | "settings";

export type AccessLevel = "none" | "view" | "edit";

export interface PermissionStatus {
  id: ID;
  key: PermissionStatusKey | string;
  display_name: string;
  description?: string;
  is_system: boolean;
}

export interface PermissionMatrixEntry {
  status_key: string;
  tab_key: TabKey;
  access: AccessLevel;
}

export interface User {
  id: ID;
  primary_email: string;
  name: string;
  avatar_url?: string;
  status: "pending_setup" | "active" | "disabled";
  member_id?: ID;
  phone?: string;
  status_keys: string[]; // permission statuses the user holds
}

// ---- Members & alumni ----
export type MemberStatus = "current" | "tryout" | "graduated" | "inactive";

export interface Member {
  id: ID;
  name: string;
  role_title?: string;
  class_year?: number;
  hometown?: string;
  major?: string;
  headshot_url?: string;
  partner_photo_url?: string;
  partner_id?: ID;
  bio?: string;
  status: MemberStatus;
  tamu_email?: string;
  personal_email?: string;
  phone?: string;
  sms_opt_in?: boolean;
  display_order?: number;
  graduation_date?: ISODate;
}

export interface AlumniProfile {
  id: ID;
  member_id?: ID;
  name: string;
  graduation_year: number;
  current_city?: string;
  current_address?: string;
  current_role?: string;
  what_im_up_to?: string;
  contact_permission: "visible_to_members_only" | "visible_to_alumni_too" | "private";
  email?: string;
  phone?: string;
  status: "draft_auto_created" | "active" | "unverified";
}

// ---- Contacts ----
export interface Contact {
  id: ID;
  kind: "person" | "organization";
  name: string;
  parent_org_contact_id?: ID;
  email?: string;
  phone?: string;
  address?: string;
  tags: string[];
  email_opt_in: boolean;
  sms_opt_in: boolean;
  notes_markdown?: string;
  follow_up_date?: ISODate;
  created_at: ISODate;
}

export interface AnnualReminder {
  id: ID;
  contact_id: ID;
  reminder_month: number;
  reminder_day_of_month?: number;
  note: string;
  assignee_status_key?: string;
  lead_time_weeks: number;
  last_acted_on_at?: ISODate;
}

// ---- Requests + workflow ----
export type PerfRequestStatus =
  | "new" | "under_review" | "ready_to_poll" | "polling"
  | "polling_closed" | "confirmed" | "declined" | "completed";

export type DonationInterest = "none" | "250" | "500" | "750" | "1000" | "other";
export type DonationStatus = "pending" | "received" | "declined" | "no_response";
export type Urgency = "standard" | "quick_answer";

export interface PerformanceRequest {
  id: ID;
  contact_id: ID;
  requester_first_name: string;
  requester_last_name: string;
  requester_email: string;
  requester_phone?: string;
  organization?: string;
  event_date: ISODate;
  event_start_time: string;
  event_end_time: string;
  audience_size?: number;
  performance_type?: string;
  notes?: string;
  urgency: Urgency;
  donation_interest: DonationInterest;
  donation_interest_other_text?: string;
  donation_status?: DonationStatus;
  donation_notes?: string;
  venue_name?: string;
  venue_formatted_address?: string;
  drive_time_minutes?: number;
  drive_distance_miles?: number;
  call_time_minutes_before: number;
  return_buffer_minutes: number;
  status: PerfRequestStatus;
  assigned_officer_id?: ID;
  review_notes?: string;
  polling_window_days: number;
  min_couples_required: number;
  response_deadline?: ISODate;
  include_in_next_survey: boolean;
  confirmed_at?: ISODate;
  confirmed_by_id?: ID;
  gcal_event_id?: string;
  created_at: ISODate;
}

export interface PerformanceRosterEntry {
  performance_request_id: ID;
  member_id: ID;
  role: "performer" | "lead" | "partner" | "alternate";
  added_at: ISODate;
}

export interface PrivateLessonRequest {
  id: ID;
  contact_id: ID;
  requester_first_name: string;
  requester_last_name: string;
  requester_email: string;
  requester_phone?: string;
  group_size?: number;
  dance_type?: string;
  experience_level?: string;
  preferred_dates?: string;
  price_quoted?: number;
  notes?: string;
  urgency: Urgency;
  status: PerfRequestStatus;
  assigned_instructor_ids: ID[];
  created_at: ISODate;
}

// ---- Lessons ----
export interface PublicLesson {
  id: ID;
  class_name: string;
  level: string;
  day: string;
  start_time: string;
  end_time: string;
  dates: ISODate[];
  instructor_ids: ID[];
  signup_url?: string;
  /** Whole-session price per couple (lessons are couple-based; $60/couple for a 4-week session). */
  price_per_couple?: number;
  visible_to_public: boolean;
  publish_at?: ISODate;
  active: boolean;
  notes?: string;
}

// ---- Tryouts ----
export interface TryoutCycle {
  id: ID;
  cycle_name: string;
  prep_lesson_dates: ISODate[];
  tryout_date: ISODate;
  eligibility_notes?: string;
  signup_url?: string;
  active: boolean;
}

// ---- Surveys ----
export interface SurveyRun {
  id: ID;
  run_at: ISODate;
  run_type: "weekly_auto" | "manual";
  performance_request_ids: ID[];
  private_lesson_request_ids: ID[];
  member_count: number;
  response_count: number;
  response_deadline: ISODate;
}

export interface SurveyResponse {
  id: ID;
  survey_run_id: ID;
  member_id: ID;
  target_type: "performance" | "private_lesson";
  target_id: ID;
  available: "yes" | "no" | "maybe";
  notes?: string;
  responded_at: ISODate;
}

// ---- Calendar ----
export type EventType =
  | "performance" | "public_lesson" | "private_lesson"
  | "tryout" | "practice" | "officer_meeting"
  | "retreat" | "workshop" | "other";

export interface CalendarEvent {
  id: ID;
  gcal_event_id: string;
  event_type: EventType;
  title: string;
  description?: string;
  location_name?: string;
  location_address?: string;
  start_at: ISODate;
  end_at: ISODate;
  all_day?: boolean;
  source_type?: string;
  source_id?: ID;
  attendee_member_ids: ID[];
  recurrence?: string;
  color?: string;
}

// ---- Resources + moves ----
export interface ResourceFile {
  id: ID;
  title: string;
  description?: string;
  category: "Constitution" | "Choreography" | "Contracts" | "Historical" | "Sponsor Decks" | "Other";
  file_url: string;
  file_type: string;
  visibility: "members_only" | "members_and_alumni" | "officers_only";
  uploaded_at: ISODate;
}

export interface Move {
  id: ID;
  name: string;
  aliases: string[];
  category: "Spin" | "Lift" | "Throw" | "Dip" | "Combination" | "Footwork" | "Aerial";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  description_markdown: string;
  originated_by?: string;
  originated_year?: number;
  video_links: string[];
  status: "draft" | "published" | "archived";
}

// ---- Email (BCC archive ingest) ----
export interface EmailThread {
  id: ID;
  contact_id: ID;
  subject: string;
  last_message_at: ISODate;
  last_message_direction: "inbound" | "outbound";
  participants_emails: string[];
  related_type?: "performance_request" | "private_lesson_request" | "general_inquiry";
  related_id?: ID;
}

export interface EmailMessage {
  id: ID;
  thread_id: ID;
  direction: "inbound" | "outbound";
  from_address: string;
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body_text: string;
  received_at: ISODate;
  sent_by_user_id?: ID;
}

// ---- Notify lists ----
export interface NotifyList {
  id: ID;
  key: "public_lessons" | "tryouts" | string;
  display_name: string;
  description?: string;
  from_alias: string;
  active: boolean;
}

export interface NotifyListSubscriber {
  id: ID;
  list_id: ID;
  email: string;
  first_name?: string;
  last_name?: string;
  subscribed_at: ISODate;
  unsubscribed_at?: ISODate;
  source: string;
}

export interface NotifyListCampaign {
  id: ID;
  list_id: ID;
  subject: string;
  body_text: string;
  composed_by_id: ID;
  sent_at: ISODate;
  recipient_count: number;
  bounce_count: number;
  unsubscribe_count_from_this_send: number;
}

// ---- Videos + sponsors + FAQ ----
export interface Video {
  id: ID;
  youtube_id: string;
  title_override?: string;
  display_order: number;
  category: "Top Routines" | "Music Videos" | "Behind the Scenes";
  featured: boolean;
  source_artist?: string;
}

export interface Sponsor {
  id: ID;
  name: string;
  tier: "Presenting" | "Supporting" | "Friends";
  logo_url?: string;
  website_url?: string;
  display_order: number;
  active: boolean;
}

export interface FAQ {
  id: ID;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

// ---- Meeting notes + goals ----
export interface MeetingNote {
  id: ID;
  meeting_date: ISODate;
  meeting_type: string;
  attendee_member_ids: ID[];
  agenda_markdown: string;
  decisions_markdown?: string;
  notes_markdown?: string;
}

export interface ActionItem {
  id: ID;
  meeting_note_id?: ID;
  description: string;
  assignee_member_id?: ID;
  due_date?: ISODate;
  completed_at?: ISODate;
}

export interface LongTermGoals {
  body_markdown: string;
  updated_at: ISODate;
}
