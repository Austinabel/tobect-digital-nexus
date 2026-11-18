import { test } from "node:test";
import assert from "node:assert/strict";
import { chipsFromAttributes, cleanFieldValue, fieldsFor, numberPart, productTypeFor, PRODUCT_TYPES } from "./product-fields";
import { parseProductForm } from "../admin/product-form";

test("categories get their product type from their address, or their parent's", () => {
  assert.equal(productTypeFor("lithium-batteries").id, "battery");
  assert.equal(productTypeFor("tubular-batteries").id, "battery");
  assert.equal(productTypeFor("inverters").id, "inverter");
  assert.equal(productTypeFor("solar-generators").id, "power-system");
  assert.equal(productTypeFor("power-systems").id, "power-system");
  assert.equal(productTypeFor("solar-panels").id, "solar-panel");
  assert.equal(productTypeFor("cctv-security").id, "cctv");
  assert.equal(productTypeFor("solar-fans").id, "fan");
  assert.equal(productTypeFor("solar-freezers").id, "freezer");
  assert.equal(productTypeFor("solar-pumps").id, "pump");
  assert.equal(productTypeFor("solar-lights").id, "lighting");
  assert.equal(productTypeFor("deye-range", "inverters").id, "inverter", "a subcategory without a keyword uses its parent");
  assert.equal(productTypeFor("accessories").id, "accessory");
  assert.equal(productTypeFor("miscellaneous").id, "general");
  assert.deepEqual(fieldsFor(""), []);
});

test("every type asks for condition, and battery details include type, volts, Ah and cycles", () => {
  for (const t of Object.values(PRODUCT_TYPES)) assert.ok(t.fields.some((f) => f.key === "condition"), t.id);
  const battery = PRODUCT_TYPES.battery.fields.map((f) => f.key);
  for (const k of ["chemistry", "voltage", "ah", "capacity", "cycles", "condition"]) assert.ok(battery.includes(k), k);
  assert.ok(PRODUCT_TYPES.battery.fields[0].options!.includes("Tubular"));
});

test("number values are stored with their unit; bad numbers are rejected", () => {
  const volts = PRODUCT_TYPES.battery.fields.find((f) => f.key === "voltage")!;
  assert.deepEqual(cleanFieldValue(volts, "48"), { value: "48 V" });
  assert.deepEqual(cleanFieldValue(volts, " 51.2V "), { value: "51.2 V" });
  assert.deepEqual(cleanFieldValue(volts, ""), { value: null });
  assert.ok(cleanFieldValue(volts, "about forty").error);
  assert.ok(cleanFieldValue(volts, "0").error);
  const cycles = PRODUCT_TYPES.battery.fields.find((f) => f.key === "cycles")!;
  assert.deepEqual(cleanFieldValue(cycles, "6,000"), { value: "6000 cycles" });
  assert.equal(numberPart("200 Ah"), "200");
  assert.equal(numberPart("Lithium"), "");
});

test("saving a battery: details cleaned, chips made from them, other categories' keys dropped", () => {
  const { value, errors } = parseProductForm(
    { name: "Felicity 100Ah Lithium Battery", category: "tubular-batteries", price: "850000", images: "[]", attr_chemistry: "Tubular", attr_voltage: "12", attr_ah: "220", attr_cycles: "1500", attr_condition: "New", attr_inverterType: "Hybrid" },
    { categories: ["batteries", "tubular-batteries"], isNew: true, rootOf: (s) => (s === "tubular-batteries" ? "batteries" : s) },
  );
  assert.deepEqual(errors, {});
  assert.deepEqual(value!.attributes, { chemistry: "Tubular", voltage: "12 V", ah: "220 Ah", cycles: "1500 cycles", condition: "New" });
  assert.deepEqual(value!.specs, ["220 Ah", "12 V", "Tubular"], "chips follow the type's order: Ah, volts, battery type");
  assert.equal(value!.inverter_spec, null);
});

test("a bad number names the field; typed key specs are kept as typed", () => {
  const bad = parseProductForm({ name: "Deye 8kW", category: "inverters", price: "1", images: "[]", attr_capacity: "eight" }, { categories: ["inverters"], isNew: true });
  assert.match(bad.errors.attr_capacity ?? "", /Capacity/);
  const typed = parseProductForm({ name: "Deye 8kW", category: "inverters", price: "1", images: "[]", attr_capacity: "8", specs: "8 kW, Hybrid" }, { categories: ["inverters"], isNew: true });
  assert.deepEqual(typed.value!.specs, ["8 kW", "Hybrid"]);
  assert.deepEqual(chipsFromAttributes(PRODUCT_TYPES.inverter.fields, { capacity: "8 kVA", inverterType: "Hybrid", phase: "Single phase" }), ["8 kVA", "Hybrid"]);
});

test("cable & accessory categories get the accessory fields; other categories are unchanged", () => {
  for (const slug of ["cables-accessories", "cables", "surge-voltage-protectors", "changeover-switches", "breakers-isolators", "connectors-mounting"])
    assert.equal(productTypeFor(slug, slug === "cables-accessories" ? null : "cables-accessories").id, "accessory", slug);
  assert.equal(productTypeFor("cctv-security").id, "cctv");
  assert.equal(productTypeFor("complete-solar-setups").id, "power-system");
  assert.equal(productTypeFor("solar-panels").id, "solar-panel");
  assert.equal(productTypeFor("small-appliances").id, "general");
});
