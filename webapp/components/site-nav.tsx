"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Lessons",
    href: "/public-lessons",
    children: [
      { label: "Public Lessons", href: "/public-lessons" },
      { label: "Private Lessons", href: "/private-lessons" },
      { label: "Request a Private Lesson", href: "/private-lesson-request" },
    ],
  },
  {
    label: "Performances",
    href: "/performances-information",
    children: [
      { label: "Performance Info", href: "/performances-information" },
      { label: "Request a Performance", href: "/performance-request" },
    ],
  },
  { label: "Tryouts", href: "/requirements" },
  {
    label: "About",
    href: "/meet-the-team",
    children: [
      { label: "Meet the Team", href: "/meet-the-team" },
      { label: "History", href: "/history" },
      { label: "Alumni", href: "/alumni" },
      { label: "FAQ", href: "/faq" },
      { label: "Sponsorships", href: "/sponsorships" },
      { label: "Banquet", href: "/banquet" },
    ],
  },
  { label: "Watch", href: "/watch" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile when route changes
  useEffect(() => { setMobileOpen(false); setOpenMenu(null); }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-200",
        scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-line"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="container-content flex items-center justify-between h-16 sm:h-20"
      >
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-maroon-700 hover:text-maroon-800 transition-colors"
        >
          Aggie Wranglers
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV.map(item => {
            const active = pathname === item.href ||
              (item.children?.some(c => c.href === pathname) ?? false);
            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "text-maroon-700"
                      : "text-ink-soft hover:text-ink hover:bg-line-subtle",
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>
                {item.children && openMenu === item.label && (
                  <div className="absolute left-0 top-full pt-2 min-w-[220px]">
                    <ul className="bg-white border border-line rounded-xl shadow-lifted py-2">
                      {item.children.map(c => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className={cn(
                              "block px-4 py-2 text-sm transition-colors",
                              pathname === c.href
                                ? "text-maroon-700 bg-maroon-50"
                                : "text-ink-soft hover:text-ink hover:bg-line-subtle",
                            )}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/portal" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/performance-request" className="btn-primary text-sm">
            Book the team
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          className="md:hidden p-2 -mr-2 text-ink"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-b border-line shadow-lifted animate-fade-in"
        >
          <ul className="container-content py-4 space-y-1">
            {NAV.flatMap(item => [
              item,
              ...(item.children ?? []),
            ]).map(item => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-3 py-2.5 rounded-md text-base font-medium transition-colors",
                    pathname === item.href
                      ? "text-maroon-700 bg-maroon-50"
                      : "text-ink-soft hover:text-ink hover:bg-line-subtle",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-line flex flex-col gap-2">
              <Link href="/portal" className="btn-secondary justify-center">Sign in</Link>
              <Link href="/performance-request" className="btn-primary justify-center">Book the team</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
