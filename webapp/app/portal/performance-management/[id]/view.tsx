"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  PERFORMANCE_REQUESTS, CONTACTS, EMAIL_THREADS, EMAIL_MESSAGES,
  MEMBERS, byId,
} from "@/lib/mock-data";
import { formatDate, formatTime, cn } from "@/lib/utils";
import {
  ArrowLeft, MapPin, Clock, Users, DollarSign, Zap, AlertCircle,
  Mail, ExternalLink, MessageSquare, Check, X,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  new: "New", under_review: "Under review", ready_to_poll: "Ready to poll",
  polling: "Polling", polling_closed: "Polling closed — needs your decision",
  confirmed: "Confirmed", declined: "Declined", completed: "Completed",
};

export function PerformanceDetailView({ id }: { id: string }) {
  const req = PERFORMANCE_REQUESTS.find(r => r.id === id);
  if (!req) notFound();

  const contact = byId(CONTACTS, req.contact_id);
  const threads = EMAIL_THREADS.filter(t => t.related_id === req.id || t.contact_id === req.contact_id);
  const messages = EMAIL_MESSAGES.filter(m => threads.some(t => t.id === m.thread_id))
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
                  Requester: <Link href={`/portal/contacts/${req.contact_id}`} className="text-maroon-700 hover:underline">{req.requester_first_name} {req.requester_last_name}</Link>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={req.status} />
                {req.urgency === "quick_answer" && (
                  <span className="pill-amber inline-flex items-center gap-1"><Zap className="h-3 w-3" /> Quick answer needed</span>
                )}
              </div>
            </div>

            {req.status === "polling_closed" && <PollingClosedCallout request={req} />}

            <dl className="mt-6 grid sm:grid-cols-2 gap-4">
              <DetailField icon={<Clock />} label="Event date">
                {formatDate(req.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                <br />
                <span className="text-ink-soft">{req.event_start_time.slice(0,5)} – {req.event_end_time.slice(0,5)} CT</span>
              </DetailField>
              <DetailField icon={<MapPin />} label="Venue">
                {req.venue_name}<br />
                <span className="text-ink-soft text-sm">{req.venue_formatted_address}</span>
              </DetailField>
              <DetailField icon={<Users />} label="Audience">
                {req.audience_size?.toLocaleString()} guests
              </DetailField>
              <DetailField icon={<DollarSign />} label="Donation interest">
                {req.donation_interest === "none" ? <span className="text-ink-faint">Not at this time</span>
                  : req.donation_interest === "other" ? "Other (see notes)"
                  : `$${req.donation_interest}`}
                {req.donation_status && (
                  <span className="block text-xs text-ink-soft mt-1">Post-event: {req.donation_status}</span>
                )}
              </DetailField>
            </dl>
          </header>

          {/* Drive time / availability window */}
          {req.drive_time_minutes && (
            <section className="card-padded">
              <h2 className="font-serif text-xl font-semibold">Travel & availability</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Computed from College Station → venue. Shown to members in the survey.
              </p>
              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                <Stat label="Drive time" value={`${req.drive_time_minutes} min`} sub={`${req.drive_distance_miles} mi`} />
                <Stat label="Call time before" value={`${req.call_time_minutes_before} min`} sub="Officer overridable" />
                <Stat label="Return buffer" value={`${req.return_buffer_minutes} min`} sub="Officer overridable" />
              </div>
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
            </section>
          )}

          {/* Notes */}
          {req.notes && (
            <section className="card-padded">
              <h2 className="font-serif text-xl font-semibold">From the requester</h2>
              <blockquote className="mt-3 text-ink italic border-l-4 border-maroon-200 pl-4">
                "{req.notes}"
              </blockquote>
            </section>
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
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{m.body_text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar: actions */}
        <aside className="space-y-6">
          <ActionPanel request={req} />
          <PollingPanel request={req} />
        </aside>
      </div>
    </PortalShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "pill-amber", under_review: "pill-amber",
    ready_to_poll: "pill-line", polling: "pill-line",
    polling_closed: "pill-maroon", confirmed: "pill-green",
    declined: "pill-line", completed: "pill-green",
  };
  return <span className={map[status] ?? "pill-line"}>{STATUS_LABEL[status]}</span>;
}

function PollingClosedCallout({ request }: { request: typeof PERFORMANCE_REQUESTS[0] }) {
  // Mock response breakdown
  const yes = 5, no = 2, maybe = 0, noResponse = 1;
  return (
    <div className="mt-6 p-4 rounded-lg border border-maroon-300 bg-maroon-50">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-maroon-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-maroon-800">Polling closed — your decision.</p>
          <p className="text-sm text-maroon-800/85 mt-1">
            {yes} of {yes + no + noResponse + maybe} couples available · review responses below and click Compose Confirmation or Compose Decline.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionPanel({ request }: { request: typeof PERFORMANCE_REQUESTS[0] }) {
  const mailtoConfirm = `mailto:${request.requester_email}?subject=${encodeURIComponent(`Confirmation — Aggie Wranglers at your ${request.performance_type ?? "event"}`)}&body=${encodeURIComponent(`Hi ${request.requester_first_name},\n\nWe're thrilled to confirm the Aggie Wranglers for your event on ${formatDate(request.event_date)}.\n\nDetails:\n- Performance time: ${request.event_start_time.slice(0,5)}\n- Call time: ${request.call_time_minutes_before} min before\n- Drive time from CS: ${request.drive_time_minutes} min\n\nWe'll be in touch closer to the date with final logistics.\n\nThanks,\nMaya — Performance Officer\nAggie Wranglers`)}`;
  const mailtoDecline = `mailto:${request.requester_email}?subject=${encodeURIComponent(`Regarding your performance request`)}&body=${encodeURIComponent(`Hi ${request.requester_first_name},\n\nThank you for thinking of the Aggie Wranglers. Unfortunately we're unable to take this booking due to...\n\n— Maya, Performance Officer`)}`;

  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Actions</h2>
      <p className="mt-2 text-xs text-ink-faint">Each button opens TAMU Outlook with a prefilled draft. Sent mail auto-captures to the CRM.</p>

      <div className="mt-5 space-y-2">
        {request.status === "polling_closed" && (
          <>
            <a href={mailtoConfirm} className="btn-primary w-full justify-between">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Compose confirmation</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href={mailtoDecline} className="btn-secondary w-full justify-between">
              <span className="inline-flex items-center gap-2"><X className="h-4 w-4" /> Compose decline</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </>
        )}
        {(request.status === "new" || request.status === "under_review") && (
          <>
            <button className="btn-primary w-full justify-center">Approve to poll</button>
            <a href={mailtoDecline} className="btn-secondary w-full justify-center">
              <Mail className="h-4 w-4" /> Compose decline draft
            </a>
            <button className="btn-ghost w-full justify-center">Mark under review (need info)</button>
          </>
        )}
        {request.status === "polling" && (
          <button className="btn-secondary w-full">Send survey now</button>
        )}
        {request.status === "confirmed" && (
          <p className="text-sm text-green pill-green">Calendar event created</p>
        )}
      </div>
    </div>
  );
}

function PollingPanel({ request }: { request: typeof PERFORMANCE_REQUESTS[0] }) {
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Polling parameters</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-faint">Polling window</dt>
          <dd className="text-ink font-medium">{request.polling_window_days} days</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">Min couples</dt>
          <dd className="text-ink font-medium">{request.min_couples_required}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">Response deadline</dt>
          <dd className="text-ink font-medium">{request.response_deadline ? formatDate(request.response_deadline) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-faint">In next survey</dt>
          <dd className="text-ink font-medium">{request.include_in_next_survey ? "Yes" : "No"}</dd>
        </div>
      </dl>
      {request.review_notes && (
        <div className="mt-5 pt-5 border-t border-line">
          <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">Officer notes</p>
          <p className="mt-2 text-sm text-ink italic">{request.review_notes}</p>
        </div>
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
