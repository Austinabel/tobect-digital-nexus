import type { Product } from "@/lib/data/products";
import type { KitCatalogue, SolarKit } from "@/lib/shop/kits";

/**
 * Complete solar installation kits, as the shop shows them. Kits live in
 * the database (Admin → Solar kits) and reach pages through the catalogue
 * snapshot: `catalog.kits` (see src/lib/catalog-server.ts).
 *
 * Kit prices are never typed in: they are added up from the catalogue
 * prices of the components, so they stay in step with the product list.
 * A kit is `purchasable` only when every component is a real catalogue
 * product; the others are "configured to order" with a quote button.
 */
export interface ShopKit extends SolarKit {
  /** application photo for the card header (media-library URL) */
  photo?: string;
  photoPosition?: string;
  /** short tag over the photo, e.g. "Home Kit" */
  tag: string;
}

export function findKit(kits: ShopKit[], slug: string): ShopKit | undefined {
  return kits.find((k) => k.slug === slug);
}

/** Catalogue lookup for kit pricing/validation, backed by the live (database) product list. */
export function kitCatalogueFrom(products: Product[]): KitCatalogue {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return (slug) => bySlug.get(slug);
}

/**
 * A "purchasable" kit is only sold online while every one of its components
 * is still in the live catalogue; otherwise it's shown as configured to order.
 */
export function kitOnSale(kit: ShopKit, products: Product[]): boolean {
  if (!kit.purchasable) return false;
  const live = new Set(products.map((p) => p.slug));
  return kit.slots.every((s) => s.choices.some((c) => live.has(c)));
}
