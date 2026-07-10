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
            <p className="eyebrow">10th annual banquet · Spring 2027</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Date to be announced</h2>
            <p className="mt-2 text-ink-soft">
              The 2027 date and tickets will be posted here in the fall. Last
              year&apos;s banquet — our 9th — filled the Hildebrand Equine Center
              with a meal, a silent auction, an open dance floor, a year recap,
              and a team performance.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="label inline mr-2">Tickets</dt><dd className="inline text-ink">$45 per person · $600 sponsors a table of eight</dd></div>
              <div><dt className="label inline mr-2">Dress</dt><dd className="inline text-ink-soft">Sunday Best — jeans and boots encouraged</dd></div>
              <div><dt className="label inline mr-2">Questions</dt><dd className="inline text-ink-soft"><a href="mailto:banquet@wranglers.tamu.edu" className="text-maroon-700 hover:underline">banquet@wranglers.tamu.edu</a></dd></div>
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
