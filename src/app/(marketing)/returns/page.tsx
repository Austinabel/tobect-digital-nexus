import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/marketing/policy-page";

/** Text edited in Admin → Pages → returns. */
export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("returns", "/returns");
}

export default function Page() {
  return <PolicyPage policy="returns" />;
}
