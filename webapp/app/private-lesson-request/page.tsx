import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PrivateLessonForm } from "./form";

export const metadata: Metadata = {
  title: "Request a private lesson",
  description:
    "Private country-western dance lessons from Aggie Wranglers instructors. Perfect for wedding first dances, couples, and small groups. Submit a request to get started.",
  alternates: { canonical: "/private-lesson-request" },
};

export default function PrivateLessonRequestPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Private lessons"
        title="Personalized country-western instruction."
        description="One-on-one or small group. Common reasons: a wedding first dance, an event coming up, or just wanting to get better than the public class can take you. Tell us what you need."
      />
      <section className="section-sm">
        <div className="container-content max-w-3xl">
          <PrivateLessonForm />
        </div>
      </section>
    </SiteShell>
  );
}
