"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { MEETING_NOTES, MEMBERS, byId } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Plus, Notebook } from "lucide-react";

export default function MeetingNotesPage() {
  return (
    <PortalShell tabKey="meeting_notes" title="Meeting Notes">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">Maintained by the Secretary. All officers can view; members get read access by default.</p>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> New meeting</button>
      </div>

      <ul className="space-y-4">
        {MEETING_NOTES.map(n => (
          <li key={n.id} className="card-padded">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="eyebrow">{n.meeting_type}</p>
                <h2 className="mt-2 font-serif text-xl font-semibold">
                  {formatDate(n.meeting_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h2>
              </div>
              <p className="text-sm text-ink-faint">{n.attendee_member_ids.length} attendees</p>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="label">Agenda</p>
                <p className="text-ink-soft whitespace-pre-wrap mt-1">{n.agenda_markdown}</p>
              </div>
              {n.decisions_markdown && (
                <div>
                  <p className="label">Decisions</p>
                  <p className="text-ink whitespace-pre-wrap mt-1">{n.decisions_markdown}</p>
                </div>
              )}
            </div>
            {n.notes_markdown && (
              <div className="mt-5 pt-5 border-t border-line">
                <p className="label">Discussion notes</p>
                <p className="text-ink-soft mt-1">{n.notes_markdown}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
