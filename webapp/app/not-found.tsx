import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section">
        <div className="container-content max-w-2xl text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
            This page two-stepped off somewhere.
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            The page you&apos;re looking for doesn&apos;t exist — it may have moved
            during the site redesign.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/" className="btn-primary">Back to home</Link>
            <Link href="/public-lessons" className="btn-secondary">Public lessons</Link>
            <Link href="/performance-request" className="btn-secondary">Book the team</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
