import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyPicks, lagosDay, type Pickable } from "./daily-picks";

const make = (slug: string, category: string, extra: Partial<Pickable> = {}): Pickable => ({ slug, category, ...extra });
const catalogue = [
  ...Array.from({ length: 20 }, (_, i) => make(`bat-${i}`, "batteries")),
  ...Array.from({ length: 10 }, (_, i) => make(`inv-${i}`, "inverters")),
  ...Array.from({ length: 3 }, (_, i) => make(`pan-${i}`, "panels")),
  make("star", "fans", { featured: true }),
  make("gone", "inverters", { availability: "out-of-stock" }),
];

test("same day, same picks; a new day, a new set", () => {
  const a = dailyPicks(catalogue, "2026-11-18").map((p) => p.slug);
  assert.deepEqual(dailyPicks(catalogue, "2026-11-18").map((p) => p.slug), a);
  assert.notDeepEqual(dailyPicks(catalogue, "2026-11-19").map((p) => p.slug), a);
  assert.equal(a.length, 12);
  assert.equal(new Set(a).size, 12, "no repeats");
});

test("featured first, out of stock never, and every category gets a turn", () => {
  const picks = dailyPicks(catalogue, "2026-11-18");
  assert.equal(picks[0].slug, "star");
  assert.ok(!picks.some((p) => p.slug === "gone"));
  for (const c of ["batteries", "inverters", "panels"]) assert.ok(picks.some((p) => p.category === c), c);
  assert.equal(dailyPicks(catalogue.slice(0, 5), "2026-11-18").length, 5, "small shop: shows what there is");
});

test("the day follows Lagos time, not the server's", () => {
  assert.equal(lagosDay(new Date("2026-11-18T22:59:00Z")), "2026-11-18");
  assert.equal(lagosDay(new Date("2026-11-18T23:01:00Z")), "2026-11-19");
});
