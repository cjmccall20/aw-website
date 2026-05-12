import { PERFORMANCE_REQUESTS } from "@/lib/mock-data";
import { PerformanceDetailView } from "./view";

export function generateStaticParams() {
  return PERFORMANCE_REQUESTS.map(r => ({ id: r.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <PerformanceDetailView id={params.id} />;
}
