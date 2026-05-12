import Link from "next/link";
import { Instagram, Youtube, Facebook } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-maroon-900 text-cream-200">
      <div className="container-content py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl text-white">Aggie Wranglers</p>
            <p className="mt-2 italic text-cream-300 text-lg">High Flyin', Death Defyin'</p>
            <p className="mt-6 text-sm leading-relaxed max-w-sm text-cream-300/80">
              Texas A&amp;M&rsquo;s nationally recognized country-western dance
              performance team. Spreading love for Texas A&amp;M through dance
              since 1981.
            </p>
            <div className="mt-6 flex gap-3">
              <SocialLink href="https://instagram.com/aggiewranglers" label="Instagram"><Instagram className="h-4 w-4" /></SocialLink>
              <SocialLink href="https://www.tiktok.com/@aggiewranglers" label="TikTok">
                <span className="text-xs font-bold">TT</span>
              </SocialLink>
              <SocialLink href="https://youtube.com/@aggiewranglers" label="YouTube"><Youtube className="h-4 w-4" /></SocialLink>
              <SocialLink href="https://facebook.com/aggiewranglers" label="Facebook"><Facebook className="h-4 w-4" /></SocialLink>
            </div>
          </div>

          <FooterCol title="Get Involved">
            <FooterLink href="/public-lessons">Public Lessons</FooterLink>
            <FooterLink href="/requirements">Tryouts</FooterLink>
            <FooterLink href="/performance-request">Book the Team</FooterLink>
            <FooterLink href="/private-lesson-request">Private Lessons</FooterLink>
          </FooterCol>

          <FooterCol title="About">
            <FooterLink href="/meet-the-team">Meet the Team</FooterLink>
            <FooterLink href="/history">History</FooterLink>
            <FooterLink href="/alumni">Alumni</FooterLink>
            <FooterLink href="/sponsorships">Sponsorships</FooterLink>
          </FooterCol>

          <FooterCol title="Resources">
            <FooterLink href="/watch">Watch</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/banquet">Banquet</FooterLink>
            <FooterLink href="https://teespring.com" external>Merchandise</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-16 pt-8 border-t border-maroon-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-cream-300/70">
          <div className="space-y-1">
            <p>&copy; {year} Aggie Wranglers. Texas A&amp;M University.</p>
            <p>College Station, TX · performance@wranglers.tamu.edu</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/portal" className="hover:text-white transition-colors">Member portal</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <h3 className="text-xs uppercase tracking-[0.18em] text-cream-300/60 font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-cream-200/85 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="h-9 w-9 rounded-full border border-maroon-800 hover:border-cream-300 hover:bg-maroon-800/40 flex items-center justify-center transition-colors text-cream-200"
    >
      {children}
    </a>
  );
}
