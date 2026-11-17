import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/marketing/policy-page";

/** Text edited in Admin → Pages → warranty. */
export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("warranty", "/warranty");
}

export default function Page() {
  return <PolicyPage policy="warranty" />;
}
