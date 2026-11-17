import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppFloat } from "@/components/marketing/whatsapp-float";
import { ShopTabBar } from "@/components/shop/shop-tab-bar";
import { CatalogProvider } from "@/components/catalog-provider";
import { getCatalog } from "@/lib/catalog-server";
import { SiteProvider } from "@/components/site-provider";
import { getSite } from "@/lib/site-server";
import { AppliancesProvider } from "@/components/calculator-provider";
import { getAppliances } from "@/lib/content-server";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  // One catalogue read per request, shared by server pages and client components alike.
  const [catalog, site, appliances] = await Promise.all([getCatalog(), getSite(), getAppliances()]);
  return (
    <SiteProvider value={site}>
    <CatalogProvider value={catalog}>
    <AppliancesProvider value={appliances}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      <ShopTabBar />
    </AppliancesProvider>
    </CatalogProvider>
    </SiteProvider>
  );
}
