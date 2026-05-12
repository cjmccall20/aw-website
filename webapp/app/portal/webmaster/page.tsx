"use client";

import { useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { MEMBERS, SPONSORS, VIDEOS, FAQS } from "@/lib/mock-data";
import { initials, placeholderColor, cn } from "@/lib/utils";
import { Pencil, GripVertical, ExternalLink, Eye, Plus } from "lucide-react";

type Section = "homepage" | "profiles" | "videos" | "sponsors" | "faq" | "tryouts" | "banquet";

export default function WebmasterPage() {
  const [section, setSection] = useState<Section>("homepage");

  return (
    <PortalShell tabKey="webmaster" title="Webmaster">
      <p className="text-ink-soft -mt-6 mb-4">
        CMS for everything the public site shows. Page structure is code-managed; content lives here.
      </p>

      <div className="flex items-center justify-end mb-4">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          <Eye className="h-4 w-4" /> Preview site <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside>
          <ul className="space-y-1">
            {[
              ["homepage", "Homepage"],
              ["profiles", "Team profiles"],
              ["videos", "Videos (/watch)"],
              ["sponsors", "Sponsors"],
              ["faq", "FAQ"],
              ["tryouts", "Tryouts cycle"],
              ["banquet", "Banquet"],
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => setSection(key as Section)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    section === key
                      ? "bg-maroon-50 text-maroon-800 font-medium"
                      : "text-ink-soft hover:bg-cream-200 hover:text-ink",
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          {section === "homepage" && <HomepageEditor />}
          {section === "profiles" && <ProfilesEditor />}
          {section === "videos" && <VideosEditor />}
          {section === "sponsors" && <SponsorsEditor />}
          {section === "faq" && <FAQEditor />}
          {section === "tryouts" && <TryoutsEditor />}
          {section === "banquet" && <BanquetEditor />}
        </div>
      </div>
    </PortalShell>
  );
}

function HomepageEditor() {
  return (
    <div className="card-padded space-y-5">
      <h2 className="font-serif text-xl font-semibold">Homepage content</h2>
      <div>
        <label className="label">Site tagline</label>
        <input className="input" defaultValue="High Flyin', Death Defyin'" />
      </div>
      <div>
        <label className="label">Hero subhead</label>
        <textarea className="textarea" rows={3} defaultValue="We're a nationally recognized performance team based at Texas A&M. We teach. We perform. We've been in music videos with Midland, Randy Rogers Band, and Ella Langley. And we'd love to dance at your event." />
      </div>
      <div>
        <label className="label">Homepage announcement banner (optional)</label>
        <input className="input" placeholder="e.g. Tryouts open Sept 6 — sign up now" />
      </div>
      <button className="btn-primary">Save changes</button>
    </div>
  );
}

function ProfilesEditor() {
  const officers = MEMBERS.filter(m => m.role_title);
  const members = MEMBERS.filter(m => !m.role_title && m.status === "current");
  return (
    <div className="space-y-6">
      <div className="card-padded">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Officers ({officers.length})</h2>
          <button className="btn-secondary text-sm">Reorder</button>
        </div>
        <ul className="mt-5 divide-y divide-line">
          {officers.map(m => (
            <li key={m.id} className="py-3 flex items-center gap-4">
              <GripVertical className="h-4 w-4 text-ink-faint cursor-grab" />
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-ink-faint">{m.role_title}</p>
              </div>
              <button className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /> Edit</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-padded">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Members ({members.length})</h2>
          <p className="text-xs text-ink-faint">Auto-grid; add a row in Members tab and it appears here.</p>
        </div>
      </div>
    </div>
  );
}

function VideosEditor() {
  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Videos on /watch</h2>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add video</button>
      </div>
      <p className="text-xs text-ink-faint mt-1">Reorder by drag. Mark one as featured to show on homepage.</p>
      <ul className="mt-5 divide-y divide-line">
        {VIDEOS.map(v => (
          <li key={v.id} className="py-3 flex items-center gap-4">
            <GripVertical className="h-4 w-4 text-ink-faint cursor-grab" />
            <img src={`https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`} alt="" className="h-12 w-20 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{v.title_override}</p>
              <p className="text-xs text-ink-faint">{v.category} {v.source_artist && `· ${v.source_artist}`}</p>
            </div>
            {v.featured && <span className="pill-maroon">Featured</span>}
            <button className="btn-ghost text-sm">Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SponsorsEditor() {
  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Sponsors</h2>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add sponsor</button>
      </div>
      <ul className="mt-5 divide-y divide-line">
        {SPONSORS.map(s => (
          <li key={s.id} className="py-3 flex items-center gap-4">
            <GripVertical className="h-4 w-4 text-ink-faint cursor-grab" />
            <span className="pill-line">{s.tier}</span>
            <p className="flex-1 font-medium">{s.name}</p>
            <button className="btn-ghost text-sm">Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQEditor() {
  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">FAQ entries</h2>
        <button className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add question</button>
      </div>
      <ul className="mt-5 divide-y divide-line">
        {FAQS.map(f => (
          <li key={f.id} className="py-3">
            <div className="flex items-start gap-3">
              <span className="pill-line">{f.category}</span>
              <div className="flex-1">
                <p className="font-medium">{f.question}</p>
                <p className="text-sm text-ink-soft mt-1 line-clamp-2">{f.answer}</p>
              </div>
              <button className="btn-ghost text-sm">Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TryoutsEditor() {
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Tryouts cycle</h2>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div><label className="label">Cycle name</label><input className="input" defaultValue="Fall 2026 Tryouts" /></div>
        <div><label className="label">Tryout date</label><input className="input" type="date" defaultValue="2026-09-06" /></div>
        <div><label className="label">Signup URL</label><input className="input" defaultValue="/requirements#signup" /></div>
        <div><label className="label">Active</label>
          <select className="select"><option>Yes</option><option>No</option></select>
        </div>
      </div>
      <button className="mt-5 btn-primary">Save</button>
    </div>
  );
}

function BanquetEditor() {
  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Banquet content</h2>
      <p className="text-xs text-ink-faint mt-1">Updated annually. Stays live at /banquet year-round.</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div><label className="label">Year</label><input className="input" type="number" defaultValue={2026} /></div>
        <div><label className="label">Date</label><input className="input" type="date" defaultValue="2026-04-25" /></div>
        <div><label className="label">Venue</label><input className="input" placeholder="TBD" /></div>
        <div><label className="label">Doors</label><input className="input" defaultValue="5:30 PM" /></div>
      </div>
      <button className="mt-5 btn-primary">Save</button>
    </div>
  );
}
