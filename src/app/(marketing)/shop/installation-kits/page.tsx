import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { CategoryNav } from "@/components/shop/category-nav";
import { KitsSection } from "@/components/shop/kits-section";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { ShopPromoTiles, ShopTrustBar } from "@/components/shop/shop-bottom";

export const metadata: Metadata = {
  title: "Complete Solar Installation Kits",
  description:
    "All-in-one solar installation kits — hybrid inverter, lithium battery, solar panels, cables and protection — configured for homes, offices and businesses across Nigeria.",
  alternates: { canonical: "/shop/installation-kits" },
};

export default function InstallationKitsPage() {
  return (
    <>
      <PageHero
        kicker="Complete Solar Packages"
        title="Solar Installation Kits"
        intro="Pre-configured solar systems with everything needed for installation. Customise the components, add to cart, or ask us to configure one for you."
        crumbs={[{ label: "Shop", href: "/shop" }, { label: "Installation Kits" }]}
      />
      <CategoryNav active="installation-kits" />
      <KitsSection showAllLink={false} />
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <CatalogueNotice />
      </div>
      <ShopTrustBar />
      <ShopPromoTiles hasNewArrivals={false} hasDeals={false} hideKits />
    </>
  );
}
