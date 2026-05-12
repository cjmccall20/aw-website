import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Performance Information",
  description:
    "What to expect when you book the Aggie Wranglers for a performance — formats, logistics, donations, lead times.",
  alternates: { canonical: "/performances-information" },
};

export default function PerformancesInfoPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Booking the team"
        title="Performance information."
        description="What to know before requesting a performance. The short version: tell us about your event, we'll handle the rest."
      />

      <section className="section-sm">
        <div className="container-content max-w-3xl space-y-12">
          <Block title="What we do">
            <p>
              We perform high-energy country-western dance routines — usually 5
              to 15 minutes — that feature partner work, jitt moves, aerials,
              and the kind of moments wedding photographers will thank you for.
              We can also stay after the routine to dance socially with guests.
            </p>
          </Block>

          <Block title="What kinds of events">
            <ul className="space-y-2 list-disc pl-5">
              <li>Wedding receptions (one of our most common bookings)</li>
              <li>Corporate events, client dinners, and gala-style fundraisers</li>
              <li>Festivals, fairs, and rodeo entertainment slots</li>
              <li>Music videos and press appearances</li>
              <li>Private parties</li>
            </ul>
          </Block>

          <Block title="How far in advance">
            <p>
              We recommend at least 2–3 months of notice. For larger events
              (200+ guests) or specific venues, 4–6 months is ideal so we can
              poll the team properly and lock in a strong roster.
            </p>
            <p>
              If you have a quick-turnaround request, mark it as &ldquo;quick
              answer needed&rdquo; on the form — we&apos;ll prioritize it.
            </p>
          </Block>

          <Block title="Donations">
            <p>
              We&apos;re a student organization, not a commercial booking
              service. We accept donations rather than charging fees. The
              request form lets you indicate what your organization is
              comfortable with ($250, $500, $750, $1,000, Other, or Not at this
              time). Donations help fund team activities — travel, costumes,
              recruiting, banquet.
            </p>
          </Block>

          <Block title="Logistics we&apos;ll handle">
            <p>
              Travel, costuming, music, and choreography are all on us. If
              you&apos;ve seen a routine of ours you specifically want, mention
              it in the request notes and we&apos;ll do our best.
            </p>
          </Block>

          <div className="card-padded bg-maroon-700 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-cream-200 font-semibold">Ready?</p>
            <h3 className="mt-3 font-serif text-3xl font-semibold">Submit a performance request.</h3>
            <p className="mt-3 text-cream-200/85">
              The performance officer reviews requests within a few days and replies personally.
            </p>
            <Link href="/performance-request" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-maroon-800 font-medium hover:bg-cream-100 transition-colors">
              Request a performance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-ink-soft">{children}</div>
    </section>
  );
}
