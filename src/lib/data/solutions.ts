import type { ApplicationType } from "@/lib/calculator";

export type SolutionSlug = "residential" | "commercial" | "industrial" | "security";

export interface Solution {
  slug: SolutionSlug;
  title: string;
  short: string;
  intro: string;
  /** what the system typically powers — descriptive, not a performance claim */
  typicalLoads: string[];
  /** product categories most relevant to this solution */
  categories: string[];
  /** calculator preset to open for this solution, if applicable */
  calculatorPreset?: ApplicationType;
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "residential",
    title: "Residential",
    short: "Homes & apartments",
    intro:
      "Solar and backup power for homes and apartments — from a small inverter that keeps the lights and fans on during outages, to a full hybrid system that runs the house through the day.",
    typicalLoads: ["Lighting & fans", "TV & entertainment", "Fridges & freezers", "Air conditioning", "Water pumps"],
    categories: ["solar-panels", "inverters", "lithium-batteries", "solar-generators"],
    calculatorPreset: "home",
  },
  {
    slug: "commercial",
    title: "Commercial",
    short: "Offices, shops, hotels",
    intro:
      "Reliable power for offices, shops, hotels and schools, sized around your opening hours and the equipment you cannot afford to lose — computers, POS terminals, cold rooms and lighting.",
    typicalLoads: ["Computers & networking", "POS & printers", "Lighting", "Air conditioning", "Refrigeration"],
    categories: ["solar-panels", "inverters", "lithium-batteries"],
    calculatorPreset: "business",
  },
  {
    slug: "industrial",
    title: "Industrial",
    short: "Factories & warehouses",
    intro:
      "Larger hybrid systems for factories and warehouses, designed after a site assessment of your machinery, motor start-up loads and shift patterns.",
    typicalLoads: ["Motors & compressors", "Pumps", "Warehouse lighting", "Production equipment"],
    categories: ["solar-panels", "inverters", "lithium-batteries", "solar-pumps"],
    calculatorPreset: "industrial",
  },
  {
    slug: "security",
    title: "Security",
    short: "CCTV & surveillance",
    intro:
      "CCTV and surveillance systems for homes, estates and businesses, with solar or battery backup so cameras keep recording when grid power goes off.",
    typicalLoads: ["CCTV cameras", "Recorders (DVR/NVR)", "Security lighting"],
    categories: ["cctv-security", "solar-lights"],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
