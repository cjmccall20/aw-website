// Legacy URL preserved; redirects to /meet-the-team via 301-style client redirect.
import { redirect } from "next/navigation";
export default function CurrentTeamRedirect() {
  redirect("/meet-the-team");
}
