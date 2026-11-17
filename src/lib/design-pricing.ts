/**
 * Prices a solar design from the shop catalogue — honestly.
 *
 * Only equipment that matches a catalogue product EXACTLY is priced:
 *   inverter  — the model the customer picked, or one whose rating equals the design's kVA
 *   panels    — a panel whose wattage equals the chosen panel size
 *   batteries — a battery whose capacity equals the chosen module (and same chemistry)
 * Everything else (cables, breakers, mounting, unmatched equipment) is
 * listed as "to be quoted" — never estimated or invented.
 */
import type { BomLine, SolarDesign } from "./solar-design";

export interface CatalogueEntry {
  slug: string;
  name: string;
  category: string;
  priceNgn: number;
  attributes?: Record<string, string>;
  availability?: "in-stock" | "pre-order" | "out-of-stock";
}

export interface PricedItem {
  bom: BomLine;
  product: CatalogueEntry;
  qty: number;
  unitPriceNgn: number;
  totalNgn: number;
}

export interface DesignPricing {
  priced: PricedItem[];
  /** shopping-list lines with no exact catalogue match — quoted by Tobecat */
  unpriced: BomLine[];
  pricedSubtotalNgn: number;
  /** inverter, panels and batteries all matched — the main-equipment cost is known */
  mainEquipmentPriced: boolean;
  /** priced items that can go straight into the cart (not out of stock) */
  cartItems: { slug: string; name: string; qty: number }[];
}

/** First number in an attribute like "10 kVA", "550 W", "15 kWh". */
export function attrNumber(value: string | undefined, unit: RegExp): number | null {
  if (!value || !unit.test(value)) return null;
  const n = parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

const same = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.01, b * 0.01);

export function priceDesign(
  design: SolarDesign,
  catalogue: CatalogueEntry[],
  opts: { panelWatt: number; inverterSlug?: string; chemistry: "lithium" | "lead-acid" },
): DesignPricing {
  const findInverter = () =>
    (opts.inverterSlug ? catalogue.find((p) => p.slug === opts.inverterSlug) : undefined) ??
    catalogue.find((p) => p.category === "inverters" && same(attrNumber(p.attributes?.capacity, /kva/i) ?? -1, design.inverterKva));
  const findPanel = () => catalogue.find((p) => p.category === "solar-panels" && attrNumber(p.attributes?.wattage, /\bw\b/i) === opts.panelWatt);
  const findBattery = () => {
    const m = design.battery?.module;
    if (!m) return undefined;
    const kwh = Math.round(m.nominalV * m.ah) / 1000;
    return catalogue.find((p) => {
      if (p.category !== "lithium-batteries") return false;
      const cap = attrNumber(p.attributes?.capacity, /kwh/i);
      const chem = (p.attributes?.chemistry ?? "").toLowerCase();
      return cap !== null && same(cap, kwh) && (opts.chemistry === "lithium" ? /lithium|lifepo/.test(chem) : /lead|tubular|gel|agm/.test(chem));
    });
  };

  const priced: PricedItem[] = [];
  const unpriced: BomLine[] = [];
  const matched = { inverter: false, panels: false, batteries: !design.battery };

  for (const line of design.bom) {
    let product: CatalogueEntry | undefined;
    if (line.group === "Main equipment" && line.shop === "inverters") product = findInverter();
    else if (line.group === "Main equipment" && line.shop === "solar-panels") product = findPanel();
    else if (line.group === "Batteries" && line.unit === "modules") product = findBattery();

    if (product && product.priceNgn > 0) {
      priced.push({ bom: line, product, qty: line.qty, unitPriceNgn: product.priceNgn, totalNgn: product.priceNgn * line.qty });
      if (line.shop === "inverters") matched.inverter = true;
      if (line.shop === "solar-panels") matched.panels = true;
      if (line.unit === "modules") matched.batteries = true;
    } else {
      unpriced.push(line);
    }
  }

  return {
    priced,
    unpriced,
    pricedSubtotalNgn: priced.reduce((s, p) => s + p.totalNgn, 0),
    mainEquipmentPriced: matched.inverter && matched.panels && matched.batteries,
    cartItems: priced.filter((p) => p.product.availability !== "out-of-stock").map((p) => ({ slug: p.product.slug, name: p.product.name, qty: Math.min(99, p.qty) })),
  };
}

/* ------------------------------------------------------------------ */
/* Generator savings                                                   */
/* ------------------------------------------------------------------ */

export interface SavingsInput {
  /** what the customer spends on generator fuel per week (₦) — their own figure */
  fuelPerWeekNgn: number;
  /** generator servicing / repairs per month (₦) — their own figure */
  maintenancePerMonthNgn: number;
  /** price of the solar system (₦) — from a quote or a fully priced design */
  systemCostNgn?: number;
}

export interface SavingsResult {
  monthlyNgn: number;
  yearlyNgn: number;
  /** null when no system cost is known */
  paybackMonths: number | null;
  /** savings minus system cost after 5 years; null without a system cost */
  fiveYearNetNgn: number | null;
}

/**
 * Straight arithmetic on the customer's own spending: the money that stops
 * going on fuel and servicing if solar replaces the generator. No fuel
 * prices or consumption figures are assumed.
 */
export function generatorSavings(input: SavingsInput): SavingsResult | null {
  const fuel = Math.max(0, Number(input.fuelPerWeekNgn) || 0);
  const maint = Math.max(0, Number(input.maintenancePerMonthNgn) || 0);
  const monthlyNgn = Math.round((fuel * 52) / 12 + maint);
  if (monthlyNgn <= 0) return null;
  const cost = input.systemCostNgn && input.systemCostNgn > 0 ? input.systemCostNgn : null;
  return {
    monthlyNgn,
    yearlyNgn: monthlyNgn * 12,
    paybackMonths: cost ? Math.round((cost / monthlyNgn) * 10) / 10 : null,
    fiveYearNetNgn: cost ? monthlyNgn * 60 - cost : null,
  };
}
