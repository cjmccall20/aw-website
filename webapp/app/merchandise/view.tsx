"use client";

import { useStore } from "@/lib/store";

export function MerchStoreLink() {
  const db = useStore();
  return (
    <a href={db.siteContent.merch_url} target="_blank" rel="noopener noreferrer" className="mt-8 btn-primary btn-lg inline-flex">
      Visit the merch store →
    </a>
  );
}
