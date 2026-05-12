import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { FAQS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Aggie Wranglers lessons, tryouts, and performances.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  const grouped = FAQS.reduce<Record<string, typeof FAQS>>((acc, q) => {
    (acc[q.category] ||= []).push(q);
    return acc;
  }, {});

  return (
    <SiteShell>
      {/* FAQPage structured data for SEO */}
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
      <section className="section-sm">
        <div className="container-content max-w-3xl">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-12">
              <h2 className="font-serif text-2xl font-semibold mb-6">{category}</h2>
              <dl className="divide-y divide-line">
                {items.sort((a, b) => a.display_order - b.display_order).map(q => (
                  <div key={q.id} className="py-6">
                    <dt className="font-medium text-lg text-ink">{q.question}</dt>
                    <dd className="mt-2 text-ink-soft">{q.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
