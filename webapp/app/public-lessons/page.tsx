import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { NotifyForm } from "@/components/notify-form";
import { PUBLIC_LESSONS, MEMBERS, byId } from "@/lib/mock-data";
import { formatDate, formatClock } from "@/lib/utils";
import { Clock, MapPin, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Public Lessons",
  description:
    "Country-western dance classes from the Aggie Wranglers — two-step, waltz, polka, and jitterbug. $60 per couple for a four-week session. We teach ~3,000 people a year.",
  alternates: { canonical: "/public-lessons" },
};

export default function PublicLessonsPage() {
  const visible = PUBLIC_LESSONS.filter(l => l.visible_to_public && l.active);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Public Lessons"
        title="Learn to country-western dance with the team that performs."
        description="Four-week sessions taught by current Aggie Wranglers, six times a year. We teach around 3,000 people annually — no prior dance experience required. Lessons are couple-based, so bring a partner (or let us help you find one below)."
      />

      <section className="section-sm">
        <div className="container-content">
          {visible.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {visible.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <NoLessonsCard />
          )}

          <PartnerSearchCard />

          <div className="mt-12 max-w-2xl">
            <NotifyForm listKey="public_lessons" />
          </div>

          <FAQNote />
        </div>
      </section>
    </SiteShell>
  );
}

function LessonCard({ lesson }: { lesson: typeof PUBLIC_LESSONS[0] }) {
  const instructors = lesson.instructor_ids
    .map(id => byId(MEMBERS, id)?.name)
    .filter(Boolean);

  return (
    <article className="card-padded">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold leading-snug">{lesson.class_name}</h2>
          <p className="mt-1 text-sm text-maroon-700 font-medium">{lesson.level}</p>
        </div>
        <span className="pill-maroon">{lesson.day}s</span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm">
        <div className="flex items-center gap-2 text-ink-soft">
          <Clock className="h-4 w-4 text-ink-faint" />
          <span>{formatClock(lesson.start_time)} – {formatClock(lesson.end_time)} <span className="text-ink-faint">CT</span></span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <MapPin className="h-4 w-4 text-ink-faint" />
          <span>Practice space, College Station</span>
        </div>
        <div className="flex items-start gap-2 text-ink-soft">
          <Users className="h-4 w-4 text-ink-faint mt-0.5" />
          <span>Taught by {instructors.join(", ")}</span>
        </div>
      </dl>

      {lesson.notes && (
        <p className="mt-4 text-sm text-ink-soft italic">{lesson.notes}</p>
      )}

      <div className="mt-5 pt-5 border-t border-line flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">Dates</p>
          <p className="mt-1.5 text-sm text-ink">
            {lesson.dates.slice(0, 6).map(d => formatDate(d, { month: "short", day: "numeric" })).join(" · ")}
          </p>
        </div>
        {lesson.price_per_couple && (
          <div className="text-right">
            <p className="font-serif text-2xl font-semibold text-ink">${lesson.price_per_couple}</p>
            <p className="text-xs text-ink-faint">per couple · all {lesson.dates.length} weeks</p>
          </div>
        )}
      </div>

      <a
        href={lesson.signup_url ?? "#"}
        target="_blank" rel="noopener noreferrer"
        className="mt-6 btn-primary w-full justify-center"
      >
        Sign up
      </a>
    </article>
  );
}

function PartnerSearchCard() {
  return (
    <div className="mt-10 card-padded bg-gradient-to-br from-maroon-50 to-cream-200 border-maroon-200 max-w-2xl">
      <h3 className="font-serif text-2xl font-semibold">Need a partner?</h3>
      <p className="mt-3 text-ink-soft text-sm">
        Lessons are couple-based, but plenty of people sign up solo and get
        matched. Follow{" "}
        <a href="https://instagram.com/AW_DancePartnerSearch" target="_blank" rel="noopener noreferrer" className="text-maroon-700 font-medium hover:underline">
          @AW_DancePartnerSearch
        </a>{" "}
        on Instagram or submit the partner-search form and we&apos;ll help you
        find another solo dancer before the session starts.
      </p>
      <p className="mt-3 text-xs text-ink-faint">
        Heads up: if a match doesn&apos;t work out, session fees aren&apos;t refundable — so start the search early.
      </p>
    </div>
  );
}

function NoLessonsCard() {
  return (
    <div className="card-padded text-center max-w-2xl mx-auto">
      <h2 className="font-serif text-2xl font-semibold">No public lessons currently scheduled</h2>
      <p className="mt-3 text-ink-soft">
        We&apos;re between sessions. Sign up below and we&apos;ll email you the
        moment the next round is announced.
      </p>
    </div>
  );
}

function FAQNote() {
  return (
    <div className="mt-16 pt-16 border-t border-line max-w-2xl">
      <h3 className="font-serif text-2xl font-semibold">Common questions</h3>
      <dl className="mt-6 space-y-6">
        <div>
          <dt className="font-medium">Do I need a partner?</dt>
          <dd className="mt-1 text-ink-soft text-sm">Yes — classes are couple-based, so sign up with a partner. Solo? Use the partner search above and we&apos;ll help you find a match.</dd>
        </div>
        <div>
          <dt className="font-medium">Do I need to know how to dance?</dt>
          <dd className="mt-1 text-ink-soft text-sm">No prior experience required. Level-1 classes start from zero, and every move is challenge-by-choice.</dd>
        </div>
        <div>
          <dt className="font-medium">What if we miss a week?</dt>
          <dd className="mt-1 text-ink-soft text-sm">Come 30 minutes before or after the next class for a free make-up, or bring a substitute partner for a $30 fee.</dd>
        </div>
        <div>
          <dt className="font-medium">What should I wear?</dt>
          <dd className="mt-1 text-ink-soft text-sm">Comfortable clothes you can move in and closed-toe shoes — boots are great but not required. For jitterbug, skip low-cut tops and skirts (you&apos;ll be upside down).</dd>
        </div>
      </dl>
    </div>
  );
}

