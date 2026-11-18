import Link from "next/link";
import { ShopSearch, type SearchSuggestion } from "@/components/shop/shop-search";
import { HeroWave } from "@/components/shop/hero-wave";
import { PromoSlideshow } from "@/components/shop/promo-slideshow";
import { MobileBannerSlider } from "@/components/shop/mobile-banner-slider";
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
  const safe = (list: Awaited<ReturnType<typeof campaignsFor>>) => list.map((s) => ({ ...s, ctaHref: safeCampaignHref(s.ctaHref) ?? "/shop" }));
  const [hero, primary, secondary, wide, tiles] = await Promise.all([
    campaignsFor("shop-hero", now, 6),
    campaignsFor("shop-primary", now, 1),
    campaignsFor("shop-secondary", now, 1),
    campaignsFor("shop-wide", now, 1),
    campaignsFor("shop-tile", now, 3),
  ]);
  const slides = safe(hero);
  // Phones: every shop banner in one short swipeable slider instead of tall stacked banners.
  const seen = new Set<string>();
  const mobileSlides = safe([...hero, ...primary, ...secondary, ...wide, ...tiles]).filter((s) => !seen.has(s.id) && seen.add(s.id));
  return (
    <>
    <section className="relative bg-ink text-white lg:overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_75%_30%,rgba(21,86,217,0.55),rgba(11,25,48,0)_70%),linear-gradient(120deg,#0b1930_0%,#0d2a5c_55%,#0b1930_100%)]"
      />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 pb-4 pt-3 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:px-9 lg:pb-28 lg:pt-12">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-4 hidden text-[0.78rem] text-white/60 lg:block">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="font-semibold text-white">Shop</span>
          </nav>
          <span className="hidden items-center gap-2.5 font-heading text-[0.74rem] font-bold uppercase tracking-[0.22em] text-white/80 lg:flex">
            <span aria-hidden className="h-0.5 w-7 rounded bg-red" />
            {site.shortName} Shop
          </span>
          <h1 className="sr-only mt-3 font-heading text-[clamp(2rem,4.6vw,3.15rem)] font-extrabold leading-[1.06] tracking-tight lg:not-sr-only">
            Shop Solar &amp; Energy Products
          </h1>
          <p className="mt-3.5 hidden max-w-[56ch] text-[1rem] leading-relaxed text-white/80 lg:block">
            Inverters, batteries, solar panels, generators, CCTV, installation kits and more. Genuine products. Competitive
            prices. Nationwide delivery.
          </p>
          <div className="max-w-[620px] lg:mt-6">
            <ShopSearch suggestions={suggestions(catalog)} defaultValue={query} />
          </div>
          <ul className="mt-7 hidden max-w-[620px] grid-cols-2 gap-2.5 lg:grid">
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

        <div className="hidden lg:block">
          <PromoSlideshow slides={slides} />
        </div>
      </div>
      <HeroWave />
    </section>
    <MobileBannerSlider slides={mobileSlides} />
    </>
  );
}
