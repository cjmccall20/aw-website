"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  STATUSES, ALL_TABS, PERMISSION_MATRIX,
  NOTIFY_LISTS,
} from "@/lib/mock-data";
import type { AccessLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Save, Plus, Info } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"permissions" | "email" | "calendar" | "ops" | "notify">("permissions");

  return (
    <PortalShell tabKey="settings" title="Settings">
      <div className="flex flex-wrap gap-1 mb-6 border-b border-line">
        {[
          ["permissions", "Permissions matrix"],
          ["email", "Email"],
          ["calendar", "Calendar"],
          ["ops", "Operations defaults"],
          ["notify", "Notify lists"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === key
                ? "border-maroon-700 text-maroon-700"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "permissions" && <PermissionsMatrix />}
      {activeTab === "email" && <EmailSettings />}
      {activeTab === "calendar" && <CalendarSettings />}
      {activeTab === "ops" && <OpsDefaults />}
      {activeTab === "notify" && <NotifySettings />}
    </PortalShell>
  );
}

function PermissionsMatrix() {
  // Local state to demonstrate editability
  const [matrix, setMatrix] = useState(() => {
    const m: Record<string, Record<string, AccessLevel>> = {};
    for (const s of STATUSES) {
      m[s.key] = {};
      for (const t of ALL_TABS) {
        const row = PERMISSION_MATRIX.find(e => e.status_key === s.key && e.tab_key === t.key);
        m[s.key][t.key] = row?.access ?? "none";
      }
    }
    return m;
  });

  function setCell(statusKey: string, tabKey: string, value: AccessLevel) {
    setMatrix(prev => ({ ...prev, [statusKey]: { ...prev[statusKey], [tabKey]: value } }));
  }

  return (
    <div className="space-y-6">
      <div className="card-padded bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Runtime-configurable permissions</p>
            <p className="mt-1 text-sm text-amber-800/85">
              For each role × tab combination, choose none / view / edit. Multiple users can hold the same role (useful for officer turnover overlap). Changes apply immediately on save.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-2xl font-semibold">Permission statuses × tabs</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm"><Plus className="h-4 w-4" /> Add status</button>
          <button className="btn-primary text-sm"><Save className="h-4 w-4" /> Save changes</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-cream-200/60 sticky top-0 z-10">
            <tr>
              <th className="text-left px-3 py-3 font-semibold sticky left-0 bg-cream-200 z-20">Tab \\ Status</th>
              {STATUSES.map(s => (
                <th key={s.key} className="px-2 py-3 text-center font-semibold whitespace-nowrap">{s.display_name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ALL_TABS.map(t => (
              <tr key={t.key} className="hover:bg-cream-200/40">
                <td className="px-3 py-2.5 sticky left-0 bg-white font-medium text-ink z-10">{t.label}</td>
                {STATUSES.map(s => (
                  <td key={s.key} className="px-2 py-1.5 text-center">
                    <select
                      value={matrix[s.key][t.key]}
                      onChange={e => setCell(s.key, t.key, e.target.value as AccessLevel)}
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                        matrix[s.key][t.key] === "edit" && "bg-green-pale text-green border-green-pale",
                        matrix[s.key][t.key] === "view" && "bg-cream-200 text-ink-soft border-line",
                        matrix[s.key][t.key] === "none" && "bg-white text-ink-faint border-line",
                      )}
                    >
                      <option value="none">none</option>
                      <option value="view">view</option>
                      <option value="edit">edit</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-faint">
        Tip: a user&apos;s effective access on a tab is the highest level across all the statuses they hold.
      </p>
    </div>
  );
}

function EmailSettings() {
  return (
    <div className="space-y-6">
      <div className="card-padded">
        <h2 className="font-serif text-xl font-semibold">Sending domain</h2>
        <p className="mt-1 text-sm text-ink-soft">All outbound auto-replies and campaigns go through Resend on the team-owned domain.</p>
        <dl className="mt-5 space-y-3 text-sm">
          <RowField label="Domain" value="aggiewranglers.com" status="verified" />
          <RowField label="DKIM" value="aw._domainkey" status="verified" />
          <RowField label="SPF" value="v=spf1 include:resend.com -all" status="verified" />
          <RowField label="DMARC" value="v=DMARC1; p=quarantine" status="verified" />
        </dl>
      </div>

      <div className="card-padded">
        <h2 className="font-serif text-xl font-semibold">Role aliases</h2>
        <p className="mt-1 text-sm text-ink-soft">Cloudflare Email Routing forwards each alias to the matching TAMU Outlook.</p>
        <ul className="mt-5 divide-y divide-line text-sm">
          {[
            ["performance@aggiewranglers.com", "→ performance@wranglers.tamu.edu"],
            ["lessons@aggiewranglers.com",     "→ lessons@wranglers.tamu.edu"],
            ["wranglers@aggiewranglers.com",   "→ president@wranglers.tamu.edu"],
            ["archive@aggiewranglers.com",     "→ Cloudflare Worker → portal webhook (CRM ingest)"],
          ].map(([from, to]) => (
            <li key={from} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <code className="text-xs">{from}</code>
              <span className="text-xs text-ink-faint">{to}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CalendarSettings() {
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Google Calendar 2-way sync</h2>
      <p className="mt-1 text-sm text-ink-soft">The team&apos;s existing calendar is the source of truth.</p>
      <dl className="mt-5 space-y-3 text-sm">
        <RowField label="Linked calendar" value="aggiewranglers@gmail.com / Wranglers events" status="verified" />
        <RowField label="Service account" value="aw-portal@aw-portal.iam.gserviceaccount.com" status="verified" />
        <RowField label="Watch channel" value="renews every 7 days; last refreshed 2 days ago" status="verified" />
        <RowField label="Last incremental sync" value="2 minutes ago" status="verified" />
      </dl>
      <p className="mt-6 text-xs text-ink-faint">
        Ownership transfers via Google&apos;s share settings — outgoing president grants ownership to incoming president at handover.
      </p>
    </div>
  );
}

function OpsDefaults() {
  return (
    <div className="card-padded space-y-5">
      <h2 className="font-serif text-xl font-semibold">Operations defaults</h2>
      <p className="text-sm text-ink-soft">PR officer can override these per-request from Performance Management.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <Setting label="Weekly survey day" value="Wednesday" />
        <Setting label="Weekly survey time" value="6:00 PM CT" />
        <Setting label="Auto-send weekly survey" value="On" />
        <Setting label="Default polling window" value="30 days" />
        <Setting label="Default min couples" value="3" />
        <Setting label="Default response deadline" value="3 days" />
        <Setting label="Weekly digest" value="Monday 8:00 AM CT" />
        <Setting label="Default call time" value="60 min before" />
        <Setting label="Default return buffer" value="15 min" />
      </div>
    </div>
  );
}

function NotifySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">Notify lists</h2>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> New list</button>
      </div>
      <ul className="space-y-3">
        {NOTIFY_LISTS.map(l => (
          <li key={l.id} className="card-padded">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{l.display_name}</p>
                <p className="text-xs text-ink-faint mt-0.5">key: <code>{l.key}</code></p>
                <p className="mt-2 text-sm text-ink-soft">{l.description}</p>
              </div>
              <span className={l.active ? "pill-green" : "pill-line"}>{l.active ? "Active" : "Paused"}</span>
            </div>
            <p className="mt-3 text-xs text-ink-faint">Sends from <code>{l.from_alias}</code></p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-ink font-medium">{value}</p>
    </div>
  );
}

function RowField({ label, value, status }: { label: string; value: string; status?: "verified" | "pending" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right flex items-center gap-2">
        <code className="text-xs text-ink-soft">{value}</code>
        {status && <span className={status === "verified" ? "pill-green" : "pill-amber"}>{status}</span>}
      </dd>
    </div>
  );
}
