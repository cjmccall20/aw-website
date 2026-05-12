"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const STORAGE_KEY = "aw.preview.access";

// Light protection only. The passphrase is in the client bundle — anyone
// inspecting the JS can find it. Designed to gate casual visitors and bots,
// not to protect sensitive content. For real auth, deploy via a host that
// supports server-side gating (Cloudflare Pages with Access, Vercel + auth).
const PASSPHRASE_NORMALIZED = "wranglers";

export function PreviewGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage unavailable (incognito, etc.) — just show the gate.
      setUnlocked(false);
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().toLowerCase() === PASSPHRASE_NORMALIZED) {
      try { window.localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  // SSR / pre-hydration: render the children invisibly so the page layout
  // is in the DOM but hidden. Avoids a flash of unlocked content.
  if (unlocked === null) {
    return <div aria-hidden style={{ visibility: "hidden" }}>{children}</div>;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-cream flex items-center justify-center px-4">
      <div className="card-padded max-w-md w-full">
        <div className="flex items-center gap-3 text-maroon-700">
          <Lock className="h-5 w-5" />
          <p className="eyebrow">Preview · invite only</p>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
          Aggie Wranglers — work in progress.
        </h1>
        <p className="mt-4 text-ink-soft">
          This is a preview of the redesigned site, not the live one. Enter
          the passphrase you were given to take a look.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="label" htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              autoFocus
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              className="input"
              autoCapitalize="none"
              spellCheck={false}
            />
            {error && <p className="mt-2 text-sm text-maroon-700">That&apos;s not it. Try again.</p>}
          </div>
          <button type="submit" className="btn-primary w-full">View preview</button>
        </form>
        <p className="mt-6 text-xs text-ink-faint">
          This gate is light protection. The rendered HTML is still in the page source for accessibility and SEO-friendliness; for genuinely private previews, switch to a host that does server-side auth.
        </p>
      </div>
    </div>
  );
}
