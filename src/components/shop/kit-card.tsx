import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/data/products";
import { kitCatalogueFrom, kitOnSale, type ShopKit } from "@/lib/data/kits";
import { getCatalog } from "@/lib/catalog-server";
import type { Product } from "@/lib/data/products";
import { defaultKitConfig, kitAvailability, priceKit } from "@/lib/shop/kits";
import { AvailabilityBadge } from "@/components/shop/availability-badge";
import { KitAddButton } from "@/components/shop/kit-add-button";
import { IconCheck, IconQuote } from "@/components/icons";

/** What a kit contains, in card-sized lines, from real catalogue data. */
export function kitHighlights(kit: ShopKit, products: Product[]): string[] {
  const kitCatalogue = kitCatalogueFrom(products);
  if (!kit.purchasable) return kit.outline ?? [];
  const price = priceKit(kit, defaultKitConfig(kit), kitCatalogue);
  return [...price.lines.map((l) => `${l.quantity} × ${l.productName}`), "Cables, breakers, surge protection & mounting"];
}

export async function KitCard({ kit: listed }: { kit: ShopKit }) {
  const { products } = await getCatalog();
  // Sold online only while every component is still listed; otherwise configured to order.
  const kit = kitOnSale(listed, products) ? listed : { ...listed, purchasable: false, outline: listed.outline ?? ["Hybrid inverter", "Battery storage", "Solar panels", "Installation accessories"] };
  const kitCatalogue = kitCatalogueFrom(products);
  const href = `/shop/installation-kits/${kit.slug}`;
  const config = defaultKitConfig(kit);
  const price = kit.purchasable ? priceKit(kit, config, kitCatalogue) : null;
  const availability = kitAvailability(kit, config, kitCatalogue);

  return (
    <article className="group flex h-full w-[76vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_1px_2px_rgba(13,27,47,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(13,27,47,0.3)] sm:w-auto sm:max-w-none">
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/8] overflow-hidden bg-[linear-gradient(115deg,#0b1930_0%,#10306b_60%,#1556d9_130%)]">
        {kit.photo && <Image
          src={kit.photo}
          alt=""
          fill
          sizes="(min-width: 1280px) 290px, (min-width: 640px) 45vw, 82vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ objectPosition: kit.photoPosition ?? "50% 50%" }}
        />}
        <span className="absolute left-3 top-3 rounded-md bg-blue px-2.5 py-1 font-heading text-[0.7rem] font-bold text-white shadow">
          {kit.capacityLabel} {kit.tag}
        </span>
      </Link>
      <div className="flex grow flex-col p-4">
        <h3 className="font-heading text-[1.02rem] font-bold text-ink">
          <Link href={href} className="hover:text-blue">
            {kit.name}
          </Link>
        </h3>
        <ul className="mt-2.5 space-y-1.5 text-[0.82rem] text-ink/85">
          {kitHighlights(kit, products).map((h) => (
            <li key={h} className="flex items-start gap-2">
              <IconCheck className="mt-0.5 size-3.5 shrink-0 text-whatsapp" />
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4">
          {price ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-heading text-[1.3rem] font-extrabold tabular-nums text-red-dark">{formatNaira(price.totalNgn)}</span>
                <AvailabilityBadge availability={availability} />
              </div>
              {price.hasUnpricedParts && <p className="text-[0.72rem] text-slate">Main components · accessories confirmed with order</p>}
            </>
          ) : (
            <p className="font-heading text-[0.95rem] font-bold text-ink">
              Configured to order
              <span className="block text-[0.74rem] font-normal text-slate">Price depends on the components you choose</span>
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={href}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border-[1.5px] border-[#c9d8f2] font-heading text-[0.82rem] font-semibold text-blue transition-colors hover:border-blue"
            >
              View Details
            </Link>
            {kit.purchasable ? (
              <KitAddButton slug={kit.slug} name={kit.name} config={config} disabled={availability === "out-of-stock"} />
            ) : (
              <Link
                href={`/quote?kit=${kit.slug}`}
                className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] bg-red px-2 font-heading text-[0.8rem] font-semibold text-white hover:bg-red-dark"
              >
                <IconQuote className="size-4 shrink-0" />
                Get a Quote
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
