import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PerformanceRequestForm } from "./form";

export const metadata: Metadata = {
  title: "Request a performance",
  description:
    "Book the Aggie Wranglers for your wedding, gala, festival, or corporate event. Submit a request and the team's performance officer will follow up.",
  alternates: { canonical: "/performance-request" },
};

export default function PerformanceRequestPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Performance booking"
        title="Bring the Aggie Wranglers to your event."
        description="We perform at weddings, galas, festivals, fundraisers, corporate events, and music videos. Tell us about your event and we'll be in touch within a few days."
      />
      <section className="section-sm">
        <div className="container-content max-w-3xl">
          <PerformanceRequestForm />
          <div className="mt-12 prose prose-sm max-w-none text-ink-soft">
            <h2 className="font-serif text-2xl text-ink not-prose mb-3">What happens next</h2>
            <ol className="space-y-2">
              <li>The performance officer reviews your request within a few days.</li>
              <li>If your date fits, we add it to the next weekly team availability survey.</li>
              <li>After the survey closes, the officer either confirms or declines and sends a personalized reply.</li>
              <li>For confirmed performances, we&apos;ll send call time, logistics, and a calendar invite.</li>
            </ol>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
