import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import NotFoundContent from "./(marketing)/not-found";

export const metadata: Metadata = { title: "Page not found" };

/** Global 404 for unmatched URLs — rendered outside the (marketing) layout, so it brings its own chrome. */
export default function GlobalNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
