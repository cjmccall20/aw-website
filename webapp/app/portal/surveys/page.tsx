"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { PERFORMANCE_REQUESTS, PRIVATE_LESSON_REQUESTS, byId, CONTACTS } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { Check, X, HelpCircle, ChevronRight } from "lucide-react";

export default function SurveysPage() {
  const polling = PERFORMANCE_REQUESTS.filter(r => r.status === "polling");
  const pollingPrivate = PRIVATE_LESSON_REQUESTS.filter(r => r.status === "polling");

  return (
    <PortalShell tabKey="surveys" title="Surveys">
      <p className="text-ink-soft -mt-6 mb-8 max-w-2xl">
        Combined weekly availability survey — performances and private lessons in one email. Default send: Wednesday 6 PM CT. Respond per-item below.
      </p>

      <div className="space-y-4">
        {polling.map(r => {
          const c = byId(CONTACTS, r.contact_id);
          return (
            <SurveyItem
              key={r.id}
              title={`${r.performance_type ?? "Performance"} · ${r.organization ?? c?.name}`}
              date={r.event_date}
              location={`${r.venue_name}${r.drive_time_minutes ? ` · ${r.drive_time_minutes} min drive` : ""}`}
              availabilityWindow={r.drive_time_minutes ? buildWindow(r) : undefined}
              deadline={r.response_deadline}
            />
          );
        })}
        {pollingPrivate.map(r => (
          <SurveyItem
            key={r.id}
            title={`Private lesson · ${r.dance_type ?? "—"}`}
            date={r.preferred_dates ?? "Flexible"}
            location={`${r.group_size} people · ${r.experience_level ?? "—"}`}
          />
        ))}
      </div>

      {polling.length === 0 && pollingPrivate.length === 0 && (
        <div className="card-padded text-center text-ink-faint">No open surveys.</div>
      )}
    </PortalShell>
  );
}

function buildWindow(r: typeof PERFORMANCE_REQUESTS[0]) {
  if (!r.drive_time_minutes) return undefined;
  const startMs = new Date(`${r.event_date}T${r.event_start_time}`).getTime();
  const endMs = new Date(`${r.event_date}T${r.event_end_time}`).getTime();
  const winStart = new Date(startMs - (r.call_time_minutes_before + r.drive_time_minutes) * 60000);
  const winEnd = new Date(endMs + (r.drive_time_minutes + r.return_buffer_minutes) * 60000);
  return `${formatTime(winStart)} - ${formatTime(winEnd)} CT`;
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
}

function SurveyItem({ title, date, location, availabilityWindow, deadline }: {
  title: string;
  date: string;
  location: string;
  availabilityWindow?: string;
  deadline?: string;
}) {
  return (
    <article className="card-padded">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{typeof date === "string" && date.includes("-") ? formatDate(date, { weekday: "long", month: "long", day: "numeric" }) : date} · {location}</p>
          {availabilityWindow && (
            <p className="mt-2 text-sm text-maroon-700 font-medium">You&apos;d need to be available roughly {availabilityWindow}</p>
          )}
        </div>
        {deadline && (
          <p className="text-xs text-ink-faint whitespace-nowrap">Respond by {formatDate(deadline, { month: "short", day: "numeric" })}</p>
        )}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <ResponseButton tone="yes"><Check className="h-4 w-4" /> Yes, I&apos;m in</ResponseButton>
        <ResponseButton tone="maybe"><HelpCircle className="h-4 w-4" /> Maybe</ResponseButton>
        <ResponseButton tone="no"><X className="h-4 w-4" /> Can&apos;t make it</ResponseButton>
      </div>
    </article>
  );
}

function ResponseButton({ tone, children }: { tone: "yes" | "maybe" | "no"; children: React.ReactNode }) {
  return (
    <button className={cn(
      "py-3 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors",
      tone === "yes" && "border-green/30 text-green hover:bg-green-pale",
      tone === "maybe" && "border-line text-ink-soft hover:bg-cream-200",
      tone === "no" && "border-maroon-200 text-maroon-700 hover:bg-maroon-50",
    )}>
      {children}
    </button>
  );
}
