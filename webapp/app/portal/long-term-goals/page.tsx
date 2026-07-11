"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, SavedFlash, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, useSessionUser, update, uid, todayISO } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Save, History } from "lucide-react";

export default function LongTermGoalsPage() {
  const db = useStore();
  const access = useAccess("long_term_goals");
  const canEdit = access === "edit";
  const user = useSessionUser();
  const goals = db.longTermGoals;

  const [body, setBody] = useState(goals.body_markdown);
  const [showRevisions, setShowRevisions] = useState(false);
  const [saved, setSaved] = useState(false);

  // The store hydrates from localStorage asynchronously (and Restore rewrites
  // the doc) — re-sync local draft state whenever the stored doc changes.
  useEffect(() => {
    setBody(goals.body_markdown);
  }, [goals.body_markdown]);

  function save() {
    update(dbx => {
      dbx.goalsRevisions.unshift({
        id: uid("rev"),
        body_markdown: dbx.longTermGoals.body_markdown,
        saved_at: new Date().toISOString(),
        saved_by_name: dbx.longTermGoals.updated_by_name,
      });
      dbx.longTermGoals = {
        body_markdown: body,
        updated_at: todayISO(),
        updated_by_name: user?.name ?? "Unknown",
      };
    }, "Saved long-term goals");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function restore(revId: string) {
    update(dbx => {
      const rev = dbx.goalsRevisions.find(r => r.id === revId);
      if (!rev) return;
      dbx.goalsRevisions.unshift({
        id: uid("rev"),
        body_markdown: dbx.longTermGoals.body_markdown,
        saved_at: new Date().toISOString(),
        saved_by_name: dbx.longTermGoals.updated_by_name,
      });
      dbx.longTermGoals = {
        body_markdown: rev.body_markdown,
        updated_at: todayISO(),
        updated_by_name: user?.name ?? "Unknown",
      };
    }, "Restored a long-term goals revision");
    setShowRevisions(false);
  }

  return (
    <PortalShell tabKey="long_term_goals" title="Long-Term Goals">
      {access === "view" && <ViewOnlyBanner />}
      <p className="text-sm text-ink-soft mb-6">
        President-maintained. Inherits forward at officer transition — the next president starts from this draft.
      </p>

      <div className="card-padded">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-xs text-ink-faint">
            Last edited {formatDate(goals.updated_at)} by {goals.updated_by_name ?? "unknown"}
            {" "}<SavedFlash show={saved} />
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowRevisions(true)} className="btn-secondary text-sm">
              <History className="h-4 w-4" /> Revisions ({db.goalsRevisions.length})
            </button>
            {canEdit && (
              <button onClick={save} className="btn-primary text-sm" data-testid="save-goals">
                <Save className="h-4 w-4" /> Save
              </button>
            )}
          </div>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          readOnly={!canEdit}
          rows={24}
          className="textarea font-mono text-sm w-full"
          aria-label="Long-term goals document"
        />
      </div>

      {showRevisions && (
        <Modal title="Revision history" onClose={() => setShowRevisions(false)} wide>
          {db.goalsRevisions.length === 0 ? (
            <p className="text-sm text-ink-faint">No revisions yet — each Save snapshots the previous version here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {db.goalsRevisions.map(rev => (
                <li key={rev.id} className="py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {formatDate(rev.saved_at)} · {rev.saved_by_name ?? "unknown"}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint font-mono truncate">
                      {rev.body_markdown.slice(0, 100)}{rev.body_markdown.length > 100 ? "…" : ""}
                    </p>
                  </div>
                  {canEdit && (
                    <button onClick={() => restore(rev.id)} className="btn-secondary text-xs flex-shrink-0">Restore</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </PortalShell>
  );
}
