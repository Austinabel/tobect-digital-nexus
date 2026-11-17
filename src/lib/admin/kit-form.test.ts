import { test } from "node:test";
import assert from "node:assert/strict";
import { parseKitForm } from "./kit-form";

const products = new Set(["deye-5kw", "beve-5kwh", "jinko-550w"]);
const opts = { mode: "new" as const, isProduct: (s: string) => products.has(s), isLibraryUrl: () => true };
const form = (o: Record<string, string>) => (k: string) => (k in o ? o[k] : null);
const base = { name: "5KVA Complete Solar Kit", capacity_label: "5KVA", summary: "A whole-home system for family homes." };
const slot = (key: string, choices: string[], q = ["1", "1", "2"]) => ({
  [`slot_${key}_on`]: "on",
  [`slot_${key}_choices`]: JSON.stringify(choices),
  [`slot_${key}_qmin`]: q[0],
  [`slot_${key}_qdef`]: q[1],
  [`slot_${key}_qmax`]: q[2],
});

test("a configured-to-order kit needs only the basics; slug comes from the name", () => {
  const { input, errors } = parseKitForm(form({ ...base, applications: "Family homes\nSmall offices\nFamily homes" }), opts);
  assert.deepEqual(errors, {});
  assert.equal(input!.kit.slug, "5kva-complete-solar-kit");
  assert.deepEqual(input!.kit.applications, ["Family homes", "Small offices"], "blank and duplicate lines dropped");
  assert.equal(input!.kit.purchasable, false);
});

test("selling online needs at least one component position with real products", () => {
  assert.ok(parseKitForm(form({ ...base, purchasable: "on" }), opts).errors.purchasable);
  assert.ok(parseKitForm(form({ ...base, purchasable: "on", ...slot("inverter", []) }), opts).errors.slot_inverter);
  assert.ok(parseKitForm(form({ ...base, purchasable: "on", ...slot("inverter", ["ghost-product"]) }), opts).errors.slot_inverter);
  const ok = parseKitForm(form({ ...base, purchasable: "on", ...slot("inverter", ["deye-5kw"]), ...slot("panels", ["jinko-550w"], ["6", "8", "10"]) }), opts);
  assert.deepEqual(ok.errors, {});
  assert.deepEqual(ok.input!.slots.map((s) => [s.key, s.role, s.qty_default]), [["inverter", "inverter", 1], ["panels", "panel", 8]]);
});

test("quantities must be ordered fewest ≤ standard ≤ most", () => {
  assert.ok(parseKitForm(form({ ...base, ...slot("battery", ["beve-5kwh"], ["2", "1", "3"]) }), opts).errors.slot_battery);
  assert.ok(parseKitForm(form({ ...base, ...slot("battery", ["beve-5kwh"], ["0", "1", "3"]) }), opts).errors.slot_battery);
});

test("accessories parse with optional details; extras need unique names and valid prices", () => {
  const { input } = parseKitForm(form({ ...base, accessories: "DC cables — 6mm², 30m\nAC breakers\nDC cables", addon_0_label: "Installation", addon_1_label: "Extra panel stand", addon_1_price: "45,000" }), opts);
  assert.deepEqual(input!.accessories.map((a) => [a.name, a.detail]), [["DC cables", "6mm², 30m"], ["AC breakers", null]]);
  assert.deepEqual(input!.addons.map((a) => [a.key, a.price_ngn]), [["installation", null], ["extra-panel-stand", 45000]]);
  assert.ok(parseKitForm(form({ ...base, addon_0_label: "Installation", addon_1_label: "installation" }), opts).errors.addon_1);
  assert.ok(parseKitForm(form({ ...base, addon_0_label: "Stand", addon_0_price: "abc" }), opts).errors.addon_0);
});

test("editing keeps the existing web address", () => {
  const { input } = parseKitForm(form({ ...base, slug: "hacked" }), { ...opts, mode: "edit", existingSlug: "5kva-complete-solar-kit" });
  assert.equal(input!.kit.slug, "5kva-complete-solar-kit");
});
