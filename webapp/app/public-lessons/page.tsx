import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { NotifyForm } from "@/components/notify-form";
import { PUBLIC_LESSONS, MEMBERS, byId } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Clock, MapPin, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Public Lessons",
  description:
    "Weekly country-western dance classes from the Aggie Wranglers. Two-step, jitterbug, polka, and more. No partner needed, no experience required.",
  alternates: { canonical: "/public-lessons" },
};

export default function PublicLessonsPage() {
  const visible = PUBLIC_LESSONS.filter(l => l.visible_to_public && l.active);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Public Lessons"
        title="Learn to country-western dance with the team that performs."
        description="Drop-in weekly classes taught by current Aggie Wranglers members. No partner needed. No prior dance experience required."
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
          <span>{lesson.start_time} – {lesson.end_time} <span className="text-ink-faint">CT</span></span>
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

      <div className="mt-5 pt-5 border-t border-line">
        <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">Dates</p>
        <p className="mt-1.5 text-sm text-ink">
          {lesson.dates.slice(0, 6).map(d => formatDate(d, { month: "short", day: "numeric" })).join(" · ")}
        </p>
      </div>

      <a
        href={lesson.signup_url ?? "#"}
        className="mt-6 btn-primary w-full justify-center"
      >
        Sign up
      </a>
    </article>
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
          <dd className="mt-1 text-ink-soft text-sm">Nope. We rotate partners through every class.</dd>
        </div>
        <div>
          <dt className="font-medium">Do I need to know how to dance?</dt>
          <dd className="mt-1 text-ink-soft text-sm">No prior experience required. Beginner classes start from zero.</dd>
        </div>
        <div>
          <dt className="font-medium">What should I wear?</dt>
          <dd className="mt-1 text-ink-soft text-sm">Comfortable clothes you can move in. Smooth-soled shoes help; boots are great but not required.</dd>
        </div>
      </dl>
    </div>
  );
}

