import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { MerchStoreLink } from "./view";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "Aggie Wranglers official merch — shirts, hats, and more.",
  alternates: { canonical: "/merchandise" },
};

export default function MerchPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Merchandise"
        title="Official Wranglers merch."
        description="Team t-shirts ($25) and event-specific gear — including the Rustic 1984, AW Dance Lessons, and Disco Ball designs."
      />
      <section className="section-sm">
        <div className="container-content max-w-2xl text-center">
          <p className="text-lg text-ink-soft">
            Merch is sold through the university&apos;s official Marketplace store. Click through to browse.
          </p>
          <MerchStoreLink />
          <p className="mt-8 text-sm text-ink-faint">
            Proceeds support the team&apos;s operating budget and travel.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
