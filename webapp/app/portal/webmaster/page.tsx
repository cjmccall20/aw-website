"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Modal, TextField, TextArea, SelectField, ViewOnlyBanner, SavedFlash } from "@/components/portal/ui";
import { useStore, useAccess, update, uid, resetDemoData } from "@/lib/store";
import type { DB } from "@/lib/store";
import type { Member, Video, Sponsor, FAQ, SiteContent } from "@/lib/types";
import { initials, placeholderColor, cn } from "@/lib/utils";
import { Pencil, ExternalLink, Eye, Plus, Trash2 } from "lucide-react";

type Section = "homepage" | "profiles" | "videos" | "sponsors" | "faq" | "tryouts" | "banquet";

export default function WebmasterPage() {
  const [section, setSection] = useState<Section>("homepage");
  const canEdit = useAccess("webmaster") === "edit";

  return (
    <PortalShell tabKey="webmaster" title="Webmaster">
      <p className="text-ink-soft -mt-6 mb-4">
        CMS for everything the public site shows. Page structure is code-managed; content lives here.
      </p>
      {!canEdit && <ViewOnlyBanner />}

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
          {section === "homepage" && <HomepageEditor canEdit={canEdit} />}
          {section === "profiles" && <ProfilesEditor canEdit={canEdit} />}
          {section === "videos" && <VideosEditor canEdit={canEdit} />}
          {section === "sponsors" && <SponsorsEditor canEdit={canEdit} />}
          {section === "faq" && <FAQEditor canEdit={canEdit} />}
          {section === "tryouts" && <TryoutsEditor canEdit={canEdit} />}
          {section === "banquet" && <BanquetEditor canEdit={canEdit} />}
        </div>
      </div>
    </PortalShell>
  );
}

// ─── shared bits ─────────────────────────────────────────────────────────────

/** ▲▼ reorder buttons. */
function MoveButtons({ onUp, onDown, first, last, label }: {
  onUp: () => void; onDown: () => void; first: boolean; last: boolean; label: string;
}) {
  return (
    <span className="flex flex-col -my-1">
      <button onClick={onUp} disabled={first} aria-label={`Move ${label} up`}
        className="text-ink-faint hover:text-ink disabled:opacity-25 text-[10px] leading-tight px-1">▲</button>
      <button onClick={onDown} disabled={last} aria-label={`Move ${label} down`}
        className="text-ink-faint hover:text-ink disabled:opacity-25 text-[10px] leading-tight px-1">▼</button>
    </span>
  );
}

function useFlash(): [boolean, () => void] {
  const [show, setShow] = useState(false);
  const flash = () => { setShow(true); setTimeout(() => setShow(false), 2000); };
  return [show, flash];
}

// ─── homepage ────────────────────────────────────────────────────────────────

const pickHomepage = (sc: SiteContent) => ({
  tagline: sc.tagline,
  hero_subhead: sc.hero_subhead,
  announcement_text: sc.announcement_text,
  announcement_link: sc.announcement_link,
});

function HomepageEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const sc = db.siteContent;
  const [f, setF] = useState(() => pickHomepage(sc));
  const [active, setActive] = useState(sc.announcement_active);
  const [dirty, setDirty] = useState(false);
  const [saved, flash] = useFlash();

  // Re-sync from the store (hydration, other-tab writes) until the user edits.
  useEffect(() => {
    if (!dirty) { setF(pickHomepage(sc)); setActive(sc.announcement_active); }
  }, [sc, dirty]);

  const set = (k: keyof ReturnType<typeof pickHomepage>) => (v: string) => {
    setDirty(true);
    setF(prev => ({ ...prev, [k]: v }));
  };

  function save() {
    update(dbx => {
      dbx.siteContent.tagline = f.tagline;
      dbx.siteContent.hero_subhead = f.hero_subhead;
      dbx.siteContent.announcement_text = f.announcement_text;
      dbx.siteContent.announcement_link = f.announcement_link;
      dbx.siteContent.announcement_active = active;
    }, "Updated homepage content");
    setDirty(false);
    flash();
  }

  return (
    <>
      <div className="card-padded space-y-5">
        <h2 className="font-serif text-xl font-semibold">Homepage content</h2>
        <div>
          <label className="label" htmlFor="wm-tagline">Site tagline</label>
          <input id="wm-tagline" className="input" value={f.tagline} onChange={e => set("tagline")(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="wm-subhead">Hero subhead</label>
          <textarea id="wm-subhead" className="textarea" rows={4} value={f.hero_subhead}
            onChange={e => set("hero_subhead")(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="wm-announcement">Homepage announcement banner (optional)</label>
          <input id="wm-announcement" data-testid="announcement-text" className="input" value={f.announcement_text}
            placeholder="e.g. Tryouts open Sept 6 — sign up now"
            onChange={e => set("announcement_text")(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="wm-announcement-link">Announcement link (optional)</label>
          <input id="wm-announcement-link" className="input" value={f.announcement_link}
            placeholder="/requirements"
            onChange={e => set("announcement_link")(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active}
            onChange={e => { setDirty(true); setActive(e.target.checked); }}
            className="h-4 w-4 rounded border-line-strong text-maroon-700" />
          Show announcement banner on the homepage
        </label>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={!canEdit} className="btn-primary disabled:opacity-50" data-testid="save-homepage">
            Save changes
          </button>
          <SavedFlash show={saved} />
        </div>
      </div>

      <div className="card-padded border-maroon-200">
        <h2 className="font-serif text-xl font-semibold text-maroon-800">Danger zone</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Wipe every demo edit in this browser and restore the original seed data. Affects all portal tabs.
        </p>
        <button
          onClick={() => { if (confirm("Reset ALL demo data back to the seed? Every edit in this browser is lost.")) resetDemoData(); }}
          disabled={!canEdit}
          className="mt-4 btn-secondary text-maroon-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> Reset demo data
        </button>
      </div>
    </>
  );
}

// ─── team profiles ───────────────────────────────────────────────────────────

const byOrder = (a: Member, b: Member) =>
  (a.display_order ?? 999) - (b.display_order ?? 999) || a.name.localeCompare(b.name);

function ProfilesEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [editing, setEditing] = useState<Member | null>(null);
  const officers = db.members.filter(m => m.role_title).sort(byOrder);
  const members = db.members.filter(m => !m.role_title && m.status === "current").sort(byOrder);

  function move(list: Member[], i: number, dir: -1 | 1) {
    const ids = list.map(m => m.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    update(dbx => {
      ids.forEach((id, idx) => {
        const m = dbx.members.find(x => x.id === id);
        if (m) m.display_order = idx + 1;
      });
    }, "Reordered team profiles");
  }

  return (
    <div className="space-y-6">
      <div className="card-padded">
        <h2 className="font-serif text-xl font-semibold">Officers ({officers.length})</h2>
        <ul className="mt-5 divide-y divide-line">
          {officers.map((m, i) => (
            <li key={m.id} className="py-3 flex items-center gap-4">
              {canEdit && (
                <MoveButtons label={m.name} first={i === 0} last={i === officers.length - 1}
                  onUp={() => move(officers, i, -1)} onDown={() => move(officers, i, 1)} />
              )}
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-ink-faint">{m.role_title}</p>
              </div>
              {canEdit && (
                <button onClick={() => setEditing(m)} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-padded">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Members ({members.length})</h2>
          <p className="text-xs text-ink-faint">Auto-grid; add a row in Members tab and it appears here.</p>
        </div>
        <ul className="mt-5 divide-y divide-line">
          {members.map(m => (
            <li key={m.id} className="py-2 flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0" style={{ background: placeholderColor(m.name) }}>{initials(m.name)}</div>
              <p className="flex-1 text-sm">{m.name} {m.class_year && <span className="text-ink-faint">&apos;{String(m.class_year).slice(-2)}</span>}</p>
              {canEdit && (
                <button onClick={() => setEditing(m)} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {editing && <MemberModal member={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function MemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [f, setF] = useState({
    name: member.name,
    role_title: member.role_title ?? "",
    class_year: member.class_year != null ? String(member.class_year) : "",
    hometown: member.hometown ?? "",
    major: member.major ?? "",
    bio: member.bio ?? "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      const m = dbx.members.find(x => x.id === member.id);
      if (!m) return;
      m.name = f.name;
      m.role_title = f.role_title || undefined;
      m.class_year = f.class_year ? Number(f.class_year) : undefined;
      m.hometown = f.hometown || undefined;
      m.major = f.major || undefined;
      m.bio = f.bio || undefined;
    }, `Updated profile: ${f.name}`);
    onClose();
  }

  return (
    <Modal title={`Edit profile — ${member.name}`} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Name" value={f.name} onChange={set("name")} required />
          <TextField label="Role title" value={f.role_title} onChange={set("role_title")} placeholder="e.g. President (blank = member)" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <TextField label="Class year" type="number" value={f.class_year} onChange={set("class_year")} />
          <TextField label="Hometown" value={f.hometown} onChange={set("hometown")} />
          <TextField label="Major" value={f.major} onChange={set("major")} />
        </div>
        <TextArea label="Bio" value={f.bio} onChange={set("bio")} rows={4} />
        <button type="submit" className="btn-primary w-full justify-center">Save profile</button>
      </form>
    </Modal>
  );
}

// ─── videos ──────────────────────────────────────────────────────────────────

const VIDEO_CATEGORIES: Video["category"][] = ["Top Routines", "Music Videos", "Behind the Scenes"];

function VideosEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [editing, setEditing] = useState<Video | null>(null);
  const [adding, setAdding] = useState(false);

  function move(catVideos: Video[], i: number, dir: -1 | 1) {
    const ids = catVideos.map(v => v.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    update(dbx => {
      ids.forEach((id, idx) => {
        const v = dbx.videos.find(x => x.id === id);
        if (v) v.display_order = idx + 1;
      });
    }, "Reordered videos");
  }

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Videos on /watch</h2>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add video</button>
        )}
      </div>
      <p className="text-xs text-ink-faint mt-1">Reorder within each category. Mark one as featured to show on the homepage.</p>
      {VIDEO_CATEGORIES.map(cat => {
        const vids = db.videos.filter(v => v.category === cat).sort((a, b) => a.display_order - b.display_order);
        if (vids.length === 0) return null;
        return (
          <div key={cat} className="mt-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">{cat}</p>
            <ul className="mt-1 divide-y divide-line">
              {vids.map((v, i) => (
                <li key={v.id} className="py-3 flex items-center gap-4">
                  {canEdit && (
                    <MoveButtons label={v.title_override ?? v.youtube_id} first={i === 0} last={i === vids.length - 1}
                      onUp={() => move(vids, i, -1)} onDown={() => move(vids, i, 1)} />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`} alt="" className="h-12 w-20 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{v.title_override}</p>
                    <p className="text-xs text-ink-faint">{v.category} {v.source_artist && `· ${v.source_artist}`}</p>
                  </div>
                  {v.featured && <span className="pill-maroon">Featured</span>}
                  {canEdit && <button onClick={() => setEditing(v)} className="btn-ghost text-sm">Edit</button>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {(adding || editing) && (
        <VideoModal video={editing} onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </div>
  );
}

function VideoModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const [f, setF] = useState({
    youtube_id: video?.youtube_id ?? "",
    title_override: video?.title_override ?? "",
    category: (video?.category ?? "Top Routines") as string,
    source_artist: video?.source_artist ?? "",
  });
  const [featured, setFeatured] = useState(video?.featured ?? false);
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = video?.id ?? uid("v");
    update(dbx => {
      let row = dbx.videos.find(x => x.id === id);
      if (!row) {
        const maxOrder = Math.max(0, ...dbx.videos.filter(v => v.category === f.category).map(v => v.display_order));
        row = { id, youtube_id: "", display_order: maxOrder + 1, category: "Top Routines", featured: false };
        dbx.videos.push(row);
      }
      row.youtube_id = f.youtube_id;
      row.title_override = f.title_override || undefined;
      row.category = f.category as Video["category"];
      row.source_artist = f.source_artist || undefined;
      row.featured = featured;
      // Only one video can be featured on the homepage.
      if (featured) dbx.videos.forEach(v => { v.featured = v.id === id; });
    }, video ? `Updated video: ${f.title_override || f.youtube_id}` : `Added video: ${f.title_override || f.youtube_id}`);
    onClose();
  }

  function remove() {
    if (!video) return;
    if (!confirm(`Delete "${video.title_override ?? video.youtube_id}" from /watch?`)) return;
    update(dbx => {
      dbx.videos = dbx.videos.filter(x => x.id !== video.id);
    }, `Deleted video: ${video.title_override ?? video.youtube_id}`);
    onClose();
  }

  return (
    <Modal title={video ? "Edit video" : "Add video"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="YouTube ID" value={f.youtube_id} onChange={set("youtube_id")} required
          help="The 11-character ID from the video URL." />
        <TextField label="Title override" value={f.title_override} onChange={set("title_override")} />
        <SelectField label="Category" value={f.category} onChange={set("category")}
          options={VIDEO_CATEGORIES.map(c => ({ value: c, label: c }))} />
        <TextField label="Source artist" value={f.source_artist} onChange={set("source_artist")} placeholder="e.g. Midland" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-maroon-700" />
          Featured on homepage (only one video at a time)
        </label>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1 justify-center">{video ? "Save changes" : "Add video"}</button>
          {video && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── sponsors ────────────────────────────────────────────────────────────────

function SponsorsEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [adding, setAdding] = useState(false);
  const sponsors = [...db.sponsors].sort((a, b) => a.display_order - b.display_order);

  function move(i: number, dir: -1 | 1) {
    const ids = sponsors.map(s => s.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    update(dbx => {
      ids.forEach((id, idx) => {
        const s = dbx.sponsors.find(x => x.id === id);
        if (s) s.display_order = idx + 1;
      });
    }, "Reordered sponsors");
  }

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Sponsors</h2>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add sponsor</button>
        )}
      </div>
      <ul className="mt-5 divide-y divide-line">
        {sponsors.map((s, i) => (
          <li key={s.id} className="py-3 flex items-center gap-4">
            {canEdit && (
              <MoveButtons label={s.name} first={i === 0} last={i === sponsors.length - 1}
                onUp={() => move(i, -1)} onDown={() => move(i, 1)} />
            )}
            <span className="pill-line">{s.tier}</span>
            <p className="flex-1 font-medium">{s.name} {!s.active && <span className="text-xs text-ink-faint font-normal">(inactive)</span>}</p>
            {canEdit && <button onClick={() => setEditing(s)} className="btn-ghost text-sm">Edit</button>}
          </li>
        ))}
      </ul>
      {(adding || editing) && (
        <SponsorModal sponsor={editing} onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </div>
  );
}

function SponsorModal({ sponsor, onClose }: { sponsor: Sponsor | null; onClose: () => void }) {
  const [f, setF] = useState({
    name: sponsor?.name ?? "",
    tier: (sponsor?.tier ?? "Supporting") as string,
    website_url: sponsor?.website_url ?? "",
  });
  const [active, setActive] = useState(sponsor?.active ?? true);
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      let row = dbx.sponsors.find(x => x.id === sponsor?.id);
      if (!row) {
        const maxOrder = Math.max(0, ...dbx.sponsors.map(s => s.display_order));
        row = { id: uid("sp"), name: "", tier: "Supporting", display_order: maxOrder + 1, active: true };
        dbx.sponsors.push(row);
      }
      row.name = f.name;
      row.tier = f.tier as Sponsor["tier"];
      row.website_url = f.website_url || undefined;
      row.active = active;
    }, sponsor ? `Updated sponsor: ${f.name}` : `Added sponsor: ${f.name}`);
    onClose();
  }

  function remove() {
    if (!sponsor) return;
    if (!confirm(`Delete sponsor "${sponsor.name}"?`)) return;
    update(dbx => {
      dbx.sponsors = dbx.sponsors.filter(x => x.id !== sponsor.id);
    }, `Deleted sponsor: ${sponsor.name}`);
    onClose();
  }

  return (
    <Modal title={sponsor ? "Edit sponsor" : "Add sponsor"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={f.name} onChange={set("name")} required />
        <SelectField label="Tier" value={f.tier} onChange={set("tier")}
          options={["Presenting", "Supporting", "Friends"].map(t => ({ value: t, label: t }))} />
        <TextField label="Website URL" value={f.website_url} onChange={set("website_url")} placeholder="https://…" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-maroon-700" />
          Active (shown on the public site)
        </label>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1 justify-center">{sponsor ? "Save changes" : "Add sponsor"}</button>
          {sponsor && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── faq ─────────────────────────────────────────────────────────────────────

function FAQEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [adding, setAdding] = useState(false);
  const faqs = [...db.faqs].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">FAQ entries</h2>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add question</button>
        )}
      </div>
      <ul className="mt-5 divide-y divide-line">
        {faqs.map(f => (
          <li key={f.id} className="py-3">
            <div className="flex items-start gap-3">
              <span className="pill-line">{f.category}</span>
              <div className="flex-1">
                <p className="font-medium">{f.question}</p>
                <p className="text-sm text-ink-soft mt-1 line-clamp-2">{f.answer}</p>
              </div>
              {canEdit && <button onClick={() => setEditing(f)} className="btn-ghost text-sm">Edit</button>}
            </div>
          </li>
        ))}
      </ul>
      {(adding || editing) && (
        <FAQModal faq={editing} onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </div>
  );
}

function FAQModal({ faq, onClose }: { faq: FAQ | null; onClose: () => void }) {
  const [f, setF] = useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "Lessons",
  });
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update(dbx => {
      let row = dbx.faqs.find(x => x.id === faq?.id);
      if (!row) {
        const maxOrder = Math.max(0, ...dbx.faqs.map(x => x.display_order));
        row = { id: uid("f"), question: "", answer: "", category: "", display_order: maxOrder + 1 };
        dbx.faqs.push(row);
      }
      row.question = f.question;
      row.answer = f.answer;
      row.category = f.category;
    }, faq ? `Updated FAQ: ${f.question}` : `Added FAQ: ${f.question}`);
    onClose();
  }

  function remove() {
    if (!faq) return;
    if (!confirm(`Delete FAQ "${faq.question}"?`)) return;
    update(dbx => {
      dbx.faqs = dbx.faqs.filter(x => x.id !== faq.id);
    }, `Deleted FAQ: ${faq.question}`);
    onClose();
  }

  return (
    <Modal title={faq ? "Edit question" : "Add question"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Question" value={f.question} onChange={set("question")} required />
        <TextArea label="Answer" value={f.answer} onChange={set("answer")} rows={5} required />
        <TextField label="Category" value={f.category} onChange={set("category")} placeholder="Lessons / Tryouts / Performances" required />
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1 justify-center">{faq ? "Save changes" : "Add question"}</button>
          {faq && (
            <button type="button" onClick={remove} className="btn-secondary text-maroon-700">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── tryouts ─────────────────────────────────────────────────────────────────

const pickTryouts = (db: DB) => {
  const c = db.tryoutCycles[0];
  return {
    cycle_name: c?.cycle_name ?? "",
    tryout_date: c?.tryout_date ?? "",
    prep_lesson_dates: c?.prep_lesson_dates.join(", ") ?? "",
    eligibility_notes: c?.eligibility_notes ?? "",
    signup_url: c?.signup_url ?? "",
    active: c?.active ? "yes" : "no",
  };
};

function TryoutsEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const cycle = db.tryoutCycles[0];
  const [f, setF] = useState(() => pickTryouts(db));
  const [dirty, setDirty] = useState(false);
  const [saved, flash] = useFlash();

  useEffect(() => {
    if (!dirty) setF(pickTryouts(db));
  }, [db, dirty]);

  const set = (k: keyof ReturnType<typeof pickTryouts>) => (v: string) => {
    setDirty(true);
    setF(prev => ({ ...prev, [k]: v }));
  };

  if (!cycle) return <div className="card-padded text-sm text-ink-faint">No tryout cycle exists yet.</div>;

  function save() {
    update(dbx => {
      const c = dbx.tryoutCycles[0];
      if (!c) return;
      c.cycle_name = f.cycle_name;
      c.tryout_date = f.tryout_date;
      c.prep_lesson_dates = f.prep_lesson_dates.split(",").map(d => d.trim()).filter(Boolean);
      c.eligibility_notes = f.eligibility_notes || undefined;
      c.signup_url = f.signup_url || undefined;
      c.active = f.active === "yes";
    }, `Updated tryout cycle: ${f.cycle_name}`);
    setDirty(false);
    flash();
  }

  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Tryouts cycle</h2>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <TextField label="Cycle name" value={f.cycle_name} onChange={set("cycle_name")} />
        <TextField label="Tryout date" type="date" value={f.tryout_date} onChange={set("tryout_date")} />
        <TextField label="Prep lesson dates" value={f.prep_lesson_dates} onChange={set("prep_lesson_dates")}
          help="Comma-separated YYYY-MM-DD." />
        <TextField label="Signup URL" value={f.signup_url} onChange={set("signup_url")} />
        <SelectField label="Active" value={f.active} onChange={set("active")}
          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
      </div>
      <div className="mt-4">
        <TextArea label="Eligibility notes" value={f.eligibility_notes} onChange={set("eligibility_notes")} rows={4} />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} disabled={!canEdit} className="btn-primary disabled:opacity-50">Save</button>
        <SavedFlash show={saved} />
      </div>
    </div>
  );
}

// ─── banquet ─────────────────────────────────────────────────────────────────

const pickBanquet = (sc: SiteContent) => ({
  banquet_eyebrow: sc.banquet_eyebrow,
  banquet_title: sc.banquet_title,
  banquet_body: sc.banquet_body,
  banquet_tickets_line: sc.banquet_tickets_line,
  banquet_dress_line: sc.banquet_dress_line,
  banquet_contact_email: sc.banquet_contact_email,
});

function BanquetEditor({ canEdit }: { canEdit: boolean }) {
  const db = useStore();
  const sc = db.siteContent;
  const [f, setF] = useState(() => pickBanquet(sc));
  const [dirty, setDirty] = useState(false);
  const [saved, flash] = useFlash();

  useEffect(() => {
    if (!dirty) setF(pickBanquet(sc));
  }, [sc, dirty]);

  const set = (k: keyof ReturnType<typeof pickBanquet>) => (v: string) => {
    setDirty(true);
    setF(prev => ({ ...prev, [k]: v }));
  };

  function save() {
    update(dbx => {
      Object.assign(dbx.siteContent, f);
    }, "Updated banquet content");
    setDirty(false);
    flash();
  }

  return (
    <div className="card-padded">
      <h2 className="font-serif text-xl font-semibold">Banquet content</h2>
      <p className="text-xs text-ink-faint mt-1">Updated annually. Stays live at /banquet year-round.</p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <TextField label="Eyebrow" value={f.banquet_eyebrow} onChange={set("banquet_eyebrow")}
          help="Small line above the title, e.g. year and season." />
        <TextField label="Title" value={f.banquet_title} onChange={set("banquet_title")} />
        <TextField label="Tickets line" value={f.banquet_tickets_line} onChange={set("banquet_tickets_line")} />
        <TextField label="Dress line" value={f.banquet_dress_line} onChange={set("banquet_dress_line")} />
        <TextField label="Contact email" type="email" value={f.banquet_contact_email} onChange={set("banquet_contact_email")} />
      </div>
      <div className="mt-4">
        <TextArea label="Body" value={f.banquet_body} onChange={set("banquet_body")} rows={4} />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} disabled={!canEdit} className="btn-primary disabled:opacity-50">Save</button>
        <SavedFlash show={saved} />
      </div>
    </div>
  );
}
