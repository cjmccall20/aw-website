import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "History",
  description: "The history of the Aggie Wranglers — Texas A&M's country-western dance performance team since 1981.",
  alternates: { canonical: "/history" },
};

export default function HistoryPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Since 1981"
        title="A history of country-western dance at Texas A&M."
        description="The Wranglers were founded to share country-western dance and Aggie spirit with the world. Four decades later — still the mission."
      />

      <section className="section-sm">
        <div className="container-content max-w-prose">
          <article className="prose prose-lg max-w-none text-ink-soft prose-headings:font-serif prose-headings:text-ink prose-strong:text-ink prose-a:text-maroon-700">
            <p>
              <strong>The Aggie Wranglers were founded in 1981</strong> as a way
              for Texas A&amp;M students to share the country-western tradition
              with audiences across Texas and beyond. From a small group of
              dancers practicing in borrowed studio time, the team grew into one
              of the most recognizable performance groups associated with the
              university.
            </p>

            <h2>Decades of performance</h2>
            <p>
              The team has performed at the Houston Livestock Show, on national
              television, at countless weddings and corporate events, and in
              music videos with Midland, Randy Rogers Band, and Ella Langley.
              Every performance is built around the same goal: spread love for
              Texas A&amp;M and country-western dance.
            </p>

            <h2>Core values</h2>
            <ul>
              <li><strong>Commitment</strong> — to the team, to the craft, to the people we&apos;re dancing for.</li>
              <li><strong>Humility</strong> — even the most polished routine started with someone learning a quick-quick-slow-slow.</li>
              <li><strong>Integrity</strong> — we represent A&amp;M everywhere we go.</li>
              <li><strong>Respect</strong> — for our partners, our audiences, and the tradition.</li>
              <li><strong>Partnership</strong> — this is a couples activity. Trust is everything.</li>
              <li><strong>Excellence</strong> — earned through practice, not claimed.</li>
            </ul>

            <h2>What today looks like</h2>
            <p>
              Roughly fifteen students at any given time. Weekly practices,
              public lessons, private lessons for couples, and a steady cadence
              of performances across the year. Fall tryouts bring in the next
              generation; spring banquet celebrates the one that&apos;s
              graduating.
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
