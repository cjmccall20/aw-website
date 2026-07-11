"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PerformanceDetailView } from "./view";

// Query-param detail route (?id=pr_xxx). A static export can't prerender
// dynamic [id] segments for records created at runtime in the client store.
function Inner() {
  const id = useSearchParams().get("id") ?? "";
  return <PerformanceDetailView id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Inner />
    </Suspense>
  );
}
