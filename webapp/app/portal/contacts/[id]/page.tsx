"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  CONTACTS, PERFORMANCE_REQUESTS, PRIVATE_LESSON_REQUESTS,
  EMAIL_THREADS, EMAIL_MESSAGES, ANNUAL_REMINDERS,
} from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft, Building2, User, Mail, Phone, MapPin,
  Calendar, Bell, ExternalLink, MessageSquare, FileText,
} from "lucide-react";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const c = CONTACTS.find(x => x.id === params.id);
  if (!c) notFound();

  const perfRequests = PERFORMANCE_REQUESTS.filter(r => r.contact_id === c.id);
  const pllRequests = PRIVATE_LESSON_REQUESTS.filter(r => r.contact_id === c.id);
  const threads = EMAIL_THREADS.filter(t => t.contact_id === c.id);
  const messages = EMAIL_MESSAGES
    .filter(m => threads.some(t => t.id === m.thread_id))
    .sort((a, b) => b.received_at.localeCompare(a.received_at));
  const reminders = ANNUAL_REMINDERS.filter(r => r.contact_id === c.id);

  return (
    <PortalShell
      tabKey="contacts"
      breadcrumb={
        <Link href="/portal/contacts" className="inline-flex items-center gap-1 text-ink-faint hover:text-ink-soft">
          <ArrowLeft className="h-3.5 w-3.5" /> Contacts
        </Link>
      }
    >
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
          {c.notes_markdown && (
            <section className="card-padded">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-maroon-700 mt-1" />
                <div className="flex-1">
                  <h2 className="font-serif text-xl font-semibold">Officer notes</h2>
                  <p className="text-xs text-ink-faint mt-0.5">Survives officer transitions. Editable by any officer.</p>
                  <p className="mt-4 text-ink whitespace-pre-wrap leading-relaxed">{c.notes_markdown}</p>
                </div>
              </div>
            </section>
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
                    <Link href={`/portal/performance-management/${r.id}`} className="flex items-center justify-between hover:bg-cream-200 -mx-2 px-2 py-1 rounded transition-colors">
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

          {reminders.length > 0 && (
            <div className="card-padded">
              <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2"><Bell className="h-4 w-4 text-amber-700" /> Annual reminders</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {reminders.map(r => (
                  <li key={r.id}>
                    <p className="font-medium">{r.note}</p>
                    <p className="text-xs text-ink-faint mt-0.5">Reminds month {r.reminder_month} · {r.lead_time_weeks} weeks lead time</p>
                  </li>
                ))}
              </ul>
              <button className="mt-4 btn-ghost text-sm w-full justify-center">+ Add reminder</button>
            </div>
          )}

          <div className="card-padded">
            <h3 className="font-serif text-lg font-semibold">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <button className="btn-secondary w-full text-sm justify-start">Edit contact</button>
              <button className="btn-secondary w-full text-sm justify-start">Merge with another</button>
              <button className="btn-ghost w-full text-sm justify-start">Mark do-not-contact</button>
            </div>
          </div>
        </aside>
      </div>
    </PortalShell>
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
