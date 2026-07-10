"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, useSessionUser, update, uid, todayISO } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import type { PublicLesson, PrivateLessonRequest } from "@/lib/types";
import { Plus, Send, Eye, EyeOff, Trash2, UserPlus } from "lucide-react";

export default function LessonsManagementPage() {
  const db = useStore();
  const canEdit = useAccess("lessons_management") === "edit";
  const [tab, setTab] = useState<"public" | "private" | "instructors" | "notify">("public");
  const publicList = db.notifyLists.find(l => l.key === "public_lessons");
  const subs = db.notifySubscribers.filter(s => s.list_id === publicList?.id && !s.unsubscribed_at);

  return (
    <PortalShell tabKey="lessons_management" title="Lessons Management">
      {!canEdit && <ViewOnlyBanner />}
      <div className="flex flex-wrap gap-1 border-b border-line mb-6">
        {[
          ["public", "Public sessions"],
          ["private", `Private requests (${db.privateLessonRequests.length})`],
          ["instructors", "Instructor pool"],
          ["notify", `Notify list (${subs.length})`],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as typeof tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === k ? "border-maroon-700 text-maroon-700" : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "public" && <PublicSessions canEdit={canEdit} />}
      {tab === "private" && <PrivateRequests canEdit={canEdit} />}
      {tab === "instructors" && <InstructorPool canEdit={canEdit} />}
      {tab === "notify" && <NotifyListAdmin canEdit={canEdit} />}
    </PortalShell>
  );
}

// ─── public sessions ─────────────────────────────────────────────────────────

function PublicSessions({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [editing, setEditing] = useState<PublicLesson | null>(null);
  const [creating, setCreating] = useState(false);

  function toggleVisibility(l: PublicLesson) {
    update(dbx => {
      const row = dbx.publicLessons.find(x => x.id === l.id);
      if (row) row.visible_to_public = !row.visible_to_public;
    }, `${l.visible_to_public ? "Hid" : "Published"} public session: ${l.class_name}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-sm text-ink-soft">Schedule public sessions for the semester. Toggle visible_to_public to publish.</p>
        {canEdit && (
          <button onClick={() => setCreating(true)} className="btn-primary text-sm" data-testid="new-session">
            <Plus className="h-4 w-4" /> New session
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {db.publicLessons.map(l => (
          <li key={l.id} className="card-padded flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{l.class_name} <span className="text-ink-soft">— {l.level}</span></p>
              <p className="text-xs text-ink-faint">{l.day}s, {l.start_time} – {l.end_time} · {l.dates.length} dates scheduled</p>
            </div>
            <button
              onClick={() => canEdit && toggleVisibility(l)}
              disabled={!canEdit}
              aria-label={l.visible_to_public ? `Hide ${l.class_name}` : `Publish ${l.class_name}`}
              title={canEdit ? "Click to toggle public visibility" : undefined}
              className={cn(
                l.visible_to_public ? "pill-green inline-flex gap-1 items-center" : "pill-line inline-flex gap-1 items-center",
                canEdit && "cursor-pointer hover:opacity-80",
              )}
            >
              {l.visible_to_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {l.visible_to_public ? "Public" : "Hidden"}
            </button>
            {canEdit && <button onClick={() => setEditing(l)} className="btn-ghost text-sm">Edit</button>}
          </li>
        ))}
      </ul>
      {(creating || editing) && (
        <SessionModal lesson={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function SessionModal({ lesson, onClose }: { lesson: PublicLesson | null; onClose: () => void }) {
  const [f, setF] = useState({
    class_name: lesson?.class_name ?? "",
    level: lesson?.level ?? "Beginner",
    day: lesson?.day ?? "Sunday",
    start_time: lesson?.start_time ?? "17:30",
    end_time: lesson?.end_time ?? "19:00",
    dates: lesson?.dates.join(", ") ?? "",
    price_per_couple: lesson?.price_per_couple != null ? String(lesson.price_per_couple) : "60",
    signup_url: lesson?.signup_url ?? "",
    notes: lesson?.notes ?? "",
  });
  const [visible, setVisible] = useState(lesson?.visible_to_public ?? false);
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const dates = f.dates.split(",").map(d => d.trim()).filter(Boolean);
    update(dbx => {
      const apply = (row: PublicLesson) => {
        row.class_name = f.class_name;
        row.level = f.level;
        row.day = f.day;
        row.start_time = f.start_time;
        row.end_time = f.end_time;
        row.dates = dates;
        row.price_per_couple = f.price_per_couple ? Number(f.price_per_couple) : undefined;
        row.signup_url = f.signup_url || undefined;
        row.notes = f.notes || undefined;
        row.visible_to_public = visible;
      };
      if (lesson) {
        const row = dbx.publicLessons.find(x => x.id === lesson.id);
        if (row) apply(row);
      } else {
        const row: PublicLesson = {
          id: uid("pl"), class_name: "", level: "", day: "", start_time: "", end_time: "",
          dates: [], instructor_ids: [], visible_to_public: false, active: true,
        };
        apply(row);
        dbx.publicLessons.push(row);
      }
    }, lesson ? `Updated public session: ${f.class_name}` : `Created public session: ${f.class_name}`);
    onClose();
  }

  function remove() {
    if (!lesson) return;
    if (!confirm(`Delete "${lesson.class_name}"? This can't be undone.`)) return;
    update(dbx => {
      dbx.publicLessons = dbx.publicLessons.filter(x => x.id !== lesson.id);
    }, `Deleted public session: ${lesson.class_name}`);
    onClose();
  }

  return (
    <Modal title={lesson ? "Edit session" : "New session"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Class name" value={f.class_name} onChange={set("class_name")} required />
          <TextField label="Level" value={f.level} onChange={set("level")} placeholder="Beginner / Intermediate" required />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <SelectField label="Day" value={f.day} onChange={set("day")}
            options={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => ({ value: d, label: d }))} />
          <TextField label="Start" type="time" value={f.start_time} onChange={set("start_time")} required />
          <TextField label="End" type="time" value={f.end_time} onChange={set("end_time")} required />
        </div>
        <TextField label="Dates" value={f.dates} onChange={set("dates")}
          placeholder="2026-09-13, 2026-09-20, 2026-09-27" help="Comma-separated YYYY-MM-DD class dates." />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Price per couple ($)" type="number" value={f.price_per_couple} onChange={set("price_per_couple")} />
          <TextField label="Signup URL" value={f.signup_url} onChange={set("signup_url")} placeholder="https://tamu.estore.flywire.com" />
        </div>
        <TextArea label="Notes" value={f.notes} onChange={set("notes")} rows={3} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-maroon-700" />
          Visible on the public site
        </label>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1 justify-center">{lesson ? "Save changes" : "Create session"}</button>
          {lesson && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── private requests ────────────────────────────────────────────────────────

function PrivateRequests({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [assigning, setAssigning] = useState<string | null>(null);

  function setStatus(r: PrivateLessonRequest, status: PrivateLessonRequest["status"], audit: string) {
    update(dbx => {
      const row = dbx.privateLessonRequests.find(x => x.id === r.id);
      if (row) row.status = status;
    }, audit);
  }

  return (
    <ul className="space-y-3">
      {db.privateLessonRequests.map(r => {
        const assigned = r.assigned_instructor_ids
          .map(id => db.members.find(m => m.id === id))
          .filter((m): m is NonNullable<typeof m> => Boolean(m));
        return (
          <li key={r.id} className="card-padded">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{r.requester_first_name} {r.requester_last_name} · {r.dance_type}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  {r.group_size} people · {r.experience_level} · received {formatDate(r.created_at, { month: "short", day: "numeric" })}
                </p>
                {r.preferred_dates && <p className="text-sm text-ink-soft mt-2">Wants: {r.preferred_dates}</p>}
              </div>
              <span className="pill-line capitalize">{r.status.replace(/_/g, " ")}</span>
            </div>
            {assigned.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-faint">Instructors:</span>
                {assigned.map(m => <span key={m.id} className="pill-line">{m.name}</span>)}
              </div>
            )}
            <div className="mt-4 flex gap-2 flex-wrap">
              {canEdit && r.status === "new" && (
                <button onClick={() => setStatus(r, "polling", `Approved private lesson to poll: ${r.requester_last_name}`)}
                  className="btn-primary text-sm">Approve to poll instructors</button>
              )}
              {canEdit && r.status === "polling" && (
                <button onClick={() => setStatus(r, "polling_closed", `Closed instructor polling: ${r.requester_last_name}`)}
                  className="btn-primary text-sm">Close polling</button>
              )}
              {canEdit && r.status === "polling_closed" && (
                <>
                  <button onClick={() => setStatus(r, "confirmed", `Confirmed private lesson: ${r.requester_last_name}`)}
                    className="btn-primary text-sm">Confirm</button>
                  <button onClick={() => setStatus(r, "declined", `Declined private lesson: ${r.requester_last_name}`)}
                    className="btn-secondary text-sm">Decline</button>
                </>
              )}
              <a href={`mailto:${r.requester_email}`} className="btn-secondary text-sm">Compose quote</a>
              {canEdit && (
                <button onClick={() => setAssigning(r.id)} className="btn-ghost text-sm">
                  <UserPlus className="h-3.5 w-3.5" /> Assign instructors
                </button>
              )}
            </div>
            {assigning === r.id && <AssignInstructorsModal request={r} onClose={() => setAssigning(null)} />}
          </li>
        );
      })}
    </ul>
  );
}

function AssignInstructorsModal({ request, onClose }: { request: PrivateLessonRequest; onClose: () => void }) {
  const db = useStore();
  const live = db.privateLessonRequests.find(x => x.id === request.id) ?? request;
  const current = db.members.filter(m => m.status === "current");

  function toggle(memberId: string, checked: boolean) {
    update(dbx => {
      const row = dbx.privateLessonRequests.find(x => x.id === request.id);
      if (!row) return;
      row.assigned_instructor_ids = checked
        ? [...row.assigned_instructor_ids.filter(id => id !== memberId), memberId]
        : row.assigned_instructor_ids.filter(id => id !== memberId);
    }, `Updated instructors for private lesson: ${request.requester_last_name}`);
  }

  return (
    <Modal title="Assign instructors" onClose={onClose}>
      <p className="text-xs text-ink-faint mb-4">
        Instructors assigned to {request.requester_first_name} {request.requester_last_name}&apos;s {request.dance_type ?? "lesson"}.
      </p>
      <ul className="divide-y divide-line">
        {current.map(m => (
          <li key={m.id}>
            <label className="flex items-center justify-between py-2.5 px-2 rounded hover:bg-cream-200 cursor-pointer">
              <span className="text-sm">{m.name}</span>
              <input
                type="checkbox"
                checked={live.assigned_instructor_ids.includes(m.id)}
                onChange={e => toggle(m.id, e.target.checked)}
                className="h-4 w-4 rounded border-line-strong text-maroon-700"
              />
            </label>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="mt-4 btn-primary w-full justify-center">Done</button>
    </Modal>
  );
}

// ─── instructor pool ─────────────────────────────────────────────────────────

function InstructorPool({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const current = db.members.filter(m => m.status === "current");

  function toggle(memberId: string, checked: boolean) {
    const name = db.members.find(m => m.id === memberId)?.name ?? memberId;
    update(dbx => {
      dbx.instructorPool = checked
        ? [...dbx.instructorPool.filter(id => id !== memberId), memberId]
        : dbx.instructorPool.filter(id => id !== memberId);
    }, `${checked ? "Added" : "Removed"} ${name} ${checked ? "to" : "from"} instructor pool`);
  }

  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Eligible instructors</h2>
      <p className="text-xs text-ink-faint mt-1">
        Drives instructor inclusion in the weekly availability survey. {db.instructorPool.length} of {current.length} current members eligible.
      </p>
      <ul className="mt-5 grid sm:grid-cols-2 gap-2">
        {current.map(m => (
          <li key={m.id}>
            <label className={cn("flex items-center justify-between px-3 py-2 rounded-md", canEdit ? "hover:bg-cream-200 cursor-pointer" : "opacity-80")}>
              <span>{m.name}</span>
              <input
                type="checkbox"
                checked={db.instructorPool.includes(m.id)}
                disabled={!canEdit}
                onChange={e => toggle(m.id, e.target.checked)}
                className="h-4 w-4 rounded border-line-strong text-maroon-700"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── notify list ─────────────────────────────────────────────────────────────

function NotifyListAdmin({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [composing, setComposing] = useState(false);
  const list = db.notifyLists.find(l => l.key === "public_lessons");
  if (!list) return <p className="text-sm text-ink-faint">Notify list not found.</p>;
  const subs = db.notifySubscribers.filter(s => s.list_id === list.id && !s.unsubscribed_at);
  const past = [...db.notifyCampaigns.filter(c => c.list_id === list.id)]
    .sort((a, b) => b.sent_at.localeCompare(a.sent_at));

  return (
    <div className="space-y-6">
      <div className="card-padded">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold">{list.display_name}</h2>
            <p className="text-sm text-ink-soft mt-1">{subs.length} active subscribers · sends from {list.from_alias}</p>
          </div>
          {canEdit && (
            <button onClick={() => setComposing(true)} className="btn-primary">
              <Send className="h-4 w-4" /> Notify the list
            </button>
          )}
        </div>
      </div>

      <div className="card-padded">
        <h3 className="font-serif text-lg font-semibold">Recent subscribers</h3>
        <ul className="mt-4 divide-y divide-line">
          {subs.map(s => (
            <li key={s.id} className="py-2.5 flex items-center justify-between text-sm">
              <span>{s.first_name ?? "—"} <span className="text-ink-faint">· {s.email}</span></span>
              <span className="text-xs text-ink-faint">{formatDate(s.subscribed_at, { month: "short", day: "numeric" })}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-padded">
        <h3 className="font-serif text-lg font-semibold">Past campaigns</h3>
        <ul className="mt-4 divide-y divide-line">
          {past.map(c => (
            <li key={c.id} className="py-3">
              <p className="font-medium text-sm">{c.subject}</p>
              <p className="text-xs text-ink-faint mt-0.5">
                Sent {formatDate(c.sent_at)} · {c.recipient_count} recipients · {c.bounce_count} bounces · {c.unsubscribe_count_from_this_send} unsubscribes
              </p>
            </li>
          ))}
          {past.length === 0 && <li className="py-3 text-sm text-ink-faint">No campaigns sent yet.</li>}
        </ul>
      </div>

      {composing && (
        <CampaignComposerModal listId={list.id} fromAlias={list.from_alias} subscriberCount={subs.length}
          onClose={() => setComposing(false)} />
      )}
    </div>
  );
}

function CampaignComposerModal({ listId, fromAlias, subscriberCount, onClose }: {
  listId: string;
  fromAlias: string;
  subscriberCount: number;
  onClose: () => void;
}) {
  const user = useSessionUser();
  const [subject, setSubject] = useState("New session of Wranglers public lessons");
  const [body, setBody] = useState(
    "Howdy!\n\nA new session of Aggie Wranglers public lessons just went up on the schedule. Classes fill fast, so grab your partner and sign up at aggiewranglers.com/public-lessons.\n\nHope to see y'all on the dance floor!\n\n— The Aggie Wranglers",
  );
  const [sent, setSent] = useState(false);

  function send(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      dbx.notifyCampaigns.push({
        id: uid("nc"),
        list_id: listId,
        subject,
        body_text: body,
        composed_by_id: user?.id ?? "unknown",
        sent_at: todayISO(),
        recipient_count: subscriberCount,
        bounce_count: 0,
        unsubscribe_count_from_this_send: 0,
      });
    }, `Sent notify-list campaign: ${subject}`);
    setSent(true);
  }

  return (
    <Modal title="Notify the list" onClose={onClose} wide>
      {sent ? (
        <div className="text-center py-6">
          <p className="font-serif text-2xl font-semibold text-green">Sent to {subscriberCount} subscribers</p>
          <p className="mt-3 text-sm text-ink-soft">
            In production Resend delivers this from {fromAlias}.
          </p>
          <button onClick={onClose} className="mt-6 btn-primary">Done</button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-4">
          <p className="text-xs text-ink-faint">Sends from {fromAlias} to every active subscriber. Every email includes a one-click unsubscribe link.</p>
          <TextField label="Subject" value={subject} onChange={setSubject} required />
          <TextArea label="Body" value={body} onChange={setBody} rows={8} required />
          <button type="submit" className="btn-primary w-full justify-center" data-testid="notify-list-send">
            <Send className="h-4 w-4" /> Send to {subscriberCount} subscribers
          </button>
        </form>
      )}
    </Modal>
  );
}
