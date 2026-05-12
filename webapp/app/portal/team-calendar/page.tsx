"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { CALENDAR_EVENTS, MEMBERS, byId } from "@/lib/mock-data";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { ExternalLink, RefreshCw } from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  performance: "bg-maroon-700 text-white",
  public_lesson: "bg-accent-gold/85 text-white",
  private_lesson: "bg-accent-rust/90 text-white",
  tryout: "bg-accent-green text-white",
  practice: "bg-cream-300 text-ink",
  officer_meeting: "bg-line-strong text-ink-soft",
  retreat: "bg-maroon-200 text-maroon-800",
  workshop: "bg-amber-100 text-amber-700",
};

export default function TeamCalendarPage() {
  const events = [...CALENDAR_EVENTS].sort((a, b) => a.start_at.localeCompare(b.start_at));
  const grouped = events.reduce<Record<string, typeof events>>((acc, e) => {
    const day = e.start_at.slice(0, 10);
    (acc[day] ||= []).push(e);
    return acc;
  }, {});

  return (
    <PortalShell tabKey="team_calendar" title="Team Calendar">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">
          2-way synced with the team&apos;s Google Calendar. Edit here or in Google — both stay in sync.
        </p>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm"><RefreshCw className="h-4 w-4" /> Resync</button>
          <a href="#" className="btn-secondary text-sm"><ExternalLink className="h-4 w-4" /> Open Google Calendar</a>
        </div>
      </div>

      <div className="card-padded mb-6 bg-cream-200/40">
        <h3 className="font-serif text-lg font-semibold">Recurring</h3>
        <ul className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          <li><span className="pill-line">Monday</span> Practice 7:30–9:30 PM</li>
          <li><span className="pill-line">Wednesday</span> Officer meeting 5:00–6:30 PM</li>
        </ul>
      </div>

      <ol className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <li key={day}>
            <h2 className="font-serif text-xl font-semibold mb-3">
              {formatDate(day, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <ul className="space-y-2">
              {items.map(e => (
                <li key={e.id} className="card p-4 flex items-center gap-4 flex-wrap">
                  <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap", TYPE_COLOR[e.event_type] ?? "pill-line")}>
                    {e.event_type.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink">{e.title}</p>
                    {e.location_name && <p className="text-xs text-ink-faint mt-0.5">{e.location_name}</p>}
                  </div>
                  <p className="text-sm text-ink-soft whitespace-nowrap">
                    {formatTime(e.start_at)} – {formatTime(e.end_at)}
                  </p>
                  {e.attendee_member_ids.length > 0 && (
                    <span className="text-xs text-ink-faint">{e.attendee_member_ids.length} attendees</span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </PortalShell>
  );
}
