"use client";

import Link from "next/link";
import { useState } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { PERFORMANCE_REQUESTS, CONTACTS, byId } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import { Filter, ArrowRight, Zap } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  new: "New", under_review: "Under review", ready_to_poll: "Ready to poll",
  polling: "Polling", polling_closed: "Polling closed", confirmed: "Confirmed",
  declined: "Declined", completed: "Completed",
};

const STATUS_PILL: Record<string, string> = {
  new: "pill-amber", under_review: "pill-amber",
  ready_to_poll: "pill-line", polling: "pill-line",
  polling_closed: "pill-maroon", confirmed: "pill-green",
  declined: "pill-line", completed: "pill-green",
};

export default function PerformanceManagementPage() {
  const [filter, setFilter] = useState<string>("all");
  const requests = PERFORMANCE_REQUESTS;

  const filtered = filter === "all"
    ? requests
    : requests.filter(r => r.status === filter);

  const counts = {
    all: requests.length,
    needs_attention: requests.filter(r => r.status === "polling_closed" || r.status === "new").length,
    polling: requests.filter(r => r.status === "polling").length,
    confirmed: requests.filter(r => r.status === "confirmed").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  return (
    <PortalShell tabKey="performance_management" title="Performance Management">
      <p className="text-ink-soft -mt-6 mb-8">
        Intake → review → Wednesday survey → response window → officer manually confirms or declines via TAMU Outlook.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Needs attention"  value={counts.needs_attention} highlight />
        <StatCard label="In polling"        value={counts.polling} />
        <StatCard label="Confirmed (upcoming)" value={counts.confirmed} />
        <StatCard label="Completed"         value={counts.completed} />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-ink-faint flex-shrink-0" />
        {[
          ["all", `All (${counts.all})`],
          ["new", "New"],
          ["polling", "Polling"],
          ["polling_closed", "Needs decision"],
          ["confirmed", "Confirmed"],
          ["completed", "Completed"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
              filter === key
                ? "bg-maroon-700 text-white"
                : "text-ink-soft hover:bg-cream-200 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-200/60 text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Event date</th>
              <th className="text-left px-4 py-3 font-semibold">Requester</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Donation</th>
              <th className="text-right px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map(r => {
              const contact = byId(CONTACTS, r.contact_id);
              return (
                <tr key={r.id} className="hover:bg-cream-200/40 transition-colors">
                  <td className="px-4 py-3 text-ink">
                    <p className="font-medium">{formatDate(r.event_date, { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-xs text-ink-faint">{r.event_start_time.slice(0,5)} CT</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{r.organization ?? `${r.requester_first_name} ${r.requester_last_name}`}</p>
                    <p className="text-xs text-ink-faint">{contact?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{r.performance_type}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={STATUS_PILL[r.status] ?? "pill-line"}>{STATUS_LABEL[r.status]}</span>
                      {r.urgency === "quick_answer" && (
                        <Zap className="h-3.5 w-3.5 text-amber-700" aria-label="Quick answer needed" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {r.donation_interest === "none" ? <span className="text-ink-faint">—</span>
                      : r.donation_interest === "other" ? "Other"
                      : `$${r.donation_interest}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/portal/performance-management/${r.id}`} className="inline-flex items-center gap-1 text-maroon-700 hover:text-maroon-800 font-medium">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("card-padded", highlight && value > 0 && "border-maroon-200 bg-maroon-50")}>
      <p className={cn("text-xs uppercase tracking-wider font-semibold", highlight ? "text-maroon-700" : "text-ink-faint")}>{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}
