"use client";

import { useStore } from "@/lib/store";

export function BanquetView() {
  const db = useStore();
  const c = db.siteContent;
  return (
    <section className="section-sm">
      <div className="container-content max-w-3xl">
        <div className="card-padded">
          <p className="eyebrow">{c.banquet_eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold">{c.banquet_title}</h2>
          <p className="mt-2 text-ink-soft">{c.banquet_body}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="label inline mr-2">Tickets</dt><dd className="inline text-ink">{c.banquet_tickets_line}</dd></div>
            <div><dt className="label inline mr-2">Dress</dt><dd className="inline text-ink-soft">{c.banquet_dress_line}</dd></div>
            <div><dt className="label inline mr-2">Questions</dt><dd className="inline text-ink-soft"><a href={`mailto:${c.banquet_contact_email}`} className="text-maroon-700 hover:underline">{c.banquet_contact_email}</a></dd></div>
          </dl>
        </div>

        <p className="mt-12 text-ink-soft">
          For the most up-to-date information — registration, lodging
          recommendations, alumni invitations — sign in to the team portal.
        </p>
      </div>
    </section>
  );
}
