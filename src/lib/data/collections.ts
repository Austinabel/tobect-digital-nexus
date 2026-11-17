import type { Product } from "@/lib/data/products";

/**
 * Merchandising collections for the shop.
 *
 * - New Arrivals: the hand-picked list (Admin → Collections) if it has any
 *   products, otherwise products listed in the last `NEW_ARRIVAL_DAYS` days.
 * - Sale & Deals: products with a genuine previous price (`compareAtPriceNgn`).
 * - Popular: hand-picked by staff from real sales — never guessed.
 * - Featured: `Product.featured`.
 *
 * A collection with no products is simply not shown.
 */
export const NEW_ARRIVAL_DAYS = 60;

const bySlug = (products: Product[], slugs: string[]) => slugs.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));

export function getNewArrivals(products: Product[], now: Date, limit = 8, pinned: string[] = []): Product[] {
  if (pinned.length) return bySlug(products, pinned).slice(0, limit);
  const cutoff = now.getTime() - NEW_ARRIVAL_DAYS * 86_400_000;
  return products.filter((p) => p.addedAt && Date.parse(p.addedAt) >= cutoff)
    .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))
    .slice(0, limit);
}

export function isOnSale(p: Product): boolean {
  return p.compareAtPriceNgn !== undefined && p.compareAtPriceNgn > p.priceNgn;
}

export function getSaleProducts(products: Product[], limit = 8): Product[] {
  return products.filter(isOnSale).slice(0, limit);
}

export function getPopularProducts(products: Product[], popular: string[], limit = 8): Product[] {
  return bySlug(products, popular).slice(0, limit);
}
