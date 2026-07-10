"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Move } from "@/lib/types";
import { Plus, Search, Play, ExternalLink, Pencil } from "lucide-react";

const DIFF_COLOR: Record<string, string> = {
  Beginner: "pill-green",
  Intermediate: "pill-line",
  Advanced: "pill-amber",
  Expert: "pill-maroon",
};

const CATEGORIES: Move["category"][] = ["Spin", "Lift", "Throw", "Dip", "Combination", "Footwork", "Aerial"];
const DIFFICULTIES: Move["difficulty"][] = ["Beginner", "Intermediate", "Advanced", "Expert"];
const STATUSES_OPTS: { value: Move["status"]; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function MoveLibraryPage() {
  const db = useStore();
  const access = useAccess("move_library");
  const canEdit = access === "edit";
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Move | "new" | null>(null);

  const filtered = db.moves.filter(m =>
    !q || `${m.name} ${m.aliases.join(" ")} ${m.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <PortalShell tabKey="move_library" title="Move Library">
      {access === "view" && <ViewOnlyBanner />}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <p className="text-sm text-ink-soft max-w-2xl">
          Catalog of every jitt and stunt move the team knows. Videos live on the team&apos;s private YouTube channel; access governed by channel membership.
        </p>
        {canEdit && (
          <button onClick={() => setEditing("new")} className="btn-primary text-sm" data-testid="new-move">
            <Plus className="h-4 w-4" /> New move
          </button>
        )}
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
              <span className="flex items-center gap-1.5">
                {m.status !== "published" && (
                  <span className={m.status === "draft" ? "pill-amber capitalize" : "pill-line capitalize"}>{m.status}</span>
                )}
                <span className={DIFF_COLOR[m.difficulty]}>{m.difficulty}</span>
              </span>
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
              {canEdit && (
                <button onClick={() => setEditing(m)} className="btn-ghost text-xs">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-sm text-ink-faint">No moves match.</li>}
      </ul>

      {editing && (
        <MoveModal move={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </PortalShell>
  );
}

function MoveModal({ move, onClose }: { move: Move | null; onClose: () => void }) {
  const [name, setName] = useState(move?.name ?? "");
  const [aliases, setAliases] = useState(move?.aliases.join(", ") ?? "");
  const [category, setCategory] = useState<string>(move?.category ?? "Spin");
  const [difficulty, setDifficulty] = useState<string>(move?.difficulty ?? "Beginner");
  const [description, setDescription] = useState(move?.description_markdown ?? "");
  const [originatedBy, setOriginatedBy] = useState(move?.originated_by ?? "");
  const [originatedYear, setOriginatedYear] = useState(move?.originated_year ? String(move.originated_year) : "");
  const [videoLinks, setVideoLinks] = useState(move?.video_links.join("\n") ?? "");
  const [status, setStatus] = useState<string>(move?.status ?? "draft");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const fields = {
      name: name.trim(),
      aliases: aliases.split(",").map(s => s.trim()).filter(Boolean),
      category: category as Move["category"],
      difficulty: difficulty as Move["difficulty"],
      description_markdown: description,
      originated_by: originatedBy.trim() || undefined,
      originated_year: originatedYear ? Number(originatedYear) : undefined,
      video_links: videoLinks.split("\n").map(s => s.trim()).filter(Boolean),
      status: status as Move["status"],
    };
    if (move) {
      update(dbx => {
        const m = dbx.moves.find(x => x.id === move.id);
        if (m) Object.assign(m, fields);
      }, `Updated move: ${fields.name}`);
    } else {
      update(dbx => {
        dbx.moves.push({ id: uid("mv"), ...fields });
      }, `Added move: ${fields.name}`);
    }
    onClose();
  }

  function remove() {
    if (!move) return;
    if (!confirm(`Delete "${move.name}" from the move library?`)) return;
    update(dbx => {
      dbx.moves = dbx.moves.filter(x => x.id !== move.id);
    }, `Deleted move: ${move.name}`);
    onClose();
  }

  return (
    <Modal title={move ? "Edit move" : "New move"} onClose={onClose} wide>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Name" value={name} onChange={setName} required />
          <TextField label="Aliases" value={aliases} onChange={setAliases} placeholder="comma-separated" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <SelectField label="Category" value={category} onChange={setCategory}
            options={CATEGORIES.map(c => ({ value: c, label: c }))} />
          <SelectField label="Difficulty" value={difficulty} onChange={setDifficulty}
            options={DIFFICULTIES.map(d => ({ value: d, label: d }))} />
          <SelectField label="Status" value={status} onChange={setStatus} options={STATUSES_OPTS} />
        </div>
        <TextArea label="Description" value={description} onChange={setDescription} rows={4} placeholder="Markdown supported" />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Originated by" value={originatedBy} onChange={setOriginatedBy} />
          <TextField label="Originated year" value={originatedYear} onChange={setOriginatedYear} type="number" />
        </div>
        <TextArea label="Video links" value={videoLinks} onChange={setVideoLinks} rows={3} placeholder="One URL per line" />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{move ? "Save changes" : "Add move"}</button>
          {move && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">Delete</button>
          )}
        </div>
      </form>
    </Modal>
  );
}
