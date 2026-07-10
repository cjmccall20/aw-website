import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { FAQS } from "@/lib/mock-data";
import { FAQView } from "./view";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Aggie Wranglers lessons, tryouts, and performances.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <SiteShell>
      {/* FAQPage structured data — from the seed catalog at build time */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(f => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      <PageHeader eyebrow="FAQ" title="Frequently asked questions." />
      <FAQView />
    </SiteShell>
  );
}
