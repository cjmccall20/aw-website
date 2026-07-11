"use client";

import { useStore } from "@/lib/store";

export function FAQView() {
  const db = useStore();
  const grouped = db.faqs.reduce<Record<string, typeof db.faqs>>((acc, q) => {
    (acc[q.category] ||= []).push(q);
    return acc;
  }, {});

  return (
    <section className="section-sm">
      <div className="container-content max-w-3xl">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-6">{category}</h2>
            <dl className="divide-y divide-line">
              {[...items].sort((a, b) => a.display_order - b.display_order).map(q => (
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
  );
}
