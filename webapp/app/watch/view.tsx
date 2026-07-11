"use client";

import { useStore } from "@/lib/store";
import { Play } from "lucide-react";
import type { Video } from "@/lib/types";

const CATEGORIES = ["Top Routines", "Music Videos", "Behind the Scenes"] as const;

export function WatchView() {
  const db = useStore();
  const byCategory = (c: typeof CATEGORIES[number]) =>
    db.videos.filter(v => v.category === c).sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="section-sm space-y-16">
      {CATEGORIES.map(category => {
        const vids = byCategory(category);
        if (vids.length === 0) return null;
        return (
          <div key={category} className="container-content">
            <h2 className="font-serif text-3xl font-semibold">{category}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vids.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="aspect-video relative overflow-hidden rounded-xl bg-maroon-900 shadow-soft group-hover:shadow-lifted transition-shadow">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail; static export ships images unoptimized anyway */}
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
