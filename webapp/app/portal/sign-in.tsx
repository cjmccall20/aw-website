"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useStore, signIn, update } from "@/lib/store";
import { initials, placeholderColor } from "@/lib/utils";
import { ChevronRight, Mail, Lock, Info, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

type Mode = "menu" | "magic" | "magic_sent" | "password" | "invite" | "invite_done";

export function SignIn() {
  const router = useRouter();
  const db = useStore();
  const [mode, setMode] = useState<Mode>("menu");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  function findUser(e: string) {
    const needle = e.trim().toLowerCase();
    return db.users.find(u => u.primary_email.toLowerCase() === needle) ?? null;
  }

  function completeSignIn(userId: string) {
    signIn(userId);
    router.push("/portal/dashboard");
  }

  function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    const user = findUser(email);
    if (!user) {
      setError("No account with that email. Accounts are created by officers — or pick a demo role below.");
      return;
    }
    setError(null);
    setPendingUserId(user.id);
    setMode("magic_sent");
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    const user = findUser(email);
    if (!user) {
      setError("No account with that email.");
      return;
    }
    if (!password) {
      setError("Enter a password.");
      return;
    }
    // Demo: any password is accepted. Real build: Supabase Auth verifies.
    completeSignIn(user.id);
  }

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    const user = findUser(email);
    if (!user) {
      setError("No invite found for that email. Ask an officer to add you from the Members tab.");
      return;
    }
    if (user.status !== "pending_setup") {
      setError("That account is already set up — use magic link or password sign-in.");
      return;
    }
    update(dbx => {
      const u = dbx.users.find(x => x.id === user.id);
      if (u) u.status = "active";
    }, `Completed account setup: ${user.name}`);
    setPendingUserId(user.id);
    setError(null);
    setMode("invite_done");
  }

  const pendingUser = pendingUserId ? db.users.find(u => u.id === pendingUserId) : null;

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
                    Auth flows are simulated (no emails actually send; any
                    password works). Data persists in your browser. Use
                    &ldquo;Sign in as a role&rdquo; to explore permissions, or
                    try <code className="text-xs">elena.cruz@tamu.edu</code> with magic link.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-padded">
            {mode === "menu" && (
              <>
                <h2 className="font-serif text-2xl font-semibold">Sign in to the portal</h2>
                <div className="mt-6 space-y-3">
                  <button onClick={() => { setMode("magic"); setError(null); }} className="w-full btn-primary justify-between">
                    <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Sign in with magic link</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setMode("password"); setError(null); }} className="w-full btn-secondary justify-between">
                    <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Sign in with password</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setMode("invite"); setError(null); }} className="w-full btn-secondary justify-between">
                    <span className="inline-flex items-center gap-2"><KeyRound className="h-4 w-4" /> I have an invite — set up my account</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="divider-ornament text-xs uppercase tracking-wider">Or</div>

                <button
                  onClick={() => setShowRolePicker(true)}
                  data-testid="demo-role-signin"
                  className="w-full btn-ghost justify-center"
                >
                  Demo: sign in as a specific role
                </button>

                <p className="mt-8 text-xs text-ink-faint">
                  By signing in you agree to act in good faith with the team&apos;s
                  constitution. New here? An officer creates your account; you&apos;ll
                  get an invite link to your email.
                </p>
              </>
            )}

            {(mode === "magic" || mode === "password" || mode === "invite") && (
              <>
                <button onClick={() => { setMode("menu"); setError(null); }} className="text-sm text-ink-faint hover:text-ink inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <h2 className="mt-4 font-serif text-2xl font-semibold">
                  {mode === "magic" ? "Magic link sign-in" : mode === "password" ? "Password sign-in" : "Set up your account"}
                </h2>
                <form
                  onSubmit={mode === "magic" ? submitMagic : mode === "password" ? submitPassword : submitInvite}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="label" htmlFor="signin-email">Email on file</label>
                    <input
                      id="signin-email" type="email" required autoFocus
                      value={email} onChange={e => { setEmail(e.target.value); setError(null); }}
                      className="input" placeholder="you@tamu.edu"
                    />
                  </div>
                  {mode === "password" && (
                    <div>
                      <label className="label" htmlFor="signin-password">Password</label>
                      <input
                        id="signin-password" type="password" required
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="input"
                      />
                      <p className="help-text">Demo: any password is accepted.</p>
                    </div>
                  )}
                  {error && <p className="text-sm text-maroon-700">{error}</p>}
                  <button type="submit" className="btn-primary w-full">
                    {mode === "magic" ? "Email me a sign-in link" : mode === "password" ? "Sign in" : "Set up account"}
                  </button>
                </form>
              </>
            )}

            {mode === "magic_sent" && pendingUser && (
              <div>
                <CheckCircle2 className="h-10 w-10 text-green" />
                <h2 className="mt-4 font-serif text-2xl font-semibold">Check your email.</h2>
                <p className="mt-3 text-sm text-ink-soft">
                  We sent a one-tap sign-in link to <strong className="text-ink">{pendingUser.primary_email}</strong>.
                  It expires in 15 minutes.
                </p>
                <div className="mt-6 p-4 rounded-lg border border-dashed border-line-strong bg-cream-100">
                  <p className="text-xs uppercase tracking-wider font-semibold text-ink-faint">Demo shortcut — the email that would have sent:</p>
                  <button
                    onClick={() => completeSignIn(pendingUser.id)}
                    className="mt-3 btn-primary w-full justify-center"
                    data-testid="open-magic-link"
                  >
                    Open the magic link → sign in as {pendingUser.name}
                  </button>
                </div>
                <button onClick={() => setMode("menu")} className="mt-4 btn-ghost text-sm w-full justify-center">Cancel</button>
              </div>
            )}

            {mode === "invite_done" && pendingUser && (
              <div>
                <CheckCircle2 className="h-10 w-10 text-green" />
                <h2 className="mt-4 font-serif text-2xl font-semibold">You&apos;re set up, {pendingUser.name.split(" ")[0]}.</h2>
                <p className="mt-3 text-sm text-ink-soft">
                  Your account is active. Going forward, sign in with a magic
                  link to {pendingUser.primary_email} (or set a password from Settings).
                </p>
                <button onClick={() => completeSignIn(pendingUser.id)} className="mt-6 btn-primary w-full justify-center">
                  Continue to dashboard
                </button>
              </div>
            )}
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
              {db.users.filter(u => u.status === "active").map(u => {
                const statusLabels = u.status_keys.map(k => db.permissionStatuses.find(s => s.key === k)?.display_name ?? k).join(" + ");
                return (
                  <li key={u.id}>
                    <button
                      onClick={() => completeSignIn(u.id)}
                      data-testid={`signin-${u.id}`}
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
