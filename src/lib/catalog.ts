/**
 * The live catalogue (products + categories from the database) and the
 * helpers every page uses to read it. Isomorphic: the server fetches it
 * once per request (src/lib/catalog-server.ts) and client components read
 * the same snapshot through <CatalogProvider>.
 */
import type { Product } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import type { ShopKit } from "@/lib/data/kits";
import { brandSlug } from "@/lib/data/products";

export interface Catalog {
  products: Product[];
  categories: Category[];
  /** published solar kits, in display order */
  kits: ShopKit[];
  /** hand-picked product lists (Admin → Collections), slugs in display order */
  collections: { newArrivals: string[]; popular: string[] };
}

export const findProduct = (c: Catalog, slug: string) => c.products.find((p) => p.slug === slug);
export const findCategory = (c: Catalog, slug: string) => c.categories.find((x) => x.slug === slug);
/** Products in a category, including those in its subcategories. */
export const productsInCategory = (c: Catalog, slug: string) => c.products.filter((p) => p.category === slug || p.categoryPath?.includes(slug));
/** Top-level categories (menus, homepage, footer). */
export const topCategories = (c: Catalog) => c.categories.filter((x) => !x.parent);
/** Subcategories of a category, in display order. */
export const subcategoriesOf = (c: Catalog, slug: string) => c.categories.filter((x) => x.parent === slug);
export const featuredProducts = (c: Catalog) => c.products.filter((p) => p.featured);
export const categoryNames = (c: Catalog): Record<string, string> => Object.fromEntries(c.categories.map((x) => [x.slug, x.name]));
/** true while any listed product is a starter sample — the shop then shows its "indicative prices" notice */
export const hasSampleProducts = (c: Catalog) => c.products.some((p) => p.isSample);

/** Brands that actually appear in the catalogue, alphabetised. */
export function catalogueBrands(c: Catalog): { name: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of c.products) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, slug: brandSlug(name), count })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Case-insensitive match on every word of the query across name, brand, model, specs and category. */
export function searchCatalog(c: Catalog, query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const names = categoryNames(c);
  return c.products.filter((p) => {
    const haystack = [p.name, p.brand, p.model, ...p.specs, ...Object.values(p.attributes ?? {}), names[p.category] ?? p.category].filter(Boolean).join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

/** The shop category for complete solar setups; its page also shows the solar kits (the old /shop/installation-kits). */
export const SETUPS_CATEGORY = "complete-solar-setups";
