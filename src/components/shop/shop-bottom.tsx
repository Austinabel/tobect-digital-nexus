import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import { ProductCard } from "@/components/shop/product-card";
import { getSiteLinks } from "@/lib/site-server";
import { onlinePaymentEnabled } from "@/lib/payments/paystack";
import {
  categoryGlyphs,
  IconArrowRight,
  IconShieldCheck,
  IconTruck,
  IconSupport,
  IconTag,
  IconWhatsApp,
  IconBuilding,
  IconCard,
  IconReturn,
} from "@/components/icons";

/**
 * Shopping assurances. "Online Payment" is only claimed once Paystack is
 * actually configured; until then that slot describes how payment works today.
 */
function assurances() {
  return [
    { Icon: IconTruck, title: "Nationwide Delivery", text: "Delivery across Nigeria", href: "/delivery" },
    { Icon: IconSupport, title: "After-Sales Support", text: "Installation & technical support" },
    onlinePaymentEnabled()
      ? { Icon: IconCard, title: "Online Payment", text: "Secure card, transfer & USSD" }
      : { Icon: IconCard, title: "Flexible Payment", text: "Pay after we confirm your order" },
    { Icon: IconReturn, title: "7-Day Return Policy", text: "Return eligible items within 7 days", href: "/returns" },
    { Icon: IconShieldCheck, title: "Warranty", text: "Manufacturer warranty on products", href: "/warranty" },
  ];
}

/** Phones: small pills in one swipeable row. Desktop: the blue assurance panel. */
const pill =
  "flex min-h-10 items-center gap-2 rounded-full bg-mist px-3.5 py-2 hover:underline focus-visible:outline-2 focus-visible:outline-blue lg:min-h-0 lg:gap-3 lg:rounded-xl lg:bg-transparent lg:p-0 lg:focus-visible:outline-white";

export function ShopTrustBar() {
  const TRUST = assurances();
  return (
    <section aria-label="Shopping assurances" className="bg-white py-3 lg:py-6">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-x-4 lg:gap-y-5 lg:rounded-3xl lg:bg-[linear-gradient(115deg,#0b3f9e,#1556d9)] lg:px-7 lg:py-6 lg:text-white [&::-webkit-scrollbar]:hidden">
          {TRUST.map((t) => {
            const { Icon, title, text } = t;
            const href = "href" in t ? t.href : undefined;
            const body = (
              <>
                <span className="grid shrink-0 place-items-center text-blue lg:size-11 lg:rounded-full lg:border lg:border-white/30 lg:text-white">
                  <Icon className="size-4 lg:size-5" />
                </span>
                <span>
                  <span className="block whitespace-nowrap font-heading text-[0.78rem] font-bold leading-tight text-ink lg:whitespace-normal lg:text-[0.86rem] lg:text-white">{title}</span>
                  <span className="hidden text-[0.74rem] leading-snug text-white/75 lg:block">{text}</span>
                </span>
              </>
            );
            return (
              <li key={title} className="shrink-0">
                {href ? (
                  <Link href={href} className={pill}>
                    {body}
                  </Link>
                ) : (
                  <span className={pill}>{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Phones: products in a sideways-swiping row with the next card peeking in. */
const rail = "-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:mt-4 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden";
const railItem = "w-[44vw] max-w-[210px] shrink-0 snap-start sm:w-auto sm:max-w-none";

/** A merchandising row (New Arrivals, Sale & Deals, Popular). Not rendered when empty. */
export function CollectionRow({ id, kicker, title, products, link }: { id: string; kicker: string; title: string; products: Product[]; link?: { href: string; label: string } }) {
  if (!products.length) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 bg-white py-4 lg:py-8">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="hidden items-center gap-2 font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red lg:flex">
              <span aria-hidden className="h-0.5 w-6 rounded bg-red" />
              {kicker}
            </span>
            <h2 id={`${id}-title`} className="font-heading text-[1.2rem] font-extrabold tracking-tight text-ink lg:mt-1 lg:text-[1.6rem]">
              {title}
            </h2>
          </div>
          {link && (
            <Link href={link.href} className="-my-3 inline-flex items-center gap-1.5 py-3 font-heading text-[0.86rem] font-bold text-blue hover:underline">
              {link.label}
              <IconArrowRight className="size-4" />
            </Link>
          )}
        </div>
        <div className={rail}>
          {products.map((p) => (
            <div key={p.slug} className={railItem}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Tile {
  key: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  tone: "light" | "red" | "navy";
  art: React.ReactNode;
  secondary?: { label: string; href: string };
}

/** Closing promo tiles. Collection tiles appear only when their collection has products. */
export async function ShopPromoTiles({ hasNewArrivals, hasDeals, hideKits }: { hasNewArrivals: boolean; hasDeals: boolean; hideKits?: boolean }) {
  const { SITE, whatsappHref } = await getSiteLinks();
  const tiles: Tile[] = [];
  if (hasNewArrivals)
    tiles.push({ key: "new", title: "New Arrivals", text: "Latest solar and energy products now in the shop.", cta: "Shop New Arrivals", href: "/shop#new-arrivals", tone: "light", art: categoryGlyphs.inverter });
  if (hasDeals)
    tiles.push({ key: "deals", title: "Sale & Deals", text: "Save on selected products and bundles.", cta: "Shop Deals", href: "/shop#deals", tone: "red", art: <IconTag /> });
  if (tiles.length < 2 && !hideKits)
    tiles.push({ key: "kits", title: "Complete Solar Setups", text: "Inverter, battery, panels and accessories in one package.", cta: "Shop Setups", href: "/shop/complete-solar-setups", tone: "light", art: categoryGlyphs.kit });
  tiles.push({
    key: "bulk",
    title: "Bulk & Commercial Orders",
    text: "Special pricing for installers, dealers and large projects.",
    cta: "Request Bulk Quote",
    href: "/bulk-quote",
    tone: "navy",
    art: <IconBuilding />,
    secondary: { label: "WhatsApp Sales", href: whatsappHref(`Hello ${SITE.shortName}, I'd like to discuss a bulk / commercial order.`) },
  });

  return (
    <section aria-label="More ways to shop" className="bg-white pb-12 pt-2 lg:pb-16">
      <div className={cn("mx-auto grid max-w-[1240px] gap-4 px-4 sm:px-6 lg:px-9", tiles.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {tiles.map((t) => {
          const light = t.tone === "light";
          return (
            <article
              key={t.key}
              id={t.key === "bulk" ? "bulk" : undefined}
              className={cn(
                "relative isolate flex min-h-[140px] overflow-hidden rounded-3xl p-5 lg:min-h-[180px] lg:p-6",
                light && "bg-[linear-gradient(115deg,#fff8e8,#eef5ff)] text-ink ring-1 ring-hair",
                t.tone === "red" && "bg-[linear-gradient(115deg,#c40f2b,#f01436)] text-white",
                t.tone === "navy" && "bg-[linear-gradient(115deg,#0b1930,#10306b)] text-white",
              )}
            >
              <span aria-hidden className={cn("absolute -bottom-3 -right-3 -z-10 size-32 [&>svg]:size-full", light ? "text-blue/15" : "text-white/15")}>
                {t.art}
              </span>
              <div className="flex flex-col">
                <h2 className="font-heading text-[1.35rem] font-extrabold leading-tight">{t.title}</h2>
                <p className={cn("mt-1.5 max-w-[30ch] text-[0.88rem]", light ? "text-slate" : "text-white/80")}>{t.text}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link
                    href={t.href}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-full px-5 font-heading text-[0.82rem] font-semibold",
                      t.tone === "red" ? "bg-white text-red-dark hover:bg-white/90" : "bg-red text-white hover:bg-red-dark",
                    )}
                  >
                    {t.cta}
                    <IconArrowRight className="size-3.5" />
                  </Link>
                  {t.secondary && (
                    <a
                      href={t.secondary.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/30 px-4 font-heading text-[0.82rem] font-semibold text-white hover:bg-white/10"
                    >
                      <IconWhatsApp className="size-4" />
                      {t.secondary.label}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Category showcase on the main shop page: a branded category tile beside
 * that category's products, so the section reads as complete even while a
 * category has only a few products listed. Hidden when the category is empty.
 */
export function CategoryShowcase({
  slug,
  kicker,
  title,
  blurb,
  glyph,
  products,
  total,
}: {
  slug: string;
  kicker: string;
  title: string;
  blurb: string;
  glyph: keyof typeof categoryGlyphs;
  products: Product[];
  total: number;
}) {
  if (!products.length) return null;
  const href = `/shop/${slug}`;
  return (
    <section id={`showcase-${slug}`} aria-label={title} className="scroll-mt-20 bg-white py-4 lg:py-7">
      <div className="mx-auto grid max-w-[1240px] px-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-4 lg:px-9">
        {/* phones: a simple row header */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <h2 className="font-heading text-[1.2rem] font-extrabold tracking-tight text-ink">{title}</h2>
          <Link href={href} className="-my-2 inline-flex items-center gap-1 py-2.5 font-heading text-[0.84rem] font-bold text-blue">
            See all{total > 0 && ` (${total})`}
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>
        <Link
          href={href}
          className="group relative isolate hidden overflow-hidden rounded-2xl bg-[linear-gradient(150deg,#0b1930_0%,#10306b_60%,#1556d9_130%)] p-5 text-white lg:flex lg:flex-col lg:p-6"
        >
          <span aria-hidden className="absolute -bottom-6 -right-6 -z-10 size-36 text-white/10 transition-transform duration-500 group-hover:scale-110 [&>svg]:size-full lg:size-44">
            {categoryGlyphs[glyph]}
          </span>
          <span aria-hidden className="absolute inset-y-0 right-[30%] -z-10 w-3 -skew-x-[18deg] bg-red/70 lg:right-[22%]" />
          <div className="flex grow flex-col">
            <span className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/70">{kicker}</span>
            <h2 className="mt-1 font-heading text-[1.5rem] font-extrabold leading-tight lg:text-[1.75rem]">
              {title}
            </h2>
            <p className="mt-1.5 max-w-[30ch] text-[0.85rem] leading-snug text-white/80">{blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-red px-4 py-2 font-heading text-[0.82rem] font-semibold transition-transform group-hover:-translate-y-0.5 lg:mt-auto">
              Shop all {total > 0 && <span className="opacity-80">({total})</span>}
              <IconArrowRight className="size-3.5" />
            </span>
          </div>
        </Link>
        <div className={cn(rail, "sm:pb-0 lg:mt-0")}>
          {products.map((p) => (
            <div key={p.slug} className={railItem}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
