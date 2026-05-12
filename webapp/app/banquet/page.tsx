import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Banquet",
  description: "The Aggie Wranglers annual banquet — current and alumni members celebrate the year.",
  alternates: { canonical: "/banquet" },
};

export default function BanquetPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Annual celebration"
        title="The Wranglers banquet."
        description="Every spring, current members and alumni come together for a night of food, dance, awards, and stories. The most-anticipated event of the team year."
      />

      <section className="section-sm">
        <div className="container-content max-w-3xl">
          <div className="card-padded">
            <p className="eyebrow">2026 banquet</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Saturday, April 25, 2026</h2>
            <p className="mt-2 text-ink-soft">Location and ticket details coming soon. Sign in to the team portal for the alumni invite.</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="label inline mr-2">When</dt><dd className="inline text-ink">6:00 PM CT, doors at 5:30</dd></div>
              <div><dt className="label inline mr-2">Where</dt><dd className="inline text-ink-soft">To be announced</dd></div>
              <div><dt className="label inline mr-2">Dress</dt><dd className="inline text-ink-soft">Cocktail Western (boots welcome)</dd></div>
            </dl>
          </div>

          <p className="mt-12 text-ink-soft">
            For the most up-to-date information — registration, lodging
            recommendations, alumni invitations — sign in to the team portal.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
