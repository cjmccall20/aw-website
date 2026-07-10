"use client";

import { useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal } from "@/components/portal/ui";
import { useStore, useAccess, update, todayISO } from "@/lib/store";
import { cn, initials, placeholderColor } from "@/lib/utils";
import type { PerformanceRequest } from "@/lib/types";
import { Plus } from "lucide-react";

export default function PerformanceStatsPage() {
  const db = useStore();
  // Roster edits are an officer action — gate on Performance Management access.
  const canEditRoster = useAccess("performance_management") === "edit";

  const current = db.members.filter(m => m.status === "current");

  const done = db.performanceRequests.filter(r => r.status === "confirmed" || r.status === "completed");
  const doneIds = new Set(done.map(r => r.id));
  const totalConfirmed = done.length;

  // Out and back: drive_time_minutes each way.
  const totalDriveHours = Math.round(done.reduce((acc, r) => acc + (r.drive_time_minutes ?? 0) * 2, 0) / 60);

  // Response rate: responses received vs (polled requests × current members).
  const polls = db.performanceRequests.filter(r => r.status === "polling" || r.status === "polling_closed");
  const pollIds = new Set(polls.map(r => r.id));
  const pollResponses = db.surveyResponses.filter(s => s.target_type === "performance" && pollIds.has(s.target_id));
  const responseDenom = polls.length * current.length;
  const responseRate = responseDenom > 0 ? `${Math.round((pollResponses.length / responseDenom) * 100)}%` : "—";

  // Yes-rate across all performance survey responses.
  const perfResponses = db.surveyResponses.filter(s => s.target_type === "performance");
  const yesRate = perfResponses.length > 0
    ? `${Math.round((perfResponses.filter(s => s.available === "yes").length / perfResponses.length) * 100)}%`
    : "—";

  const attendanceFor = (memberId: string) => {
    const made = db.performanceRoster.filter(e => e.member_id === memberId && doneIds.has(e.performance_request_id)).length;
    const pct = totalConfirmed > 0 ? Math.round((made / totalConfirmed) * 100) : 0;
    return { made, total: totalConfirmed, pct };
  };

  const upcoming = db.performanceRequests
    .filter(r => r.status === "polling" || r.status === "polling_closed" || r.status === "confirmed")
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <PortalShell tabKey="performance_stats" title="Performance Stats">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Confirmed perfs this year" value={totalConfirmed.toString()} />
        <StatCard label="Total drive hours" value={`${totalDriveHours}h`} />
        <StatCard label="Survey response rate" value={responseRate} />
        <StatCard label="Yes-rate" value={yesRate} />
      </div>

      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold mb-4">Per-member attendance</h2>
        <p className="text-xs text-ink-faint mb-3">Confirmed or completed performances each member was rostered on, out of {totalConfirmed} total.</p>
        <ul className="card divide-y divide-line">
          {current.map(m => {
            const a = attendanceFor(m.id);
            return (
              <li key={m.id} className="p-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{m.name}</p>
                  <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full",
                      a.pct >= 80 ? "bg-green" : a.pct >= 60 ? "bg-accent-gold" : "bg-accent-rust",
                    )} style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="font-medium text-sm">{a.total > 0 ? `${a.pct}%` : "—"}</p>
                  <p className="text-xs text-ink-faint">{a.made}/{a.total}</p>
                </div>
              </li>
            );
          })}
          {current.length === 0 && <li className="p-4 text-sm text-ink-faint">No current members.</li>}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold mb-4">Upcoming performance rosters</h2>
        <ul className="space-y-3">
          {upcoming.map(r => (
            <RosterRow key={r.id} req={r} canEdit={canEditRoster} />
          ))}
          {upcoming.length === 0 && <li className="text-sm text-ink-faint">No performances currently polling or confirmed.</li>}
        </ul>
      </section>
    </PortalShell>
  );
}

function RosterRow({ req, canEdit }: { req: PerformanceRequest; canEdit: boolean }) {
  const db = useStore();
  const [adding, setAdding] = useState(false);
  const roster = db.performanceRoster.filter(e => e.performance_request_id === req.id);
  const rosterIds = new Set(roster.map(e => e.member_id));
  const addable = db.members.filter(m => m.status === "current" && !rosterIds.has(m.id));

  function removeMember(memberId: string) {
    update(dbx => {
      dbx.performanceRoster = dbx.performanceRoster.filter(
        e => !(e.performance_request_id === req.id && e.member_id === memberId));
      const ev = dbx.calendarEvents.find(e => e.source_id === req.id);
      if (ev) ev.attendee_member_ids = ev.attendee_member_ids.filter(id => id !== memberId);
    }, `Removed member from ${req.venue_name ?? "performance"} roster`);
  }

  function addMember(memberId: string) {
    update(dbx => {
      dbx.performanceRoster.push({ performance_request_id: req.id, member_id: memberId, role: "performer", added_at: todayISO() });
      const ev = dbx.calendarEvents.find(e => e.source_id === req.id);
      if (ev && !ev.attendee_member_ids.includes(memberId)) ev.attendee_member_ids.push(memberId);
    }, `Added member to ${req.venue_name ?? "performance"} roster`);
    setAdding(false);
  }

  return (
    <li className="card-padded">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link href={`/portal/performance-management/detail?id=${req.id}`} className="font-medium text-ink hover:text-maroon-700 hover:underline">
            {req.organization ?? `${req.requester_first_name} ${req.requester_last_name}`}
          </Link>
          <p className="text-xs text-ink-faint mt-0.5">{req.performance_type} · {req.venue_name}</p>
        </div>
        <span className="pill-line capitalize">{req.status.replace(/_/g, " ")}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {roster.map(e => {
          const m = db.members.find(x => x.id === e.member_id);
          if (!m) return null;
          return (
            <span key={e.member_id} className="inline-flex items-center gap-1.5 pill-line">
              <span className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</span>
              {m.name.split(" ")[0]}
              {canEdit && (
                <button onClick={() => removeMember(m.id)} aria-label={`Remove ${m.name}`} className="text-ink-faint hover:text-maroon-700 ml-0.5">×</button>
              )}
            </span>
          );
        })}
        {roster.length === 0 && <span className="text-xs text-ink-faint self-center">No one rostered yet.</span>}
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
    </li>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-padded">
      <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}
