import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/marketing/policy-page";

/** Text edited in Admin → Pages → privacy. */
export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("privacy", "/privacy");
}

export default function Page() {
  return <PolicyPage policy="privacy" />;
}
