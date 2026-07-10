"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { MEMBERS, PERFORMANCE_REQUESTS } from "@/lib/mock-data";
import { cn, initials, placeholderColor } from "@/lib/utils";

// Mock attendance data. Deterministic — Math.random() in render would make the
// server-rendered HTML disagree with the client render and break hydration.
function attendanceFor(memberId: string) {
  const n = parseInt(memberId.slice(-2), 10) || 0;
  const total = 18 + (n % 8); // 18-25 range
  const made = Math.max(8, total - ((n * 5) % 7));
  return { made, total, pct: Math.round((made / total) * 100) };
}

export default function PerformanceStatsPage() {
  const current = MEMBERS.filter(m => m.status === "current");
  const upcoming = PERFORMANCE_REQUESTS.filter(r => r.status === "polling" || r.status === "polling_closed" || r.status === "confirmed");
  const totalConfirmed = PERFORMANCE_REQUESTS.filter(r => r.status === "confirmed" || r.status === "completed").length;
  const totalDriveHours = PERFORMANCE_REQUESTS
    .filter(r => r.status === "confirmed" || r.status === "completed")
    .reduce((acc, r) => acc + (r.drive_time_minutes ?? 0), 0) / 60;

  return (
    <PortalShell tabKey="performance_stats" title="Performance Stats">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Confirmed perfs this year" value={totalConfirmed.toString()} />
        <StatCard label="Total drive hours" value={`${Math.round(totalDriveHours)}h`} />
        <StatCard label="Avg response rate" value="87%" />
        <StatCard label="Avg yes-rate" value="62%" />
      </div>

      <section className="mb-10">
        <h2 className="font-serif text-2xl font-semibold mb-4">Per-member attendance</h2>
        <ul className="card divide-y divide-line">
          {current.slice(0, 12).map(m => {
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
                  <p className="font-medium text-sm">{a.pct}%</p>
                  <p className="text-xs text-ink-faint">{a.made}/{a.total}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold mb-4">Upcoming performance rosters</h2>
        <ul className="space-y-3">
          {upcoming.map(r => (
            <li key={r.id} className="card-padded">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{r.organization ?? `${r.requester_first_name} ${r.requester_last_name}`}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{r.performance_type} · {r.venue_name}</p>
                </div>
                <span className="pill-line capitalize">{r.status.replace(/_/g, " ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {/* Mock confirmed-couple chips */}
                {current.slice(0, 6).map(m => (
                  <span key={m.id} className="inline-flex items-center gap-1.5 pill-line">
                    <span className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</span>
                    {m.name.split(" ")[0]}
                  </span>
                ))}
                <button className="pill-line cursor-pointer hover:bg-cream-300">+ Add member</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PortalShell>
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
