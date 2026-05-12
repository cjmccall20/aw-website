// Top-level /portal route — either renders the sign-in page or redirects into the shell.
// For the demo we keep this simple: client-side check for a stored demo user.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDemoUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { SignIn } from "./sign-in";

export default function PortalIndex() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const user = getDemoUser();
    if (user) {
      setSignedIn(true);
      router.replace("/portal/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking || signedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </main>
    );
  }

  return <SignIn />;
}
