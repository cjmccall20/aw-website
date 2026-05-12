"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { MOVES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Plus, Search, Play, ExternalLink } from "lucide-react";

const DIFF_COLOR: Record<string, string> = {
  Beginner: "pill-green",
  Intermediate: "pill-line",
  Advanced: "pill-amber",
  Expert: "pill-maroon",
};

export default function MoveLibraryPage() {
  const [q, setQ] = useState("");
  const filtered = MOVES.filter(m => !q || `${m.name} ${m.aliases.join(" ")} ${m.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <PortalShell tabKey="move_library" title="Move Library">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <p className="text-sm text-ink-soft max-w-2xl">
          Catalog of every jitt and stunt move the team knows. Videos live on the team&apos;s private YouTube channel; access governed by channel membership.
        </p>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> New move</button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search by name, alias, category…" />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map(m => (
          <li key={m.id} className="card-padded">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold">{m.name}</h2>
                {m.aliases.length > 0 && (
                  <p className="text-xs text-ink-faint mt-0.5">aka {m.aliases.join(", ")}</p>
                )}
              </div>
              <span className={DIFF_COLOR[m.difficulty]}>{m.difficulty}</span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{m.description_markdown}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
              <span className="pill-line">{m.category}</span>
              {m.originated_by && <span>Origin: {m.originated_by} {m.originated_year && `(${m.originated_year})`}</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.video_links.map((l, i) => (
                <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Play className="h-3.5 w-3.5" /> Watch <ExternalLink className="h-3 w-3" />
                </a>
              ))}
              <button className="btn-ghost text-xs">Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
