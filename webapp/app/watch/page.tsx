import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { VIDEOS } from "@/lib/mock-data";
import { WatchView } from "./view";

export const metadata: Metadata = {
  title: "Watch",
  description: "Watch Aggie Wranglers performances and music-video features. Midland, Randy Rogers Band, Ella Langley, and more.",
  alternates: { canonical: "/watch" },
};

export default function WatchPage() {
  return (
    <SiteShell>
      {/* VideoObject structured data for SEO — rendered from the seed catalog at build time */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": VIDEOS.map(v => ({
              "@type": "VideoObject",
              name: v.title_override,
              embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube_id}`,
              thumbnailUrl: `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`,
              publisher: { "@type": "Organization", name: "Aggie Wranglers" },
            })),
          }),
        }}
      />

      <PageHeader
        eyebrow="Watch"
        title="The Wranglers, in motion."
        description="A selection of full routines, music-video features, and behind-the-scenes moments. New videos added as we capture them."
      />

      <WatchView />

      <section className="bg-maroon-900 text-cream-200 py-20">
        <div className="container-content max-w-2xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-white">Want to dance like this?</h2>
          <p className="mt-4 text-cream-200/85">It starts with one weekly class.</p>
          <Link href="/public-lessons" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-maroon-800 font-medium hover:bg-cream-100 transition-colors">
            See public lessons
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
