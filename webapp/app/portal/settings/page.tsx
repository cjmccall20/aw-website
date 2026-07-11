"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { ALL_TABS } from "@/lib/mock-data";
import { Modal, TextField, SavedFlash, ViewOnlyBanner } from "@/components/portal/ui";
import { useStore, useAccess, update, uid } from "@/lib/store";
import type { AccessLevel, PermissionStatus, PermissionMatrixEntry, TabKey } from "@/lib/types";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { Save, Plus, Info } from "lucide-react";

type SettingsTab = "permissions" | "email" | "calendar" | "ops" | "notify" | "audit";

const TAB_LIST: { key: SettingsTab; label: string }[] = [
  { key: "permissions", label: "Permissions matrix" },
  { key: "email", label: "Email" },
  { key: "calendar", label: "Calendar" },
  { key: "ops", label: "Operations defaults" },
  { key: "notify", label: "Notify lists" },
  { key: "audit", label: "Audit log" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("permissions");
  const access = useAccess("settings");
  const canEdit = access === "edit";

  return (
    <PortalShell tabKey="settings" title="Settings">
      {access === "view" && <ViewOnlyBanner />}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-line">
        {TAB_LIST.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
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

      {activeTab === "permissions" && <PermissionsMatrix canEdit={canEdit} />}
      {activeTab === "email" && <EmailSettings />}
      {activeTab === "calendar" && <CalendarSettings />}
      {activeTab === "ops" && <OpsDefaults />}
      {activeTab === "notify" && <NotifySettings />}
      {activeTab === "audit" && <AuditLog />}
    </PortalShell>
  );
}

// ─── permissions ─────────────────────────────────────────────────────────────

type Grid = Record<string, Record<string, AccessLevel>>;

function buildGrid(statuses: PermissionStatus[], permissions: PermissionMatrixEntry[]): Grid {
  const g: Grid = {};
  for (const s of statuses) {
    g[s.key] = {};
    for (const t of ALL_TABS) {
      const row = permissions.find(e => e.status_key === s.key && e.tab_key === t.key);
      g[s.key][t.key] = row?.access ?? "none";
    }
  }
  return g;
}

function gridToEntries(grid: Grid): PermissionMatrixEntry[] {
  const entries: PermissionMatrixEntry[] = [];
  for (const [statusKey, tabs] of Object.entries(grid)) {
    for (const [tabKey, access] of Object.entries(tabs)) {
      entries.push({ status_key: statusKey, tab_key: tabKey as TabKey, access });
    }
  }
  return entries;
}

function PermissionsMatrix({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const statuses = db.permissionStatuses;
  const [grid, setGrid] = useState<Grid>(() => buildGrid(db.permissionStatuses, db.permissions));
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  // The store hydrates from localStorage async (and other tabs can write) —
  // re-sync the editable grid whenever the persisted matrix changes.
  useEffect(() => {
    setGrid(buildGrid(db.permissionStatuses, db.permissions));
  }, [db.permissionStatuses, db.permissions]);

  function setCell(statusKey: string, tabKey: string, value: AccessLevel) {
    setGrid(prev => ({ ...prev, [statusKey]: { ...prev[statusKey], [tabKey]: value } }));
  }

  function saveMatrix() {
    update(dbx => {
      dbx.permissions = gridToEntries(grid);
    }, "Updated permissions matrix");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function deleteStatus(s: PermissionStatus) {
    if (!confirm(`Delete the "${s.display_name}" status? Users holding it lose that access immediately.`)) return;
    update(dbx => {
      // Persist current (possibly unsaved) grid edits for the surviving statuses,
      // then drop the deleted status entirely.
      const rest: Grid = { ...grid };
      delete rest[s.key];
      dbx.permissions = gridToEntries(rest);
      dbx.permissionStatuses = dbx.permissionStatuses.filter(x => x.id !== s.id);
    }, `Deleted permission status: ${s.display_name}`);
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
        <h2 className="font-serif text-2xl font-semibold">Permission statuses × tabs <SavedFlash show={saved} /></h2>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setAdding(true)} className="btn-secondary text-sm" data-testid="add-status">
              <Plus className="h-4 w-4" /> Add status
            </button>
            <button onClick={saveMatrix} className="btn-primary text-sm" data-testid="save-permissions">
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-cream-200/60 sticky top-0 z-10">
            <tr>
              <th className="text-left px-3 py-3 font-semibold sticky left-0 bg-cream-200 z-20">Tab \ Status</th>
              {statuses.map(s => (
                <th key={s.key} className="px-2 py-3 text-center font-semibold whitespace-nowrap">
                  {s.display_name}
                  {canEdit && !s.is_system && (
                    <button
                      onClick={() => deleteStatus(s)}
                      aria-label={`Delete ${s.display_name} status`}
                      title={`Delete ${s.display_name}`}
                      className="ml-1.5 text-ink-faint hover:text-maroon-700"
                    >
                      ×
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ALL_TABS.map(t => (
              <tr key={t.key} className="hover:bg-cream-200/40">
                <td className="px-3 py-2.5 sticky left-0 bg-white font-medium text-ink z-10">{t.label}</td>
                {statuses.map(s => {
                  const value = grid[s.key]?.[t.key] ?? "none";
                  return (
                    <td key={s.key} className="px-2 py-1.5 text-center">
                      <select
                        value={value}
                        disabled={!canEdit}
                        aria-label={`${s.display_name} access to ${t.label}`}
                        onChange={e => setCell(s.key, t.key, e.target.value as AccessLevel)}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                          value === "edit" && "bg-green-pale text-green border-green-pale",
                          value === "view" && "bg-cream-200 text-ink-soft border-line",
                          value === "none" && "bg-white text-ink-faint border-line",
                        )}
                      >
                        <option value="none">none</option>
                        <option value="view">view</option>
                        <option value="edit">edit</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-faint">
        Tip: a user&apos;s effective access on a tab is the highest level across all the statuses they hold.
      </p>

      {adding && <AddStatusModal grid={grid} onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddStatusModal({ grid, onClose }: { grid: Grid; onClose: () => void }) {
  const db = useStore();
  const [displayName, setDisplayName] = useState("");
  const key = displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!key) return;
    if (db.permissionStatuses.some(s => s.key === key)) {
      alert(`A status with the key "${key}" already exists.`);
      return;
    }
    update(dbx => {
      dbx.permissionStatuses.push({
        id: uid("ps"),
        key,
        display_name: displayName.trim(),
        is_system: false,
      });
      // Persist current grid edits, then add default "none" rows for every tab.
      dbx.permissions = [
        ...gridToEntries(grid),
        ...ALL_TABS.map(t => ({ status_key: key, tab_key: t.key as TabKey, access: "none" as AccessLevel })),
      ];
    }, `Added permission status: ${displayName.trim()}`);
    onClose();
  }

  return (
    <Modal title="Add permission status" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <TextField label="Display name" value={displayName} onChange={setDisplayName} required placeholder="e.g. Social Chair" />
        <div>
          <p className="label">Key (auto-generated)</p>
          <p className="text-sm font-mono text-ink-soft">{key || "—"}</p>
          <p className="help-text">New statuses start with no access on every tab — set their column in the matrix, then Save changes.</p>
        </div>
        <button type="submit" className="btn-primary w-full">Add status</button>
      </form>
    </Modal>
  );
}

// ─── audit log ───────────────────────────────────────────────────────────────

function AuditLog() {
  const db = useStore();
  const entries = db.auditLog.slice(0, 200);
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Audit log</h2>
      <p className="mt-1 text-sm text-ink-soft">Every write in the portal, latest first. Capped at the 200 most recent entries.</p>
      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-ink-faint">Nothing logged yet — make an edit anywhere in the portal and it shows up here.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line text-sm">
          {entries.map(e => (
            <li key={e.id} className="py-2.5 flex items-baseline gap-3 flex-wrap">
              <span className="text-xs text-ink-faint whitespace-nowrap w-40">
                {formatDate(e.at)} · {formatTime(e.at)}
              </span>
              <span className="font-medium whitespace-nowrap">{e.actor_name}</span>
              <span className="text-ink-soft">{e.action}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── informational tabs ──────────────────────────────────────────────────────

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
      <p className="text-sm text-ink-soft">
        PR officer can override these per-request from Performance Management. <span className="text-ink-faint">(editable once backend lands)</span>
      </p>

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
  const db = useStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">Notify lists</h2>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> New list</button>
      </div>
      <ul className="space-y-3">
        {db.notifyLists.map(l => (
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
