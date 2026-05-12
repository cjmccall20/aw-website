import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Member Portal", template: "%s · AW Portal" },
  description: "Aggie Wranglers internal portal — for current members, alumni, and officers.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
