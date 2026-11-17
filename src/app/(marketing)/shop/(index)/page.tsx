import type { Metadata } from "next";
import { ShopHero } from "@/components/shop/shop-hero";
import { CategoryNav } from "@/components/shop/category-nav";
import { CampaignBanners, WideBanner } from "@/components/shop/campaign-banners";
import { KitsSection } from "@/components/shop/kits-section";
import { Catalogue } from "@/components/shop/catalogue";
import { CategoryShowcase, CollectionRow, ShopPromoTiles, ShopTrustBar } from "@/components/shop/shop-bottom";
import { getNewArrivals, getPopularProducts, getSaleProducts } from "@/lib/data/collections";
import { getCatalog } from "@/lib/catalog-server";
import { productsInCategory } from "@/lib/catalog";
import { catalogueSearch, hasActiveFilters, parseCatalogueQuery } from "@/lib/shop/catalogue-query";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(props: PageProps<"/shop">): Promise<Metadata> {
  const SITE = await getSite();
  const query = parseCatalogueQuery(await props.searchParams);
  const filtered = hasActiveFilters(query);
  return {
    title: "Shop Solar Panels, Inverters, Batteries & CCTV",
    description:
      `Shop solar panels, hybrid inverters, lithium batteries, solar generators, CCTV and complete solar installation kits from ${SITE.name}, with nationwide delivery across Nigeria.`,
    // Filtered views point search engines at the main shop page; plain pagination keeps its own URL.
    alternates: { canonical: filtered ? "/shop" : `/shop${catalogueSearch({ ...query, sort: "featured", view: "grid" })}` },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

/** Category showcases on the main shop page, in display order. */
const SHOWCASES = [
  { slug: "inverters", kicker: "Power conversion", title: "Inverters", glyph: "inverter", blurb: "Hybrid and off-grid inverters to run your home or business." },
  { slug: "lithium-batteries", kicker: "Energy storage", title: "Batteries", glyph: "battery", blurb: "Lithium battery storage to keep the power on through the night." },
  { slug: "solar-panels", kicker: "Generation", title: "Solar Panels", glyph: "panel", blurb: "Solar panels to generate your own clean power." },
] as const;

export default async function ShopPage(props: PageProps<"/shop">) {
  const query = parseCatalogueQuery(await props.searchParams);
  const now = new Date();
  const catalog = await getCatalog();
  const newArrivals = getNewArrivals(catalog.products, now, 8, catalog.collections.newArrivals);
  const deals = getSaleProducts(catalog.products);
  const popular = getPopularProducts(catalog.products, catalog.collections.popular);
  const [inverters, batteries, panels] = SHOWCASES.map((s) => {
    const all = productsInCategory(catalog, s.slug);
    return { ...s, products: all.slice(0, 4), total: all.length };
  });
  const showcase = (s: typeof inverters) => <CategoryShowcase key={s.slug} {...s} />;

  return (
    <>
      <ShopHero query={query.q} now={now} />
      <CategoryNav active="all" />
      <ShopTrustBar />
      <CampaignBanners now={now} />
      <KitsSection />
      {showcase(inverters)}
      <WideBanner now={now} />
      {showcase(batteries)}
      {showcase(panels)}
      <Catalogue query={query} basePath="/shop" />
      <CollectionRow id="new-arrivals" kicker="Just in" title="New Arrivals" products={newArrivals} link={{ href: "/shop?sort=newest#catalogue", label: "View all new" }} />
      <CollectionRow id="deals" kicker="Genuine savings" title="Sale & Deals" products={deals} />
      <CollectionRow id="popular" kicker="Customer favourites" title="Popular Products" products={popular} />
      <ShopPromoTiles hasNewArrivals={newArrivals.length > 0} hasDeals={deals.length > 0} />
    </>
  );
}
