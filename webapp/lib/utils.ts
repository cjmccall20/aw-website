import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a date input without the classic date-only pitfall: `new Date("2026-07-18")`
 * is parsed as UTC midnight, which renders as the *previous day* in US timezones.
 * Date-only strings are constructed as local dates instead.
 */
export function parseDate(d: string | number | Date): Date {
  if (typeof d === "number" || d instanceof Date) return new Date(d);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (dateOnly) {
    const [, y, m, day] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(day));
  }
  return new Date(d);
}

export function formatDate(d: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", opts ?? {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(parseDate(d));
}

export function formatTime(d: string | number | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit",
  }).format(parseDate(d));
}

/** Format a bare "HH:MM" (or "HH:MM:SS") 24h clock string as "5:30 PM". */
export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function initials(name: string) {
  return name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
}

/** Deterministic placeholder background color for avatars/cards based on a string. */
export function placeholderColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palette = ["#500000", "#6E2818", "#8E3B26", "#B89B5C", "#A0501F", "#4A6B3F"];
  return palette[h % palette.length];
}
