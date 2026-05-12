import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "Aggie Wranglers official merch — shirts, hats, and more.",
  alternates: { canonical: "/merchandise" },
};

const STORE_URL = "https://teespring.com";

export default function MerchPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Merchandise"
        title="Official Wranglers merch."
        description="Shirts, hats, and event-specific gear. All orders ship from our partner store."
      />
      <section className="section-sm">
        <div className="container-content max-w-2xl text-center">
          <p className="text-lg text-ink-soft">
            Our merch lives on our external store. Click through to browse.
          </p>
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="mt-8 btn-primary btn-lg inline-flex">
            Visit the merch store →
          </a>
          <p className="mt-8 text-sm text-ink-faint">
            Proceeds support the team&apos;s operating budget and travel.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
