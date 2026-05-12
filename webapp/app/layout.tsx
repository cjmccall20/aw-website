import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const SITE_URL = "https://aggiewranglers.com";
const TEAM_NAME = "Aggie Wranglers";
const TAGLINE = "High Flyin', Death Defyin'";
const DESCRIPTION =
  "Texas A&M's nationally recognized country-western dance performance team. Public lessons, private lessons, performance bookings, and tryouts — request below.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TEAM_NAME} — ${TAGLINE}`,
    template: `%s · ${TEAM_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "Aggie Wranglers", "Texas A&M dance team", "country western dance",
    "two-step lessons College Station", "TAMU performance team",
    "jitterbug", "swing dance", "country swing", "performance booking",
    "wedding dance lessons", "tryouts",
  ],
  authors: [{ name: TEAM_NAME }],
  creator: TEAM_NAME,
  publisher: TEAM_NAME,
  applicationName: TEAM_NAME,
  category: "education",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: TEAM_NAME,
    title: `${TEAM_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TEAM_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    creator: "@AggieWranglers",
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#500000",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "PerformingGroup",
              name: TEAM_NAME,
              alternateName: "AW",
              url: SITE_URL,
              slogan: TAGLINE,
              description: DESCRIPTION,
              parentOrganization: {
                "@type": "CollegeOrUniversity",
                name: "Texas A&M University",
              },
              areaServed: { "@type": "State", name: "Texas" },
              sameAs: [
                "https://instagram.com/aggiewranglers",
                "https://tiktok.com/@aggiewranglers",
                "https://youtube.com/@aggiewranglers",
                "https://facebook.com/aggiewranglers",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Performance booking",
                email: "performance@wranglers.tamu.edu",
              },
            }),
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
