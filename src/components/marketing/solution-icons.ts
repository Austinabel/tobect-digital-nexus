import type { SolutionSlug } from "@/lib/data/solutions";
import { IconHouse, IconBuilding, IconFactory, IconShieldCheck } from "@/components/icons";

export const SOLUTION_ICONS: Record<SolutionSlug, typeof IconHouse> = {
  residential: IconHouse,
  commercial: IconBuilding,
  industrial: IconFactory,
  security: IconShieldCheck,
};
