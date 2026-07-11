import type { Metadata } from "next";
import Image from "next/image";
import { assetPath } from "@/lib/utils";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PublicLessonsView } from "./view";

export const metadata: Metadata = {
  title: "Public Lessons",
  description:
    "Country-western dance classes from the Aggie Wranglers — two-step, waltz, polka, and jitterbug. $60 per couple for a four-week session. We teach ~3,000 people a year.",
  alternates: { canonical: "/public-lessons" },
};

export default function PublicLessonsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Public Lessons"
        title="Learn to country-western dance with the team that performs."
        description="Four-week sessions taught by current Aggie Wranglers, six times a year. We teach around 3,000 people annually — no prior dance experience required. Lessons are couple-based, so bring a partner (or let us help you find one below)."
      />
      <section className="container-content -mt-8 sm:-mt-10 relative z-10">
        <div className="relative aspect-[3/1] rounded-2xl overflow-hidden shadow-lifted">
          <Image
            src={assetPath("/images/lessons-class.jpg")}
            alt="A public lesson class of about thirty students posing in the practice studio"
            fill sizes="(min-width: 1180px) 1116px, 100vw"
            className="object-cover"
          />
        </div>
      </section>
      <PublicLessonsView />
    </SiteShell>
  );
}
