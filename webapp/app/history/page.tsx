import type { Metadata } from "next";
import Image from "next/image";
import { assetPath } from "@/lib/utils";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "History",
  description: "The history of the Aggie Wranglers — Texas A&M's country-western exhibition dance team since 1984.",
  alternates: { canonical: "/history" },
};

export default function HistoryPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Since 1984"
        title="A history of country-western dance at Texas A&M."
        description="The Wranglers were founded to share country-western dance and Aggie spirit with the world. Four decades later — still the mission."
      />

      <section className="container-content -mt-8 sm:-mt-10 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4 items-start">
          <div className="relative sm:col-span-2 aspect-[3/2] rounded-2xl overflow-hidden shadow-lifted">
            <Image
              src={assetPath("/images/team-photo.jpg")}
              alt="The current Aggie Wranglers team in front of the Texas A&M Administration Building"
              fill sizes="(min-width: 640px) 66vw, 100vw"
              className="object-cover"
            />
          </div>
          <figure className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft">
              <Image
                src={assetPath("/images/history-early-years.jpg")}
                alt="Black-and-white team photo of the Aggie Wranglers in 1987"
                fill sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-ink-faint">The team in 1987 — three years in.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-content max-w-prose">
          <article className="prose prose-lg max-w-none text-ink-soft prose-headings:font-serif prose-headings:text-ink prose-strong:text-ink prose-a:text-maroon-700">
            <p>
              <strong>The Aggie Wranglers started with an ad in The Battalion.</strong>{" "}
              In 1984, a Texas A&amp;M student with a dance background put out a
              call for dancers to perform at that year&apos;s Calvert County
              Fair. Twenty people showed up; seven couples were chosen. She
              choreographed the original routines herself — and several of the
              moves from that first era, like the Donna and the Jesse flip, are
              still danced by the team today.
            </p>

            <h2>Four decades of performance</h2>
            <p>
              From a county fair to stages far beyond Texas: the team has
              performed at Aggie Ring Day and Fish Camp, at the Houston
              Livestock Show and a Houston Texans halftime, aboard Royal
              Caribbean cruises, at the Cattle Baron&apos;s Ball, for Nobel
              Laureate meetings in Germany, and at the Texas State
              Society&apos;s Black Tie and Boots Inaugural Ball in
              Washington, D.C. When country acts need dancers who actually
              know what they&apos;re doing, we get the call — music videos with
              Midland, Randy Rogers Band, and Ella Langley.
            </p>
            <p>
              Every performance is built around the same signature: choreographed
              high-speed polka routines and the internationally famous
              Aggie-style jitterbug — the flips, dips, and lifts behind
              &ldquo;High Flyin&apos;, Death Defyin&apos;.&rdquo; Ask a Wrangler
              about &ldquo;the Michelle,&rdquo; the overhead lift with a toe
              touch that&apos;s become a team trademark.
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
              Roughly eighteen students at any given time, chosen through a
              spring tryout that tests both dancing and character. Weekly
              practices, six public-lesson sessions a year that teach around
              3,000 people to two-step, waltz, polka, and jitterbug, private
              lessons for couples, and a steady cadence of free,
              donation-supported performances across the year. Spring tryouts
              bring in the next generation; the annual banquet celebrates the
              one that&apos;s graduating.
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
