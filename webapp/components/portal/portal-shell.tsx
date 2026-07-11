"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ALL_TABS } from "@/lib/mock-data";
import { useStore, useSessionUser, accessFor, signOut } from "@/lib/store";
import type { User } from "@/lib/types";
import { initials, placeholderColor, cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Users, UserCog,
  Pencil, Calendar, Folder, Sparkles, GraduationCap as Alumni,
  Notebook, Target, BarChart3, ClipboardList, Settings, LogOut,
  ChevronsLeft, ChevronsRight, Menu, X,
} from "lucide-react";

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  performance_management: CalendarCheck,
  lessons_management: GraduationCap,
  contacts: Users,
  members: UserCog,
  webmaster: Pencil,
  team_calendar: Calendar,
  resources: Folder,
  move_library: Sparkles,
  alumni_directory: Alumni,
  meeting_notes: Notebook,
  long_term_goals: Target,
  performance_stats: BarChart3,
  surveys: ClipboardList,
  settings: Settings,
};

export function PortalShell({ children, tabKey, title, breadcrumb }: {
  children: React.ReactNode;
  tabKey: string;
  title?: string;
  breadcrumb?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useStore();
  const user = useSessionUser();
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !user) router.replace("/portal");
  }, [mounted, user, router]);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  if (!mounted || !user) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-ink-faint">Loading…</div>;
  }

  // Gate this tab
  const access = accessFor(db, user.status_keys, tabKey);
  if (access === "none" && tabKey !== "dashboard") {
    return (
      <Shell user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
        <div className="container-content py-16">
          <h1 className="font-serif text-3xl font-semibold">No access</h1>
          <p className="mt-3 text-ink-soft">Your permission status doesn&apos;t include this tab. Ask the president or an admin to grant access in Settings.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell user={user} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
      <div className="container-content py-8 sm:py-10">
        {breadcrumb && <div className="mb-3 text-sm text-ink-faint">{breadcrumb}</div>}
        {title && <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>}
        <div className={title ? "mt-8" : ""}>{children}</div>
      </div>
    </Shell>
  );
}

function Shell({ user, children, mobileNavOpen, setMobileNavOpen }: {
  user: User;
  children: React.ReactNode;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-cream/85 backdrop-blur border-b border-line">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/portal/dashboard" className="font-serif font-semibold text-maroon-700">AW Portal</Link>
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu" className="p-2 -mr-2">
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <Sidebar user={user} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        {children}
      </div>
    </div>
  );
}

function Sidebar({ user, mobileOpen, onClose }: { user: User; mobileOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useStore();

  function handleSignOut() {
    signOut();
    router.push("/portal");
  }

  const statusLabels = user.status_keys
    .map(k => db.permissionStatuses.find(s => s.key === k)?.display_name ?? k);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-white",
        "lg:translate-x-0 transition-transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
      aria-label="Portal navigation"
    >
      <div className="flex flex-col h-full">
        <div className="px-5 pt-5 pb-3 border-b border-line">
          <Link href="/portal/dashboard" className="font-serif text-lg font-semibold text-maroon-700">AW Portal</Link>
          <Link href="/" className="block mt-1 text-xs text-ink-faint hover:text-ink-soft">← Public site</Link>
        </div>

        <nav aria-label="Portal navigation" className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {ALL_TABS.map(t => {
              const access = accessFor(db, user.status_keys, t.key);
              const visible = access !== "none";
              if (!visible) return null;
              const Icon = TAB_ICONS[t.key] ?? LayoutDashboard;
              const href = `/portal/${t.key.replace(/_/g, "-")}`;
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={t.key}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-maroon-50 text-maroon-800 font-medium"
                        : "text-ink-soft hover:bg-cream-200 hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-3 px-2 py-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: placeholderColor(user.name) }}
            >
              {initials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-ink-faint truncate">{statusLabels.join(" · ")}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink-soft hover:text-ink hover:bg-cream-200">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
