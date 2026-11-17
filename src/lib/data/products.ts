import type { CategoryGlyphKey } from "@/components/icons";

export type Availability = "in-stock" | "pre-order" | "out-of-stock";

export interface Product {
  slug: string;
  name: string;
  /** manufacturer, only when it is part of the verified product name */
  brand?: string;
  /** manufacturer model number, when known */
  model?: string;
  /** slug of the category in `CATEGORIES` */
  category: string;
  /** set when the category is a subcategory: [subcategory, parent] */
  categoryPath?: string[];
  /** shop code and manufacturer barcode, when known */
  sku?: string;
  barcode?: string;
  glyph: CategoryGlyphKey;
  priceNgn: number;
  /**
   * Previous price — set ONLY for a genuine, approved reduction. When set
   * (and higher than `priceNgn`) the product appears in Sale & Deals.
   */
  compareAtPriceNgn?: number;
  /** short, verified spec chips shown on cards (e.g. "10 kVA", "Hybrid") */
  specs: string[];
  /**
   * Verified technical attributes used by the shop's spec filters, keyed as
   * in `SPEC_FILTERS` (src/lib/shop/catalogue-query.ts). Leave a key out
   * rather than guess it.
   */
  attributes?: Record<string, string>;
  /** main product photo URL (first of `images`); undefined until a real photo exists */
  image?: string;
  /** all product photos in display order, from the media library */
  images?: { url: string; alt: string }[];
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** starter/sample item — prices are indicative and it's excluded from structured data */
  isSample?: boolean;
  /** undefined = not tracked yet, so the UI asks the customer to confirm */
  availability?: Availability;
  /** units on hand; undefined = stock not tracked (orders are confirmed by hand) */
  stockQuantity?: number;
  /** ISO date the product was listed — drives "New Arrivals" and the Newest sort */
  addedAt?: string;
  /**
   * Inverters only — values copied from the manufacturer's datasheet. The
   * solar calculator uses them when a customer picks this model; leave a
   * field out until it has been checked against the datasheet.
   */
  inverterSpec?: { batteryV?: 12 | 24 | 48; maxPvV?: number; mpptMinV?: number };
  featured?: boolean;
}

/**
 * STARTER CATALOGUE — the sample products a fresh install starts with
 * (also in supabase/seed.sql). The live shop reads products from the
 * database (see src/lib/catalog.ts); this list is NOT used by the site.
 * Specs below are only what each product name itself states.
 */
export const STARTER_PRODUCTS: Product[] = [
  {
    slug: "deye-10kva-hybrid-inverter",
    name: "Deye 10kVA Hybrid Inverter",
    brand: "Deye",
    category: "inverters",
    glyph: "inverter",
    priceNgn: 985_000,
    specs: ["10 kVA", "Hybrid"],
    attributes: { capacity: "10 kVA", inverterType: "Hybrid" },
    featured: true,
  },
  {
    slug: "beve-15kwh-lithium-battery",
    name: "BEVE 15kWh Lithium Battery",
    brand: "BEVE",
    category: "lithium-batteries",
    glyph: "battery",
    priceNgn: 2_280_000,
    specs: ["15 kWh", "Lithium"],
    attributes: { capacity: "15 kWh", chemistry: "Lithium" },
    featured: true,
  },
  {
    slug: "jinko-550w-solar-panel",
    name: "Jinko 550W Solar Panel",
    brand: "Jinko Solar",
    category: "solar-panels",
    glyph: "panel",
    priceNgn: 142_000,
    specs: ["550 W"],
    attributes: { wattage: "550 W" },
    featured: true,
  },
  {
    slug: "cola-solar-3600w-generator",
    name: "Cola Solar 3600W Generator",
    brand: "Cola Solar",
    category: "solar-generators",
    glyph: "generator",
    priceNgn: 1_450_000,
    specs: ["3600 W"],
    attributes: { output: "3600 W" },
    featured: true,
  },
  {
    slug: "cctv-4-lens-camera-kit",
    name: "CCTV 4-Lens Camera",
    category: "cctv-security",
    glyph: "camera",
    priceNgn: 95_000,
    specs: ["4 lenses"],
    featured: true,
  },
  {
    slug: "solar-street-light-200w",
    name: "Solar Street Light 200W",
    category: "solar-lights",
    glyph: "light",
    priceNgn: 75_000,
    specs: ["200 W"],
    attributes: { wattage: "200 W" },
    featured: true,
  },
];

export function brandSlug(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
