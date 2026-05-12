"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { Save, History } from "lucide-react";

const SAMPLE = `## Multi-year priorities

1. **Reach 25+ confirmed performances/year** sustainably without burning out members.
2. **Build the alumni-engagement pipeline.** Annual reunion + monthly featured-alumnus post.
3. **Brand refresh.** Coordinate with student design talent for new logo, palette, and wordmark by Spring 2027.
4. **Course product**. Build the online country-western fundamentals course (deferred to v1.1 — see IDEAS.md).

## What we tried that didn't stick
- Weekly social posts on Twitter/X (audience moved to TikTok).

## Open questions for the next president
- Do we want to formalize the captain role?
- Should sponsorships move to multi-year contracts?

## Inheritance log
- 2026-05: Goals doc started by Elena.
- 2025-09: Previous officer transition — handed off from Drew.`;

export default function LongTermGoalsPage() {
  return (
    <PortalShell tabKey="long_term_goals" title="Long-Term Goals">
      <p className="text-sm text-ink-soft mb-6">
        President-maintained. Inherits forward at officer transition — the next president starts from this draft.
      </p>

      <div className="card-padded">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-ink-faint">Last edited 2026-05-12 by Elena Cruz</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm"><History className="h-4 w-4" /> Revisions</button>
            <button className="btn-primary text-sm"><Save className="h-4 w-4" /> Save</button>
          </div>
        </div>
        <textarea
          defaultValue={SAMPLE}
          rows={24}
          className="textarea font-mono text-sm w-full"
          aria-label="Long-term goals document"
        />
      </div>
    </PortalShell>
  );
}
