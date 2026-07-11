"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, SelectField, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, todayISO } from "@/lib/store";
import { initials, placeholderColor, cn } from "@/lib/utils";
import type { Member, MemberStatus } from "@/lib/types";
import { Plus, Search, Pencil, CheckCircle2 } from "lucide-react";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "tryout", label: "Tryout" },
  { value: "graduated", label: "Graduated" },
  { value: "inactive", label: "Inactive" },
];

export default function MembersPage() {
  const db = useStore();
  const access = useAccess("members");
  const canEdit = access === "edit";
  const [filter, setFilter] = useState<"current" | "tryout" | "graduated" | "inactive" | "all">("current");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const members = db.members;
  const filtered = members.filter(m => {
    if (filter !== "all" && m.status !== filter) return false;
    if (q && !`${m.name} ${m.major ?? ""} ${m.hometown ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const counts: Record<string, number> = {
    current: members.filter(m => m.status === "current").length,
    tryout: members.filter(m => m.status === "tryout").length,
    graduated: members.filter(m => m.status === "graduated").length,
    inactive: members.filter(m => m.status === "inactive").length,
  };

  const editingMember = editingId ? members.find(m => m.id === editingId) : undefined;

  return (
    <PortalShell tabKey="members" title="Members">
      {access === "view" && <ViewOnlyBanner />}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} className="input pl-9" placeholder="Search members…" />
        </div>
        <div className="flex gap-1 bg-cream-200 rounded-lg p-1">
          {(["current", "tryout", "graduated", "inactive", "all"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize",
                filter === s ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:text-ink",
              )}
            >
              {s === "all" ? "All" : `${s} (${counts[s] ?? "-"})`}
            </button>
          ))}
        </div>
        {canEdit && (
          <button data-testid="add-member" onClick={() => setAdding(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add member
          </button>
        )}
      </div>

      <p className="text-xs text-ink-faint mb-4">
        Adding a member creates a `users` row and sends them an invite-link email. Marking someone graduated flips their primary email from TAMU to personal.
      </p>

      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
      {editingMember && <EditMemberModal member={editingMember} onClose={() => setEditingId(null)} />}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-200/60 text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Class</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Hometown</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              {canEdit && <th className="text-right px-4 py-3 font-semibold"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-cream-200/40">
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
                  <span className="font-medium">{m.name}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{m.role_title ?? <span className="text-ink-faint">—</span>}</td>
                <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{m.class_year ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{m.hometown ?? "—"}</td>
                <td className="px-4 py-3"><span className="pill-line capitalize">{m.status}</span></td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingId(m.id)}
                      className="inline-flex items-center gap-1 text-maroon-700 hover:text-maroon-800 font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({
    name: "", tamu_email: "", personal_email: "", phone: "",
    class_year: "", hometown: "", major: "", role_title: "",
  });
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const memberId = uid("m");
    const email = f.tamu_email.trim();
    update(dbx => {
      dbx.members.push({
        id: memberId,
        name: f.name.trim(),
        role_title: f.role_title.trim() || undefined,
        class_year: f.class_year ? Number(f.class_year) : undefined,
        hometown: f.hometown.trim() || undefined,
        major: f.major.trim() || undefined,
        status: "current",
        tamu_email: email || undefined,
        personal_email: f.personal_email.trim() || undefined,
        phone: f.phone.trim() || undefined,
      });
      dbx.users.push({
        id: uid("u"),
        primary_email: email,
        name: f.name.trim(),
        status: "pending_setup",
        member_id: memberId,
        status_keys: ["member"],
      });
    }, `Added member: ${f.name.trim()}`);
    setInvitedEmail(email);
  }

  if (invitedEmail !== null) {
    return (
      <Modal title="Add member" onClose={onClose}>
        <div className="text-center py-6">
          <CheckCircle2 className="h-10 w-10 text-green mx-auto" />
          <p className="mt-4 font-medium">
            Invite sent to {invitedEmail} — they finish setup at /portal → &apos;I have an invite&apos;.
          </p>
          <button onClick={onClose} className="mt-6 btn-primary">Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Add member" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="TAMU email" type="email" value={f.tamu_email} onChange={set("tamu_email")} required />
          <TextField label="Personal email" type="email" value={f.personal_email} onChange={set("personal_email")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Phone" type="tel" value={f.phone} onChange={set("phone")} />
          <TextField label="Class year" type="number" value={f.class_year} onChange={set("class_year")} placeholder="2028" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Hometown" value={f.hometown} onChange={set("hometown")} />
          <TextField label="Major" value={f.major} onChange={set("major")} />
        </div>
        <TextField label="Role title" value={f.role_title} onChange={set("role_title")} placeholder="Performance Officer" />
        <button type="submit" className="btn-primary w-full">Add member &amp; send invite</button>
      </form>
    </Modal>
  );
}

function EditMemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [f, setF] = useState({
    name: member.name,
    tamu_email: member.tamu_email ?? "",
    personal_email: member.personal_email ?? "",
    phone: member.phone ?? "",
    class_year: member.class_year ? String(member.class_year) : "",
    hometown: member.hometown ?? "",
    major: member.major ?? "",
    role_title: member.role_title ?? "",
    status: member.status as string,
  });
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const newStatus = f.status as MemberStatus;
    const graduating = newStatus === "graduated" && member.status !== "graduated";
    update(dbx => {
      const mx = dbx.members.find(m => m.id === member.id);
      if (!mx) return;
      mx.name = f.name.trim();
      mx.tamu_email = f.tamu_email.trim() || undefined;
      mx.personal_email = f.personal_email.trim() || undefined;
      mx.phone = f.phone.trim() || undefined;
      mx.class_year = f.class_year ? Number(f.class_year) : undefined;
      mx.hometown = f.hometown.trim() || undefined;
      mx.major = f.major.trim() || undefined;
      mx.role_title = f.role_title.trim() || undefined;
      mx.status = newStatus;
      if (graduating) {
        mx.graduation_date = todayISO();
        dbx.alumni.push({
          id: uid("a"),
          member_id: mx.id,
          name: mx.name,
          graduation_year: new Date().getFullYear(),
          status: "draft_auto_created",
          contact_permission: "visible_to_members_only",
          email: mx.personal_email ?? mx.tamu_email,
        });
        const user = dbx.users.find(u => u.member_id === mx.id);
        if (user) {
          if (mx.personal_email) user.primary_email = mx.personal_email;
          user.status_keys = [...user.status_keys.filter(k => k !== "member" && k !== "alumni"), "alumni"];
        }
      }
    }, graduating ? `Graduated member: ${f.name.trim()}` : `Edited member: ${f.name.trim()}`);
    onClose();
  }

  return (
    <Modal title={`Edit ${member.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="TAMU email" type="email" value={f.tamu_email} onChange={set("tamu_email")} />
          <TextField label="Personal email" type="email" value={f.personal_email} onChange={set("personal_email")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Phone" type="tel" value={f.phone} onChange={set("phone")} />
          <TextField label="Class year" type="number" value={f.class_year} onChange={set("class_year")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Hometown" value={f.hometown} onChange={set("hometown")} />
          <TextField label="Major" value={f.major} onChange={set("major")} />
        </div>
        <TextField label="Role title" value={f.role_title} onChange={set("role_title")} />
        <SelectField
          label="Status"
          value={f.status}
          onChange={set("status")}
          options={STATUS_OPTIONS}
          help="Setting status to Graduated stamps today as the graduation date, drafts an alumni-directory profile, switches their sign-in email from TAMU to personal (when set), and moves their access from member to alumni."
        />
        <button type="submit" className="btn-primary w-full">Save changes</button>
      </form>
    </Modal>
  );
}
