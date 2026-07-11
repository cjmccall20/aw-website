import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/utils";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { Heart, Users, Music, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Private Lessons",
  description:
    "Private country-western dance lessons from Aggie Wranglers instructors. Wedding first dances, couples, small groups.",
  alternates: { canonical: "/private-lessons" },
};

export default function PrivateLessonsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Private lessons"
        title="One-on-one instruction from working performers."
        description="Whether you're prepping for your wedding's first dance, a couples date night, or just trying to actually learn this — we'll meet you where you are."
      />
      <section className="container-content -mt-8 sm:-mt-10 relative z-10">
        <div className="relative aspect-[3/1] rounded-2xl overflow-hidden shadow-lifted">
          <Image
            src={assetPath("/images/couple-portrait.jpg")}
            alt="A Wrangler couple in uniform among the columns of the Administration Building"
            fill sizes="(min-width: 1180px) 1116px, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
      </section>
      <section className="section">
        <div className="container-content grid lg:grid-cols-3 gap-6">
          <Feature
            icon={<Heart className="h-6 w-6" />}
            title="Wedding first dance"
            description="The single most common request. We'll help you choose a style that fits your song, then build a routine you can pull off without it feeling memorized."
          />
          <Feature
            icon={<Users className="h-6 w-6" />}
            title="Couples + small groups"
            description="Practice with a partner — or with friends — in a relaxed setting. We can pace it to weekly sessions or a focused crash course."
          />
          <Feature
            icon={<Music className="h-6 w-6" />}
            title="Style focus"
            description="Two-step, jitterbug, polka, waltz, country swing. We'll help you figure out which one fits the song or vibe you have in mind."
          />
        </div>

        <div className="container-content mt-16 text-center">
          <Link href="/private-lesson-request" className="btn-primary btn-lg">
            Request a private lesson <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-padded">
      <div className="h-12 w-12 rounded-full bg-maroon-50 text-maroon-700 flex items-center justify-center">{icon}</div>
      <h2 className="mt-5 font-serif text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-ink-soft">{description}</p>
    </div>
  );
}
