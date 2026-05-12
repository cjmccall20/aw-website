"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy URL preserved via client redirect (static export can't do server-side
// redirects, and next.config.js redirects() are stripped in `output: 'export'`).
export default function CurrentTeamRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/meet-the-team"); }, [router]);
  return (
    <main className="min-h-[40vh] flex items-center justify-center text-ink-faint text-sm">
      Redirecting to Meet the Team…
    </main>
  );
}
