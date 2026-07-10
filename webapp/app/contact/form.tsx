"use client";

import { useState, useId } from "react";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const uid = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/forms/general-inquiry
    //  → matches/creates contact (first+last OR phone OR email)
    //  → inserts general_inquiries row with needs_human=true
    //  → keyword-matched auto-reply (links matching FAQ entry if found)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card-padded">
        <CheckCircle2 className="h-10 w-10 text-green" />
        <h2 className="mt-5 font-serif text-3xl font-semibold">Message sent.</h2>
        <p className="mt-3 text-ink-soft">
          Thanks for reaching out — an officer will get back to you within a few days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-padded space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor={`${uid}-first`}>First name <span className="text-maroon-700">*</span></label>
          <input id={`${uid}-first`} className="input" autoComplete="given-name" required />
        </div>
        <div>
          <label className="label" htmlFor={`${uid}-last`}>Last name <span className="text-maroon-700">*</span></label>
          <input id={`${uid}-last`} className="input" autoComplete="family-name" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor={`${uid}-email`}>Email <span className="text-maroon-700">*</span></label>
          <input id={`${uid}-email`} className="input" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor={`${uid}-phone`}>Phone</label>
          <input id={`${uid}-phone`} className="input" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-subject`}>Subject <span className="text-maroon-700">*</span></label>
        <input id={`${uid}-subject`} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-message`}>Message <span className="text-maroon-700">*</span></label>
        <textarea id={`${uid}-message`} className="textarea" rows={6} required />
      </div>
      <button type="submit" className="btn-primary btn-lg w-full">Send message</button>
      <p className="help-text">We&apos;ll reply from the most relevant team address within a few days.</p>
    </form>
  );
}
