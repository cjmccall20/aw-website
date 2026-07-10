import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { NotifyForm } from "@/components/notify-form";
import { TRYOUT_CYCLES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Tryouts",
  description:
    "Tryouts for the Aggie Wranglers happen every spring. Open to all Texas A&M students — you try out with a partner, and the process includes prep events, a dancing portion, and an interview.",
  alternates: { canonical: "/requirements" },
};

export default function RequirementsPage() {
  const active = TRYOUT_CYCLES.find(t => t.active);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Tryouts"
        title="Want to join the team?"
        description="Tryouts happen each spring. We bring on new members through a multi-week process — an informational meeting, mock tryouts, and the real thing in April — so you're not walking in cold."
      />

      <section className="section-sm">
        <div className="container-content grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {active ? (
              <ActiveTryoutCard cycle={active} />
            ) : (
              <NoCyclesCard />
            )}

            <WhatToExpect />
            <Eligibility />
          </div>

          <aside className="space-y-6">
            <NotifyForm listKey="tryouts" />
            <div className="card-padded">
              <p className="eyebrow">Already came to a class?</p>
              <p className="mt-3 text-sm text-ink-soft">
                Coming to public lessons is one of the best ways to prepare for
                tryouts. You&apos;ll meet members of the team and start getting
                comfortable with the basics.
              </p>
              <Link href="/public-lessons" className="mt-4 btn-secondary text-sm">See public lessons</Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function ActiveTryoutCard({ cycle }: { cycle: typeof TRYOUT_CYCLES[0] }) {
  return (
    <article className="card-padded bg-gradient-to-br from-maroon-50 to-cream-200 border-maroon-200">
      <div className="flex items-center gap-2 text-maroon-700">
        <Sparkles className="h-5 w-5" />
        <p className="eyebrow text-maroon-800">Currently open</p>
      </div>
      <h2 className="mt-3 font-serif text-3xl font-semibold">{cycle.cycle_name}</h2>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="label">Tryout date</dt>
          <dd className="flex items-center gap-2 text-ink">
            <Calendar className="h-4 w-4 text-maroon-700" />
            <span className="font-medium">{formatDate(cycle.tryout_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          </dd>
        </div>
        <div>
          <dt className="label">Prep events (info meeting + mock tryouts)</dt>
          <dd className="text-ink-soft">
            {cycle.prep_lesson_dates.map(d => formatDate(d, { month: "short", day: "numeric", year: "numeric" })).join(" · ")}
          </dd>
        </div>
        {cycle.eligibility_notes && (
          <div>
            <dt className="label">Notes</dt>
            <dd className="text-ink-soft">{cycle.eligibility_notes}</dd>
          </div>
        )}
      </dl>

      <a href={cycle.signup_url ?? "#"} className="mt-7 btn-primary">Sign up for tryouts</a>
    </article>
  );
}

function NoCyclesCard() {
  return (
    <div className="card-padded">
      <h2 className="font-serif text-2xl font-semibold">No tryout cycle currently scheduled</h2>
      <p className="mt-3 text-ink-soft">
        We&apos;re between cycles. Sign up for tryout updates to your right and
        you&apos;ll be first to know when the next round opens.
      </p>
    </div>
  );
}

function WhatToExpect() {
  const steps = [
    { title: "Come to the informational meeting", description: "Early in the spring semester at the practice space. Meet the team, hear how the process works, ask anything." },
    { title: "Find a partner and practice", description: "You try out as a couple. Come to public lessons and the mock tryouts — we run through exactly what we'll evaluate so nobody walks in cold." },
    { title: "Tryout day (April)", description: "A dancing portion judged on creativity and technique, then an interview portion. We care about who you are as much as how you dance." },
    { title: "Decisions within a week", description: "We contact everyone who tries out, whether selected or not." },
  ];
  return (
    <section>
      <h2 className="font-serif text-3xl font-semibold">What to expect</h2>
      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-maroon-700 text-white text-sm font-semibold flex items-center justify-center">{i + 1}</div>
            <div>
              <p className="font-medium text-ink">{s.title}</p>
              <p className="text-sm text-ink-soft mt-0.5">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Eligibility() {
  const reqs = [
    "Currently enrolled Texas A&M student in good standing",
    "A tryout partner (you audition as a couple)",
    "Available for weekly practices and weekend performances",
    "Comfortable being part of a team that travels for events",
  ];
  return (
    <section>
      <h2 className="font-serif text-3xl font-semibold">Eligibility</h2>
      <ul className="mt-6 space-y-3">
        {reqs.map(r => (
          <li key={r} className="flex gap-3 text-ink">
            <CheckCircle2 className="h-5 w-5 text-maroon-700 flex-shrink-0 mt-0.5" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-ink-soft">
        No dance experience required. Many of our best members joined with zero background.
      </p>
    </section>
  );
}
