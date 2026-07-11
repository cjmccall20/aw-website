import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the Aggie Wranglers handle the information you share with us.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Privacy" title="How we handle your information." />
      <section className="section-sm">
        <div className="container-content max-w-prose">
          <article className="prose prose-lg max-w-none text-ink-soft prose-headings:font-serif prose-headings:text-ink prose-strong:text-ink prose-a:text-maroon-700">
            <p>
              The Aggie Wranglers are a Recognized Student Organization at Texas
              A&amp;M University. The short version: we collect only what you give
              us, we use it only to run the team, and we don&apos;t sell it to anyone.
            </p>
            <h2>What we collect</h2>
            <ul>
              <li><strong>Request forms</strong> (performance, private lesson, contact): the contact and event details you enter, used to respond to and coordinate your request.</li>
              <li><strong>Notify lists</strong>: your email (and optional name), used only to send the announcements you signed up for. Every email includes a one-click unsubscribe.</li>
              <li><strong>Payments</strong>: handled by the university&apos;s Marketplace store (Flywire) — we never see or store card numbers.</li>
            </ul>
            <h2>What we don&apos;t do</h2>
            <ul>
              <li>No selling or sharing of your information outside the team.</li>
              <li>No advertising trackers or third-party ad cookies on this site.</li>
            </ul>
            <h2>Questions or removal requests</h2>
            <p>
              Email <a href="mailto:president@wranglers.tamu.edu">president@wranglers.tamu.edu</a>{" "}
              and we&apos;ll take care of it.
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
