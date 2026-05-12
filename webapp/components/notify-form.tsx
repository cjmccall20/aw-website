"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

interface Props {
  listKey: "public_lessons" | "tryouts";
  heading?: string;
  description?: string;
  variant?: "card" | "inline";
}

export function NotifyForm({ listKey, heading, description, variant = "card" }: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const defaults = {
    public_lessons: {
      heading: heading ?? "Notify me when new lessons drop",
      description: description ?? "We'll email you the moment the next session schedule goes live. Unsubscribe anytime.",
    },
    tryouts: {
      heading: heading ?? "Get notified about tryouts",
      description: description ?? "Be the first to know when the next tryout cycle opens up.",
    },
  };
  const copy = defaults[listKey];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/notify-list/subscribe { list_key: listKey, email, first_name }
    //  → creates notify_list_subscribers row, sends auto-reply confirmation
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={variant === "card" ? "card-padded" : ""}>
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-serif text-xl">You're on the list.</p>
            <p className="mt-1 text-sm text-ink-soft">
              We'll email you from <code className="text-xs">lessons@aggiewranglers.com</code> when the next session is scheduled. Check your inbox for a confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-maroon-50 text-maroon-700 flex items-center justify-center flex-shrink-0">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-semibold leading-tight">{copy.heading}</h3>
          <p className="text-sm text-ink-soft mt-0.5">{copy.description}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div className="grid sm:grid-cols-[1fr_2fr] gap-3">
          <div>
            <label className="label" htmlFor={`first-${listKey}`}>First name (optional)</label>
            <input
              id={`first-${listKey}`}
              type="text" autoComplete="given-name"
              value={firstName} onChange={e => setFirstName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor={`email-${listKey}`}>Email <span className="text-maroon-700">*</span></label>
            <input
              id={`email-${listKey}`}
              type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto">Notify me</button>
        <p className="help-text">By signing up you agree to receive announcements about this list. One-click unsubscribe in every email.</p>
      </form>
    </>
  );

  return variant === "card" ? <div className="card-padded">{inner}</div> : inner;
}
