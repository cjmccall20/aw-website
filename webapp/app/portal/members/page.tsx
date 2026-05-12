"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { MEMBERS } from "@/lib/mock-data";
import { initials, placeholderColor, cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export default function MembersPage() {
  const [filter, setFilter] = useState<"current" | "tryout" | "graduated" | "inactive" | "all">("current");
  const [q, setQ] = useState("");
  const filtered = MEMBERS.filter(m => {
    if (filter !== "all" && m.status !== filter) return false;
    if (q && !`${m.name} ${m.major ?? ""} ${m.hometown ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const counts = {
    current: MEMBERS.filter(m => m.status === "current").length,
    tryout: MEMBERS.filter(m => m.status === "tryout").length,
    graduated: MEMBERS.filter(m => m.status === "graduated").length,
    inactive: MEMBERS.filter(m => m.status === "inactive").length,
  };

  return (
    <PortalShell tabKey="members" title="Members">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search members…" />
        </div>
        <div className="flex gap-1 bg-cream-200 rounded-lg p-1">
          {(["current", "tryout", "graduated", "inactive", "all"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize",
                filter === s ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:text-ink",
              )}
            >
              {s === "all" ? "All" : `${s} (${(counts as any)[s] ?? "-"})`}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add member</button>
      </div>

      <p className="text-xs text-ink-faint mb-4">
        Adding a member creates a `users` row and sends them an invite-link email. Marking someone graduated flips their primary email from TAMU to personal.
      </p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-200/60 text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Class</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Hometown</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-cream-200/40">
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
                  <span className="font-medium">{m.name}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{m.role_title ?? <span className="text-ink-faint">—</span>}</td>
                <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{m.class_year ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{m.hometown ?? "—"}</td>
                <td className="px-4 py-3"><span className="pill-line capitalize">{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
