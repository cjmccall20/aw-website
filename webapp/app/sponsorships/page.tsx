import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { SponsorTiers } from "./view";

export const metadata: Metadata = {
  title: "Sponsorships",
  description: "Sponsor the Aggie Wranglers. Multiple tiers; meaningful brand alignment with one of Texas A&M's most beloved performance teams.",
  alternates: { canonical: "/sponsorships" },
};

export default function SponsorshipsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Sponsorships"
        title="Stand with the Wranglers."
        description="Sponsorships fund travel, costumes, recruiting, and the operational work of running a national-caliber student team. Multiple tiers; we'll find one that fits."
      />

      <section className="section-sm">
        <div className="container-content max-w-4xl">
          <SponsorTiers />

          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="card-padded">
              <h3 className="font-serif text-2xl font-semibold">Tax-deductible donations</h3>
              <p className="mt-3 text-ink-soft text-sm">
                Give through the Texas A&amp;M Foundation, a 501(c)(3) — donations
                are tax-deductible. Make checks payable to <strong className="text-ink">Texas A&amp;M
                Foundation</strong> with <strong className="text-ink">&ldquo;Aggie Wranglers — SOFC 954450&rdquo;</strong> in
                the memo line, and mail to:
              </p>
              <p className="mt-3 text-sm text-ink font-medium">
                125 John J. Koldus Student Services Building<br />
                College Station, TX 77843-1236
              </p>
            </div>
            <div className="card-padded bg-maroon-700 text-white">
              <h3 className="font-serif text-2xl font-semibold">Corporate &amp; private sponsorships</h3>
              <p className="mt-3 text-cream-200/85 text-sm">
                Sponsors fund specific needs — uniforms, travel, equipment — and
                get featured on this page and on specialty merch. Email{" "}
                <a href="mailto:vicepresident@wranglers.tamu.edu" className="underline">vicepresident@wranglers.tamu.edu</a>{" "}
                with your contact info and the kind of partnership you&apos;re
                imagining. We&apos;ll send the sponsorship deck and follow up to talk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
