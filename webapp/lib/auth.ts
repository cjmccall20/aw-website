// Session helpers. Thin wrappers over lib/store's session so older call sites
// keep working; new code should prefer useSessionUser()/signIn() from store.

import { getDB, getSessionUser, signIn, signOut } from "@/lib/store";
import type { User } from "@/lib/types";

export function getDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  // Session id is hydrated lazily; read storage directly for pre-effect callers.
  const id = window.localStorage.getItem("aw.session.user_id");
  if (!id) return null;
  return getDB().users.find(u => u.id === id) ?? getSessionUser();
}

export function setDemoUser(userId: string) {
  if (typeof window === "undefined") return;
  signIn(userId);
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  signOut();
}
