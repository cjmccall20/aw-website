"use client";

import Link from "next/link";
import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField } from "@/components/portal/ui";
import { useStore, useAccess, useSessionUser, update, uid, todayISO } from "@/lib/store";
import { formatDate, formatTime, cn, initials, placeholderColor } from "@/lib/utils";
import type { PerformanceRequest, DonationStatus } from "@/lib/types";
import {
  ArrowLeft, MapPin, Clock, Users, DollarSign, Zap, AlertCircle,
  Mail, ExternalLink, MessageSquare, Check, X, Pencil, Plus, CalendarPlus,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  new: "New", under_review: "Under review", ready_to_poll: "Ready to poll",
  polling: "Polling", polling_closed: "Polling closed — needs your decision",
  confirmed: "Confirmed", declined: "Declined", completed: "Completed",
};

const STATUS_PILL: Record<string, string> = {
  new: "pill-amber", under_review: "pill-amber",
  ready_to_poll: "pill-line", polling: "pill-line",
  polling_closed: "pill-maroon", confirmed: "pill-green",
  declined: "pill-line", completed: "pill-green",
};

export function PerformanceDetailView({ id }: { id: string }) {
  const db = useStore();
  const access = useAccess("performance_management");
  const canEdit = access === "edit";
  const req = db.performanceRequests.find(r => r.id === id);

  if (!req) {
    return (
      <PortalShell tabKey="performance_management" title="Request not found">
        <p className="text-ink-soft">This request doesn&apos;t exist (it may have been created in another browser session).</p>
        <Link href="/portal/performance-management" className="mt-4 btn-secondary inline-flex">Back to Performance Management</Link>
      </PortalShell>
    );
  }

  const contact = db.contacts.find(c => c.id === req.contact_id);
  const threads = db.emailThreads.filter(t => t.related_id === req.id || t.contact_id === req.contact_id);
  const messages = db.emailMessages.filter(m => threads.some(t => t.id === m.thread_id))
    .sort((a, b) => a.received_at.localeCompare(b.received_at));

  return (
    <PortalShell
      tabKey="performance_management"
      breadcrumb={
        <Link href="/portal/performance-management" className="inline-flex items-center gap-1 text-ink-faint hover:text-ink-soft">
          <ArrowLeft className="h-3.5 w-3.5" /> Performance Management
        </Link>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <header className="card-padded">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="eyebrow">{req.performance_type}</p>
                <h1 className="mt-2 font-serif text-3xl font-semibold">
                  {req.organization ?? `${req.requester_first_name} ${req.requester_last_name}`}
                </h1>
                <p className="mt-1 text-ink-soft">
                  Requester: {contact ? (
                    <Link href={`/portal/contacts/detail?id=${req.contact_id}`} className="text-maroon-700 hover:underline">{req.requester_first_name} {req.requester_last_name}</Link>
                  ) : (
                    <span>{req.requester_first_name} {req.requester_last_name}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={STATUS_PILL[req.status] ?? "pill-line"} data-testid="request-status">{STATUS_LABEL[req.status]}</span>
                {req.urgency === "quick_answer" && (
                  <span className="pill-amber inline-flex items-center gap-1"><Zap className="h-3 w-3" /> Quick answer needed</span>
                )}
              </div>
            </div>

            {req.status === "polling_closed" && <PollBreakdownCallout req={req} />}

            <dl className="mt-6 grid sm:grid-cols-2 gap-4">
              <DetailField icon={<Clock />} label="Event date">
                {formatDate(req.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                <br />
                <span className="text-ink-soft">{req.event_start_time.slice(0, 5)} – {req.event_end_time.slice(0, 5)} CT</span>
              </DetailField>
              <DetailField icon={<MapPin />} label="Venue">
                {req.venue_name}<br />
                <span className="text-ink-soft text-sm">{req.venue_formatted_address}</span>
              </DetailField>
              <DetailField icon={<Users />} label="Audience">
                {req.audience_size ? `${req.audience_size.toLocaleString()} guests` : "—"}
              </DetailField>
              <DetailField icon={<DollarSign />} label="Donation interest">
                {req.donation_interest === "none" ? <span className="text-ink-faint">Not at this time</span>
                  : req.donation_interest === "other" ? (req.donation_interest_other_text || "Other")
                  : `$${req.donation_interest}`}
                {(req.status === "completed" || req.status === "confirmed") && (
                  <DonationTracker req={req} canEdit={canEdit} />
                )}
              </DetailField>
            </dl>
          </header>

          <TravelCard req={req} canEdit={canEdit} />

          {req.notes && (
            <section className="card-padded">
              <h2 className="font-serif text-xl font-semibold">From the requester</h2>
              <blockquote className="mt-3 text-ink italic border-l-4 border-maroon-200 pl-4">
                &ldquo;{req.notes}&rdquo;
              </blockquote>
            </section>
          )}

          {(req.status === "polling" || req.status === "polling_closed") && <ResponsesCard req={req} />}

          {(req.status === "confirmed" || req.status === "completed") && (
            <RosterCard req={req} canEdit={canEdit} />
          )}

          {/* Email thread */}
          {messages.length > 0 && (
            <section className="card-padded">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold inline-flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-maroon-700" /> Email history
                </h2>
                <span className="text-xs text-ink-faint">{messages.length} messages · auto-captured via Outlook BCC</span>
              </div>
              <ul className="mt-5 space-y-4">
                {messages.map(m => (
                  <li key={m.id} className={cn("p-4 rounded-lg border", m.direction === "outbound" ? "bg-cream-100 border-line" : "bg-white border-line")}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-semibold", m.direction === "outbound" ? "text-maroon-700" : "text-ink")}>
                        {m.direction === "outbound" ? "Sent" : "Received"} · {m.from_address}
                      </span>
                      <span className="text-ink-faint">{formatDate(m.received_at)}</span>
                    </div>
                    <p className="mt-2 font-medium text-sm">{m.subject}</p>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{m.body_text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar: actions */}
        <aside className="space-y-6">
          <ActionPanel req={req} canEdit={canEdit} />
          <PollingPanel req={req} canEdit={canEdit} />
        </aside>
      </div>
    </PortalShell>
  );
}

// ─── polling breakdown ───────────────────────────────────────────────────────

function usePollCounts(req: PerformanceRequest) {
  const db = useStore();
  const responses = db.surveyResponses.filter(r => r.target_type === "performance" && r.target_id === req.id);
  const yes = responses.filter(r => r.available === "yes");
  const no = responses.filter(r => r.available === "no");
  const maybe = responses.filter(r => r.available === "maybe");
  const respondedIds = new Set(responses.map(r => r.member_id));
  const noResponse = db.members.filter(m => m.status === "current" && !respondedIds.has(m.id));
  return { responses, yes, no, maybe, noResponse };
}

function PollBreakdownCallout({ req }: { req: PerformanceRequest }) {
  const { yes } = usePollCounts(req);
  const couples = Math.floor(yes.length / 2);
  const met = couples >= req.min_couples_required;
  return (
    <div className={cn("mt-6 p-4 rounded-lg border", met ? "border-green/40 bg-green-pale" : "border-maroon-300 bg-maroon-50")}>
      <div className="flex gap-3">
        <AlertCircle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", met ? "text-green" : "text-maroon-700")} />
        <div>
          <p className={cn("font-semibold", met ? "text-green" : "text-maroon-800")}>
            Polling closed — your decision. {met ? "Threshold met." : "Threshold NOT met."}
          </p>
          <p className="text-sm text-ink-soft mt-1">
            {yes.length} members (≈{couples} couples) available; need {req.min_couples_required} couples.
            Review the responses below, then Confirm or Decline — nothing sends without your click.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResponsesCard({ req }: { req: PerformanceRequest }) {
  const db = useStore();
  const { yes, no, maybe, noResponse } = usePollCounts(req);
  const name = (id: string) => db.members.find(m => m.id === id)?.name ?? id;
  const Group = ({ label, tone, ids }: { label: string; tone: string; ids: string[] }) => (
    <div>
      <p className={cn("text-xs uppercase tracking-wider font-semibold", tone)}>{label} ({ids.length})</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ids.length === 0 && <span className="text-xs text-ink-faint">—</span>}
        {ids.map(id => (
          <span key={id} className="pill-line inline-flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold" style={{ background: placeholderColor(name(id)) }}>{initials(name(id))}</span>
            {name(id).split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <section className="card-padded" data-testid="responses-card">
      <h2 className="font-serif text-xl font-semibold">Availability responses</h2>
      <p className="text-xs text-ink-faint mt-1">From the weekly combined survey. Members respond in the portal or by email.</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <Group label="Yes" tone="text-green" ids={yes.map(r => r.member_id)} />
        <Group label="Maybe" tone="text-amber-700" ids={maybe.map(r => r.member_id)} />
        <Group label="No" tone="text-maroon-700" ids={no.map(r => r.member_id)} />
        <Group label="No response yet" tone="text-ink-faint" ids={noResponse.map(m => m.id)} />
      </div>
    </section>
  );
}

// ─── roster ──────────────────────────────────────────────────────────────────

function RosterCard({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  const db = useStore();
  const [adding, setAdding] = useState(false);
  const roster = db.performanceRoster.filter(r => r.performance_request_id === req.id);
  const rosterIds = new Set(roster.map(r => r.member_id));
  const addable = db.members.filter(m => m.status === "current" && !rosterIds.has(m.id));

  function removeMember(memberId: string) {
    update(dbx => {
      dbx.performanceRoster = dbx.performanceRoster.filter(
        r => !(r.performance_request_id === req.id && r.member_id === memberId));
      const ev = dbx.calendarEvents.find(e => e.source_id === req.id);
      if (ev) ev.attendee_member_ids = ev.attendee_member_ids.filter(id => id !== memberId);
    }, `Removed member from ${req.venue_name} roster`);
  }

  function addMember(memberId: string) {
    update(dbx => {
      dbx.performanceRoster.push({ performance_request_id: req.id, member_id: memberId, role: "performer", added_at: todayISO() });
      const ev = dbx.calendarEvents.find(e => e.source_id === req.id);
      if (ev && !ev.attendee_member_ids.includes(memberId)) ev.attendee_member_ids.push(memberId);
    }, `Added member to ${req.venue_name} roster`);
    setAdding(false);
  }

  return (
    <section className="card-padded" data-testid="roster-card">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Performance roster</h2>
        <span className="text-xs text-ink-faint">{roster.length} members · edits notify affected members</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {roster.map(r => {
          const m = db.members.find(x => x.id === r.member_id);
          if (!m) return null;
          return (
            <span key={r.member_id} className="inline-flex items-center gap-1.5 pill-line">
              <span className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</span>
              {m.name.split(" ")[0]}
              {canEdit && (
                <button onClick={() => removeMember(m.id)} aria-label={`Remove ${m.name}`} className="text-ink-faint hover:text-maroon-700 ml-0.5">×</button>
              )}
            </span>
          );
        })}
        {canEdit && (
          <button onClick={() => setAdding(true)} className="pill-line cursor-pointer hover:bg-cream-300 inline-flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add member
          </button>
        )}
      </div>
      {adding && (
        <Modal title="Add member to roster" onClose={() => setAdding(false)}>
          <ul className="divide-y divide-line">
            {addable.map(m => (
              <li key={m.id}>
                <button onClick={() => addMember(m.id)} className="w-full text-left py-2.5 px-2 hover:bg-cream-200 rounded flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</span>
                  {m.name}
                </button>
              </li>
            ))}
            {addable.length === 0 && <li className="py-3 text-sm text-ink-faint">Everyone&apos;s already on the roster.</li>}
          </ul>
        </Modal>
      )}
    </section>
  );
}

// ─── travel ──────────────────────────────────────────────────────────────────

function TravelCard({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [drive, setDrive] = useState(String(req.drive_time_minutes ?? ""));
  const [call, setCall] = useState(String(req.call_time_minutes_before));
  const [buffer, setBuffer] = useState(String(req.return_buffer_minutes));

  function save(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id);
      if (!r) return;
      r.drive_time_minutes = drive ? Number(drive) : undefined;
      r.call_time_minutes_before = Number(call) || 60;
      r.return_buffer_minutes = Number(buffer) || 15;
    }, `Updated travel numbers for ${req.venue_name}`);
    setEditing(false);
  }

  return (
    <section className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Travel &amp; availability</h2>
        {canEdit && (
          <button onClick={() => setEditing(true)} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /> Edit</button>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {req.drive_time_minutes
          ? "Computed from College Station → venue. Shown to members in the survey."
          : "Drive time not set yet — the real build computes this via Google Distance Matrix at intake; set it manually for now."}
      </p>
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        <Stat label="Drive time" value={req.drive_time_minutes ? `${req.drive_time_minutes} min` : "—"} sub={req.drive_distance_miles ? `${req.drive_distance_miles} mi` : undefined} />
        <Stat label="Call time before" value={`${req.call_time_minutes_before} min`} sub="Officer overridable" />
        <Stat label="Return buffer" value={`${req.return_buffer_minutes} min`} sub="Officer overridable" />
      </div>
      {req.drive_time_minutes ? (
        <div className="mt-5 p-4 bg-cream-200 rounded-lg text-sm">
          <p className="font-medium">Member availability window:</p>
          <p className="text-ink-soft mt-1">
            Roughly{" "}
            {formatTime(new Date(`${req.event_date}T${req.event_start_time}`).getTime() - (req.call_time_minutes_before + req.drive_time_minutes) * 60000)}
            {" "}–{" "}
            {formatTime(new Date(`${req.event_date}T${req.event_end_time}`).getTime() + (req.drive_time_minutes + req.return_buffer_minutes) * 60000)}
            {" CT"}
          </p>
        </div>
      ) : null}
      {editing && (
        <Modal title="Edit travel numbers" onClose={() => setEditing(false)}>
          <form onSubmit={save} className="space-y-4">
            <TextField label="Drive time (minutes)" value={drive} onChange={setDrive} type="number" />
            <TextField label="Call time before (minutes)" value={call} onChange={setCall} type="number" />
            <TextField label="Return buffer (minutes)" value={buffer} onChange={setBuffer} type="number" />
            <button type="submit" className="btn-primary w-full">Save</button>
          </form>
        </Modal>
      )}
    </section>
  );
}

// ─── donation tracking ───────────────────────────────────────────────────────

function DonationTracker({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  if (!canEdit) {
    return req.donation_status ? (
      <span className="block text-xs text-ink-soft mt-1">Post-event: {req.donation_status.replace(/_/g, " ")}</span>
    ) : null;
  }
  return (
    <div className="mt-2">
      <select
        className="select text-xs py-1.5"
        value={req.donation_status ?? "pending"}
        aria-label="Donation status"
        onChange={e => update(dbx => {
          const r = dbx.performanceRequests.find(x => x.id === req.id);
          if (r) r.donation_status = e.target.value as DonationStatus;
        }, `Set donation status: ${e.target.value}`)}
      >
        <option value="pending">Donation: pending</option>
        <option value="received">Donation: received</option>
        <option value="declined">Donation: declined</option>
        <option value="no_response">Donation: no response</option>
      </select>
    </div>
  );
}

// ─── actions ─────────────────────────────────────────────────────────────────

function logOutbound(dbx: ReturnType<typeof structuredCloneDbType>, req: PerformanceRequest, subject: string, body: string) {
  let thread = dbx.emailThreads.find(t => t.related_id === req.id);
  if (!thread) {
    thread = {
      id: uid("et"), contact_id: req.contact_id, subject,
      last_message_at: new Date().toISOString(), last_message_direction: "outbound",
      participants_emails: [req.requester_email, "performance@wranglers.tamu.edu"],
      related_type: "performance_request", related_id: req.id,
    };
    dbx.emailThreads.push(thread);
  }
  thread.last_message_at = new Date().toISOString();
  thread.last_message_direction = "outbound";
  dbx.emailMessages.push({
    id: uid("em"), thread_id: thread.id, direction: "outbound",
    from_address: "performance@wranglers.tamu.edu", to_addresses: [req.requester_email],
    subject, body_text: body, received_at: new Date().toISOString(),
  });
}
// Type helper so logOutbound can take the draft inside update()
function structuredCloneDbType() { return undefined as unknown as import("@/lib/store").DB; }

function ActionPanel({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  const user = useSessionUser();
  const officerFirst = user?.name.split(" ")[0] ?? "The team";

  const mailtoConfirm = `mailto:${req.requester_email}?subject=${encodeURIComponent(`Confirmation — Aggie Wranglers at your ${req.performance_type ?? "event"}`)}&body=${encodeURIComponent(`Hi ${req.requester_first_name},\n\nWe're thrilled to confirm the Aggie Wranglers for your event on ${formatDate(req.event_date)}.\n\nDetails:\n- Performance time: ${req.event_start_time.slice(0, 5)}\n- Call time: ${req.call_time_minutes_before} min before\n${req.drive_time_minutes ? `- Drive time from CS: ${req.drive_time_minutes} min\n` : ""}\nWe'll be in touch closer to the date with final logistics.\n\nThanks,\n${officerFirst} — Performance Officer\nAggie Wranglers`)}`;
  const mailtoDecline = `mailto:${req.requester_email}?subject=${encodeURIComponent("Regarding your performance request")}&body=${encodeURIComponent(`Hi ${req.requester_first_name},\n\nThank you for thinking of the Aggie Wranglers. Unfortunately we're unable to take this booking due to...\n\n— ${officerFirst}, Performance Officer`)}`;

  function transition(status: PerformanceRequest["status"], audit: string, extra?: (dbx: import("@/lib/store").DB) => void) {
    update(dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id);
      if (!r) return;
      r.status = status;
      extra?.(dbx);
    }, audit);
  }

  function approveToPoll() {
    transition("ready_to_poll", `Approved to poll: ${req.venue_name}`);
  }

  function sendSurveyNow() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    transition("polling", `Opened polling: ${req.venue_name}`, dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id);
      if (r) r.response_deadline = deadline.toISOString().slice(0, 10);
    });
  }

  function closePolling() {
    transition("polling_closed", `Closed polling: ${req.venue_name}`);
  }

  function confirm() {
    transition("confirmed", `CONFIRMED performance: ${req.venue_name}`, dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id)!;
      r.confirmed_at = new Date().toISOString();
      // Roster = everyone who said yes.
      const yes = dbx.surveyResponses.filter(x => x.target_type === "performance" && x.target_id === req.id && x.available === "yes");
      for (const y of yes) {
        if (!dbx.performanceRoster.some(pr => pr.performance_request_id === req.id && pr.member_id === y.member_id)) {
          dbx.performanceRoster.push({ performance_request_id: req.id, member_id: y.member_id, role: "performer", added_at: todayISO() });
        }
      }
      // Calendar event.
      if (!dbx.calendarEvents.some(e => e.source_id === req.id)) {
        const gid = uid("g");
        dbx.calendarEvents.push({
          id: uid("ce"), gcal_event_id: gid, event_type: "performance",
          title: `${req.performance_type ?? "Performance"} · ${req.organization ?? req.requester_last_name}`,
          location_name: req.venue_name, location_address: req.venue_formatted_address,
          start_at: `${req.event_date}T${req.event_start_time}-05:00`,
          end_at: `${req.event_date}T${req.event_end_time}-05:00`,
          source_type: "performance_request", source_id: req.id,
          attendee_member_ids: yes.map(y => y.member_id),
        });
        const rr = dbx.performanceRequests.find(x => x.id === req.id)!;
        rr.gcal_event_id = gid;
      }
      logOutbound(dbx, req, `Confirmation — Aggie Wranglers at your ${req.performance_type ?? "event"}`,
        `(Logged) Confirmation drafted in Outlook and sent to ${req.requester_email}. Calendar event created and roster seeded from yes-responses.`);
    });
  }

  function decline() {
    transition("declined", `Declined request: ${req.venue_name}`, dbx => {
      logOutbound(dbx, req, "Regarding your performance request",
        `(Logged) Decline drafted in Outlook and sent to ${req.requester_email}.`);
    });
  }

  function markCompleted() {
    transition("completed", `Marked completed: ${req.venue_name}`, dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id);
      if (r && !r.donation_status && r.donation_interest !== "none") r.donation_status = "pending";
    });
  }

  if (!canEdit) {
    return (
      <div className="card-padded">
        <h2 className="font-serif text-xl font-semibold">Actions</h2>
        <p className="mt-3 text-sm text-ink-faint">View-only — workflow actions need edit access to Performance Management.</p>
      </div>
    );
  }

  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Actions</h2>
      <p className="mt-2 text-xs text-ink-faint">Compose buttons open TAMU Outlook with a prefilled draft; the send is always yours. Status changes apply immediately.</p>

      <div className="mt-5 space-y-2">
        {(req.status === "new" || req.status === "under_review") && (
          <>
            <button onClick={approveToPoll} className="btn-primary w-full justify-center" data-testid="approve-to-poll">Approve to poll</button>
            {req.status === "new" && (
              <button
                onClick={() => transition("under_review", `Marked under review: ${req.venue_name}`)}
                className="btn-ghost w-full justify-center"
              >
                Mark under review (need info)
              </button>
            )}
            <a href={mailtoDecline} onClick={decline} className="btn-secondary w-full justify-center">
              <Mail className="h-4 w-4" /> Decline (opens Outlook draft)
            </a>
          </>
        )}
        {req.status === "ready_to_poll" && (
          <>
            <button onClick={sendSurveyNow} className="btn-primary w-full justify-center" data-testid="send-survey">Send availability survey now</button>
            <p className="text-xs text-ink-faint text-center">Or it goes out with Wednesday&apos;s combined survey.</p>
          </>
        )}
        {req.status === "polling" && (
          <>
            <button onClick={closePolling} className="btn-primary w-full justify-center" data-testid="close-polling">Close polling → decide</button>
            <p className="text-xs text-ink-faint text-center">Deadline {req.response_deadline ? formatDate(req.response_deadline) : "—"} · closes automatically in the real build.</p>
          </>
        )}
        {req.status === "polling_closed" && (
          <>
            <a href={mailtoConfirm} onClick={confirm} className="btn-primary w-full justify-between" data-testid="confirm-performance">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Confirm (opens Outlook draft)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href={mailtoDecline} onClick={decline} className="btn-secondary w-full justify-between">
              <span className="inline-flex items-center gap-2"><X className="h-4 w-4" /> Decline (opens Outlook draft)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </>
        )}
        {req.status === "confirmed" && (
          <>
            <p className="text-sm pill-green inline-flex items-center gap-1.5"><CalendarPlus className="h-3.5 w-3.5" /> Calendar event created</p>
            <button onClick={markCompleted} className="btn-secondary w-full justify-center mt-2" data-testid="mark-completed">Mark completed (post-event)</button>
          </>
        )}
        {req.status === "completed" && (
          <p className="text-sm text-ink-soft">Performance completed. Track the donation outcome under &ldquo;Donation interest.&rdquo;</p>
        )}
        {req.status === "declined" && (
          <button onClick={() => transition("under_review", `Reopened: ${req.venue_name}`)} className="btn-ghost w-full justify-center">Reopen request</button>
        )}
      </div>
    </div>
  );
}

// ─── polling params ──────────────────────────────────────────────────────────

function PollingPanel({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [minCouples, setMinCouples] = useState(String(req.min_couples_required));
  const [deadline, setDeadline] = useState(req.response_deadline ?? "");
  const [notes, setNotes] = useState(req.review_notes ?? "");
  const [inSurvey, setInSurvey] = useState(req.include_in_next_survey ? "yes" : "no");

  function save(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      const r = dbx.performanceRequests.find(x => x.id === req.id);
      if (!r) return;
      r.min_couples_required = Number(minCouples) || 3;
      r.response_deadline = deadline || undefined;
      r.review_notes = notes || undefined;
      r.include_in_next_survey = inSurvey === "yes";
    }, `Updated polling parameters: ${req.venue_name}`);
    setEditing(false);
  }

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Polling parameters</h2>
        {canEdit && <button onClick={() => setEditing(true)} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /> Edit</button>}
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-faint">Polling window</dt>
          <dd className="text-ink font-medium">{req.polling_window_days} days</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">Min couples</dt>
          <dd className="text-ink font-medium">{req.min_couples_required}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">Response deadline</dt>
          <dd className="text-ink font-medium">{req.response_deadline ? formatDate(req.response_deadline) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">In next survey</dt>
          <dd className="text-ink font-medium">{req.include_in_next_survey ? "Yes" : "No"}</dd>
        </div>
      </dl>
      {req.review_notes && (
        <div className="mt-5 pt-5 border-t border-line">
          <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">Officer notes</p>
          <p className="mt-2 text-sm text-ink italic">{req.review_notes}</p>
        </div>
      )}
      {editing && (
        <Modal title="Polling parameters" onClose={() => setEditing(false)}>
          <form onSubmit={save} className="space-y-4">
            <TextField label="Minimum couples required" value={minCouples} onChange={setMinCouples} type="number" />
            <TextField label="Response deadline" value={deadline} onChange={setDeadline} type="date" />
            <SelectField label="Include in next weekly survey" value={inSurvey} onChange={setInSurvey}
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
            <TextArea label="Officer notes" value={notes} onChange={setNotes} rows={3} />
            <button type="submit" className="btn-primary w-full">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function DetailField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-md bg-cream-200 text-maroon-700 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <dt className="text-xs uppercase tracking-wider font-semibold text-ink-faint">{label}</dt>
        <dd className="mt-1 text-ink">{children}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-semibold">{value}</p>
      <p className="text-xs uppercase tracking-wider text-ink-faint mt-1">{label}</p>
      {sub && <p className="text-xs text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}
