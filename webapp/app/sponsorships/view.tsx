"use client";

import { useStore } from "@/lib/store";

const TIERS = ["Presenting", "Supporting", "Friends"] as const;

export function SponsorTiers() {
  const db = useStore();
  const byTier = (t: typeof TIERS[number]) =>
    db.sponsors.filter(s => s.active && s.tier === t).sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      <h2 className="font-serif text-3xl font-semibold">Current sponsors</h2>
      <div className="mt-8 space-y-10">
        {TIERS.map(tier => (
          <div key={tier}>
            <p className="eyebrow">{tier}</p>
            <ul className="mt-3 flex flex-wrap gap-x-10 gap-y-3">
              {byTier(tier).map(s => (
                <li key={s.id}>
                  <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="font-serif text-xl text-ink hover:text-maroon-700 transition-colors">
                    {s.name}
                  </a>
                </li>
              ))}
              {byTier(tier).length === 0 && <li className="text-ink-faint italic text-sm">Spots open at this tier.</li>}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
