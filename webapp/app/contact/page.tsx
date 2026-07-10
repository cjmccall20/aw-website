import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "./form";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Aggie Wranglers — general questions, press, sponsorships, or anything that doesn't fit the performance and lesson request forms.",
  alternates: { canonical: "/contact" },
};

const ROLE_EMAILS = [
  { label: "General / President", email: "president@wranglers.tamu.edu" },
  { label: "Lessons", email: "lessons@wranglers.tamu.edu" },
  { label: "Sponsorships & donations", email: "vicepresident@wranglers.tamu.edu" },
  { label: "Banquet", email: "banquet@wranglers.tamu.edu" },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch."
        description="Booking a performance or requesting a lesson? Use the dedicated forms — they route straight to the right officer. For everything else, this is the place."
      />
      <section className="section-sm">
        <div className="container-content grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <aside className="space-y-6">
            <div className="card-padded">
              <h2 className="font-serif text-xl font-semibold">Reach an officer directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                {ROLE_EMAILS.map(r => (
                  <li key={r.email}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">{r.label}</p>
                    <a href={`mailto:${r.email}`} className="mt-0.5 inline-flex items-center gap-2 text-maroon-700 hover:underline">
                      <Mail className="h-3.5 w-3.5" /> {r.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-padded bg-cream-200/60">
              <p className="eyebrow">Looking to book us?</p>
              <p className="mt-3 text-sm text-ink-soft">
                Performance and private-lesson requests are only accepted through
                the request forms (not email) so nothing falls through the cracks.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
