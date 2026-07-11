import type { Metadata } from "next";
import Image from "next/image";
import { assetPath } from "@/lib/utils";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { MeetTheTeamView } from "./view";

export const metadata: Metadata = {
  title: "Meet the Team",
  description: "The current members of the Aggie Wranglers.",
  alternates: { canonical: "/meet-the-team" },
};

export default function MeetTheTeamPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="The team"
        title="Meet the Wranglers."
        description="Roughly eighteen students, chosen each spring. The officer slate plus the dancers who make every performance happen."
      />
      <section className="container-content -mt-8 sm:-mt-10 relative z-10">
        <div className="relative aspect-[5/2] rounded-2xl overflow-hidden shadow-lifted">
          <Image
            src={assetPath("/images/team-steps-formation.jpg")}
            alt="The Aggie Wranglers in formation on the Administration Building steps — shoulder sits, cradle lifts, and dips"
            fill sizes="(min-width: 1180px) 1116px, 100vw"
            className="object-cover"
          />
        </div>
        <p className="mt-2 text-xs text-ink-faint text-right">Demo roster below uses placeholder names — the portal&apos;s Members tab drives this grid.</p>
      </section>
      <MeetTheTeamView />
    </SiteShell>
  );
}
