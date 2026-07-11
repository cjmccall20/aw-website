"use client";

// Shared write-actions used by both the public forms and the portal.
// Each mirrors a future API route (PLAN.md §7) — swapping to the real backend
// means replacing these bodies with fetch("/api/...") calls.

import { update, uid, todayISO, type DB } from "@/lib/store";
import type { Contact, DonationInterest, Urgency } from "@/lib/types";

export interface PersonFields {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization?: string;
}

/**
 * Contact matching per PLAN.md §6.3: match on email OR phone OR fuzzy
 * first+last OR org name; otherwise create a person contact (plus an
 * organization contact when an org name is given and unknown).
 */
export function matchOrCreateContact(dbx: DB, p: PersonFields): Contact {
  const norm = (s: string) => s.trim().toLowerCase();
  const fullName = `${p.first_name} ${p.last_name}`.trim();
  let contact =
    dbx.contacts.find(c => c.email && norm(c.email) === norm(p.email)) ??
    (p.phone ? dbx.contacts.find(c => c.phone && c.phone.replace(/\D/g, "") === p.phone!.replace(/\D/g, "")) : undefined) ??
    dbx.contacts.find(c => c.kind === "person" && norm(c.name) === norm(fullName)) ??
    (p.organization ? dbx.contacts.find(c => c.kind === "organization" && norm(c.name) === norm(p.organization!)) : undefined);

  if (!contact) {
    contact = {
      id: uid("c"),
      kind: "person",
      name: fullName,
      email: p.email,
      phone: p.phone || undefined,
      tags: [],
      email_opt_in: true,
      sms_opt_in: false,
      created_at: todayISO(),
    };
    dbx.contacts.push(contact);
  }
  return contact;
}

export interface PerformanceRequestFields extends PersonFields {
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  venue_name: string;
  venue_formatted_address?: string;
  audience_size?: number;
  performance_type?: string;
  notes?: string;
  urgency: Urgency;
  donation_interest: DonationInterest;
  donation_interest_other_text?: string;
}

export function createPerformanceRequest(f: PerformanceRequestFields): string {
  const id = uid("pr");
  update(dbx => {
    const contact = matchOrCreateContact(dbx, f);
    dbx.performanceRequests.push({
      id,
      contact_id: contact.id,
      requester_first_name: f.first_name,
      requester_last_name: f.last_name,
      requester_email: f.email,
      requester_phone: f.phone || undefined,
      organization: f.organization || undefined,
      event_date: f.event_date,
      event_start_time: f.event_start_time.length === 5 ? `${f.event_start_time}:00` : f.event_start_time,
      event_end_time: f.event_end_time.length === 5 ? `${f.event_end_time}:00` : f.event_end_time,
      audience_size: f.audience_size,
      performance_type: f.performance_type,
      notes: f.notes || undefined,
      urgency: f.urgency,
      donation_interest: f.donation_interest,
      donation_interest_other_text: f.donation_interest_other_text || undefined,
      venue_name: f.venue_name,
      venue_formatted_address: f.venue_formatted_address,
      call_time_minutes_before: 60,
      return_buffer_minutes: 15,
      status: "new",
      polling_window_days: 30,
      min_couples_required: 3,
      include_in_next_survey: false,
      created_at: todayISO(),
    });
    // Auto-reply record (the real build sends this via Resend and archives it).
    const threadId = uid("et");
    dbx.emailThreads.push({
      id: threadId, contact_id: contact.id,
      subject: `Performance request received — ${f.venue_name}`,
      last_message_at: new Date().toISOString(), last_message_direction: "outbound",
      participants_emails: [f.email, "performance@wranglers.tamu.edu"],
      related_type: "performance_request", related_id: id,
    });
    dbx.emailMessages.push({
      id: uid("em"), thread_id: threadId, direction: "outbound",
      from_address: "performance@aggiewranglers.com", to_addresses: [f.email],
      subject: `Performance request received — ${f.venue_name}`,
      body_text: `Hi ${f.first_name} — we received your performance request for ${f.event_date} at ${f.venue_name}. The performance officer reviews requests within a few days and will follow up personally. (Automated acknowledgment.)`,
      received_at: new Date().toISOString(),
    });
  }, `New performance request: ${f.venue_name} (${f.event_date})`);
  return id;
}

export interface PrivateLessonFields extends PersonFields {
  group_size?: number;
  dance_type?: string;
  experience_level?: string;
  preferred_dates?: string;
  notes?: string;
}

export function createPrivateLessonRequest(f: PrivateLessonFields): string {
  const id = uid("plr");
  update(dbx => {
    const contact = matchOrCreateContact(dbx, f);
    dbx.privateLessonRequests.push({
      id,
      contact_id: contact.id,
      requester_first_name: f.first_name,
      requester_last_name: f.last_name,
      requester_email: f.email,
      requester_phone: f.phone || undefined,
      group_size: f.group_size,
      dance_type: f.dance_type,
      experience_level: f.experience_level,
      preferred_dates: f.preferred_dates,
      notes: f.notes,
      urgency: "standard",
      status: "new",
      assigned_instructor_ids: [],
      created_at: todayISO(),
    });
  }, `New private lesson request: ${f.first_name} ${f.last_name}`);
  return id;
}

export function createInquiry(f: PersonFields & { subject: string; message: string }): string {
  const id = uid("gi");
  update(dbx => {
    const contact = matchOrCreateContact(dbx, f);
    dbx.inquiries.push({
      id,
      contact_id: contact.id,
      first_name: f.first_name,
      last_name: f.last_name,
      email: f.email,
      phone: f.phone,
      subject: f.subject,
      message: f.message,
      needs_human: true,
      created_at: todayISO(),
    });
  }, `New general inquiry: ${f.subject}`);
  return id;
}

export function subscribeToNotifyList(listKey: string, email: string, firstName?: string): boolean {
  let ok = false;
  update(dbx => {
    const list = dbx.notifyLists.find(l => l.key === listKey);
    if (!list) return;
    const existing = dbx.notifySubscribers.find(
      s => s.list_id === list.id && s.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      existing.unsubscribed_at = undefined; // re-subscribe
      ok = true;
      return;
    }
    dbx.notifySubscribers.push({
      id: uid("ns"), list_id: list.id, email: email.trim(),
      first_name: firstName || undefined,
      subscribed_at: todayISO(),
      source: `/${listKey === "tryouts" ? "requirements" : "public-lessons"} signup form`,
    });
    ok = true;
  }, `Notify-list signup (${listKey}): ${email}`);
  return ok;
}
