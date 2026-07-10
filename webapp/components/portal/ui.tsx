"use client";

// Small shared primitives for portal CRUD screens.

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children, wide }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`bg-white w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[88vh] overflow-y-auto rounded-2xl shadow-lifted`}>
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-line sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-serif text-xl font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink p-2 -mr-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function TextField({ label, value, onChange, type = "text", required, placeholder, help, id }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  id?: string;
}) {
  const fieldId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label className="label" htmlFor={fieldId}>{label} {required && <span className="text-maroon-700">*</span>}</label>
      <input id={fieldId} className="input" type={type} value={value} required={required}
        placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {help && <p className="help-text">{help}</p>}
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 4, required, placeholder, id }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  id?: string;
}) {
  const fieldId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label className="label" htmlFor={fieldId}>{label} {required && <span className="text-maroon-700">*</span>}</label>
      <textarea id={fieldId} className="textarea" rows={rows} value={value} required={required}
        placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function SelectField({ label, value, onChange, options, id, help }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  help?: string;
}) {
  const fieldId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label className="label" htmlFor={fieldId}>{label}</label>
      <select id={fieldId} className="select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {help && <p className="help-text">{help}</p>}
    </div>
  );
}

/** Shown on tabs where the user has view access but not edit. */
export function ViewOnlyBanner() {
  return (
    <p className="mb-6 text-xs px-3 py-2 rounded-lg bg-cream-200 text-ink-soft inline-block">
      View-only — your permission status doesn&apos;t include editing this tab.
    </p>
  );
}

/** Toast-ish inline confirmation. */
export function SavedFlash({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="text-xs text-green font-medium animate-fade-in">Saved ✓</span>;
}
