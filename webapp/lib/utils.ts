import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", opts ?? {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(date);
}

export function formatTime(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit",
  }).format(date);
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
