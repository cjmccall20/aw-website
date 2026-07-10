"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, MapPin, Calendar, Quote, Megaphone } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { useStore } from "@/lib/store";
import { formatDate, formatClock, assetPath } from "@/lib/utils";
import type { PublicLesson } from "@/lib/types";

export function HomeView() {
  const db = useStore();
  const activeTryout = db.tryoutCycles.find(t => t.active);
  const nextLesson = db.publicLessons.find(l => l.visible_to_public && l.active);
  const featuredVideo = db.videos.find(v => v.featured);

  return (
    <SiteShell>
      {db.siteContent.announcement_active && db.siteContent.announcement_text && (
        <AnnouncementBanner text={db.siteContent.announcement_text} link={db.siteContent.announcement_link} />
      )}
      <Hero
        hasActiveTryout={!!activeTryout}
        headlineTop={db.siteContent.hero_headline_top}
        headlineAccent={db.siteContent.hero_headline_accent}
        subhead={db.siteContent.hero_subhead}
      />
      <CTAGrid />
      {nextLesson && <NextLessonStrip lesson={nextLesson} />}
      {featuredVideo && <FeaturedVideo videoId={featuredVideo.youtube_id} title={featuredVideo.title_override ?? ""} />}
      <PressStrip />
      <TestimonialBlock />
      <SponsorStrip />
    </SiteShell>
  );
}

function AnnouncementBanner({ text, link }: { text: string; link?: string }) {
  const inner = (
    <div className="container-content py-2.5 flex items-center gap-3 text-sm font-medium">
      <Megaphone className="h-4 w-4 flex-shrink-0" />
      <span data-testid="announcement-banner">{text}</span>
      {link && <ArrowRight className="h-4 w-4 flex-shrink-0" />}
    </div>
  );
  return (
    <div className="bg-maroon-700 text-white">
      {link ? <Link href={link} className="block hover:bg-maroon-800 transition-colors">{inner}</Link> : inner}
    </div>
  );
}

function Hero({ hasActiveTryout, headlineTop, headlineAccent, subhead }: {
  hasActiveTryout: boolean;
  headlineTop: string;
  headlineAccent: string;
  subhead: string;
}) {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="container-content pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 max-w-3xl">
            <p className="eyebrow animate-fade-in">Texas A&amp;M&apos;s country-western dance team · est. 1984</p>
            <h1 className="mt-5 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-balance animate-slide-up">
              {headlineTop}<br />
              <span className="text-maroon-700">{headlineAccent}</span>
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-ink-soft max-w-2xl text-pretty animate-slide-up" style={{ animationDelay: "0.05s" }}>
              {subhead}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <Link href="/public-lessons" className="btn-primary btn-lg">
                Sign up for lessons <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/performance-request" className="btn-secondary btn-lg">
                Request the team for an event
              </Link>
            </div>

            {hasActiveTryout && (
              <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 bg-maroon-700 text-white rounded-full text-sm font-medium shadow-soft animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <Sparkles className="h-4 w-4" />
                Tryouts are coming — <Link href="/requirements" className="underline underline-offset-2 font-semibold">see details</Link>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lifted rotate-1">
              <Image
                src={assetPath("/images/hero-performance.jpg")}
                alt="An Aggie Wrangler lifted high on her partner's shoulder mid-performance, couples spinning behind them"
                fill sizes="(min-width: 1024px) 450px, 0px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTAGrid() {
  const ctas: { label: string; href: string; eyebrow: string; description: string; tone: "primary" | "default" }[] = [
    { label: "Sign up for public lessons", href: "/public-lessons", eyebrow: "Most popular", description: "4-week sessions, $60/couple. We teach ~3,000 people a year.", tone: "primary" },
    { label: "Tryouts info", href: "/requirements", eyebrow: "Each spring", description: "Join the team. Open to all TAMU students.", tone: "default" },
    { label: "Book the team", href: "/performance-request", eyebrow: "Events", description: "Wedding, gala, festival, fundraiser — request a performance.", tone: "default" },
    { label: "Private lessons", href: "/private-lesson-request", eyebrow: "Couples + groups", description: "Personalized instruction — first-dance, social, prep.", tone: "default" },
  ];

  return (
    <section className="section-sm">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ctas.map(c => (
            <Link
              key={c.href}
              href={c.href}
              className={
                c.tone === "primary"
                  ? "group relative overflow-hidden rounded-2xl bg-maroon-700 text-white p-7 hover:bg-maroon-800 transition-colors shadow-soft hover:shadow-lifted"
                  : "group card-interactive p-7"
              }
            >
              <p className={c.tone === "primary" ? "text-xs font-semibold uppercase tracking-[0.18em] text-cream-200" : "eyebrow"}>{c.eyebrow}</p>
              <h2 className={c.tone === "primary" ? "mt-4 font-serif text-2xl font-semibold leading-snug text-white" : "mt-4 font-serif text-2xl font-semibold leading-snug text-ink"}>{c.label}</h2>
              <p className={c.tone === "primary" ? "mt-2 text-sm text-cream-200/85" : "mt-2 text-sm text-ink-soft"}>{c.description}</p>
              <ArrowRight className={c.tone === "primary" ? "mt-6 h-5 w-5 text-cream-200 group-hover:translate-x-1 transition-transform" : "mt-6 h-5 w-5 text-maroon-700 group-hover:translate-x-1 transition-transform"} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function NextLessonStrip({ lesson }: { lesson: PublicLesson }) {
  return (
    <section className="section-sm">
      <div className="container-content">
        <div className="card-padded flex flex-col md:flex-row md:items-center gap-6 md:gap-10 bg-gradient-to-br from-cream-100 to-cream-200 border-line-strong">
          <div className="flex-1">
            <p className="eyebrow">Next public class</p>
            <p className="mt-2 font-serif text-3xl font-semibold">{lesson.class_name} <span className="text-ink-faint">·</span> <span className="text-ink-soft font-medium text-2xl">{lesson.level}</span></p>
            <p className="mt-2 text-ink-soft flex items-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4 inline" /> {lesson.day}s, {formatClock(lesson.start_time)} – {formatClock(lesson.end_time)} CT
              <span className="text-line-strong">·</span>
              <MapPin className="h-4 w-4 inline" /> Practice space, College Station
              {lesson.price_per_couple && (
                <>
                  <span className="text-line-strong">·</span>
                  <span className="font-medium text-ink">${lesson.price_per_couple}/couple</span>
                </>
              )}
            </p>
            <p className="mt-3 text-sm text-ink-soft">Upcoming dates: {lesson.dates.slice(0, 4).map(d => formatDate(d, { month: "short", day: "numeric" })).join(" · ")}</p>
          </div>
          <Link href="/public-lessons" className="btn-primary btn-lg flex-shrink-0">View schedule</Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedVideo({ videoId, title }: { videoId: string; title: string }) {
  return (
    <section className="section">
      <div className="container-content">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow">Watch</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">We get pulled into music videos.</h2>
            <p className="mt-5 text-lg text-ink-soft">
              Midland. Randy Rogers Band. Ella Langley. When a country act needs
              dancers who actually know what they&apos;re doing, we&apos;re the call.
            </p>
            <Link href="/watch" className="mt-7 btn-secondary inline-flex">
              See all videos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-video rounded-2xl overflow-hidden bg-maroon-900 shadow-lifted relative">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PressStrip() {
  const items = [
    { artist: "Midland", song: "Burn Out" },
    { artist: "Randy Rogers Band", song: "I'll Never Get Over You" },
    { artist: "Ella Langley", song: "Choosin' Texas" },
  ];
  return (
    <section className="bg-cream-200/60 border-y border-line">
      <div className="container-content py-10 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <p className="eyebrow flex-shrink-0">Featured in music videos by</p>
          <div className="flex-1 flex flex-wrap gap-x-10 gap-y-3">
            {items.map(i => (
              <span key={i.artist} className="text-ink font-serif text-xl">
                {i.artist} <span className="text-ink-faint italic text-lg">— {i.song}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialBlock() {
  return (
    <section className="section">
      <div className="container-content">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-10 w-10 text-maroon-700 mx-auto" />
          <blockquote className="mt-6 font-serif text-3xl sm:text-4xl leading-tight font-medium text-balance text-ink">
            &ldquo;The Wranglers turned a 200-person wedding into something
            everyone is still talking about a year later. Worth every minute
            of planning.&rdquo;
          </blockquote>
          <p className="mt-8 text-sm uppercase tracking-[0.18em] text-ink-faint">Linda W. <span className="text-ink-muted">·</span> Stevens Gala Events</p>
        </div>
      </div>
    </section>
  );
}

function SponsorStrip() {
  const db = useStore();
  const sponsors = db.sponsors.filter(s => s.active).sort((a, b) => a.display_order - b.display_order);
  return (
    <section className="bg-cream-200/60 border-t border-line">
      <div className="container-content py-12">
        <p className="eyebrow text-center">Proudly supported by</p>
        <div className="mt-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {sponsors.map(s => (
            <a
              key={s.id}
              href={s.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-xl text-ink-soft hover:text-ink transition-colors"
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
