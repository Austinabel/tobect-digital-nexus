/**
 * Solar installation kits — configuration, pricing and validation.
 *
 * Pure functions with no framework or path-alias imports, so they run in
 * the browser, on the server and under `node --test` alike. Product data
 * is passed in through `KitCatalogue`, which keeps a kit's price derived
 * from the real catalogue prices of its components instead of a second,
 * separately-maintained number that could drift.
 */

export type KitRole = "inverter" | "battery" | "panel";

/** A swappable, quantity-bearing component position in a kit (e.g. "Battery"). */
export interface KitSlot {
  key: string;
  label: string;
  role: KitRole;
  /** product slugs the customer may choose from; the first is the default */
  choices: string[];
  quantity: { default: number; min: number; max: number };
}

/** Installation accessory that is always included (cables, breakers…). */
export interface KitAccessory {
  name: string;
  detail?: string;
}

/** Optional extra the customer can tick. Priced from the catalogue, a fixed price, or "quoted". */
export interface KitAddon {
  key: string;
  label: string;
  description?: string;
  productSlug?: string;
  priceNgn?: number;
}

/** "If slot X uses product A, slot Y must use one of B…" */
export interface KitRule {
  when: { slot: string; choice: string };
  require: { slot: string; choices: string[] };
  message: string;
}

export interface SolarKit {
  slug: string;
  name: string;
  /** headline system rating, e.g. "10KVA" */
  capacityLabel: string;
  summary: string;
  applications: string[];
  image?: string;
  imageAlt?: string;
  /** false = configured to order: shown with "Request a Quote" instead of Add to Cart */
  purchasable: boolean;
  /** for configured-to-order kits: what the system is built from, in words */
  outline?: string[];
  slots: KitSlot[];
  accessories: KitAccessory[];
  /** one price for the accessory bundle; undefined = confirmed by Tobecat with the order */
  accessoriesPriceNgn?: number;
  addons: KitAddon[];
  rules: KitRule[];
  installationNote?: string;
}

export interface KitConfig {
  choices: Record<string, string>;
  quantities: Record<string, number>;
  addons: string[];
}

export interface KitCatalogueProduct {
  slug: string;
  name: string;
  priceNgn: number;
  availability?: "in-stock" | "pre-order" | "out-of-stock";
}

export type KitCatalogue = (slug: string) => KitCatalogueProduct | undefined;

export function defaultKitConfig(kit: SolarKit): KitConfig {
  return {
    choices: Object.fromEntries(kit.slots.map((s) => [s.key, s.choices[0]])),
    quantities: Object.fromEntries(kit.slots.map((s) => [s.key, s.quantity.default])),
    addons: [],
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Fill gaps with defaults and drop anything the kit doesn't offer, so a
 * stale or hand-edited cart entry can never price an impossible system.
 */
export function normaliseKitConfig(kit: SolarKit, partial?: Partial<KitConfig> | null): KitConfig {
  const base = defaultKitConfig(kit);
  const choices: Record<string, string> = {};
  const quantities: Record<string, number> = {};
  for (const slot of kit.slots) {
    const chosen = partial?.choices?.[slot.key];
    choices[slot.key] = chosen && slot.choices.includes(chosen) ? chosen : base.choices[slot.key];
    const qty = Number(partial?.quantities?.[slot.key]);
    quantities[slot.key] = Number.isFinite(qty) ? clamp(qty, slot.quantity.min, slot.quantity.max) : base.quantities[slot.key];
  }
  const allowed = new Set(kit.addons.map((a) => a.key));
  const addons = [...new Set((partial?.addons ?? []).filter((a) => allowed.has(a)))].sort();
  return { choices, quantities, addons };
}

export interface KitValidation {
  errors: string[];
}

/** Checks a config as given (no silent fixing) — used before anything enters the cart. */
export function validateKitConfig(kit: SolarKit, config: KitConfig, catalogue: KitCatalogue): KitValidation {
  const errors: string[] = [];
  if (!kit.purchasable) errors.push(`${kit.name} is configured to order — please request a quote.`);
  for (const slot of kit.slots) {
    const choice = config.choices[slot.key];
    if (!choice || !slot.choices.includes(choice)) {
      errors.push(`Choose a ${slot.label.toLowerCase()} from the options offered for this kit.`);
      continue;
    }
    const product = catalogue(choice);
    if (!product) errors.push(`The selected ${slot.label.toLowerCase()} is no longer in the catalogue.`);
    else if (product.availability === "out-of-stock") errors.push(`${product.name} is out of stock.`);
    const qty = config.quantities[slot.key];
    if (!Number.isInteger(qty) || qty < slot.quantity.min || qty > slot.quantity.max) {
      errors.push(`${slot.label} quantity must be between ${slot.quantity.min} and ${slot.quantity.max}.`);
    }
  }
  for (const rule of kit.rules) {
    if (config.choices[rule.when.slot] === rule.when.choice && !rule.require.choices.includes(config.choices[rule.require.slot])) {
      errors.push(rule.message);
    }
  }
  for (const key of config.addons) {
    if (!kit.addons.some((a) => a.key === key)) errors.push("An add-on that isn't offered for this kit was selected.");
  }
  return { errors };
}

export interface KitPriceLine {
  slotKey: string;
  label: string;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPriceNgn: number;
  totalNgn: number;
}

export interface KitPrice {
  lines: KitPriceLine[];
  addons: { key: string; label: string; priceNgn?: number }[];
  /** sum of every part that has a price */
  totalNgn: number;
  /** true when some included part (accessories, a "quoted" add-on) has no online price yet */
  hasUnpricedParts: boolean;
}

export function priceKit(kit: SolarKit, config: KitConfig, catalogue: KitCatalogue): KitPrice {
  const lines: KitPriceLine[] = [];
  for (const slot of kit.slots) {
    const product = catalogue(config.choices[slot.key]);
    if (!product) continue;
    const quantity = config.quantities[slot.key] ?? slot.quantity.default;
    lines.push({
      slotKey: slot.key,
      label: slot.label,
      productSlug: product.slug,
      productName: product.name,
      quantity,
      unitPriceNgn: product.priceNgn,
      totalNgn: product.priceNgn * quantity,
    });
  }
  const addons = kit.addons
    .filter((a) => config.addons.includes(a.key))
    .map((a) => ({ key: a.key, label: a.label, priceNgn: a.productSlug ? catalogue(a.productSlug)?.priceNgn : a.priceNgn }));

  const accessoriesUnpriced = kit.accessories.length > 0 && kit.accessoriesPriceNgn === undefined;
  const totalNgn =
    lines.reduce((s, l) => s + l.totalNgn, 0) +
    (kit.accessoriesPriceNgn ?? 0) +
    addons.reduce((s, a) => s + (a.priceNgn ?? 0), 0);

  return { lines, addons, totalNgn, hasUnpricedParts: accessoriesUnpriced || addons.some((a) => a.priceNgn === undefined) };
}

/**
 * Catalogue units one kit consumes — the inventory view of a kit. A kit
 * has no stock of its own; it is available only while its parts are.
 */
export function kitComponentDemand(kit: SolarKit, config: KitConfig): Record<string, number> {
  const demand: Record<string, number> = {};
  const add = (slug: string, qty: number) => {
    demand[slug] = (demand[slug] ?? 0) + qty;
  };
  for (const slot of kit.slots) add(config.choices[slot.key], config.quantities[slot.key] ?? slot.quantity.default);
  for (const addon of kit.addons) if (addon.productSlug && config.addons.includes(addon.key)) add(addon.productSlug, 1);
  return demand;
}

/** Kit availability from its components: any part out → out; any pre-order → pre-order; all in stock → in stock. */
export function kitAvailability(
  kit: SolarKit,
  config: KitConfig,
  catalogue: KitCatalogue,
): "in-stock" | "pre-order" | "out-of-stock" | undefined {
  if (!kit.purchasable) return undefined;
  const states = Object.keys(kitComponentDemand(kit, config)).map((slug) => catalogue(slug)?.availability);
  if (states.some((s) => s === "out-of-stock")) return "out-of-stock";
  if (states.some((s) => s === undefined)) return undefined;
  if (states.some((s) => s === "pre-order")) return "pre-order";
  return "in-stock";
}

/** Stable identity for a configuration, so identical kits merge into one cart line. */
export function kitConfigKey(config: KitConfig): string {
  const part = (r: Record<string, string | number>) =>
    Object.keys(r)
      .sort()
      .map((k) => `${k}=${r[k]}`)
      .join(",");
  return `${part(config.choices)}|${part(config.quantities)}|${[...config.addons].sort().join(",")}`;
}

/** Human-readable configuration, one line per part — used in the cart and in order messages. */
export function describeKitConfig(kit: SolarKit, config: KitConfig, catalogue: KitCatalogue): string[] {
  const price = priceKit(kit, config, catalogue);
  return [
    ...price.lines.map((l) => `${l.quantity} × ${l.productName}`),
    ...(kit.accessories.length ? [`Installation accessories (${kit.accessories.map((a) => a.name).join(", ")})`] : []),
    ...price.addons.map((a) => `Add-on: ${a.label}`),
  ];
}
