"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  PUBLIC_LESSONS, PRIVATE_LESSON_REQUESTS,
  NOTIFY_LISTS, NOTIFY_SUBSCRIBERS, NOTIFY_CAMPAIGNS,
  MEMBERS, byId,
} from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Send, Eye, EyeOff, Calendar, Users } from "lucide-react";

export default function LessonsManagementPage() {
  const [tab, setTab] = useState<"public" | "private" | "instructors" | "notify">("public");
  const publicList = NOTIFY_LISTS.find(l => l.key === "public_lessons");
  const subs = NOTIFY_SUBSCRIBERS.filter(s => s.list_id === publicList?.id && !s.unsubscribed_at);

  return (
    <PortalShell tabKey="lessons_management" title="Lessons Management">
      <div className="flex flex-wrap gap-1 border-b border-line mb-6">
        {[
          ["public", "Public sessions"],
          ["private", `Private requests (${PRIVATE_LESSON_REQUESTS.length})`],
          ["instructors", "Instructor pool"],
          ["notify", `Notify list (${subs.length})`],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as any)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === k ? "border-maroon-700 text-maroon-700" : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "public" && <PublicSessions />}
      {tab === "private" && <PrivateRequests />}
      {tab === "instructors" && <InstructorPool />}
      {tab === "notify" && <NotifyListAdmin />}
    </PortalShell>
  );
}

function PublicSessions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-soft">Schedule public sessions for the semester. Toggle visible_to_public to publish.</p>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> New session</button>
      </div>
      <ul className="space-y-3">
        {PUBLIC_LESSONS.map(l => (
          <li key={l.id} className="card-padded flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{l.class_name} <span className="text-ink-soft">— {l.level}</span></p>
              <p className="text-xs text-ink-faint">{l.day}s, {l.start_time} – {l.end_time} · {l.dates.length} dates scheduled</p>
            </div>
            <span className={l.visible_to_public ? "pill-green inline-flex gap-1 items-center" : "pill-line inline-flex gap-1 items-center"}>
              {l.visible_to_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {l.visible_to_public ? "Public" : "Hidden"}
            </span>
            <button className="btn-ghost text-sm">Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrivateRequests() {
  return (
    <ul className="space-y-3">
      {PRIVATE_LESSON_REQUESTS.map(r => (
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
          <div className="mt-4 flex gap-2 flex-wrap">
            <button className="btn-primary text-sm">Approve to poll instructors</button>
            <a href={`mailto:${r.requester_email}`} className="btn-secondary text-sm">Compose quote</a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function InstructorPool() {
  const eligible = MEMBERS.filter(m => m.status === "current").slice(0, 8);
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Eligible instructors</h2>
      <p className="text-xs text-ink-faint mt-1">Drives instructor inclusion in the weekly availability survey.</p>
      <ul className="mt-5 grid sm:grid-cols-2 gap-2">
        {eligible.map(m => (
          <li key={m.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-cream-200">
            <span>{m.name}</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line-strong text-maroon-700" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotifyListAdmin() {
  const list = NOTIFY_LISTS.find(l => l.key === "public_lessons")!;
  const subs = NOTIFY_SUBSCRIBERS.filter(s => s.list_id === list.id && !s.unsubscribed_at);
  const past = NOTIFY_CAMPAIGNS.filter(c => c.list_id === list.id);

  return (
    <div className="space-y-6">
      <div className="card-padded">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold">{list.display_name}</h2>
            <p className="text-sm text-ink-soft mt-1">{subs.length} active subscribers · sends from {list.from_alias}</p>
          </div>
          <button className="btn-primary"><Send className="h-4 w-4" /> Notify the list</button>
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
        </ul>
      </div>
    </div>
  );
}
