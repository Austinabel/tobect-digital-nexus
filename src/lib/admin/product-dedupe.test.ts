import { test } from "node:test";
import assert from "node:assert/strict";
import { bigramSimilarity, cleanBarcode, cleanSku, findDuplicates, squash, type ExistingProduct } from "./product-dedupe";

const existing: ExistingProduct[] = [
  { slug: "deye-10kva-hybrid-inverter", name: "Deye 10kVA Hybrid Inverter", brand: "Deye", model: "SUN-10K-SG04LP3", sku: "DEY-10K", barcode: "6971234567890" },
  { slug: "jinko-550w-solar-panel", name: "Jinko 550W Solar Panel", brand: "Jinko Solar", model: null },
  { slug: "old-battery", name: "BEVE 15kWh Lithium Battery", brand: "BEVE", model: "LB-15", deleted: true },
];

test("squash ignores case, spaces and dashes", () => {
  assert.equal(squash(" Deye SUN-10K sg04lp3 "), "deyesun10ksg04lp3");
});

test("same barcode, SKU, or brand + model are certain duplicates", () => {
  assert.equal(findDuplicates({ name: "Anything", barcode: "697-1234567890" }, existing)[0].reason, "Same barcode");
  assert.equal(findDuplicates({ name: "Anything", sku: "dey-10k" }, existing)[0].reason, "Same SKU");
  const m = findDuplicates({ name: "Deye 10 kVA inverter (new stock)", brand: "DEYE", model: "sun 10k sg04 lp3" }, existing)[0];
  assert.equal(m.reason, "Same brand and model number");
  assert.equal(m.strength, "certain");
});

test("a duplicate in the trash is flagged so it can be restored", () => {
  const m = findDuplicates({ name: "Beve 15 kWh lithium battery", brand: "Beve" }, existing)[0];
  assert.equal(m.slug, "old-battery");
  assert.equal(m.deleted, true);
});

test("same name (any spacing/case) is certain; very similar names are likely", () => {
  assert.equal(findDuplicates({ name: "jinko 550w  solar-panel" }, existing)[0].strength, "certain");
  const likely = findDuplicates({ name: "Jinko 550W Solar Panels" }, existing)[0];
  assert.equal(likely.strength, "likely");
  assert.equal(likely.reason, "Very similar name");
});

test("different ratings are different products, however similar the names", () => {
  assert.deepEqual(findDuplicates({ name: "Deye 8kVA Hybrid Inverter", brand: "Deye" }, existing), []);
  assert.deepEqual(findDuplicates({ name: "Jinko 450W Solar Panel" }, existing), []);
});

test("editing a product never matches itself; unrelated products don't match", () => {
  assert.deepEqual(findDuplicates({ slug: "jinko-550w-solar-panel", name: "Jinko 550W Solar Panel" }, existing), []);
  assert.deepEqual(findDuplicates({ name: "Hikvision 4MP Dome Camera", brand: "Hikvision" }, existing), []);
});

test("a short product name doesn't match every longer name that contains it", () => {
  const withShort: ExistingProduct[] = [...existing, { slug: "test", name: "Test" }, { slug: "inverter", name: "Inverter" }];
  assert.deepEqual(findDuplicates({ name: "E2E Test Panel 600W" }, withShort), []);
  assert.deepEqual(findDuplicates({ name: "Luminous 2.5kVA Inverter" }, withShort), []);
  // but a longer name fully contained still counts
  assert.equal(findDuplicates({ name: "Jinko 550W Solar Panel Mono" }, existing)[0]?.strength, "likely");
});

test("same model number under another brand is only a likely match", () => {
  const m = findDuplicates({ name: "Rebranded inverter", brand: "Other", model: "SUN-10K-SG04LP3" }, existing)[0];
  assert.equal(m.strength, "likely");
});

test("codes are cleaned", () => {
  assert.equal(cleanBarcode("6971 2345 6789 0"), "6971234567890");
  assert.equal(cleanBarcode("123"), null);
  assert.equal(cleanSku(" INV 10K "), "INV-10K");
  assert.equal(cleanSku("bad<sku>"), null);
  assert.ok(bigramSimilarity("Solar Panel 550W", "Solar Panel 550 W") > 0.95);
});
