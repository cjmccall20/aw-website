"use client";

import Link from "next/link";
import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import type { Contact } from "@/lib/types";
import {
  ArrowLeft, Building2, User, Mail, Phone, MapPin,
  Calendar, Bell, MessageSquare, FileText, Search, X, Pencil,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function ContactDetailView({ id }: { id: string }) {
  const db = useStore();
  const access = useAccess("contacts");
  const canEdit = access === "edit";
  const [editing, setEditing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [addingReminder, setAddingReminder] = useState(false);

  const c = db.contacts.find(x => x.id === id);
  if (!c) {
    return (
      <PortalShell tabKey="contacts" title="Contact not found">
        <p className="text-ink-soft">This contact doesn&apos;t exist (it may have been merged or created in another browser session).</p>
        <Link href="/portal/contacts" className="mt-4 btn-secondary inline-flex">Back to Contacts</Link>
      </PortalShell>
    );
  }

  const contactName = c.name;
  const perfRequests = db.performanceRequests.filter(r => r.contact_id === c.id);
  const pllRequests = db.privateLessonRequests.filter(r => r.contact_id === c.id);
  const threads = db.emailThreads.filter(t => t.contact_id === c.id);
  const messages = db.emailMessages
    .filter(m => threads.some(t => t.id === m.thread_id))
    .sort((a, b) => b.received_at.localeCompare(a.received_at));
  const reminders = db.annualReminders.filter(r => r.contact_id === c.id);

  const doNotContact = !c.email_opt_in && !c.sms_opt_in;

  function toggleDoNotContact() {
    if (!canEdit) return;
    update(dbx => {
      const cx = dbx.contacts.find(x => x.id === id);
      if (!cx) return;
      if (!cx.email_opt_in && !cx.sms_opt_in) {
        cx.email_opt_in = true; // re-enable email only
      } else {
        cx.email_opt_in = false;
        cx.sms_opt_in = false;
      }
    }, doNotContact ? `Re-enabled contact for ${contactName}` : `Marked ${contactName} do-not-contact`);
  }

  function deleteReminder(reminderId: string) {
    if (!canEdit) return;
    update(dbx => {
      dbx.annualReminders = dbx.annualReminders.filter(r => r.id !== reminderId);
    }, `Deleted annual reminder for ${contactName}`);
  }

  return (
    <PortalShell
      tabKey="contacts"
      breadcrumb={
        <Link href="/portal/contacts" className="inline-flex items-center gap-1 text-ink-faint hover:text-ink-soft">
          <ArrowLeft className="h-3.5 w-3.5" /> Contacts
        </Link>
      }
    >
      {access === "view" && <ViewOnlyBanner />}

      {editing && <EditContactModal contact={c} onClose={() => setEditing(false)} />}
      {merging && <MergeContactModal contact={c} others={db.contacts.filter(x => x.id !== c.id)} onClose={() => setMerging(false)} />}
      {addingReminder && <AddReminderModal contact={c} onClose={() => setAddingReminder(false)} />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <header className="card-padded">
            <div className="flex items-start gap-5">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0",
                c.kind === "organization" ? "bg-maroon-50 text-maroon-700" : "bg-cream-200 text-ink-soft",
              )}>
                {c.kind === "organization" ? <Building2 className="h-7 w-7" /> : <User className="h-7 w-7" />}
              </div>
              <div className="flex-1">
                <p className="eyebrow capitalize">{c.kind}</p>
                <h1 className="mt-1 font-serif text-3xl font-semibold">{c.name}</h1>
                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  {c.email && <ContactLine icon={<Mail />}>{c.email}</ContactLine>}
                  {c.phone && <ContactLine icon={<Phone />}>{c.phone}</ContactLine>}
                  {c.address && <ContactLine icon={<MapPin />}>{c.address}</ContactLine>}
                  <ContactLine icon={<Calendar />}>First seen {formatDate(c.created_at, { month: "long", year: "numeric" })}</ContactLine>
                </div>
                {c.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.tags.map(t => <span key={t} className="pill-line">{t}</span>)}
                  </div>
                )}
                {doNotContact && (
                  <p className="mt-4 pill-maroon inline-block">Do-not-contact</p>
                )}
              </div>
              <a
                href={c.email ? `mailto:${c.email}` : "#"}
                className="btn-primary text-sm"
              >
                <Mail className="h-4 w-4" /> Compose
              </a>
            </div>
          </header>

          {/* Notes */}
          {(c.notes_markdown || canEdit) && (
            <NotesCard contact={c} canEdit={canEdit} />
          )}

          {/* Email history */}
          {messages.length > 0 && (
            <section className="card-padded">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold inline-flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-maroon-700" /> Email history
                </h2>
                <span className="text-xs text-ink-faint">{messages.length} messages across {threads.length} threads</span>
              </div>
              <p className="mt-1 text-xs text-ink-faint">Auto-captured via Outlook BCC archive — survives every officer transition.</p>
              <ul className="mt-5 space-y-3">
                {messages.map(m => (
                  <li key={m.id} className={cn(
                    "p-4 rounded-lg border",
                    m.direction === "outbound" ? "bg-cream-100 border-line" : "bg-white border-line",
                  )}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-semibold", m.direction === "outbound" ? "text-maroon-700" : "text-ink")}>
                        {m.direction === "outbound" ? "Sent" : "Received"} · {m.from_address}
                      </span>
                      <span className="text-ink-faint">{formatDate(m.received_at, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <p className="mt-2 font-medium text-sm">{m.subject}</p>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">{m.body_text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Request history */}
          {(perfRequests.length > 0 || pllRequests.length > 0) && (
            <section className="card-padded">
              <h2 className="font-serif text-xl font-semibold">Request history</h2>
              <ul className="mt-5 divide-y divide-line">
                {perfRequests.map(r => (
                  <li key={r.id} className="py-3.5">
                    <Link href={`/portal/performance-management/detail?id=${r.id}`} className="flex items-center justify-between hover:bg-cream-200 -mx-2 px-2 py-1 rounded transition-colors">
                      <div>
                        <p className="font-medium text-sm">Performance · {r.performance_type}</p>
                        <p className="text-xs text-ink-faint mt-0.5">{formatDate(r.event_date)} · {r.venue_name}</p>
                      </div>
                      <span className="pill-line capitalize">{r.status.replace(/_/g, " ")}</span>
                    </Link>
                  </li>
                ))}
                {pllRequests.map(r => (
                  <li key={r.id} className="py-3.5">
                    <p className="font-medium text-sm">Private lesson · {r.dance_type}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{formatDate(r.created_at)} · {r.group_size} people · {r.experience_level}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card-padded">
            <h3 className="font-serif text-lg font-semibold">Preferences</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-faint">Email opt-in</dt><dd>{c.email_opt_in ? "Yes" : "No"}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-faint">SMS opt-in</dt><dd>{c.sms_opt_in ? "Yes" : "No"}</dd></div>
            </dl>
          </div>

          {(reminders.length > 0 || canEdit) && (
            <div className="card-padded">
              <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2"><Bell className="h-4 w-4 text-amber-700" /> Annual reminders</h3>
              {reminders.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {reminders.map(r => (
                    <li key={r.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.note}</p>
                        <p className="text-xs text-ink-faint mt-0.5">Reminds in {MONTHS[r.reminder_month - 1] ?? `month ${r.reminder_month}`} · {r.lead_time_weeks} weeks lead time</p>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => deleteReminder(r.id)}
                          aria-label={`Delete reminder: ${r.note}`}
                          className="text-ink-faint hover:text-maroon-700 p-1 -mr-1 flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-ink-faint">No reminders yet.</p>
              )}
              {canEdit && (
                <button onClick={() => setAddingReminder(true)} className="mt-4 btn-ghost text-sm w-full justify-center">+ Add reminder</button>
              )}
            </div>
          )}

          {canEdit && (
            <div className="card-padded">
              <h3 className="font-serif text-lg font-semibold">Quick actions</h3>
              <div className="mt-4 space-y-2">
                <button onClick={() => setEditing(true)} className="btn-secondary w-full text-sm justify-start">Edit contact</button>
                <button onClick={() => setMerging(true)} className="btn-secondary w-full text-sm justify-start">Merge with another</button>
                <button onClick={toggleDoNotContact} className="btn-ghost w-full text-sm justify-start">
                  {doNotContact ? "Do-not-contact ✓" : "Mark do-not-contact"}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </PortalShell>
  );
}

function NotesCard({ contact, canEdit }: { contact: Contact; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEdit() {
    setDraft(contact.notes_markdown ?? "");
    setEditing(true);
  }

  function save() {
    update(dbx => {
      const cx = dbx.contacts.find(x => x.id === contact.id);
      if (cx) cx.notes_markdown = draft.trim() || undefined;
    }, `Updated officer notes for ${contact.name}`);
    setEditing(false);
  }

  return (
    <section className="card-padded">
      <div className="flex items-start gap-2">
        <FileText className="h-4 w-4 text-maroon-700 mt-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Officer notes</h2>
            {canEdit && !editing && (
              <button onClick={startEdit} className="btn-ghost text-xs inline-flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>
          <p className="text-xs text-ink-faint mt-0.5">Survives officer transitions. Editable by any officer.</p>
          {editing ? (
            <div className="mt-4">
              <textarea
                className="textarea"
                rows={6}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                aria-label="Officer notes"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={save} className="btn-primary text-sm">Save</button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          ) : contact.notes_markdown ? (
            <p className="mt-4 text-ink whitespace-pre-wrap leading-relaxed">{contact.notes_markdown}</p>
          ) : (
            <p className="mt-4 text-sm text-ink-faint italic">No notes yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function EditContactModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [f, setF] = useState({
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    address: contact.address ?? "",
    tags: contact.tags.join(", "),
  });
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      const cx = dbx.contacts.find(x => x.id === contact.id);
      if (!cx) return;
      cx.name = f.name.trim();
      cx.email = f.email.trim() || undefined;
      cx.phone = f.phone.trim() || undefined;
      cx.address = f.address.trim() || undefined;
      cx.tags = f.tags.split(",").map(t => t.trim()).filter(Boolean);
    }, `Edited contact: ${f.name.trim()}`);
    onClose();
  }

  return (
    <Modal title="Edit contact" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Email" type="email" value={f.email} onChange={set("email")} />
          <TextField label="Phone" type="tel" value={f.phone} onChange={set("phone")} />
        </div>
        <TextField label="Address" value={f.address} onChange={set("address")} />
        <TextField label="Tags" value={f.tags} onChange={set("tags")} help="Comma-separated." />
        <button type="submit" className="btn-primary w-full">Save changes</button>
      </form>
    </Modal>
  );
}

function AddReminderModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [month, setMonth] = useState("1");
  const [leadWeeks, setLeadWeeks] = useState("4");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      dbx.annualReminders.push({
        id: uid("ar"),
        contact_id: contact.id,
        reminder_month: Number(month),
        note: note.trim(),
        lead_time_weeks: Math.max(0, Number(leadWeeks) || 0),
      });
    }, `Added annual reminder for ${contact.name}`);
    onClose();
  }

  return (
    <Modal title="Add annual reminder" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Note" value={note} onChange={setNote} required placeholder="Reach out about the spring gala" />
        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField label="Reminder month" value={month} onChange={setMonth}
            options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
          <TextField label="Lead time (weeks)" type="number" value={leadWeeks} onChange={setLeadWeeks} required />
        </div>
        <button type="submit" className="btn-primary w-full">Add reminder</button>
      </form>
    </Modal>
  );
}

function MergeContactModal({ contact, others, onClose }: { contact: Contact; others: Contact[]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const matches = others.filter(o =>
    !q || `${o.name} ${o.email ?? ""} ${o.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  function merge(other: Contact) {
    const ok = window.confirm(
      `Merge "${other.name}" into "${contact.name}"? All requests, email threads, inquiries, and reminders move here, then "${other.name}" is deleted. This cannot be undone.`);
    if (!ok) return;
    update(dbx => {
      dbx.performanceRequests.forEach(r => { if (r.contact_id === other.id) r.contact_id = contact.id; });
      dbx.privateLessonRequests.forEach(r => { if (r.contact_id === other.id) r.contact_id = contact.id; });
      dbx.emailThreads.forEach(t => { if (t.contact_id === other.id) t.contact_id = contact.id; });
      dbx.inquiries.forEach(i => { if (i.contact_id === other.id) i.contact_id = contact.id; });
      dbx.annualReminders.forEach(r => { if (r.contact_id === other.id) r.contact_id = contact.id; });
      dbx.contacts = dbx.contacts.filter(x => x.id !== other.id);
    }, `Merged contact "${other.name}" into "${contact.name}"`);
    onClose();
  }

  return (
    <Modal title="Merge with another contact" onClose={onClose}>
      <p className="text-xs text-ink-faint mb-4">
        Pick the duplicate. Its history (requests, email threads, inquiries, reminders) moves to <strong>{contact.name}</strong> and the duplicate is deleted.
      </p>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search contacts…" />
      </div>
      <ul className="divide-y divide-line max-h-72 overflow-y-auto">
        {matches.map(o => (
          <li key={o.id}>
            <button
              onClick={() => merge(o)}
              className="w-full text-left py-3 px-2 hover:bg-cream-200 rounded transition-colors flex items-center gap-3"
            >
              <span className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                o.kind === "organization" ? "bg-maroon-50 text-maroon-700" : "bg-cream-200 text-ink-soft",
              )}>
                {o.kind === "organization" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-sm truncate">{o.name}</span>
                {o.email && <span className="block text-xs text-ink-faint truncate">{o.email}</span>}
              </span>
            </button>
          </li>
        ))}
        {matches.length === 0 && <li className="py-4 text-center text-sm text-ink-faint">No other contacts match.</li>}
      </ul>
    </Modal>
  );
}

function ContactLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-ink-soft">
      <span className="text-ink-faint">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
