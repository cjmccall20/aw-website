import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { MEMBERS } from "@/lib/mock-data";
import { initials, placeholderColor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meet the Team",
  description: "The current members of the Aggie Wranglers.",
  alternates: { canonical: "/meet-the-team" },
};

export default function MeetTheTeamPage() {
  const officers = MEMBERS.filter(m => m.role_title);
  const members = MEMBERS.filter(m => !m.role_title && m.status === "current");

  return (
    <SiteShell>
      <PageHeader
        eyebrow="The team"
        title="Meet the Wranglers."
        description={`${MEMBERS.filter(m => m.status === "current").length} current members. Officer slate plus the dancers who make every performance happen.`}
      />

      <section className="section-sm">
        <div className="container-content">
          <h2 className="font-serif text-2xl font-semibold">Officers</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {officers.map(m => <MemberCard key={m.id} member={m} showRole />)}
          </div>

          <h2 className="mt-16 font-serif text-2xl font-semibold">Members</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {members.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function MemberCard({ member, showRole }: { member: typeof MEMBERS[0]; showRole?: boolean }) {
  const color = placeholderColor(member.name);
  return (
    <article className="text-center group">
      <div
        className="aspect-square rounded-2xl flex items-center justify-center font-serif text-3xl font-semibold text-white shadow-soft group-hover:shadow-lifted transition-shadow"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        aria-hidden="true"
      >
        {initials(member.name)}
      </div>
      <p className="mt-3 font-medium text-sm">{member.name}</p>
      {showRole && member.role_title && (
        <p className="text-xs text-maroon-700 font-medium uppercase tracking-wider mt-0.5">{member.role_title}</p>
      )}
      {member.class_year && (
        <p className="text-xs text-ink-faint mt-0.5">Class of {member.class_year}</p>
      )}
    </article>
  );
}
