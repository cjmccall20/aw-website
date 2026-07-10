"use client";

import React, { useState, useId } from "react";
import { CheckCircle2 } from "lucide-react";

type DonationOption = "" | "250" | "500" | "750" | "1000" | "other" | "not_at_this_time";

export function PerformanceRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [donation, setDonation] = useState<DonationOption>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/forms/performance-request
    //  → matches/creates contact (first+last OR org OR phone OR email)
    //  → inserts performance_requests row with donation_interest
    //  → computes drive_time via Google Distance Matrix
    //  → sends Resend auto-reply from performance@aggiewranglers.com
    //  → if notify_opt_in, adds to public_lessons notify list too
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card-padded">
        <CheckCircle2 className="h-10 w-10 text-green" />
        <h2 className="mt-5 font-serif text-3xl font-semibold">Request received.</h2>
        <p className="mt-3 text-ink-soft">
          Thanks. We&apos;ll follow up from <code className="text-xs">performance@aggiewranglers.com</code> within a few days
          with next steps or any clarifying questions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-padded space-y-8">
      <FieldSet legend="Your information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name" required>
            <input className="input" autoComplete="given-name" required />
          </Field>
          <Field label="Last name" required>
            <input className="input" autoComplete="family-name" required />
          </Field>
        </div>
        <Field label="Organization" help="Wedding planner, sorority, company, etc.">
          <input className="input" autoComplete="organization" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" required>
            <input className="input" type="email" autoComplete="email" required />
          </Field>
          <Field label="Phone" required>
            <input className="input" type="tel" autoComplete="tel" required />
          </Field>
        </div>
      </FieldSet>

      <FieldSet legend="Event details">
        <Field label="Event date" required>
          <input className="input" type="date" required />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start time" required>
            <input className="input" type="time" required />
          </Field>
          <Field label="End time" required>
            <input className="input" type="time" required />
          </Field>
        </div>
        <Field label="Venue name" required>
          <input className="input" required />
        </Field>
        <Field label="Venue address" required help="We'll auto-compute drive time from College Station.">
          <input className="input" autoComplete="street-address" required placeholder="Street, City, State ZIP" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Audience size" required>
            <input className="input" type="number" min={0} required />
          </Field>
          <Field label="Performance type" required>
            <select className="select" required defaultValue="">
              <option value="" disabled>Select…</option>
              <option>Wedding reception</option>
              <option>Corporate event</option>
              <option>Festival / fair</option>
              <option>Fundraiser / gala</option>
              <option>Music video / press</option>
              <option>Private party</option>
              <option>Other</option>
            </select>
          </Field>
        </div>
        <Field label="Tell us about your event" help="Vision, music preferences, any specific requests.">
          <textarea className="textarea" rows={4} />
        </Field>
        <Field label="Urgency">
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="urgency" defaultChecked className="sr-only peer" />
              <div className="card p-4 peer-checked:border-maroon-700 peer-checked:bg-maroon-50 hover:border-line-strong transition-colors text-center">
                <p className="font-medium">Standard</p>
                <p className="text-xs text-ink-soft mt-0.5">2-3 weeks notice is fine</p>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="urgency" className="sr-only peer" />
              <div className="card p-4 peer-checked:border-maroon-700 peer-checked:bg-maroon-50 hover:border-line-strong transition-colors text-center">
                <p className="font-medium">Quick answer needed</p>
                <p className="text-xs text-ink-soft mt-0.5">Decision needed in days</p>
              </div>
            </label>
          </div>
        </Field>
      </FieldSet>

      <FieldSet legend="Donation">
        <Field
          label="Would you be willing to give a donation when we perform?"
          help="We're a student organization — donations help fund the team's activities. This is interest only; no payment is processed here."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              ["250", "$250"], ["500", "$500"], ["750", "$750"],
              ["1000", "$1,000"], ["other", "Other"], ["not_at_this_time", "Not at this time"],
            ] as const).map(([val, label]) => (
              <label key={val} className="cursor-pointer">
                <input type="radio" name="donation" value={val} checked={donation === val} onChange={() => setDonation(val)} className="sr-only peer" />
                <div className="px-3 py-2.5 rounded-lg border border-line text-center text-sm font-medium peer-checked:border-maroon-700 peer-checked:bg-maroon-50 peer-checked:text-maroon-800 hover:border-line-strong transition-colors">
                  {label}
                </div>
              </label>
            ))}
          </div>
          {donation === "other" && (
            <input className="input mt-3" placeholder="Tell us what you're thinking..." />
          )}
        </Field>
      </FieldSet>

      <FieldSet legend="Stay in touch">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-line-strong text-maroon-700 focus:ring-maroon-700/40" />
          <span className="text-sm text-ink-soft">
            Subscribe me to updates about future Wranglers happenings (new lessons, tryouts, performances near me). Unsubscribe anytime.
          </span>
        </label>
      </FieldSet>

      <button type="submit" className="btn-primary btn-lg w-full">Submit performance request</button>

      <p className="help-text">We&apos;ll review your request and follow up within a few days from <code className="text-xs">performance@aggiewranglers.com</code>.</p>
    </form>
  );
}

function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
  const id = useId();
  // Associate the label with the control for screen readers + click-to-focus.
  // Single bare inputs get an explicit id; composite children (radio groups)
  // contain their own labels, so the heading renders as a span to avoid
  // invalid nested <label> markup.
  const isBareControl =
    React.isValidElement(children) &&
    typeof children.type === "string" &&
    ["input", "textarea", "select"].includes(children.type);

  return (
    <div>
      {isBareControl ? (
        <label className="label" htmlFor={id}>
          {label} {required && <span className="text-maroon-700">*</span>}
        </label>
      ) : (
        <span className="label">
          {label} {required && <span className="text-maroon-700">*</span>}
        </span>
      )}
      {isBareControl ? React.cloneElement(children as React.ReactElement, { id }) : children}
      {help && <p className="help-text">{help}</p>}
    </div>
  );
}

function FieldSet({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-serif text-xl font-semibold pb-3 mb-2 border-b border-line w-full">{legend}</legend>
      {children}
    </fieldset>
  );
}
