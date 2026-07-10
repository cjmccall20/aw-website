import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { BanquetView } from "./view";

export const metadata: Metadata = {
  title: "Banquet",
  description: "The Aggie Wranglers annual banquet — current and alumni members celebrate the year.",
  alternates: { canonical: "/banquet" },
};

export default function BanquetPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Annual celebration"
        title="The Wranglers banquet."
        description="Every spring, current members and alumni come together for a night of food, dance, awards, and stories. The most-anticipated event of the team year."
      />
      <BanquetView />
    </SiteShell>
  );
}
