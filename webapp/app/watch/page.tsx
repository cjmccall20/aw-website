import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { VIDEOS } from "@/lib/mock-data";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Watch",
  description: "Watch Aggie Wranglers performances and music-video features. Midland, Randy Rogers Band, Ella Langley, and more.",
  alternates: { canonical: "/watch" },
};

export default function WatchPage() {
  const categories = ["Top Routines", "Music Videos", "Behind the Scenes"] as const;
  const byCategory = (c: typeof categories[number]) =>
    VIDEOS.filter(v => v.category === c).sort((a, b) => a.display_order - b.display_order);

  return (
    <SiteShell>
      {/* VideoObject structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": VIDEOS.map(v => ({
              "@type": "VideoObject",
              name: v.title_override,
              embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube_id}`,
              uploadDate: "2024-01-01",
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

      <section className="section-sm space-y-16">
        {categories.map(category => (
          <div key={category} className="container-content">
            <h2 className="font-serif text-3xl font-semibold">{category}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {byCategory(category).map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        ))}
      </section>

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

function VideoCard({ video }: { video: typeof VIDEOS[0] }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="aspect-video relative overflow-hidden rounded-xl bg-maroon-900 shadow-soft group-hover:shadow-lifted transition-shadow">
        <img
          src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-white/95 group-hover:bg-white flex items-center justify-center transition-colors shadow-lifted">
            <Play className="h-6 w-6 text-maroon-700 fill-maroon-700 ml-0.5" />
          </div>
        </div>
      </div>
      <p className="mt-3 font-medium text-ink group-hover:text-maroon-700 transition-colors">{video.title_override}</p>
      {video.source_artist && (
        <p className="text-sm text-ink-faint">{video.source_artist}</p>
      )}
    </a>
  );
}
