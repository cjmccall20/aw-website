"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { setDemoUser } from "@/lib/auth";
import { DEMO_USERS, STATUSES } from "@/lib/mock-data";
import { initials, placeholderColor } from "@/lib/utils";
import { ChevronRight, Mail, Lock, Info } from "lucide-react";
import { useState } from "react";

export function SignIn() {
  const router = useRouter();
  const [showRolePicker, setShowRolePicker] = useState(false);

  function signInAs(userId: string) {
    setDemoUser(userId);
    router.push("/portal/dashboard");
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <div className="container-content py-8">
        <Link href="/" className="font-serif text-lg font-semibold text-maroon-700">
          Aggie Wranglers
        </Link>
      </div>

      <div className="flex-1 container-content py-12 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl w-full items-center">
          <div className="hidden lg:block">
            <p className="eyebrow">Member portal</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Sign in.</h1>
            <p className="mt-6 text-lg text-ink-soft max-w-md">
              The members&apos; side of aggiewranglers.com — performance
              management, lessons coordination, contacts, the team calendar,
              alumni directory, and more.
            </p>
            <div className="mt-10 card-padded bg-amber-50 border-amber-200">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">Demo mode</p>
                  <p className="mt-1 text-sm text-amber-700/80">
                    No real auth in this MVP. Use &ldquo;Sign in as…&rdquo; to
                    pick a role and see what that user&apos;s permissions
                    expose.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-padded">
            <h2 className="font-serif text-2xl font-semibold">Sign in to the portal</h2>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowRolePicker(true)}
                className="w-full btn-primary justify-between"
              >
                <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Sign in with magic link</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                disabled
                className="w-full btn-secondary justify-between opacity-60 cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Sign in with password</span>
                <span className="text-xs text-ink-faint">demo only</span>
              </button>
            </div>

            <div className="divider-ornament text-xs uppercase tracking-wider">Or</div>

            <button
              onClick={() => setShowRolePicker(true)}
              className="w-full btn-ghost justify-center"
            >
              Demo: sign in as a specific role
            </button>

            <p className="mt-8 text-xs text-ink-faint">
              By signing in you agree to act in good faith with the team&apos;s
              constitution. New here? An officer creates your account; you&apos;ll
              get an invite link to your email.
            </p>
          </div>
        </div>
      </div>

      {showRolePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-lifted">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-semibold">Sign in as…</h3>
                <p className="text-sm text-ink-soft mt-1">Pick a role to see the portal from that perspective.</p>
              </div>
              <button onClick={() => setShowRolePicker(false)} aria-label="Close" className="text-ink-faint hover:text-ink p-2 -mr-2">×</button>
            </div>
            <ul className="px-3 pb-4">
              {DEMO_USERS.map(u => {
                const statusLabels = u.status_keys.map(k => STATUSES.find(s => s.key === k)?.display_name ?? k).join(" + ");
                return (
                  <li key={u.id}>
                    <button
                      onClick={() => signInAs(u.id)}
                      className="w-full text-left px-3 py-3 rounded-lg hover:bg-cream-200 transition-colors flex items-center gap-3"
                    >
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ background: placeholderColor(u.name) }}
                      >
                        {initials(u.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-ink-faint truncate">{statusLabels}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-faint" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
