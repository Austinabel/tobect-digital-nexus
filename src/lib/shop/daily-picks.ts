/** What the picker needs to know about a product (any catalogue product fits). */
export interface Pickable {
  slug: string;
  category: string;
  featured?: boolean;
  availability?: string;
}

/** The calendar day in Lagos, e.g. "2026-11-18" — the daily picks change when it does. */
export function lagosDay(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Small seeded random generator: the same seed always gives the same sequence. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The homepage selection for one day: products staff marked "featured" first,
 * then random products taken a category at a time so the mix stays varied.
 * The same day always gives the same selection; the next day gives a new one.
 * Out-of-stock products are left out.
 */
export function dailyPicks<T extends Pickable>(products: T[], day: string, count = 12): T[] {
  const rand = seededRandom(`picks:${day}`);
  const available = products.filter((p) => p.availability !== "out-of-stock");
  const featured = shuffled(available.filter((p) => p.featured), rand).slice(0, count);
  const chosen = new Set(featured.map((p) => p.slug));
  // one queue per category, each shuffled; categories visited in a shuffled order, round-robin
  const byCategory = new Map<string, T[]>();
  for (const p of available) if (!chosen.has(p.slug)) byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p]);
  const queues = shuffled([...byCategory.values()].map((q) => shuffled(q, rand)), rand);
  const picks = [...featured];
  while (picks.length < count && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && picks.length < count) picks.push(next);
    }
  }
  return picks;
}
