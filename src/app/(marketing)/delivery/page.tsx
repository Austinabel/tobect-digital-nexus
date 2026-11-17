import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/marketing/policy-page";

/** Text edited in Admin → Pages → delivery. */
export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("delivery", "/delivery");
}

export default function Page() {
  return <PolicyPage policy="delivery" />;
}
