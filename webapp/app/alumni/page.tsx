import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Aggie Wranglers alumni — once a Wrangler, always a Wrangler.",
  alternates: { canonical: "/alumni" },
};

export default function AlumniPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Once a Wrangler, always a Wrangler"
        title="Alumni network."
        description="Four-plus decades of Wranglers across Texas, the country, and the world. The alumni directory itself lives in the team portal — sign in to access it."
      />

      <section className="section-sm">
        <div className="container-content max-w-3xl space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold">For alumni</h2>
            <p className="mt-4 text-ink-soft">
              The full alumni directory is now in the team portal, with searchable
              graduation year and current city, plus contact preferences you control.
              If you graduated before the portal existed and need access, sign in
              and follow the alumni self-registration flow — current officers will
              verify and grant access.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="/portal" className="btn-primary">Alumni portal sign-in</Link>
              <Link href="/portal" className="btn-secondary">Self-register</Link>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl font-semibold">For current students</h2>
            <p className="mt-4 text-ink-soft">
              Curious about life after the Wranglers? Alumni have gone on to
              careers in medicine, law, ranching, music, tech, education,
              ministry, you name it. The directory shows you where everyone
              landed and how to reach out.
            </p>
          </div>

          <div className="card-padded">
            <p className="eyebrow">Reunion</p>
            <p className="mt-3 font-serif text-2xl">Annual banquet is the canonical reunion.</p>
            <p className="mt-3 text-ink-soft">
              We invite alumni back every spring. Check the banquet page for the
              current year&apos;s date and registration.
            </p>
            <Link href="/banquet" className="mt-4 btn-ghost text-sm">Banquet info →</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
