"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, todayISO } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import type { ResourceFile } from "@/lib/types";
import { FileText, Download, Upload, Folder, Pencil, Trash2 } from "lucide-react";

const VIS_PILL: Record<string, string> = {
  members_only: "pill-line",
  members_and_alumni: "pill-green",
  officers_only: "pill-amber",
};

const CATEGORIES: ResourceFile["category"][] = [
  "Constitution", "Choreography", "Contracts", "Historical", "Sponsor Decks", "Other",
];

const VISIBILITIES: { value: ResourceFile["visibility"]; label: string }[] = [
  { value: "members_only", label: "Members only" },
  { value: "members_and_alumni", label: "Members and alumni" },
  { value: "officers_only", label: "Officers only" },
];

export default function ResourcesPage() {
  const db = useStore();
  const access = useAccess("resources");
  const canEdit = access === "edit";
  const [editing, setEditing] = useState<ResourceFile | "new" | null>(null);

  const grouped = db.resources.reduce<Record<string, ResourceFile[]>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});

  function remove(r: ResourceFile) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    update(dbx => {
      dbx.resources = dbx.resources.filter(x => x.id !== r.id);
    }, `Deleted resource: ${r.title}`);
  }

  return (
    <PortalShell tabKey="resources" title="Resources">
      {access === "view" && <ViewOnlyBanner />}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">Constitution, contracts, choreography notes, sponsor decks. Permissioned by visibility tag.</p>
        {canEdit && (
          <button onClick={() => setEditing("new")} className="btn-primary text-sm" data-testid="upload-file">
            <Upload className="h-4 w-4" /> Upload file
          </button>
        )}
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
                  <a href={r.file_url} aria-label={`Download ${r.title}`} className="btn-ghost text-sm"><Download className="h-4 w-4" /></a>
                  {canEdit && (
                    <>
                      <button onClick={() => setEditing(r)} aria-label={`Edit ${r.title}`} className="btn-ghost text-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(r)} aria-label={`Delete ${r.title}`} className="btn-ghost text-sm text-maroon-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {db.resources.length === 0 && <p className="text-sm text-ink-faint">No files yet.</p>}
      </div>

      {editing && (
        <ResourceModal resource={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </PortalShell>
  );
}

function ResourceModal({ resource, onClose }: { resource: ResourceFile | null; onClose: () => void }) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [category, setCategory] = useState<string>(resource?.category ?? "Other");
  const [visibility, setVisibility] = useState<string>(resource?.visibility ?? "members_only");
  const [fileType, setFileType] = useState(resource?.file_type ?? "");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.includes(".") ? f.name.split(".").pop()! : "file";
    setFileType(ext.toLowerCase());
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (resource) {
      update(dbx => {
        const r = dbx.resources.find(x => x.id === resource.id);
        if (!r) return;
        r.title = title.trim();
        r.description = description.trim() || undefined;
        r.category = category as ResourceFile["category"];
        r.visibility = visibility as ResourceFile["visibility"];
        r.file_type = fileType || r.file_type;
      }, `Updated resource: ${title.trim()}`);
    } else {
      update(dbx => {
        dbx.resources.push({
          id: uid("res"),
          title: title.trim(),
          description: description.trim() || undefined,
          category: category as ResourceFile["category"],
          file_url: "#",
          file_type: fileType || "file",
          visibility: visibility as ResourceFile["visibility"],
          uploaded_at: todayISO(),
        });
      }, `Uploaded resource: ${title.trim()}`);
    }
    onClose();
  }

  return (
    <Modal title={resource ? "Edit file" : "Upload file"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label" htmlFor="f-file">File</label>
          <input id="f-file" type="file" className="input" onChange={onFile} />
          <p className="help-text">
            Demo captures only the file name/type{fileType ? ` (.${fileType})` : ""} — real uploads land in Supabase Storage.
          </p>
        </div>
        <TextField label="Title" value={title} onChange={setTitle} required />
        <TextArea label="Description" value={description} onChange={setDescription} rows={3} />
        <SelectField label="Category" value={category} onChange={setCategory}
          options={CATEGORIES.map(c => ({ value: c, label: c }))} />
        <SelectField label="Visibility" value={visibility} onChange={setVisibility} options={VISIBILITIES} />
        <button type="submit" className="btn-primary w-full">{resource ? "Save changes" : "Add file"}</button>
      </form>
    </Modal>
  );
}
