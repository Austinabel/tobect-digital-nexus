import type { CategoryGlyphKey } from "@/components/icons";

export interface Product {
  slug: string;
  name: string;
  glyph: CategoryGlyphKey;
  priceNgn: number;
  rating: number;
  reviewCount: number;
}

/**
 * Placeholder "best sellers" data for early UI work. Replace with a
 * Supabase query (`products` table, `featured = true`) once the
 * database is wired up.
 */
export const FEATURED_PRODUCTS: Product[] = [
  { slug: "deye-10kva-hybrid-inverter", name: "Deye 10kVA Hybrid Inverter", glyph: "inverter", priceNgn: 985_000, rating: 4.8, reviewCount: 24 },
  { slug: "beve-15kwh-lithium-battery", name: "BEVE 15kWh Lithium Battery", glyph: "battery", priceNgn: 2_280_000, rating: 4.9, reviewCount: 18 },
  { slug: "jinko-550w-solar-panel", name: "Jinko 550W Solar Panel", glyph: "panel", priceNgn: 142_000, rating: 4.8, reviewCount: 32 },
  { slug: "cola-solar-3600w-generator", name: "Cola Solar 3600W Generator", glyph: "generator", priceNgn: 1_450_000, rating: 4.6, reviewCount: 16 },
  { slug: "cctv-4-lens-camera-kit", name: "CCTV 4-Lens Camera", glyph: "camera", priceNgn: 95_000, rating: 4.7, reviewCount: 12 },
  { slug: "solar-street-light-200w", name: "Solar Street Light 200W", glyph: "light", priceNgn: 75_000, rating: 4.6, reviewCount: 20 },
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
