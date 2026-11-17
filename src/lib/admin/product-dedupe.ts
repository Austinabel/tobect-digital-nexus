/**
 * Duplicate detection for product listing. Pure and unit-tested
 * (product-dedupe.test.ts) — the same rules run live in the form while
 * staff type and again on the server when they save.
 *
 * - "certain" matches block saving: same barcode, same SKU, same brand +
 *   model (spacing, dashes and case ignored), or the same name.
 * - "likely" matches need staff to confirm it's a different product:
 *   very similar names, or the same model number under another brand.
 */

export interface DedupeCandidate {
  slug?: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  barcode?: string | null;
}

export interface ExistingProduct extends DedupeCandidate {
  slug: string;
  deleted?: boolean;
  published?: boolean;
}

export type MatchStrength = "certain" | "likely";

export interface DuplicateMatch {
  slug: string;
  name: string;
  reason: string;
  strength: MatchStrength;
  /** the match is in the trash — restore it instead of listing it again */
  deleted: boolean;
  published: boolean;
}

/** lower-case letters and digits only: "Deye SUN-8K-SG04LP3" → "deyesun8ksg04lp3" */
export const squash = (s: string | null | undefined) => (s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

/** words for comparing names; units are kept attached to their numbers ("8 kw" → "8kw") */
export function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/(\d)\s+(kva|kw|kwh|w|wh|ah|v|hp|mm2|mm)\b/g, "$1$2")
    .split(/[^a-z0-9.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 0 && !STOP.has(t));
}
const STOP = new Set(["the", "and", "with", "for", "of", "a", "an", "new", "original", "genuine"]);

/** Dice coefficient on character bigrams of the squashed names (0–1). */
export function bigramSimilarity(a: string, b: string): number {
  const x = squash(a);
  const y = squash(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const grams = (s: string) => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) ?? 0) + 1);
    return m;
  };
  const gx = grams(x);
  const gy = grams(y);
  let overlap = 0;
  for (const [g, n] of gx) overlap += Math.min(n, gy.get(g) ?? 0);
  return (2 * overlap) / (x.length - 1 + y.length - 1);
}

/** Share of the shorter name's words that appear in the other name (0–1). */
export function tokenOverlap(a: string, b: string): number {
  const ta = new Set(nameTokens(a));
  const tb = new Set(nameTokens(b));
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

/** Numbers with units must agree ("5kva" vs "10kva" are different products, however similar the names). */
function ratingsConflict(a: string, b: string): boolean {
  const ratings = (s: string) => new Set(nameTokens(s).filter((t) => /^\d+(\.\d+)?(kva|kw|kwh|w|wh|ah|v|hp)$/.test(t)));
  const ra = ratings(a);
  const rb = ratings(b);
  if (!ra.size || !rb.size) return false;
  for (const r of ra) if (!rb.has(r)) return true;
  return false;
}

export function findDuplicates(c: DedupeCandidate, existing: ExistingProduct[]): DuplicateMatch[] {
  const out: DuplicateMatch[] = [];
  const name = c.name.trim();
  for (const p of existing) {
    if (c.slug && p.slug === c.slug) continue; // editing this product
    const add = (reason: string, strength: MatchStrength) =>
      out.push({ slug: p.slug, name: p.name, reason, strength, deleted: Boolean(p.deleted), published: p.published !== false });

    if (c.barcode && p.barcode && c.barcode.replace(/\D/g, "") === p.barcode.replace(/\D/g, "")) {
      add("Same barcode", "certain");
      continue;
    }
    if (c.sku && p.sku && c.sku.trim().toLowerCase() === p.sku.trim().toLowerCase()) {
      add("Same SKU", "certain");
      continue;
    }
    const model = squash(c.model);
    if (model && model === squash(p.model)) {
      if (squash(c.brand) && squash(c.brand) === squash(p.brand)) {
        add("Same brand and model number", "certain");
        continue;
      }
      if (model.length >= 4) {
        add("Same model number", "likely");
        continue;
      }
    }
    if (name.length >= 3 && squash(name) === squash(p.name)) {
      add("Same name", "certain");
      continue;
    }
    if (name.length >= 6 && !ratingsConflict(name, p.name)) {
      // one name fully inside the other counts only when both have at least 3 words
      // (so a product called just "Test" or "Inverter" doesn't match everything containing that word)
      const contained = tokenOverlap(name, p.name) >= 1 && Math.min(nameTokens(name).length, nameTokens(p.name).length) >= 3;
      const sim = Math.max(bigramSimilarity(name, p.name), contained ? 0.9 : 0);
      const sameBrandOrUnknown = !squash(c.brand) || !squash(p.brand) || squash(c.brand) === squash(p.brand);
      if (sim >= 0.85 && sameBrandOrUnknown) add("Very similar name", "likely");
    }
  }
  // certain first, then live before trashed
  return out.sort((a, b) => Number(a.strength === "likely") - Number(b.strength === "likely") || Number(a.deleted) - Number(b.deleted)).slice(0, 5);
}

/** Barcodes: digits only (EAN-8/UPC-A/EAN-13/GTIN-14 lengths are 8–14; 6+ allowed for in-house codes). */
export function cleanBarcode(v: string | null | undefined): string | null {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length >= 6 && d.length <= 14 ? d : null;
}

/** SKU: letters, digits and . _ / - only, up to 40 characters. */
export function cleanSku(v: string | null | undefined): string | null {
  const s = (v ?? "").trim().replace(/\s+/g, "-");
  return s && /^[A-Za-z0-9._/-]{1,40}$/.test(s) ? s : null;
}
