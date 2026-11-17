import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultKitConfig,
  normaliseKitConfig,
  validateKitConfig,
  priceKit,
  kitComponentDemand,
  kitAvailability,
  kitConfigKey,
  type SolarKit,
  type KitCatalogueProduct,
} from "./kits";
import { aggregateDemand, checkStock, maxBuildable } from "./inventory";
import { isCampaignLive, selectCampaigns, slotCampaigns, safeCampaignHref, type Campaign } from "./campaigns";
import { parseCatalogueQuery, catalogueSearch, runCatalogueQuery, PAGE_SIZE, type CatalogueItem } from "./catalogue-query";

// ---------- fixtures (test-only; not catalogue data) ----------
const products: Record<string, KitCatalogueProduct> = {
  invA: { slug: "invA", name: "Inverter A", priceNgn: 1000, availability: "in-stock" },
  invB: { slug: "invB", name: "Inverter B", priceNgn: 1500, availability: "in-stock" },
  batA: { slug: "batA", name: "Battery A", priceNgn: 400, availability: "in-stock" },
  batB: { slug: "batB", name: "Battery B", priceNgn: 600, availability: "out-of-stock" },
  pan: { slug: "pan", name: "Panel", priceNgn: 100 },
  bulb: { slug: "bulb", name: "Bulb", priceNgn: 7 },
};
const catalogue = (s: string) => products[s];

const kit: SolarKit = {
  slug: "kit",
  name: "Test Kit",
  capacityLabel: "5KVA",
  summary: "",
  applications: [],
  purchasable: true,
  slots: [
    { key: "inverter", label: "Inverter", role: "inverter", choices: ["invA", "invB"], quantity: { default: 1, min: 1, max: 1 } },
    { key: "battery", label: "Battery", role: "battery", choices: ["batA", "batB"], quantity: { default: 2, min: 1, max: 4 } },
    { key: "panels", label: "Solar panels", role: "panel", choices: ["pan"], quantity: { default: 6, min: 4, max: 10 } },
  ],
  accessories: [{ name: "DC cables" }],
  addons: [
    { key: "bulb", label: "Bulb", productSlug: "bulb" },
    { key: "install", label: "Installation" },
  ],
  rules: [{ when: { slot: "inverter", choice: "invB" }, require: { slot: "battery", choices: ["batB"] }, message: "Inverter B needs Battery B." }],
};

// ---------- kits ----------
test("default kit config prices from catalogue and flags unpriced accessories", () => {
  const c = defaultKitConfig(kit);
  const p = priceKit(kit, c, catalogue);
  assert.equal(p.totalNgn, 1000 + 2 * 400 + 6 * 100);
  assert.equal(p.hasUnpricedParts, true);
  assert.deepEqual(validateKitConfig(kit, c, catalogue).errors, []);
});

test("changing components recalculates price, including catalogue-priced add-ons", () => {
  const c = normaliseKitConfig(kit, { quantities: { panels: 8, battery: 3 }, addons: ["bulb"] });
  assert.equal(priceKit(kit, c, catalogue).totalNgn, 1000 + 3 * 400 + 8 * 100 + 7);
});

test("normalise clamps quantities and drops unknown choices/add-ons", () => {
  const c = normaliseKitConfig(kit, { choices: { inverter: "nope" }, quantities: { panels: 99, battery: -2 }, addons: ["hack", "bulb", "bulb"] });
  assert.equal(c.choices.inverter, "invA");
  assert.equal(c.quantities.panels, 10);
  assert.equal(c.quantities.battery, 1);
  assert.deepEqual(c.addons, ["bulb"]);
});

test("validation rejects out-of-range quantities, incompatible combinations and out-of-stock parts", () => {
  const c = defaultKitConfig(kit);
  assert.match(validateKitConfig(kit, { ...c, quantities: { ...c.quantities, panels: 11 } }, catalogue).errors.join(), /between 4 and 10/);
  const incompatible = { ...c, choices: { ...c.choices, inverter: "invB" } };
  assert.ok(validateKitConfig(kit, incompatible, catalogue).errors.includes("Inverter B needs Battery B."));
  const outOfStock = { ...incompatible, choices: { ...incompatible.choices, battery: "batB" } };
  assert.deepEqual(validateKitConfig(kit, outOfStock, catalogue).errors, ["Battery B is out of stock."]);
});

test("quote-only kits cannot be validated for cart", () => {
  assert.equal(validateKitConfig({ ...kit, purchasable: false }, defaultKitConfig(kit), catalogue).errors.length, 1);
});

test("kit availability follows its components", () => {
  const c = defaultKitConfig(kit);
  assert.equal(kitAvailability(kit, c, catalogue), undefined, "panel stock untracked");
  const tracked = (s: string) => ({ ...products[s], availability: products[s].availability ?? "in-stock" });
  assert.equal(kitAvailability(kit, c, tracked), "in-stock");
  assert.equal(kitAvailability(kit, { ...c, choices: { ...c.choices, battery: "batB" } }, tracked), "out-of-stock");
});

test("config key is order-independent so identical kits merge", () => {
  const a = normaliseKitConfig(kit, { addons: ["install", "bulb"] });
  const b = normaliseKitConfig(kit, { addons: ["bulb", "install"] });
  assert.equal(kitConfigKey(a), kitConfigKey(b));
  assert.notEqual(kitConfigKey(a), kitConfigKey(defaultKitConfig(kit)));
});

// ---------- inventory ----------
test("kit components and standalone products are counted together, once", () => {
  const c = normaliseKitConfig(kit, { addons: ["bulb"] });
  const demand = aggregateDemand([
    { kind: "kit", components: kitComponentDemand(kit, c), quantity: 2 },
    { kind: "product", slug: "batA", quantity: 1 },
  ]);
  assert.equal(demand.get("batA"), 2 * 2 + 1);
  assert.equal(demand.get("pan"), 12);
  assert.equal(demand.get("invA"), 2);
  assert.equal(demand.get("bulb"), 2);
});

test("stock check reports shortfalls and untracked items", () => {
  const stock: Record<string, number> = { a: 5, b: 1 };
  const r = checkStock(new Map([["a", 5], ["b", 3], ["c", 1]]), (s) => stock[s]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.shortfalls, [{ slug: "b", requested: 3, available: 1 }]);
  assert.deepEqual(r.untracked, ["c"]);
});

test("max buildable kits is limited by the scarcest component", () => {
  assert.equal(maxBuildable({ inv: 1, bat: 2, pan: 6 }, (s) => ({ inv: 10, bat: 5, pan: 30 })[s]), 2);
  assert.equal(maxBuildable({ inv: 1, x: 1 }, (s) => (s === "inv" ? 3 : undefined)), undefined);
});

// ---------- campaigns ----------
const camp = (p: Partial<Campaign>): Campaign => ({ id: "c", title: "T", ctaText: "Go", ctaHref: "/shop", active: true, priority: 0, position: "shop-primary", ...p });
const now = new Date("2026-06-15T12:00:00Z");

test("campaigns respect active flag and schedule window", () => {
  assert.equal(isCampaignLive(camp({}), now), true);
  assert.equal(isCampaignLive(camp({ active: false }), now), false);
  assert.equal(isCampaignLive(camp({ startsAt: "2026-07-01" }), now), false);
  assert.equal(isCampaignLive(camp({ endsAt: "2026-06-01" }), now), false, "expired campaigns stop showing");
  assert.equal(isCampaignLive(camp({ endsAt: "not a date" }), now), false);
  assert.equal(isCampaignLive(camp({ startsAt: "2026-06-01", endsAt: "2026-06-30" }), now), true);
});

test("campaign selection filters by position and orders by priority", () => {
  const list = [
    camp({ id: "low", priority: 1 }),
    camp({ id: "high", priority: 9 }),
    camp({ id: "other", priority: 99, position: "shop-tile" }),
    camp({ id: "expired", priority: 50, endsAt: "2026-01-01" }),
  ];
  assert.deepEqual(selectCampaigns(list, "shop-primary", now).map((c) => c.id), ["high", "low"]);
  assert.deepEqual(selectCampaigns(list, "shop-primary", now, 1).map((c) => c.id), ["high"]);
});

test("evergreen banners fill a slot only when no promotion is live", () => {
  const house = camp({ id: "house", evergreen: true, priority: 0 });
  const promo = camp({ id: "promo", priority: 5, endsAt: "2026-06-30" });
  assert.deepEqual(slotCampaigns([house, promo], "shop-primary", now, 1).map((c) => c.id), ["promo"]);
  const ended = camp({ id: "promo", endsAt: "2026-06-01" });
  assert.deepEqual(slotCampaigns([house, ended], "shop-primary", now, 1).map((c) => c.id), ["house"], "expired promo falls back to house banner");
  assert.deepEqual(slotCampaigns([house, camp({ id: "draft", active: false })], "shop-primary", now, 1).map((c) => c.id), ["house"]);
});

test("hero slideshow shows promotions first, then evergreen slides, up to the limit", () => {
  const h = (id: string, priority: number, evergreen = true) => camp({ id, priority, evergreen, position: "shop-hero" });
  const list = [h("e1", 0), h("e2", -1), h("e3", -2), h("p1", 1, false), h("p2", 9, false)];
  assert.deepEqual(slotCampaigns(list, "shop-hero", now, 4).map((c) => c.id), ["p2", "p1", "e1", "e2"]);
});

test("campaign links allow site paths and https only", () => {
  assert.equal(safeCampaignHref("/shop/inverters"), "/shop/inverters");
  assert.equal(safeCampaignHref("https://example.com/x"), "https://example.com/x");
  assert.equal(safeCampaignHref("javascript:alert(1)"), null);
  assert.equal(safeCampaignHref("//evil.example"), null);
  assert.equal(safeCampaignHref("http://insecure.example"), null);
});

// ---------- catalogue ----------
const items: CatalogueItem[] = Array.from({ length: 15 }, (_, i): CatalogueItem => ({
  slug: `p${i}`,
  name: `Product ${String(i).padStart(2, "0")}`,
  brand: i % 2 ? "Deye" : "Jinko Solar",
  category: i < 10 ? "inverters" : "solar-panels",
  priceNgn: (i + 1) * 1000,
  specs: [],
  availability: i % 3 === 0 ? "in-stock" : undefined,
  attributes: i < 10 ? { capacity: i < 5 ? "5 kVA" : "10 kVA" } : { wattage: "550 W" },
}));
const names = { inverters: "Inverters", "solar-panels": "Solar Panels" };

test("query parsing is defensive and round-trips through the URL", () => {
  const q = parseCatalogueQuery({ brand: ["deye", "deye"], min: "9000", max: "2000", sort: "bogus", page: "-4", spec_capacity: "5 kVA", availability: ["in-stock", "nope"] });
  assert.deepEqual(q.brands, ["deye"]);
  assert.equal(q.min, 2000);
  assert.equal(q.max, 9000);
  assert.equal(q.sort, "featured");
  assert.equal(q.page, 1);
  assert.deepEqual(q.availability, ["in-stock"]);
  const again = parseCatalogueQuery(Object.fromEntries(new URLSearchParams(catalogueSearch(q)).entries()));
  assert.equal(again.min, 2000);
  assert.deepEqual(again.attrs, { capacity: ["5 kVA"] });
});

test("filters combine; facets count without their own dimension", () => {
  const q = parseCatalogueQuery({ category: "inverters", brand: "deye", spec_capacity: "10 kVA" });
  const r = runCatalogueQuery(items, q, names);
  assert.deepEqual(r.items.map((i) => i.slug).sort(), ["p5", "p7", "p9"]);
  assert.equal(r.facets.brands.find((b) => b.value === "jinko-solar")?.count, 2, "brand facet ignores the brand filter");
  const capacity = r.facets.specs.find((s) => s.key === "capacity");
  assert.deepEqual(capacity?.values.map((v) => [v.value, v.count]), [["5 kVA", 2], ["10 kVA", 3]]);
});

test("price range, availability, sorting and pagination", () => {
  const r = runCatalogueQuery(items, parseCatalogueQuery({ min: "3000", max: "6000", sort: "price-desc" }), names);
  assert.deepEqual(r.items.map((i) => i.priceNgn), [6000, 5000, 4000, 3000]);
  assert.equal(runCatalogueQuery(items, parseCatalogueQuery({ availability: "in-stock" }), names).total, 5);
  const p2 = runCatalogueQuery(items, parseCatalogueQuery({ page: "2" }), names);
  assert.equal(p2.items.length, 15 - PAGE_SIZE);
  assert.equal(p2.totalPages, 2);
  assert.equal(runCatalogueQuery(items, parseCatalogueQuery({ page: "99" }), names).page, 2, "page clamps to last");
});

test("text search matches across name, brand, attributes and category", () => {
  assert.equal(runCatalogueQuery(items, parseCatalogueQuery({ q: "deye 10 kva" }), names).total, 3);
  assert.equal(runCatalogueQuery(items, parseCatalogueQuery({ q: "solar panels 550" }), names).total, 5);
});

// ---------- order pricing (server) ----------
import { parseRequestedLines, priceOrder } from "./order-pricing";

test("order pricing ignores client prices and re-prices from the catalogue", () => {
  const lines = parseRequestedLines(JSON.stringify([{ slug: "batA", quantity: 2, priceNgn: 1 }, { slug: "kit", quantity: 1, kit: { quantities: { panels: 8 } } }]));
  assert.ok(lines);
  const order = priceOrder(lines!, catalogue, (s) => (s === "kit" ? kit : undefined));
  assert.deepEqual(order.errors, []);
  assert.equal(order.lines[0].lineTotalNgn, 800);
  assert.equal(order.lines[1].unitPriceNgn, 1000 + 2 * 400 + 8 * 100);
  assert.equal(order.subtotalNgn, 800 + 2600);
  assert.equal(order.hasUnpricedParts, true);
  assert.deepEqual(Object.fromEntries(order.demand.map((d) => [d.slug, d.qty])), { batA: 4, invA: 1, pan: 8 });
});

test("order pricing rejects unknown, out-of-stock and invalid items", () => {
  const order = priceOrder(
    [{ slug: "nope", quantity: 1 }, { slug: "batB", quantity: 1 }, { slug: "kit", quantity: 1, kit: { choices: { inverter: "invB" } } }],
    catalogue,
    (s) => (s === "kit" ? kit : undefined),
  );
  assert.equal(order.lines.length, 0);
  assert.equal(order.errors.length, 3);
});

test("malformed cart payloads are refused", () => {
  assert.equal(parseRequestedLines("not json"), null);
  assert.equal(parseRequestedLines("[]"), null);
  assert.equal(parseRequestedLines(JSON.stringify([{ slug: "a", quantity: 0 }])), null);
  assert.equal(parseRequestedLines(JSON.stringify([{ slug: "a", quantity: 1.5 }])), null);
  assert.equal(parseRequestedLines(JSON.stringify([{ slug: "a", quantity: 100 }])), null);
});

// ---------- order workflow ----------
import { allowedNextStatuses, canChangeStatus, canRecordPayment, stockEffect } from "./order-status";

test("order status flow only allows sensible moves", () => {
  assert.deepEqual(allowedNextStatuses("new"), ["confirmed", "cancelled"]);
  assert.ok(canChangeStatus("confirmed", "dispatched"));
  assert.ok(!canChangeStatus("new", "delivered"), "can't deliver an unconfirmed order");
  assert.ok(!canChangeStatus("cancelled", "confirmed"), "cancelled is final");
  assert.ok(!canChangeStatus("delivered", "cancelled"), "delivered orders are returned, not cancelled");
  assert.ok(!canChangeStatus("new", "hacked"));
});

test("stock is deducted on confirm and given back on cancel or return", () => {
  assert.equal(stockEffect("new", "confirmed"), "commit");
  assert.equal(stockEffect("confirmed", "cancelled"), "release");
  assert.equal(stockEffect("delivered", "returned"), "release");
  assert.equal(stockEffect("confirmed", "dispatched"), null);
});

test("payments: mark paid from unpaid/pending/failed; refund only paid orders", () => {
  assert.ok(canRecordPayment("unpaid", "paid") && canRecordPayment("failed", "paid"));
  assert.ok(!canRecordPayment("paid", "paid"));
  assert.ok(canRecordPayment("paid", "refunded"));
  assert.ok(!canRecordPayment("unpaid", "refunded"));
});

test("subcategories: a parent category includes its subcategories' products and counts", () => {
  const items: CatalogueItem[] = [
    { slug: "a", name: "Hybrid A", category: "hybrid-inverters", categoryPath: ["hybrid-inverters", "inverters"], priceNgn: 100, specs: [], attributes: { capacity: "5 kVA" } },
    { slug: "b", name: "Plain B", category: "inverters", priceNgn: 200, specs: [], attributes: { capacity: "10 kVA" } },
    { slug: "c", name: "Panel C", category: "solar-panels", priceNgn: 50, specs: [] },
  ];
  const q = parseCatalogueQuery({ category: "inverters" });
  const r = runCatalogueQuery(items, q, {});
  assert.deepEqual(r.items.map((i) => i.slug).sort(), ["a", "b"]);
  const counts = Object.fromEntries(r.facets.categories.map((f) => [f.value, f.count]));
  assert.equal(counts["inverters"], 2);
  assert.equal(counts["hybrid-inverters"], 1);
  const sub = runCatalogueQuery(items, parseCatalogueQuery({ category: "hybrid-inverters" }), {});
  assert.deepEqual(sub.items.map((i) => i.slug), ["a"]);
  assert.ok(sub.facets.specs.some((s) => s.key === "capacity"), "a subcategory uses its parent's spec filters");
});
