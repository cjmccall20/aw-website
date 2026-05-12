"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The team no longer has a dedicated building. Legacy URL → home.
// In a real production deploy this should be a server-side 301 (handled via
// next.config.js redirects on Vercel, or rewrites/redirects file on Pages alternatives).
// Static export uses a client redirect as the fallback.
export default function OurBuildingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return (
    <main className="min-h-[40vh] flex items-center justify-center text-ink-faint text-sm">
      Redirecting…
    </main>
  );
}
