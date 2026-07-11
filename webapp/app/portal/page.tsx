// Top-level /portal route — either renders the sign-in page or redirects into the shell.
// For the demo we keep this simple: client-side check for a stored demo user.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { SignIn } from "./sign-in";

export default function PortalIndex() {
  const router = useRouter();
  const user = useSessionUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && user) router.replace("/portal/dashboard");
  }, [mounted, user, router]);

  if (!mounted || user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </main>
    );
  }

  return <SignIn />;
}
