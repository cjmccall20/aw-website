"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, todayISO } from "@/lib/store";
import { formatDate, formatTime, cn } from "@/lib/utils";
import type { CalendarEvent, EventType } from "@/lib/types";
import { ExternalLink, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";

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

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "performance", label: "Performance" },
  { value: "public_lesson", label: "Public lesson" },
  { value: "private_lesson", label: "Private lesson" },
  { value: "tryout", label: "Tryout" },
  { value: "practice", label: "Practice" },
  { value: "officer_meeting", label: "Officer meeting" },
  { value: "retreat", label: "Retreat" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export default function TeamCalendarPage() {
  const db = useStore();
  const access = useAccess("team_calendar");
  const canEdit = access === "edit";
  const [showPast, setShowPast] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | "new" | null>(null);

  const today = todayISO();
  const events = [...db.calendarEvents]
    .filter(e => showPast || e.start_at.slice(0, 10) >= today)
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
  const pastCount = db.calendarEvents.filter(e => e.start_at.slice(0, 10) < today).length;
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const day = e.start_at.slice(0, 10);
    (acc[day] ||= []).push(e);
    return acc;
  }, {});

  function remove(e: CalendarEvent) {
    if (!confirm(`Delete "${e.title}"? This also removes it from the synced Google Calendar in the real build.`)) return;
    update(dbx => {
      dbx.calendarEvents = dbx.calendarEvents.filter(x => x.id !== e.id);
    }, `Deleted calendar event: ${e.title}`);
  }

  return (
    <PortalShell tabKey="team_calendar" title="Team Calendar">
      {access === "view" && <ViewOnlyBanner />}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">
          2-way synced with the team&apos;s Google Calendar. Edit here or in Google — both stay in sync.
        </p>
        <div className="flex gap-2">
          {canEdit && (
            <button onClick={() => setEditing("new")} className="btn-primary text-sm" data-testid="add-event">
              <Plus className="h-4 w-4" /> Add event
            </button>
          )}
          <button
            disabled
            title="Sync runs automatically in the real build (Google Calendar watch channel) — nothing to resync in the demo."
            className="btn-secondary text-sm opacity-60 cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4" /> Resync
          </button>
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
            <ExternalLink className="h-4 w-4" /> Open Google Calendar
          </a>
        </div>
      </div>

      <div className="card-padded mb-6 bg-cream-200/40">
        <h3 className="font-serif text-lg font-semibold">Recurring</h3>
        <ul className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          <li><span className="pill-line">Monday</span> Practice 7:30–9:30 PM</li>
          <li><span className="pill-line">Wednesday</span> Officer meeting 5:00–6:30 PM</li>
        </ul>
      </div>

      {pastCount > 0 && (
        <div className="mb-6">
          <button onClick={() => setShowPast(v => !v)} className="btn-ghost text-sm" data-testid="toggle-past">
            {showPast ? "Hide past events" : `Show past events (${pastCount})`}
          </button>
        </div>
      )}

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
                  {canEdit && (
                    <span className="flex gap-1">
                      <button onClick={() => setEditing(e)} aria-label={`Edit ${e.title}`} className="btn-ghost text-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(e)} aria-label={`Delete ${e.title}`} className="btn-ghost text-sm text-maroon-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-sm text-ink-faint">No upcoming events{pastCount > 0 ? " — toggle past events above." : "."}</li>
        )}
      </ol>

      {editing && (
        <EventModal
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PortalShell>
  );
}

function EventModal({ event, onClose }: { event: CalendarEvent | null; onClose: () => void }) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<string>(event?.event_type ?? "practice");
  const [date, setDate] = useState(event ? event.start_at.slice(0, 10) : todayISO());
  const [start, setStart] = useState(event ? event.start_at.slice(11, 16) : "19:30");
  const [end, setEnd] = useState(event ? event.end_at.slice(11, 16) : "21:30");
  const [location, setLocation] = useState(event?.location_name ?? "");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !start || !end) return;
    const start_at = `${date}T${start}:00-05:00`;
    const end_at = `${date}T${end}:00-05:00`;
    if (event) {
      update(dbx => {
        const ev = dbx.calendarEvents.find(x => x.id === event.id);
        if (!ev) return;
        ev.title = title.trim();
        ev.event_type = type as EventType;
        ev.start_at = start_at;
        ev.end_at = end_at;
        ev.location_name = location.trim() || undefined;
      }, `Updated calendar event: ${title.trim()}`);
    } else {
      update(dbx => {
        dbx.calendarEvents.push({
          id: uid("ce"),
          gcal_event_id: uid("g"),
          event_type: type as EventType,
          title: title.trim(),
          location_name: location.trim() || undefined,
          start_at,
          end_at,
          attendee_member_ids: [],
        });
      }, `Added calendar event: ${title.trim()}`);
    }
    onClose();
  }

  return (
    <Modal title={event ? "Edit event" : "Add event"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <TextField label="Title" value={title} onChange={setTitle} required />
        <SelectField label="Event type" value={type} onChange={setType} options={EVENT_TYPES} />
        <TextField label="Date" value={date} onChange={setDate} type="date" required />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Start time" value={start} onChange={setStart} type="time" required />
          <TextField label="End time" value={end} onChange={setEnd} type="time" required />
        </div>
        <TextField label="Location" value={location} onChange={setLocation} placeholder="e.g. MSC 2406" />
        <button type="submit" className="btn-primary w-full">{event ? "Save changes" : "Add event"}</button>
      </form>
    </Modal>
  );
}
