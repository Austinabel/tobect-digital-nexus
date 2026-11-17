import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/marketing/policy-page";

/** Text edited in Admin → Pages → terms. */
export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("terms", "/terms");
}

export default function Page() {
  return <PolicyPage policy="terms" />;
}
