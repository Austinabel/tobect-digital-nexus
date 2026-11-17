/**
 * Server-side order pricing. The browser only says WHAT it wants (slugs,
 * quantities, kit choices); every price is looked up again here, so a
 * tampered cart can't change what the customer pays.
 */
import {
  describeKitConfig,
  kitComponentDemand,
  normaliseKitConfig,
  priceKit,
  validateKitConfig,
  type KitCatalogue,
  type KitConfig,
  type SolarKit,
} from "./kits";
import { aggregateDemand, type DemandLine } from "./inventory";

export interface RequestedLine {
  slug: string;
  quantity: number;
  kit?: Partial<KitConfig>;
}

export interface PricedLine {
  kind: "product" | "kit";
  slug: string;
  name: string;
  quantity: number;
  unitPriceNgn: number;
  lineTotalNgn: number;
  kitConfig?: KitConfig;
  kitParts?: string[];
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotalNgn: number;
  hasUnpricedParts: boolean;
  /** catalogue units to reserve (kits expanded to components) */
  demand: { slug: string; qty: number }[];
  errors: string[];
}

export const MAX_LINES = 50;
export const MAX_QTY = 99;

/** Parse untrusted JSON from the checkout form into well-formed lines (or null). */
export function parseRequestedLines(raw: unknown): RequestedLine[] | null {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(data) || data.length === 0 || data.length > MAX_LINES) return null;
  const out: RequestedLine[] = [];
  for (const l of data) {
    if (!l || typeof l.slug !== "string" || l.slug.length > 120 || !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > MAX_QTY) return null;
    out.push({ slug: l.slug, quantity: l.quantity, ...(l.kit && typeof l.kit === "object" ? { kit: l.kit as Partial<KitConfig> } : {}) });
  }
  return out;
}

export function priceOrder(lines: RequestedLine[], catalogue: KitCatalogue, kitOf: (slug: string) => SolarKit | undefined): PricedOrder {
  const priced: PricedLine[] = [];
  const errors: string[] = [];
  const demand: DemandLine[] = [];
  let hasUnpricedParts = false;

  for (const line of lines) {
    if (line.kit) {
      const kit = kitOf(line.slug);
      if (!kit) {
        errors.push("A kit in your cart is no longer available.");
        continue;
      }
      const config = normaliseKitConfig(kit, line.kit);
      const problems = validateKitConfig(kit, config, catalogue).errors;
      if (problems.length) {
        errors.push(...problems.map((p) => `${kit.name}: ${p}`));
        continue;
      }
      const price = priceKit(kit, config, catalogue);
      hasUnpricedParts ||= price.hasUnpricedParts;
      priced.push({
        kind: "kit",
        slug: kit.slug,
        name: kit.name,
        quantity: line.quantity,
        unitPriceNgn: price.totalNgn,
        lineTotalNgn: price.totalNgn * line.quantity,
        kitConfig: config,
        kitParts: describeKitConfig(kit, config, catalogue),
      });
      demand.push({ kind: "kit", components: kitComponentDemand(kit, config), quantity: line.quantity });
    } else {
      const product = catalogue(line.slug);
      if (!product) {
        errors.push("A product in your cart is no longer available.");
        continue;
      }
      if (product.availability === "out-of-stock") {
        errors.push(`${product.name} is out of stock.`);
        continue;
      }
      priced.push({
        kind: "product",
        slug: product.slug,
        name: product.name,
        quantity: line.quantity,
        unitPriceNgn: product.priceNgn,
        lineTotalNgn: product.priceNgn * line.quantity,
      });
      demand.push({ kind: "product", slug: product.slug, quantity: line.quantity });
    }
  }

  return {
    lines: priced,
    subtotalNgn: priced.reduce((s, l) => s + l.lineTotalNgn, 0),
    hasUnpricedParts,
    demand: [...aggregateDemand(demand)].map(([slug, qty]) => ({ slug, qty })),
    errors,
  };
}
