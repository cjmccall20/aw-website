import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { RequirementsView } from "./view";

export const metadata: Metadata = {
  title: "Tryouts",
  description:
    "Tryouts for the Aggie Wranglers happen every spring. Open to all Texas A&M students — you try out with a partner, and the process includes prep events, a dancing portion, and an interview.",
  alternates: { canonical: "/requirements" },
};

export default function RequirementsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Tryouts"
        title="Want to join the team?"
        description="Tryouts happen each spring. We bring on new members through a multi-week process — an informational meeting, mock tryouts, and the real thing in April — so you're not walking in cold."
      />
      <RequirementsView />
    </SiteShell>
  );
}
