"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField } from "@/components/portal/ui";
import { useStore, useAccess, useSessionUser, update, uid } from "@/lib/store";
import { initials, placeholderColor } from "@/lib/utils";
import type { AlumniProfile } from "@/lib/types";
import { Search, Mail, MapPin, Phone, BadgeCheck, Pencil } from "lucide-react";

const PERMISSION_OPTIONS = [
  { value: "visible_to_members_only", label: "Visible to members only" },
  { value: "visible_to_alumni_too", label: "Visible to members and alumni" },
  { value: "private", label: "Private — hide my contact info" },
];

export default function AlumniDirectoryPage() {
  const db = useStore();
  const user = useSessionUser();
  const canEdit = useAccess("alumni_directory") === "edit";
  const [q, setQ] = useState("");
  const [year, setYear] = useState<"all" | number>("all");
  const [editingProfile, setEditingProfile] = useState(false);
  const [registering, setRegistering] = useState(false);

  const alumni = db.alumni;
  const years = Array.from(new Set(alumni.map(a => a.graduation_year))).sort((a, b) => b - a);

  const isAlumnus = (user?.status_keys ?? []).includes("alumni");
  const myProfile = isAlumnus
    ? (alumni.find(a => a.email && user && a.email.toLowerCase() === user.primary_email.toLowerCase()) ?? alumni[0])
    : undefined;

  const pending = alumni.filter(a => a.status === "draft_auto_created" || a.status === "unverified");

  const filtered = alumni.filter(a => {
    if (year !== "all" && a.graduation_year !== year) return false;
    if (q && !`${a.name} ${a.current_city ?? ""} ${a.current_role ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function approve(id: string) {
    if (!canEdit) return;
    const a = alumni.find(x => x.id === id);
    update(dbx => {
      const ax = dbx.alumni.find(x => x.id === id);
      if (ax) ax.status = "active";
    }, `Approved alumni profile: ${a?.name ?? id}`);
  }

  return (
    <PortalShell tabKey="alumni_directory" title="Alumni Directory">
      {editingProfile && myProfile && <EditMyProfileModal profile={myProfile} onClose={() => setEditingProfile(false)} />}
      {registering && <RegisterModal onClose={() => setRegistering(false)} />}

      {canEdit && pending.length > 0 && (
        <div className="card-padded mb-6 border-maroon-200 bg-maroon-50">
          <h2 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-maroon-700" /> Approval queue
          </h2>
          <p className="mt-1 text-xs text-ink-faint">Auto-created drafts from graduations plus self-registrations waiting on officer verification.</p>
          <ul className="mt-4 divide-y divide-line">
            {pending.map(a => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-sm">{a.name} <span className="text-ink-faint font-normal">· Class of {a.graduation_year}</span></p>
                  <p className="text-xs text-ink-faint mt-0.5 capitalize">
                    {a.status === "draft_auto_created" ? "Draft auto-created at graduation" : "Self-registered, unverified"}
                    {a.email ? ` · ${a.email}` : ""}
                  </p>
                </div>
                <button onClick={() => approve(a.id)} className="btn-primary text-xs">Approve</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search by name, city, current role…" />
        </div>
        <select value={String(year)} onChange={e => setYear(e.target.value === "all" ? "all" : Number(e.target.value))} className="select sm:w-48">
          <option value="all">All graduation years</option>
          {years.map(y => <option key={y} value={y}>Class of {y}</option>)}
        </select>
        {isAlumnus && myProfile && (
          <button onClick={() => setEditingProfile(true)} className="btn-primary text-sm">
            <Pencil className="h-4 w-4" /> Edit my profile
          </button>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(a => {
          const hideContact = a.contact_permission === "private" && !canEdit;
          return (
            <li key={a.id} className="card-padded">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: placeholderColor(a.name) }}>{initials(a.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.name}</p>
                  <p className="text-xs text-ink-faint">Class of {a.graduation_year}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                {a.current_city && (
                  <div className="flex items-center gap-2 text-ink-soft">
                    <MapPin className="h-3.5 w-3.5 text-ink-faint" />
                    <span>{a.current_city}</span>
                  </div>
                )}
                {a.current_role && <p className="text-ink-soft">{a.current_role}</p>}
                {!hideContact && a.email && (
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Mail className="h-3.5 w-3.5 text-ink-faint" />
                    <a href={`mailto:${a.email}`} className="hover:text-maroon-700 truncate">{a.email}</a>
                  </div>
                )}
                {!hideContact && a.phone && (
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Phone className="h-3.5 w-3.5 text-ink-faint" />
                    <span>{a.phone}</span>
                  </div>
                )}
                {hideContact && (
                  <p className="text-xs text-ink-faint italic">Contact info kept private.</p>
                )}
              </dl>
              {a.what_im_up_to && (
                <p className="mt-3 text-sm text-ink-soft italic line-clamp-3">&ldquo;{a.what_im_up_to}&rdquo;</p>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="card-padded text-center text-ink-faint">No alumni match your filters.</div>
      )}

      <div className="card-padded mt-8">
        <h2 className="font-serif text-lg font-semibold">Alumni self-registration</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Former Wrangler not in the directory? Register below — an officer verifies each submission before it goes live.
        </p>
        <button onClick={() => setRegistering(true)} className="mt-4 btn-secondary text-sm">Register</button>
      </div>
    </PortalShell>
  );
}

function EditMyProfileModal({ profile, onClose }: { profile: AlumniProfile; onClose: () => void }) {
  const [f, setF] = useState({
    current_city: profile.current_city ?? "",
    current_role: profile.current_role ?? "",
    what_im_up_to: profile.what_im_up_to ?? "",
    contact_permission: profile.contact_permission as string,
    email: profile.email ?? "",
    phone: profile.phone ?? "",
  });
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      const ax = dbx.alumni.find(x => x.id === profile.id);
      if (!ax) return;
      ax.current_city = f.current_city.trim() || undefined;
      ax.current_role = f.current_role.trim() || undefined;
      ax.what_im_up_to = f.what_im_up_to.trim() || undefined;
      ax.contact_permission = f.contact_permission as AlumniProfile["contact_permission"];
      ax.email = f.email.trim() || undefined;
      ax.phone = f.phone.trim() || undefined;
    }, `Alumni profile updated: ${profile.name}`);
    onClose();
  }

  return (
    <Modal title="Edit my profile" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Current city" value={f.current_city} onChange={set("current_city")} />
          <TextField label="Current role" value={f.current_role} onChange={set("current_role")} placeholder="Software Engineer at…" />
        </div>
        <TextArea label={"What I'm up to"} value={f.what_im_up_to} onChange={set("what_im_up_to")} rows={3} />
        <SelectField label="Contact visibility" value={f.contact_permission} onChange={set("contact_permission")} options={PERMISSION_OPTIONS} />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Email" type="email" value={f.email} onChange={set("email")} />
          <TextField label="Phone" type="tel" value={f.phone} onChange={set("phone")} />
        </div>
        <button type="submit" className="btn-primary w-full">Save profile</button>
      </form>
    </Modal>
  );
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: "", graduation_year: "", current_city: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      dbx.alumni.push({
        id: uid("a"),
        name: f.name.trim(),
        graduation_year: Number(f.graduation_year),
        current_city: f.current_city.trim() || undefined,
        email: f.email.trim() || undefined,
        contact_permission: "visible_to_members_only",
        status: "unverified",
      });
    }, `Alumni self-registration: ${f.name.trim()}`);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Modal title="Alumni self-registration" onClose={onClose}>
        <div className="text-center py-6">
          <BadgeCheck className="h-10 w-10 text-green mx-auto" />
          <p className="mt-4 font-medium">Submitted — an officer will verify you</p>
          <p className="mt-2 text-sm text-ink-soft">Your profile appears in the directory once approved.</p>
          <button onClick={onClose} className="mt-6 btn-primary">Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Alumni self-registration" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Graduation year" type="number" value={f.graduation_year} onChange={set("graduation_year")} required placeholder="2019" />
          <TextField label="Current city" value={f.current_city} onChange={set("current_city")} />
        </div>
        <TextField label="Email" type="email" value={f.email} onChange={set("email")} required />
        <button type="submit" className="btn-primary w-full">Submit for verification</button>
      </form>
    </Modal>
  );
}
