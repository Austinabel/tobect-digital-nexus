import { cache } from "react";
import { categoryGlyphs, type CategoryGlyphKey } from "@/components/icons";
import { supabasePublic } from "@/lib/supabase/server";
import type { Availability, Product } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import type { Catalog } from "@/lib/catalog";
import type { ShopKit } from "@/lib/data/kits";
import type { KitRole } from "@/lib/shop/kits";

const glyphOf = (g: string | null | undefined): CategoryGlyphKey => (g && g in categoryGlyphs ? (g as CategoryGlyphKey) : "panel");
const AVAILABILITY = new Set(["in-stock", "pre-order", "out-of-stock"]);

interface ProductRow {
  slug: string;
  name: string;
  brand: string | null;
  model: string | null;
  category_slug: string;
  price_ngn: number | string;
  compare_at_price_ngn: number | string | null;
  specs: string[] | null;
  attributes: Record<string, string> | null;
  image_url: string | null;
  availability: string | null;
  stock_quantity: number | null;
  featured: boolean;
  is_sample: boolean;
  added_at: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  inverter_spec: { batteryV?: 12 | 24 | 48; maxPvV?: number; mpptMinV?: number } | null;
  product_images: { sort_order: number; media_assets: { public_url: string; alt: string } | null }[];
}

export function mapProduct(r: ProductRow, glyphs: Map<string, CategoryGlyphKey>): Product {
  const images = [...(r.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((i) => (i.media_assets ? [{ url: i.media_assets.public_url, alt: i.media_assets.alt || r.name }] : []));
  return {
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? undefined,
    model: r.model ?? undefined,
    category: r.category_slug,
    glyph: glyphs.get(r.category_slug) ?? "panel",
    priceNgn: Number(r.price_ngn),
    compareAtPriceNgn: r.compare_at_price_ngn === null ? undefined : Number(r.compare_at_price_ngn),
    specs: r.specs ?? [],
    attributes: r.attributes && Object.keys(r.attributes).length ? r.attributes : undefined,
    image: images[0]?.url ?? r.image_url ?? undefined,
    images,
    availability: r.availability && AVAILABILITY.has(r.availability) ? (r.availability as Availability) : undefined,
    stockQuantity: r.stock_quantity ?? undefined,
    // Starter samples aren't "new arrivals" just because they were seeded recently.
    addedAt: r.is_sample ? undefined : r.added_at,
    featured: r.featured,
    isSample: r.is_sample,
    description: r.description ?? undefined,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    inverterSpec: r.inverter_spec ?? undefined,
  };
}

interface KitRow {
  slug: string;
  name: string;
  capacity_label: string;
  tag: string | null;
  summary: string;
  applications: string[] | null;
  outline: string[] | null;
  image_url: string | null;
  image_alt: string | null;
  image_position: string | null;
  purchasable: boolean;
  accessories_price_ngn: number | string | null;
  installation_note: string | null;
  kit_slots: { key: string; label: string; role: KitRole; qty_default: number; qty_min: number; qty_max: number; sort_order: number; kit_slot_choices: { product_slug: string; sort_order: number }[] }[];
  kit_accessories: { name: string; detail: string | null; sort_order: number }[];
  kit_addons: { key: string; label: string; description: string | null; product_slug: string | null; price_ngn: number | string | null }[];
  kit_rules: { when_slot: string; when_product: string; require_slot: string; require_products: string[]; message: string }[];
}

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

export function mapKit(r: KitRow): ShopKit {
  return {
    slug: r.slug,
    name: r.name,
    capacityLabel: r.capacity_label,
    tag: r.tag ?? "Solar Kit",
    summary: r.summary,
    applications: r.applications ?? [],
    outline: r.outline?.length ? r.outline : undefined,
    photo: r.image_url ?? undefined,
    imageAlt: r.image_alt ?? undefined,
    photoPosition: r.image_position ?? undefined,
    purchasable: r.purchasable,
    slots: [...r.kit_slots].sort(bySort).map((s) => ({
      key: s.key,
      label: s.label,
      role: s.role,
      choices: [...s.kit_slot_choices].sort(bySort).map((c) => c.product_slug),
      quantity: { default: s.qty_default, min: s.qty_min, max: s.qty_max },
    })),
    accessories: [...r.kit_accessories].sort(bySort).map((a) => ({ name: a.name, detail: a.detail ?? undefined })),
    accessoriesPriceNgn: r.accessories_price_ngn === null ? undefined : Number(r.accessories_price_ngn),
    addons: r.kit_addons.map((a) => ({ key: a.key, label: a.label, description: a.description ?? undefined, productSlug: a.product_slug ?? undefined, priceNgn: a.price_ngn === null ? undefined : Number(a.price_ngn) })),
    rules: r.kit_rules.map((x) => ({ when: { slot: x.when_slot, choice: x.when_product }, require: { slot: x.require_slot, choices: x.require_products }, message: x.message })),
    installationNote: r.installation_note ?? undefined,
  };
}

export const KIT_SELECT =
  "*, kit_slots(key, label, role, qty_default, qty_min, qty_max, sort_order, kit_slot_choices(product_slug, sort_order)), kit_accessories(name, detail, sort_order), kit_addons(key, label, description, product_slug, price_ngn), kit_rules(when_slot, when_product, require_slot, require_products, message)";

/**
 * The published catalogue, read as an anonymous visitor (row-level security
 * hides drafts and trashed items). Fetched once per request.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const db = supabasePublic();
  const [cats, prods, kits, coll] = await Promise.all([
    db.from("categories").select("slug, name, glyph, image_url, sort_order, parent_slug").order("sort_order"),
    db.from("products").select("*, product_images(sort_order, media_assets(public_url, alt))").order("name"),
    db.from("solar_kits").select(KIT_SELECT).order("sort_order").order("name"),
    db.from("collection_items").select("collection, product_slug, sort_order").order("sort_order"),
  ]);
  for (const r of [cats, prods, kits, coll]) if (r.error) throw new Error(`Catalogue unavailable: ${r.error.message}`);
  const categories: Category[] = (cats.data ?? []).map((c) => ({ slug: c.slug, name: c.name, glyph: glyphOf(c.glyph), image: c.image_url ?? undefined, ...(c.parent_slug ? { parent: c.parent_slug } : {}) }));
  // a subcategory without its own icon choice shows its parent's
  const glyphs = new Map(categories.map((c) => [c.slug, c.glyph]));
  const parents = new Map(categories.filter((c) => c.parent).map((c) => [c.slug, c.parent!]));
  const products = (prods.data as unknown as ProductRow[]).map((r) => {
    const p = mapProduct(r, glyphs);
    const parent = parents.get(p.category);
    return parent ? { ...p, categoryPath: [p.category, parent] } : p;
  });
  const listed = new Set(products.map((p) => p.slug));
  const pick = (name: string) => (coll.data ?? []).filter((c) => c.collection === name && listed.has(c.product_slug)).map((c) => c.product_slug);
  return {
    categories,
    products,
    kits: (kits.data as unknown as KitRow[]).map(mapKit),
    collections: { newArrivals: pick("new-arrivals"), popular: pick("popular") },
  };
});
