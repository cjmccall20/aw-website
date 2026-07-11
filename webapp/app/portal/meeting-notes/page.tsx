"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, todayISO } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { MeetingNote } from "@/lib/types";
import { Plus, Pencil } from "lucide-react";

export default function MeetingNotesPage() {
  const db = useStore();
  const access = useAccess("meeting_notes");
  const canEdit = access === "edit";
  const [editing, setEditing] = useState<MeetingNote | "new" | null>(null);

  const notes = [...db.meetingNotes].sort((a, b) => b.meeting_date.localeCompare(a.meeting_date));

  return (
    <PortalShell tabKey="meeting_notes" title="Meeting Notes">
      {access === "view" && <ViewOnlyBanner />}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-ink-soft">Maintained by the Secretary. All officers can view; members get read access by default.</p>
        {canEdit && (
          <button onClick={() => setEditing("new")} className="btn-primary text-sm" data-testid="new-meeting">
            <Plus className="h-4 w-4" /> New meeting
          </button>
        )}
      </div>

      <ul className="space-y-4">
        {notes.map(n => (
          <li key={n.id} className="card-padded">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="eyebrow">{n.meeting_type}</p>
                <h2 className="mt-2 font-serif text-xl font-semibold">
                  {formatDate(n.meeting_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-ink-faint">{n.attendee_member_ids.length} attendees</p>
                {canEdit && (
                  <button onClick={() => setEditing(n)} className="btn-ghost text-sm" aria-label="Edit meeting note">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="label">Agenda</p>
                <p className="text-ink-soft whitespace-pre-wrap mt-1">{n.agenda_markdown}</p>
              </div>
              {n.decisions_markdown && (
                <div>
                  <p className="label">Decisions</p>
                  <p className="text-ink whitespace-pre-wrap mt-1">{n.decisions_markdown}</p>
                </div>
              )}
            </div>
            {n.notes_markdown && (
              <div className="mt-5 pt-5 border-t border-line">
                <p className="label">Discussion notes</p>
                <p className="text-ink-soft mt-1 whitespace-pre-wrap">{n.notes_markdown}</p>
              </div>
            )}

            <ActionItems noteId={n.id} canEdit={canEdit} />
          </li>
        ))}
        {notes.length === 0 && <li className="text-sm text-ink-faint">No meeting notes yet.</li>}
      </ul>

      {editing && (
        <MeetingModal note={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </PortalShell>
  );
}

// ─── action items ────────────────────────────────────────────────────────────

function ActionItems({ noteId, canEdit }: { noteId: string; canEdit: boolean }) {
  const db = useStore();
  const [adding, setAdding] = useState(false);
  const items = db.actionItems.filter(a => a.meeting_note_id === noteId);
  const memberName = (id?: string) => (id && db.members.find(m => m.id === id)?.name) || "Unassigned";

  function toggle(id: string) {
    update(dbx => {
      const a = dbx.actionItems.find(x => x.id === id);
      if (a) a.completed_at = a.completed_at ? undefined : todayISO();
    }, "Toggled action item");
  }

  if (items.length === 0 && !canEdit) return null;

  return (
    <div className="mt-5 pt-5 border-t border-line">
      <div className="flex items-center justify-between">
        <p className="label">Action items</p>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="btn-ghost text-xs">+ Add action item</button>
        )}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map(a => (
          <li key={a.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!!a.completed_at}
              disabled={!canEdit}
              onChange={() => toggle(a.id)}
              aria-label={`Mark "${a.description}" ${a.completed_at ? "incomplete" : "complete"}`}
              className="h-4 w-4 rounded border-line text-maroon-700 flex-shrink-0"
            />
            <span className={a.completed_at ? "line-through text-ink-faint" : "text-ink"}>{a.description}</span>
            <span className="text-xs text-ink-faint whitespace-nowrap ml-auto">
              {memberName(a.assignee_member_id)}{a.due_date && ` · due ${formatDate(a.due_date)}`}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-ink-faint">None yet.</li>}
      </ul>
      {adding && <AddActionItemModal noteId={noteId} onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddActionItemModal({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const db = useStore();
  const members = db.members.filter(m => m.status === "current");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    update(dbx => {
      dbx.actionItems.push({
        id: uid("ai"),
        meeting_note_id: noteId,
        description: description.trim(),
        assignee_member_id: assignee || undefined,
        due_date: dueDate || undefined,
      });
    }, `Added action item: ${description.trim()}`);
    onClose();
  }

  return (
    <Modal title="Add action item" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <TextField label="Description" value={description} onChange={setDescription} required />
        <SelectField label="Assignee" value={assignee} onChange={setAssignee}
          options={[{ value: "", label: "Unassigned" }, ...members.map(m => ({ value: m.id, label: m.name }))]} />
        <TextField label="Due date" value={dueDate} onChange={setDueDate} type="date" />
        <button type="submit" className="btn-primary w-full">Add action item</button>
      </form>
    </Modal>
  );
}

// ─── meeting modal ───────────────────────────────────────────────────────────

function MeetingModal({ note, onClose }: { note: MeetingNote | null; onClose: () => void }) {
  const db = useStore();
  const members = db.members.filter(m => m.status === "current");
  const [date, setDate] = useState(note?.meeting_date ?? todayISO());
  const [type, setType] = useState(note?.meeting_type ?? "Officer meeting");
  const [attendees, setAttendees] = useState<string[]>(note?.attendee_member_ids ?? []);
  const [agenda, setAgenda] = useState(note?.agenda_markdown ?? "");
  const [decisions, setDecisions] = useState(note?.decisions_markdown ?? "");
  const [notesMd, setNotesMd] = useState(note?.notes_markdown ?? "");

  function toggleAttendee(id: string) {
    setAttendees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const fields = {
      meeting_date: date,
      meeting_type: type.trim() || "Meeting",
      attendee_member_ids: attendees,
      agenda_markdown: agenda,
      decisions_markdown: decisions.trim() || undefined,
      notes_markdown: notesMd.trim() || undefined,
    };
    if (note) {
      update(dbx => {
        const n = dbx.meetingNotes.find(x => x.id === note.id);
        if (n) Object.assign(n, fields);
      }, `Updated meeting notes for ${date}`);
    } else {
      update(dbx => {
        dbx.meetingNotes.push({ id: uid("mn"), ...fields });
      }, `Added meeting notes for ${date}`);
    }
    onClose();
  }

  function remove() {
    if (!note) return;
    if (!confirm("Delete this meeting note? Its action items stay but lose the link back to the meeting.")) return;
    update(dbx => {
      dbx.meetingNotes = dbx.meetingNotes.filter(x => x.id !== note.id);
      for (const a of dbx.actionItems) {
        if (a.meeting_note_id === note.id) a.meeting_note_id = undefined;
      }
    }, `Deleted meeting notes for ${note.meeting_date}`);
    onClose();
  }

  return (
    <Modal title={note ? "Edit meeting" : "New meeting"} onClose={onClose} wide>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Meeting date" value={date} onChange={setDate} type="date" required />
          <TextField label="Meeting type" value={type} onChange={setType} placeholder="e.g. Officer meeting" />
        </div>
        <div>
          <p className="label">Attendees</p>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {members.map(m => (
              <label key={m.id} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={attendees.includes(m.id)}
                  onChange={() => toggleAttendee(m.id)}
                  className="h-4 w-4 rounded border-line text-maroon-700"
                />
                <span className="truncate">{m.name}</span>
              </label>
            ))}
          </div>
        </div>
        <TextArea label="Agenda" value={agenda} onChange={setAgenda} rows={4} placeholder="Markdown supported" />
        <TextArea label="Decisions" value={decisions} onChange={setDecisions} rows={3} />
        <TextArea label="Discussion notes" value={notesMd} onChange={setNotesMd} rows={4} />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{note ? "Save changes" : "Add meeting"}</button>
          {note && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">Delete</button>
          )}
        </div>
      </form>
    </Modal>
  );
}
