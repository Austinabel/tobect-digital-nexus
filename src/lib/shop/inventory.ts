/**
 * Stock checks across standalone products and kits.
 *
 * A kit never holds stock of its own: buying one kit consumes its
 * components. Everything is converted to catalogue units first, then
 * compared with stock once — so a battery bought on its own and the same
 * battery inside a kit are counted together, and never twice.
 */

export type DemandLine =
  | { kind: "product"; slug: string; quantity: number }
  | { kind: "kit"; components: Record<string, number>; quantity: number };

export function aggregateDemand(lines: DemandLine[]): Map<string, number> {
  const total = new Map<string, number>();
  const add = (slug: string, qty: number) => total.set(slug, (total.get(slug) ?? 0) + qty);
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    if (line.kind === "product") add(line.slug, line.quantity);
    else for (const [slug, per] of Object.entries(line.components)) add(slug, per * line.quantity);
  }
  return total;
}

export interface StockShortfall {
  slug: string;
  requested: number;
  available: number;
}

export interface StockCheck {
  shortfalls: StockShortfall[];
  /** products whose stock level isn't tracked yet — the team confirms these by hand */
  untracked: string[];
  ok: boolean;
}

/** `stockOf` returns units on hand, or undefined when the product's stock isn't tracked. */
export function checkStock(demand: Map<string, number>, stockOf: (slug: string) => number | undefined): StockCheck {
  const shortfalls: StockShortfall[] = [];
  const untracked: string[] = [];
  for (const [slug, requested] of demand) {
    const available = stockOf(slug);
    if (available === undefined) untracked.push(slug);
    else if (requested > available) shortfalls.push({ slug, requested, available: Math.max(0, available) });
  }
  return { shortfalls, untracked, ok: shortfalls.length === 0 };
}

/** How many complete kits current stock can build; undefined if any component is untracked. */
export function maxBuildable(components: Record<string, number>, stockOf: (slug: string) => number | undefined): number | undefined {
  let max = Infinity;
  for (const [slug, per] of Object.entries(components)) {
    if (per <= 0) continue;
    const stock = stockOf(slug);
    if (stock === undefined) return undefined;
    max = Math.min(max, Math.floor(Math.max(0, stock) / per));
  }
  return max === Infinity ? 0 : max;
}
