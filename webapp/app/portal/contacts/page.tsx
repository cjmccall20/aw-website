"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, SelectField } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, todayISO } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import { Search, Building2, User, Bell, Mail, Inbox, Check } from "lucide-react";

export default function ContactsPage() {
  const db = useStore();
  const canEdit = useAccess("contacts") === "edit";
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "person" | "organization">("all");
  const [showInquiries, setShowInquiries] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return db.contacts.filter(c => {
      if (kind !== "all" && c.kind !== kind) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.email ?? ""} ${c.phone ?? ""} ${(c.tags ?? []).join(" ")} ${c.notes_markdown ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [db.contacts, q, kind]);

  const inquiries = [...db.inquiries].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const unresolvedCount = inquiries.filter(i => !i.resolved_at).length;

  function markResolved(id: string) {
    if (!canEdit) return;
    update(dbx => {
      const inq = dbx.inquiries.find(i => i.id === id);
      if (inq) inq.resolved_at = todayISO();
    }, "Marked inquiry resolved");
  }

  return (
    <PortalShell tabKey="contacts" title="Contacts">
      <p className="text-ink-soft -mt-6 mb-8">
        Every person and organization the team has talked to. History is auto-captured from inbound forms + Outlook BCC archive.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            className="input pl-9"
            placeholder="Search by name, email, phone, organization, tag…"
          />
        </div>
        <div className="flex gap-1 bg-cream-200 rounded-lg p-1 self-start">
          {(["all", "person", "organization"] as const).map(k => (
            <button
              key={k}
              onClick={() => { setKind(k); setShowInquiries(false); }}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md font-medium transition-colors capitalize",
                !showInquiries && kind === k ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:text-ink",
              )}
            >
              {k}
            </button>
          ))}
          <button
            data-testid="inquiries-tab"
            onClick={() => setShowInquiries(s => !s)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md font-medium transition-colors inline-flex items-center gap-1.5",
              showInquiries ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:text-ink",
            )}
          >
            <Inbox className="h-3.5 w-3.5" /> Inquiries ({unresolvedCount})
          </button>
        </div>
        {canEdit && (
          <button data-testid="new-contact" onClick={() => setCreating(true)} className="btn-primary text-sm">
            + New contact
          </button>
        )}
      </div>

      {creating && <NewContactModal onClose={() => setCreating(false)} />}

      {showInquiries ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {inquiries.map(i => (
              <li key={i.id} className={cn("card-padded", i.resolved_at && "opacity-60")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{i.first_name} {i.last_name}</p>
                    <p className="text-sm text-ink-faint truncate">{i.email}</p>
                  </div>
                  {i.resolved_at
                    ? <span className="pill-green text-[10px] flex-shrink-0">Resolved</span>
                    : <span className="pill-amber text-[10px] flex-shrink-0">Open</span>}
                </div>
                <p className="mt-3 font-medium text-sm">{i.subject}</p>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{i.message}</p>
                <p className="mt-2 text-xs text-ink-faint">{formatDate(i.created_at, { month: "short", day: "numeric", year: "numeric" })}</p>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`mailto:${i.email}?subject=${encodeURIComponent(`Re: ${i.subject}`)}`}
                    className="btn-secondary text-xs inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" /> Reply
                  </a>
                  {canEdit && !i.resolved_at && (
                    <button onClick={() => markResolved(i.id)} className="btn-ghost text-xs inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Mark resolved
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {inquiries.length === 0 && (
            <div className="card-padded text-center text-ink-faint">No inquiries yet — the public contact form feeds this list.</div>
          )}
        </>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map(c => (
              <li key={c.id}>
                <Link
                  href={`/portal/contacts/detail?id=${c.id}`}
                  className="card-interactive p-5 flex items-start gap-4"
                >
                  <div className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0",
                    c.kind === "organization" ? "bg-maroon-50 text-maroon-700" : "bg-cream-200 text-ink-soft",
                  )}>
                    {c.kind === "organization" ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{c.name}</p>
                    {c.email && <p className="text-sm text-ink-faint truncate">{c.email}</p>}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {c.tags.slice(0, 3).map(t => <span key={t} className="pill-line text-[10px]">{t}</span>)}
                      {c.follow_up_date && (
                        <span className="pill-amber text-[10px] inline-flex items-center gap-1">
                          <Bell className="h-2.5 w-2.5" /> follow up {formatDate(c.follow_up_date, { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <div className="card-padded text-center text-ink-faint">No contacts match your filters.</div>
          )}
        </>
      )}
    </PortalShell>
  );
}

function NewContactModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({
    kind: "person", name: "", email: "", phone: "", address: "", tags: "",
  });
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      dbx.contacts.push({
        id: uid("c"),
        kind: f.kind === "organization" ? "organization" : "person",
        name: f.name.trim(),
        email: f.email.trim() || undefined,
        phone: f.phone.trim() || undefined,
        address: f.address.trim() || undefined,
        tags: f.tags.split(",").map(t => t.trim()).filter(Boolean),
        email_opt_in: true,
        sms_opt_in: false,
        created_at: todayISO(),
      });
    }, `Created contact: ${f.name.trim()}`);
    onClose();
  }

  return (
    <Modal title="New contact" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <SelectField label="Kind" value={f.kind} onChange={set("kind")}
          options={[{ value: "person", label: "Person" }, { value: "organization", label: "Organization" }]} />
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Email" type="email" value={f.email} onChange={set("email")} />
          <TextField label="Phone" type="tel" value={f.phone} onChange={set("phone")} />
        </div>
        <TextField label="Address" value={f.address} onChange={set("address")} />
        <TextField label="Tags" value={f.tags} onChange={set("tags")} placeholder="wedding, donor, venue" help="Comma-separated." />
        <button type="submit" className="btn-primary w-full">Create contact</button>
      </form>
    </Modal>
  );
}
