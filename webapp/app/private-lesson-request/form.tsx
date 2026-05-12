"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function PrivateLessonForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card-padded">
        <CheckCircle2 className="h-10 w-10 text-green" />
        <h2 className="mt-5 font-serif text-3xl font-semibold">Request received.</h2>
        <p className="mt-3 text-ink-soft">
          The lessons coordinator will follow up from <code className="text-xs">lessons@aggiewranglers.com</code> within a few days
          with availability and a quote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-padded space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-serif text-xl font-semibold pb-3 mb-2 border-b border-line w-full">Your information</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">First name <span className="text-maroon-700">*</span></label>
            <input className="input" autoComplete="given-name" required />
          </div>
          <div>
            <label className="label">Last name <span className="text-maroon-700">*</span></label>
            <input className="input" autoComplete="family-name" required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email <span className="text-maroon-700">*</span></label>
            <input className="input" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" type="tel" autoComplete="tel" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl font-semibold pb-3 mb-2 border-b border-line w-full">Lesson details</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Group size <span className="text-maroon-700">*</span></label>
            <input className="input" type="number" min={1} max={20} defaultValue={2} required />
            <p className="help-text">Typically 1 (solo) or 2 (couples). Small groups OK.</p>
          </div>
          <div>
            <label className="label">Dance style of interest</label>
            <select className="select" defaultValue="">
              <option value="" disabled>Choose one…</option>
              <option>Wedding first dance</option>
              <option>Two-step</option>
              <option>Jitterbug / swing</option>
              <option>Polka</option>
              <option>Waltz</option>
              <option>Not sure — help me pick</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Experience level</label>
          <select className="select" defaultValue="">
            <option value="" disabled>Choose one…</option>
            <option>Total beginner</option>
            <option>Some experience</option>
            <option>Comfortable on a dance floor</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="label">When do you need to be ready by?</label>
          <input className="input" type="text" placeholder="e.g. our wedding is October 18 / no rush" />
        </div>
        <div>
          <label className="label">Anything else?</label>
          <textarea className="textarea" rows={4} placeholder="Specific song, particular goal, scheduling constraints..." />
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-serif text-xl font-semibold pb-3 mb-2 border-b border-line w-full">Stay in touch</legend>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-line-strong text-maroon-700 focus:ring-maroon-700/40" />
          <span className="text-sm text-ink-soft">
            Email me when new public lessons or workshops drop. Unsubscribe anytime.
          </span>
        </label>
      </fieldset>

      <button type="submit" className="btn-primary btn-lg w-full">Submit private lesson request</button>

      <p className="help-text">Reply will come from <code className="text-xs">lessons@aggiewranglers.com</code>.</p>
    </form>
  );
}
