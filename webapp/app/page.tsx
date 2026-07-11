import type { Metadata } from "next";
import { HomeView } from "./home-view";

export const metadata: Metadata = {
  title: "Aggie Wranglers — Texas A&M's country-western dance team",
  description:
    "Texas A&M's premier country-western exhibition dance team. Public lessons six sessions a year, tryouts each spring, free performance bookings, and private lessons for weddings and events.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aggie Wranglers — High Flyin', Death Defyin'",
    description: "Country-western dance from Texas A&M. Lessons, tryouts, performance bookings.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeView />;
}
