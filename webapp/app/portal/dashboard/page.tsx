"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  PERFORMANCE_REQUESTS, CALENDAR_EVENTS, ANNUAL_REMINDERS,
  PRIVATE_LESSON_REQUESTS, CONTACTS, MEMBERS, byId,
} from "@/lib/mock-data";
import { getDemoUser } from "@/lib/auth";
import { formatDate, cn } from "@/lib/utils";
import { ArrowRight, AlertTriangle, Bell, Calendar, Mail } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const u = getDemoUser();
    if (u) setUserName(u.name.split(" ")[0]);
  }, []);

  const myUpcoming = CALENDAR_EVENTS
    .filter(e => new Date(e.start_at) > new Date())
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
    .slice(0, 4);

  const pollingClosed = PERFORMANCE_REQUESTS.filter(r => r.status === "polling_closed");
  const newRequests = PERFORMANCE_REQUESTS.filter(r => r.status === "new" || r.status === "under_review");
  const upcomingReminders = ANNUAL_REMINDERS.slice(0, 2);
  const pendingPrivate = PRIVATE_LESSON_REQUESTS.filter(r => r.status === "new").length;

  return (
    <PortalShell tabKey="dashboard" title={`Welcome back${userName ? `, ${userName}` : ""}.`}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Action items */}
          <section className="card-padded">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">Needs your attention</h2>
              <span className="pill-maroon">{pollingClosed.length + newRequests.length + pendingPrivate} items</span>
            </div>
            <ul className="mt-5 divide-y divide-line">
              {pollingClosed.map(r => (
                <ActionItem
                  key={r.id}
                  severity="urgent"
                  href={`/portal/performance-management/${r.id}`}
                  title={`Polling closed: ${r.performance_type} for ${r.organization ?? r.requester_first_name + " " + r.requester_last_name}`}
                  subtitle={`Event ${formatDate(r.event_date, { month: "short", day: "numeric" })} · ${r.venue_name}`}
                  meta="Confirm or decline"
                />
              ))}
              {newRequests.map(r => (
                <ActionItem
                  key={r.id}
                  severity={r.urgency === "quick_answer" ? "urgent" : "info"}
                  href={`/portal/performance-management/${r.id}`}
                  title={`New request: ${r.performance_type} (${r.organization ?? r.requester_first_name + " " + r.requester_last_name})`}
                  subtitle={`Event ${formatDate(r.event_date, { month: "short", day: "numeric" })} · ${r.urgency === "quick_answer" ? "Quick answer needed" : "Review when you can"}`}
                />
              ))}
              {pendingPrivate > 0 && (
                <ActionItem
                  severity="info"
                  href="/portal/lessons-management"
                  title={`${pendingPrivate} new private lesson request${pendingPrivate > 1 ? "s" : ""}`}
                  subtitle="Lessons Management → Private Lessons"
                />
              )}
            </ul>
          </section>

          {/* Annual reminder pings */}
          {upcomingReminders.length > 0 && (
            <section className="card-padded">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-700" />
                <h2 className="font-serif text-xl font-semibold">Annual reminders</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {upcomingReminders.map(r => {
                  const contact = byId(CONTACTS, r.contact_id);
                  return (
                    <li key={r.id} className="flex items-start gap-3 text-sm">
                      <span className="pill-amber flex-shrink-0">Month {r.reminder_month}</span>
                      <div className="flex-1">
                        <p className="text-ink">
                          {r.note} · <Link href={`/portal/contacts/${r.contact_id}`} className="text-maroon-700 hover:underline">{contact?.name}</Link>
                        </p>
                        <p className="text-xs text-ink-faint mt-0.5">Lead time: {r.lead_time_weeks} weeks</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar: where you're expected */}
        <aside className="space-y-6">
          <section className="card-padded">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-maroon-700" />
              <h2 className="font-serif text-xl font-semibold">This week</h2>
            </div>
            <ul className="mt-5 space-y-4">
              {myUpcoming.map(e => (
                <li key={e.id}>
                  <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">
                    {formatDate(e.start_at, { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="mt-0.5 font-medium text-ink">{e.title}</p>
                  {e.location_name && (
                    <p className="text-sm text-ink-soft">{e.location_name}</p>
                  )}
                </li>
              ))}
            </ul>
            <Link href="/portal/team-calendar" className="mt-5 btn-ghost text-sm w-full justify-center">
              View calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="card-padded bg-maroon-700 text-white">
            <Mail className="h-4 w-4" />
            <p className="mt-3 font-serif text-lg font-semibold">Email composer note</p>
            <p className="mt-2 text-sm text-cream-200/85">
              All client emails are composed in your TAMU Outlook — buttons in
              the portal open prefilled drafts. Sent mail auto-archives to the
              CRM via your one-time Outlook BCC rule.
            </p>
          </section>
        </aside>
      </div>
    </PortalShell>
  );
}

function ActionItem({
  href, title, subtitle, meta, severity = "info",
}: {
  href?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  severity?: "info" | "urgent";
}) {
  const inner = (
    <div className="py-3.5 flex items-start gap-3">
      {severity === "urgent" ? (
        <AlertTriangle className="h-4 w-4 text-maroon-700 mt-0.5 flex-shrink-0" />
      ) : (
        <span className="h-1.5 w-1.5 mt-2 rounded-full bg-ink-faint flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", severity === "urgent" ? "text-ink" : "text-ink-soft")}>{title}</p>
        {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
      </div>
      {meta && <span className="pill-maroon text-[10px]">{meta}</span>}
      <ArrowRight className="h-4 w-4 text-ink-faint flex-shrink-0" />
    </div>
  );

  return href ? (
    <li><Link href={href} className="block hover:bg-cream-200 -mx-2 px-2 rounded transition-colors">{inner}</Link></li>
  ) : (
    <li>{inner}</li>
  );
}
