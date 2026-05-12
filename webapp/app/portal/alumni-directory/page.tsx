"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { ALUMNI } from "@/lib/mock-data";
import { initials, placeholderColor } from "@/lib/utils";
import { Search, Mail, MapPin } from "lucide-react";

export default function AlumniDirectoryPage() {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<"all" | number>("all");
  const years = Array.from(new Set(ALUMNI.map(a => a.graduation_year))).sort((a, b) => b - a);

  const filtered = ALUMNI.filter(a => {
    if (year !== "all" && a.graduation_year !== year) return false;
    if (q && !`${a.name} ${a.current_city ?? ""} ${a.current_role ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <PortalShell tabKey="alumni_directory" title="Alumni Directory">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search by name, city, current role…" />
        </div>
        <select value={String(year)} onChange={e => setYear(e.target.value === "all" ? "all" : Number(e.target.value))} className="select sm:w-48">
          <option value="all">All graduation years</option>
          {years.map(y => <option key={y} value={y}>Class of {y}</option>)}
        </select>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(a => (
          <li key={a.id} className="card-padded">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: placeholderColor(a.name) }}>{initials(a.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{a.name}</p>
                <p className="text-xs text-ink-faint">Class of {a.graduation_year}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              {a.current_city && (
                <div className="flex items-center gap-2 text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 text-ink-faint" />
                  <span>{a.current_city}</span>
                </div>
              )}
              {a.current_role && <p className="text-ink-soft">{a.current_role}</p>}
              {a.email && (
                <div className="flex items-center gap-2 text-ink-soft">
                  <Mail className="h-3.5 w-3.5 text-ink-faint" />
                  <a href={`mailto:${a.email}`} className="hover:text-maroon-700 truncate">{a.email}</a>
                </div>
              )}
            </dl>
            {a.what_im_up_to && (
              <p className="mt-3 text-sm text-ink-soft italic line-clamp-3">&ldquo;{a.what_im_up_to}&rdquo;</p>
            )}
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
