import type { CategoryGlyphKey } from "@/components/icons";

export interface Category {
  slug: string;
  name: string;
  glyph: CategoryGlyphKey;
}

/**
 * Placeholder catalogue data for early UI work. Replace with a
 * Supabase query (`categories` table) once the database is wired up —
 * the shape here is deliberately close to what that table will hold.
 */
export const CATEGORIES: Category[] = [
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
