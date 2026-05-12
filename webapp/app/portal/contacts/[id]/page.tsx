import { CONTACTS } from "@/lib/mock-data";
import { ContactDetailView } from "./view";

export function generateStaticParams() {
  return CONTACTS.map(c => ({ id: c.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <ContactDetailView id={params.id} />;
}
