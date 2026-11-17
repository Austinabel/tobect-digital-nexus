import type { CategoryGlyphKey } from "@/components/icons";

export interface Category {
  slug: string;
  name: string;
  glyph: CategoryGlyphKey;
  /** real category/product photo URL — leave undefined until one exists (the glyph is shown instead) */
  image?: string;
  /** set on a subcategory: the slug of its parent category */
  parent?: string;
}

/**
 * STARTER CATEGORIES — what a fresh install starts with (also in
 * supabase/seed.sql). The live site reads categories from the database
 * (see src/lib/catalog.ts) and they're managed in the admin.
 */
export const STARTER_CATEGORIES: Category[] = [
  { slug: "solar-panels", name: "Solar Panels", glyph: "panel" },
  { slug: "inverters", name: "Inverters", glyph: "inverter" },
  { slug: "lithium-batteries", name: "Lithium Batteries", glyph: "battery" },
  { slug: "solar-generators", name: "Solar Generators", glyph: "generator" },
  { slug: "cctv-security", name: "CCTV & Security", glyph: "camera" },
  { slug: "solar-lights", name: "Solar Lights", glyph: "light" },
  { slug: "solar-fans", name: "Solar Fans", glyph: "fan" },
  { slug: "solar-freezers", name: "Solar Freezers", glyph: "freezer" },
  { slug: "solar-pumps", name: "Solar Pumps", glyph: "pump" },
];
