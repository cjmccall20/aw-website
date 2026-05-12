import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main-content" className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}
