import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductForm, slugify } from "./product-form";

const CATS = ["inverters", "solar-panels", "lithium-batteries"];
const base = { name: "Deye 8kW Hybrid Inverter", category: "inverters", price: "1,250,000", images: "[]" };

test("a valid new product produces a clean row with an automatic address", () => {
  const { value, errors } = parseProductForm({ ...base, published: "on", specs: "8 kW, Hybrid\n48 V", attr_capacity: "8 kVA", attr_phase: "Single", attr_bogus: "x" }, { categories: CATS, isNew: true });
  assert.deepEqual(errors, {});
  assert.equal(value!.slug, "deye-8kw-hybrid-inverter");
  assert.equal(value!.price_ngn, 1_250_000);
  assert.deepEqual(value!.specs, ["8 kW", "Hybrid", "48 V"]);
  assert.deepEqual(value!.attributes, { capacity: "8 kVA", phase: "Single" }, "only this category's filter fields are kept");
  assert.equal(value!.published, true);
  assert.equal(value!.stock_quantity, null, "empty stock = not tracked");
  assert.equal(value!.availability, null);
});

test("prices: required, whole numbers, and a previous price must be higher", () => {
  assert.ok(parseProductForm({ ...base, price: "" }, { categories: CATS, isNew: true }).errors.price_ngn);
  assert.ok(parseProductForm({ ...base, price: "12.5" }, { categories: CATS, isNew: true }).errors.price_ngn);
  assert.ok(parseProductForm({ ...base, price: "-4" }, { categories: CATS, isNew: true }).errors.price_ngn);
  assert.ok(parseProductForm({ ...base, compare_at_price: "1000000" }, { categories: CATS, isNew: true }).errors.compare_at_price_ngn);
  assert.equal(parseProductForm({ ...base, compare_at_price: "1400000" }, { categories: CATS, isNew: true }).value!.compare_at_price_ngn, 1_400_000);
});

test("category, slug, stock and availability are validated", () => {
  assert.ok(parseProductForm({ ...base, category: "made-up" }, { categories: CATS, isNew: true }).errors.category_slug);
  assert.ok(parseProductForm({ ...base, slug: "Bad Slug!" }, { categories: CATS, isNew: true }).errors.slug);
  assert.ok(parseProductForm({ ...base, stock_quantity: "3.5" }, { categories: CATS, isNew: true }).errors.stock_quantity);
  assert.equal(parseProductForm({ ...base, stock_quantity: "12" }, { categories: CATS, isNew: true }).value!.stock_quantity, 12);
  assert.ok(parseProductForm({ ...base, availability: "maybe" }, { categories: CATS, isNew: true }).errors.availability);
});

test("editing keeps the existing address even if a slug is submitted", () => {
  const { value } = parseProductForm({ ...base, slug: "hacked" }, { categories: CATS, isNew: false, fixedSlug: "deye-10kva-hybrid-inverter" });
  assert.equal(value!.slug, "deye-10kva-hybrid-inverter");
});

test("inverter datasheet values: optional, checked, and only for inverters", () => {
  const ok = parseProductForm({ ...base, inv_battery_v: "48", inv_max_pv_v: "500", inv_mppt_min_v: "120" }, { categories: CATS, isNew: true });
  assert.deepEqual(ok.value!.inverter_spec, { batteryV: 48, maxPvV: 500, mpptMinV: 120 });
  assert.ok(parseProductForm({ ...base, inv_battery_v: "36" }, { categories: CATS, isNew: true }).errors.inverter_spec);
  assert.ok(parseProductForm({ ...base, inv_max_pv_v: "100", inv_mppt_min_v: "150" }, { categories: CATS, isNew: true }).errors.inverter_spec);
  const panel = parseProductForm({ ...base, category: "solar-panels", inv_battery_v: "48" }, { categories: CATS, isNew: true });
  assert.equal(panel.value!.inverter_spec, null);
});

test("photos: valid ids only, de-duplicated, at most 8", () => {
  const id = "11111111-2222-3333-4444-555555555555";
  assert.deepEqual(parseProductForm({ ...base, images: JSON.stringify([id, id]) }, { categories: CATS, isNew: true }).value!.imageIds, [id]);
  assert.ok(parseProductForm({ ...base, images: JSON.stringify(["../../etc"]) }, { categories: CATS, isNew: true }).errors.imageIds);
  assert.ok(parseProductForm({ ...base, images: "not json" }, { categories: CATS, isNew: true }).errors.imageIds);
  const nine = Array.from({ length: 9 }, (_, i) => `11111111-2222-3333-4444-${String(i).padStart(12, "0")}`);
  assert.ok(parseProductForm({ ...base, images: JSON.stringify(nine) }, { categories: CATS, isNew: true }).errors.imageIds);
});

test("slugify makes safe addresses", () => {
  assert.equal(slugify("Jinko Tiger Neo 580W — N-type!"), "jinko-tiger-neo-580w-n-type");
  assert.equal(slugify("Café Inverter"), "cafe-inverter");
});
