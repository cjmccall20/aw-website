"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { RESOURCES } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { FileText, Download, Upload, Folder } from "lucide-react";

const VIS_PILL: Record<string, string> = {
  members_only: "pill-line",
  members_and_alumni: "pill-green",
  officers_only: "pill-amber",
};

export default function ResourcesPage() {
  const grouped = RESOURCES.reduce<Record<string, typeof RESOURCES>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});

  return (
    <PortalShell tabKey="resources" title="Resources">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">Constitution, contracts, choreography notes, sponsor decks. Permissioned by visibility tag.</p>
        <button className="btn-primary text-sm"><Upload className="h-4 w-4" /> Upload file</button>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="font-serif text-xl font-semibold mb-3 flex items-center gap-2">
              <Folder className="h-4 w-4 text-maroon-700" /> {cat}
            </h2>
            <ul className="space-y-2">
              {items.map(r => (
                <li key={r.id} className="card p-4 flex items-center gap-4">
                  <FileText className="h-5 w-5 text-ink-faint flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{r.title}</p>
                    {r.description && <p className="text-xs text-ink-faint mt-0.5">{r.description}</p>}
                    <p className="text-xs text-ink-faint mt-0.5">{r.file_type.toUpperCase()} · uploaded {formatDate(r.uploaded_at)}</p>
                  </div>
                  <span className={cn("text-xs whitespace-nowrap capitalize", VIS_PILL[r.visibility])}>{r.visibility.replace(/_/g, " ")}</span>
                  <button className="btn-ghost text-sm"><Download className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PortalShell>
  );
}
