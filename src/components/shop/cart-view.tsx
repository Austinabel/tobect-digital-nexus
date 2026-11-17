"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useCart, type CartLine } from "@/lib/cart";
import { formatNaira, type Product } from "@/lib/data/products";
import { findKit, kitCatalogueFrom, type ShopKit } from "@/lib/data/kits";
import { useCatalog } from "@/components/catalog-provider";
import { findProduct } from "@/lib/catalog";
import { describeKitConfig, kitComponentDemand, normaliseKitConfig, priceKit, validateKitConfig } from "@/lib/shop/kits";
import { aggregateDemand, checkStock, type DemandLine } from "@/lib/shop/inventory";
import { useSiteLinks } from "@/components/site-provider";
import { ProductImage } from "@/components/shop/product-image";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { IconMinus, IconPlus, IconTrash, IconWhatsApp, IconMail, IconCart, IconInfo, IconPackage } from "@/components/icons";

const noopSubscribe = () => () => {};

type Item =
  | { kind: "product"; line: CartLine; product: Product; unit: number; total: number }
  | { kind: "kit"; line: CartLine; kit: ShopKit; parts: string[]; unit: number; total: number; unpriced: boolean; errors: string[]; demand: Record<string, number> };

export function CartView() {
  const { SITE, whatsappHref, mailtoHref } = useSiteLinks();
  // Live catalogue (from the database), shared via <CatalogProvider>.
  const catalog = useCatalog();
  const kitCatalogue = useMemo(() => kitCatalogueFrom(catalog.products), [catalog]);
  const getProduct = useCallback((slug: string) => findProduct(catalog, slug), [catalog]);
  const { lines, count, setQuantity, remove, clear } = useCart();
  // The cart lives in localStorage, so render a neutral state until we're on the client.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const items = useMemo(
    () =>
      lines.flatMap((line): Item[] => {
        if (line.kit) {
          const kit = findKit(catalog.kits, line.slug);
          if (!kit) return [];
          // Re-normalise against today's kit definition so a stale saved config can't price an impossible system.
          const config = normaliseKitConfig(kit, line.kit);
          const price = priceKit(kit, config, kitCatalogue);
          return [
            {
              kind: "kit",
              line,
              kit,
              parts: describeKitConfig(kit, config, kitCatalogue),
              unit: price.totalNgn,
              total: price.totalNgn * line.quantity,
              unpriced: price.hasUnpricedParts,
              errors: validateKitConfig(kit, config, kitCatalogue).errors,
              demand: kitComponentDemand(kit, config),
            },
          ];
        }
        const product = getProduct(line.slug);
        return product ? [{ kind: "product", line, product, unit: product.priceNgn, total: product.priceNgn * line.quantity }] : [];
      }),
    [lines, getProduct, kitCatalogue, catalog.kits],
  );
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const anyUnpriced = items.some((i) => i.kind === "kit" && i.unpriced);

  // Inventory: kits and loose products are converted to catalogue units and checked together.
  const stock = useMemo(() => {
    const demand: DemandLine[] = items.map((i) =>
      i.kind === "kit"
        ? { kind: "kit", components: i.demand, quantity: i.line.quantity }
        : { kind: "product", slug: i.product.slug, quantity: i.line.quantity },
    );
    return checkStock(aggregateDemand(demand), (slug) => {
      const p = getProduct(slug);
      return p?.availability === "out-of-stock" ? 0 : p?.stockQuantity;
    });
  }, [items, getProduct]);
  const kitErrors = items.flatMap((i) => (i.kind === "kit" ? i.errors.map((e) => `${i.kit.name}: ${e}`) : []));
  const blocked = !stock.ok || kitErrors.length > 0;

  const orderText = [
    `Hello ${SITE.shortName}, I'd like to order:`,
    "",
    ...items.flatMap((i) =>
      i.kind === "kit"
        ? [`- ${i.line.quantity} × ${i.kit.name} (${formatNaira(i.unit)} each${i.unpriced ? " + accessories" : ""})`, ...i.parts.map((p) => `    · ${p}`)]
        : [`- ${i.line.quantity} × ${i.product.name} (${formatNaira(i.unit)} each)`],
    ),
    "",
    `Website subtotal: ${formatNaira(subtotal)}${anyUnpriced ? " (kit accessories/installation to be confirmed)" : ""}`,
    ...(name.trim() ? [`Name: ${name.trim()}`] : []),
    ...(location.trim() ? [`Delivery location: ${location.trim()}`] : []),
    "",
    "Please confirm availability, final price and delivery.",
  ].join("\n");

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-3xl bg-field" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#c9d8f2] bg-white px-6 py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mist text-blue">
          <IconCart className="size-6" />
        </span>
        <h2 className="mt-4 font-heading text-[1.25rem] font-bold text-ink">Your cart is empty</h2>
        <p className="mt-1.5 text-slate">Browse the shop and add products to build your order.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-red px-7 font-heading text-[0.92rem] font-semibold text-white hover:bg-red-dark"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="overflow-hidden rounded-3xl border border-hair bg-white">
        <ul className="divide-y divide-hair">
          {items.map((item) => {
            const { line } = item;
            const title = item.kind === "kit" ? item.kit.name : item.product.name;
            const href = item.kind === "kit" ? `/shop/installation-kits/${item.kit.slug}` : `/product/${item.product.slug}`;
            return (
              <li key={line.id} className="grid grid-cols-[72px_1fr] gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:p-5">
                <Link href={href} className="overflow-hidden rounded-xl border border-hair">
                  {item.kind === "kit" ? (
                    <span className="grid aspect-square place-items-center bg-mist text-blue">
                      <IconPackage className="size-8" />
                    </span>
                  ) : (
                    <ProductImage product={item.product} sizes="96px" compact />
                  )}
                </Link>
                <div className="min-w-0">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate-light">
                    {item.kind === "kit" ? "Complete solar kit" : (item.product.brand ?? SITE.shortName)}
                  </span>
                  <Link href={href} className="block font-heading text-[0.96rem] font-semibold leading-snug text-ink hover:text-blue">
                    {title}
                  </Link>
                  {item.kind === "kit" && (
                    <ul className="mt-1 space-y-0.5 text-[0.78rem] text-slate">
                      {item.parts.map((p) => (
                        <li key={p}>· {p}</li>
                      ))}
                    </ul>
                  )}
                  <span className="text-[0.82rem] text-slate">
                    {formatNaira(item.unit)} each{item.kind === "kit" && item.unpriced ? ` + accessories (confirmed by ${SITE.shortName})` : ""}
                  </span>
                  {item.kind === "kit" &&
                    item.errors.map((e) => (
                      <p key={e} className="mt-1 text-[0.78rem] font-semibold text-red-dark">
                        {e}
                      </p>
                    ))}
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 items-center rounded-full border border-hair" role="group" aria-label={`${title} quantity`}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        className="grid h-full w-9 place-items-center text-slate hover:text-blue"
                      >
                        <IconMinus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center font-heading font-bold tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        className="grid h-full w-9 place-items-center text-slate hover:text-blue"
                      >
                        <IconPlus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${title}`}
                      onClick={() => remove(line.id)}
                      className="grid size-10 place-items-center rounded-full text-slate hover:bg-field hover:text-red"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                  <span className="font-heading text-[1.02rem] font-extrabold tabular-nums text-ink">{formatNaira(item.total)}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between border-t border-hair px-5 py-3">
          <Link href="/shop" className="text-[0.86rem] font-semibold text-blue hover:underline">
            &larr; Continue shopping
          </Link>
          <button type="button" onClick={clear} className="text-[0.86rem] font-semibold text-slate hover:text-red">
            Clear cart
          </button>
        </div>
      </div>

      <aside className="rounded-3xl border border-hair bg-white p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-heading text-[1.1rem] font-bold text-ink">Order summary</h2>
        <div className="mt-4 flex items-baseline justify-between border-b border-hair pb-4">
          <span className="text-slate">Subtotal</span>
          <span className="font-heading text-[1.4rem] font-extrabold tabular-nums text-ink">{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-3 text-[0.8rem] text-slate">
          Delivery and installation are quoted separately.
          {anyUnpriced && " Kit installation accessories are confirmed with your order."}
        </p>

        {(stock.shortfalls.length > 0 || kitErrors.length > 0) && (
          <div role="alert" className="mt-4 rounded-xl border border-red/30 bg-red/5 px-3.5 py-3 text-[0.82rem] text-red-dark">
            <p className="font-semibold">Please adjust your cart before ordering:</p>
            <ul className="mt-1 list-disc pl-4">
              {stock.shortfalls.map((s) => (
                <li key={s.slug}>
                  {getProduct(s.slug)?.name ?? s.slug}: {s.available === 0 ? "out of stock" : `only ${s.available} available`} (you need {s.requested},
                  including kit components)
                </li>
              ))}
              {kitErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[0.78rem] font-semibold text-ink">Your name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-11 w-full rounded-xl border border-hair px-3 text-[0.92rem] outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[0.78rem] font-semibold text-ink">Delivery city / state (optional)</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoComplete="address-level2"
              className="h-11 w-full rounded-xl border border-hair px-3 text-[0.92rem] outline-none focus:border-blue"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-2.5">
          {blocked ? (
            <span className="inline-flex h-12 items-center justify-center rounded-full bg-field font-heading text-[0.9rem] font-semibold text-slate">
              Fix the items above to send your order
            </span>
          ) : (
            <>
              <Link
                href="/checkout"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-red font-heading text-[1rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-colors hover:bg-red-dark"
              >
                Proceed to Checkout
              </Link>
              <p className="text-center text-[0.74rem] text-slate">Guest checkout available · or order by WhatsApp / email:</p>
              <a
                href={whatsappHref(orderText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#bfe4cd] font-heading text-[0.9rem] font-semibold text-whatsapp transition-colors hover:border-whatsapp"
              >
                <IconWhatsApp className="size-[18px]" />
                Send Order on WhatsApp
              </a>
              <a
                href={mailtoHref("Order request from tobecat.com", orderText)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] font-heading text-[0.9rem] font-semibold text-blue transition-colors hover:border-blue"
              >
                <IconMail className="size-4" />
                Send Order by Email
              </a>
            </>
          )}
        </div>

        <p className="mt-4 flex gap-2 text-[0.76rem] leading-snug text-slate">
          <IconInfo className="mt-px size-4 shrink-0" />
          Our team confirms stock, delivery and any kit accessories with you before your order is dispatched.
        </p>
        <CatalogueNotice className="mt-3" />
      </aside>

      {/* phones & tablets: total + checkout fixed to the bottom of the screen */}
      <div className="shop-actionbar fixed inset-x-0 bottom-0 z-[65] border-t border-hair bg-white/95 px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-16px_rgba(13,27,47,0.35)] backdrop-blur-md print:hidden lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0">
            <span className="block text-[0.76rem] text-slate">Subtotal · {count} {count === 1 ? "item" : "items"}</span>
            <span className="block font-heading text-[1.15rem] font-extrabold tabular-nums text-ink">{formatNaira(subtotal)}</span>
          </div>
          {blocked ? (
            <span className="ml-auto text-right text-[0.8rem] font-semibold text-red-dark">Fix the items above</span>
          ) : (
            <Link
              href="/checkout"
              className="ml-auto inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-red px-7 font-heading text-[0.95rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] hover:bg-red-dark"
            >
              Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
