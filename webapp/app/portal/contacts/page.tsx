"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { CONTACTS } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { Search, Building2, User, Bell } from "lucide-react";

export default function ContactsPage() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "person" | "organization">("all");

  const filtered = useMemo(() => {
    return CONTACTS.filter(c => {
      if (kind !== "all" && c.kind !== kind) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.email ?? ""} ${c.phone ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [q, kind]);

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
              onClick={() => setKind(k)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md font-medium transition-colors capitalize",
                kind === k ? "bg-white text-ink shadow-soft" : "text-ink-soft hover:text-ink",
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm">+ New contact</button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map(c => (
          <li key={c.id}>
            <Link
              href={`/portal/contacts/${c.id}`}
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
    </PortalShell>
  );
}
