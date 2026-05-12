// Client-side demo auth: pick a user from /portal/login → store id in localStorage.
// When Supabase comes online this gets replaced with real session reads.

import { DEMO_USERS } from "@/lib/mock-data";
import type { User } from "@/lib/types";

const STORAGE_KEY = "aw.demo.user_id";

export function getDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) return null;
  return DEMO_USERS.find(u => u.id === id) ?? null;
}

export function setDemoUser(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, userId);
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
