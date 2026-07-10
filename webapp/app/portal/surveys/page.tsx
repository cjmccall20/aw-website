"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { useStore, useSessionUser, update, uid } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import type { PerformanceRequest } from "@/lib/types";
import { Check, X, HelpCircle } from "lucide-react";

export default function SurveysPage() {
  const db = useStore();
  const user = useSessionUser();
  const memberId = user?.member_id;

  const polling = db.performanceRequests.filter(r => r.status === "polling");
  const pollingPrivate = db.privateLessonRequests.filter(r => r.status === "polling");

  const myResponse = (targetType: "performance" | "private_lesson", targetId: string) =>
    db.surveyResponses.find(r => r.member_id === memberId && r.target_type === targetType && r.target_id === targetId);

  function respond(targetType: "performance" | "private_lesson", targetId: string, available: "yes" | "no" | "maybe") {
    if (!memberId) return;
    update(dbx => {
      const existing = dbx.surveyResponses.find(
        r => r.member_id === memberId && r.target_type === targetType && r.target_id === targetId);
      if (existing) {
        existing.available = available;
        existing.responded_at = new Date().toISOString();
      } else {
        dbx.surveyResponses.push({
          id: uid("sr"), survey_run_id: "manual", member_id: memberId,
          target_type: targetType, target_id: targetId,
          available, responded_at: new Date().toISOString(),
        });
      }
    }, `Survey response: ${available}`);
  }

  return (
    <PortalShell tabKey="surveys" title="Surveys">
      <p className="text-ink-soft -mt-6 mb-4 max-w-2xl">
        Combined weekly availability survey — performances and private lessons in one email. Default send: Wednesday 6 PM CT. Respond per-item below.
      </p>
      {!memberId && (
        <p className="mb-6 text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700 inline-block">
          Your account isn&apos;t linked to a member profile, so you can view surveys but not respond.
        </p>
      )}

      <div className="space-y-4">
        {polling.map(r => {
          const mine = myResponse("performance", r.id);
          return (
            <SurveyItem
              key={r.id}
              title={`${r.performance_type ?? "Performance"} · ${r.organization ?? `${r.requester_first_name} ${r.requester_last_name}`}`}
              date={r.event_date}
              location={`${r.venue_name}${r.drive_time_minutes ? ` · ${r.drive_time_minutes} min drive` : ""}`}
              availabilityWindow={r.drive_time_minutes ? buildWindow(r) : undefined}
              deadline={r.response_deadline}
              selected={mine?.available}
              disabled={!memberId}
              onRespond={a => respond("performance", r.id, a)}
            />
          );
        })}
        {pollingPrivate.map(r => {
          const mine = myResponse("private_lesson", r.id);
          return (
            <SurveyItem
              key={r.id}
              title={`Private lesson · ${r.dance_type ?? "—"}`}
              date={r.preferred_dates ?? "Flexible"}
              location={`${r.group_size ?? "?"} people · ${r.experience_level ?? "—"}`}
              selected={mine?.available}
              disabled={!memberId}
              onRespond={a => respond("private_lesson", r.id, a)}
            />
          );
        })}
      </div>

      {polling.length === 0 && pollingPrivate.length === 0 && (
        <div className="card-padded text-center text-ink-faint">No open surveys.</div>
      )}
    </PortalShell>
  );
}

function buildWindow(r: PerformanceRequest) {
  if (!r.drive_time_minutes) return undefined;
  const startMs = new Date(`${r.event_date}T${r.event_start_time}`).getTime();
  const endMs = new Date(`${r.event_date}T${r.event_end_time}`).getTime();
  const winStart = new Date(startMs - (r.call_time_minutes_before + r.drive_time_minutes) * 60000);
  const winEnd = new Date(endMs + (r.drive_time_minutes + r.return_buffer_minutes) * 60000);
  return `${formatClock12(winStart)} - ${formatClock12(winEnd)} CT`;
}

function formatClock12(d: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
}

function SurveyItem({ title, date, location, availabilityWindow, deadline, selected, disabled, onRespond }: {
  title: string;
  date: string;
  location: string;
  availabilityWindow?: string;
  deadline?: string;
  selected?: "yes" | "no" | "maybe";
  disabled?: boolean;
  onRespond: (a: "yes" | "no" | "maybe") => void;
}) {
  return (
    <article className="card-padded" data-testid="survey-item">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{date.includes("-") ? formatDate(date, { weekday: "long", month: "long", day: "numeric" }) : date} · {location}</p>
          {availabilityWindow && (
            <p className="mt-2 text-sm text-maroon-700 font-medium">You&apos;d need to be available roughly {availabilityWindow}</p>
          )}
        </div>
        <div className="text-right">
          {deadline && (
            <p className="text-xs text-ink-faint whitespace-nowrap">Respond by {formatDate(deadline, { month: "short", day: "numeric" })}</p>
          )}
          {selected && <p className="mt-1 text-xs text-green font-semibold">Responded: {selected}</p>}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <ResponseButton tone="yes" active={selected === "yes"} disabled={disabled} onClick={() => onRespond("yes")}>
          <Check className="h-4 w-4" /> Yes, I&apos;m in
        </ResponseButton>
        <ResponseButton tone="maybe" active={selected === "maybe"} disabled={disabled} onClick={() => onRespond("maybe")}>
          <HelpCircle className="h-4 w-4" /> Maybe
        </ResponseButton>
        <ResponseButton tone="no" active={selected === "no"} disabled={disabled} onClick={() => onRespond("no")}>
          <X className="h-4 w-4" /> Can&apos;t make it
        </ResponseButton>
      </div>
    </article>
  );
}

function ResponseButton({ tone, active, disabled, onClick, children }: {
  tone: "yes" | "maybe" | "no";
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`respond-${tone}`}
      className={cn(
        "py-3 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
        tone === "yes" && (active ? "bg-green text-white border-green" : "border-green/30 text-green hover:bg-green-pale"),
        tone === "maybe" && (active ? "bg-ink-soft text-white border-ink-soft" : "border-line text-ink-soft hover:bg-cream-200"),
        tone === "no" && (active ? "bg-maroon-700 text-white border-maroon-700" : "border-maroon-200 text-maroon-700 hover:bg-maroon-50"),
      )}
    >
      {children}
    </button>
  );
}
