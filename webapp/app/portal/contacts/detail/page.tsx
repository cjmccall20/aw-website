"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ContactDetailView } from "./view";

function Inner() {
  const id = useSearchParams().get("id") ?? "";
  return <ContactDetailView id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Inner />
    </Suspense>
  );
}
