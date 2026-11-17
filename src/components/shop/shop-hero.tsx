import Link from "next/link";
import { ShopSearch, type SearchSuggestion } from "@/components/shop/shop-search";
import { HeroWave } from "@/components/shop/hero-wave";
import { PromoSlideshow } from "@/components/shop/promo-slideshow";
import { IconTruck, IconShieldCheck, IconSupport, IconWrench } from "@/components/icons";
import { getCatalog } from "@/lib/catalog-server";
import { catalogueBrands, type Catalog } from "@/lib/catalog";
import { campaignsFor } from "@/lib/merch-server";
import { getSite } from "@/lib/site-server";
import { safeCampaignHref } from "@/lib/shop/campaigns";

const TRUST = [
  { Icon: IconShieldCheck, title: "Genuine Products", text: "From trusted brands" },
  { Icon: IconSupport, title: "Expert Support", text: "Technical advice & sizing" },
  { Icon: IconTruck, title: "Nationwide Delivery", text: "Across Nigeria" },
  { Icon: IconWrench, title: "Warranty & After-Sales", text: "Installation & service support" },
];

function suggestions(catalog: Catalog): SearchSuggestion[] {
  const { categories: CATEGORIES, products: PRODUCTS } = catalog;
  return [
    ...CATEGORIES.map((c) => ({ label: c.name, kind: "Category" as const, href: `/shop/${c.slug}` })),
    { label: "Installation Kits", kind: "Category" as const, href: "/shop/installation-kits", keywords: "solar package complete" },
    ...catalogueBrands(catalog).map((b) => ({ label: b.name, kind: "Brand" as const, href: `/shop?brand=${b.slug}#catalogue` })),
    ...PRODUCTS.map((p) => ({
      label: p.name,
      kind: "Product" as const,
      href: `/product/${p.slug}`,
      keywords: [p.brand, p.model, ...p.specs, ...Object.values(p.attributes ?? {})].filter(Boolean).join(" "),
    })),
    ...catalog.kits.map((k) => ({ label: k.name, kind: "Kit" as const, href: `/shop/installation-kits/${k.slug}`, keywords: "solar package installation" })),
  ];
}

/** Navy shop header: headline, search and trust points; parallelogram offers slideshow on the right. */
export async function ShopHero({ query, now }: { query?: string; now: Date }) {
  const catalog = await getCatalog();
  // Links are sanitised on the server, so a bad campaign URL can never reach the page.
  const site = await getSite();
  const slides = (await campaignsFor("shop-hero", now, 6)).map((s) => ({ ...s, ctaHref: safeCampaignHref(s.ctaHref) ?? "/shop" }));
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_75%_30%,rgba(21,86,217,0.55),rgba(11,25,48,0)_70%),linear-gradient(120deg,#0b1930_0%,#0d2a5c_55%,#0b1930_100%)]"
      />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-20 pt-9 sm:px-6 sm:pb-24 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:px-9 lg:pb-28 lg:pt-12">
        <div>
          <nav aria-label="Breadcrumb" className="mb-4 text-[0.78rem] text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="font-semibold text-white">Shop</span>
          </nav>
          <span className="flex items-center gap-2.5 font-heading text-[0.74rem] font-bold uppercase tracking-[0.22em] text-white/80">
            <span aria-hidden className="h-0.5 w-7 rounded bg-red" />
            {site.shortName} Shop
          </span>
          <h1 className="mt-3 font-heading text-[clamp(2rem,4.6vw,3.15rem)] font-extrabold leading-[1.06] tracking-tight">
            Shop Solar &amp; Energy Products
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[1rem] leading-relaxed text-white/80">
            Inverters, batteries, solar panels, generators, CCTV, installation kits and more. Genuine products. Competitive
            prices. Nationwide delivery.
          </p>
          <div className="mt-6 max-w-[620px]">
            <ShopSearch suggestions={suggestions(catalog)} defaultValue={query} />
          </div>
          <ul className="mt-7 grid max-w-[620px] grid-cols-2 gap-2.5">
            {TRUST.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/25 text-white">
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-[0.82rem] font-bold leading-tight">{title}</span>
                  <span className="block text-[0.76rem] leading-snug text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <PromoSlideshow slides={slides} />
      </div>
      <HeroWave />
    </section>
  );
}
