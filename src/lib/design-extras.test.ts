import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { computeSystemEstimate, defaultInput, type CalculatorInput } from "./calculator";
import { computeDesign, defaultDesignOptions } from "./solar-design";
import { attrNumber, generatorSavings, priceDesign, type CatalogueEntry } from "./design-pricing";
import { buildDesignPdf, naira } from "./design-pdf";

const line = (watts: number, hours: number, nightHours?: number) => ({ key: `k${watts}`, name: "x", quantity: 1, watts, hoursPerDay: hours, surge: false, nightHours });
const input = (over: Partial<CalculatorInput> = {}): CalculatorInput => ({ ...defaultInput("home"), loads: [line(100, 10, 4), line(200, 6, 6)], ...over });

// ---------- day / night sizing ----------
test("night energy uses each appliance's night hours", () => {
  const r = computeSystemEstimate(input());
  assert.equal(r.nightEnergyWh, 100 * 4 + 200 * 6);
  assert.equal(r.dailyEnergyWh, 100 * 10 + 200 * 6);
});

test("night sizing sizes the battery on night use instead of outage backup", () => {
  const backup = computeSystemEstimate(input({ backupHours: 2 }));
  const night = computeSystemEstimate(input({ backupHours: 2, batterySizing: "night" }));
  assert.equal(backup.backupEnergyWh, 100 * 2 + 200 * 2);
  assert.equal(night.backupEnergyWh, 1600);
  assert.ok(night.batteryKwh > backup.batteryKwh);
});

test("lines without night hours assume half their use is after dark", () => {
  const r = computeSystemEstimate(input({ loads: [line(100, 8)] }));
  assert.equal(r.nightEnergyWh, 400);
});

// ---------- growth allowance ----------
test("growth allowance upsizes the inverter, and headroom is reported", () => {
  const loads = [line(2000, 4, 2)];
  const now = computeSystemEstimate(input({ loads }));
  const later = computeSystemEstimate(input({ loads, growthPct: 50 }));
  assert.ok(later.inverterKva > now.inverterKva, `${now.inverterKva} → ${later.inverterKva}`);
  assert.ok(later.growthHeadroomW >= 2000 * 0.5 * 0.99, `headroom ${later.growthHeadroomW}`);
});

// ---------- chosen inverter ----------
test("a chosen inverter drives the design and warns when undersized", () => {
  const i = input({ loads: [line(3000, 4, 2)] });
  const rec = computeDesign(i, defaultDesignOptions());
  const small = computeDesign(i, { ...defaultDesignOptions(), inverter: { kva: 1, batteryV: 12, name: "Tiny 1kVA" } });
  assert.equal(small.inverterKva, 1);
  assert.equal(small.systemV, 12);
  assert.ok(small.warnings.some((w) => w.includes("Tiny 1kVA") && w.includes(`${rec.inverterKva} kVA`)));
  assert.ok(small.bom.some((b) => b.item === "Tiny 1kVA"));
  const big = computeDesign(i, { ...defaultDesignOptions(), inverter: { kva: 10, batteryV: 48, name: "Big 10kVA" } });
  assert.ok(!big.warnings.some((w) => w.includes("Big 10kVA")));
  assert.ok(big.growthHeadroomW > rec.growthHeadroomW);
});

// ---------- pricing ----------
const catalogue: CatalogueEntry[] = [
  { slug: "inv10", name: "Inverter 10kVA", category: "inverters", priceNgn: 900_000, attributes: { capacity: "10 kVA" } },
  { slug: "pan550", name: "Panel 550W", category: "solar-panels", priceNgn: 100_000, attributes: { wattage: "550 W" } },
  { slug: "bat15", name: "Battery 15kWh", category: "lithium-batteries", priceNgn: 2_000_000, attributes: { capacity: "15 kWh", chemistry: "Lithium" } },
  { slug: "bat512", name: "Battery 5.12kWh", category: "lithium-batteries", priceNgn: 800_000, attributes: { capacity: "5.12 kWh", chemistry: "Lithium" }, availability: "out-of-stock" },
];

test("attribute numbers need the right unit", () => {
  assert.equal(attrNumber("10 kVA", /kva/i), 10);
  assert.equal(attrNumber("550 W", /\bw\b/i), 550);
  assert.equal(attrNumber("15 kWh", /\bw\b/i), null);
});

test("only exact catalogue matches are priced; everything else is quoted", () => {
  const d = computeDesign(input(), { ...defaultDesignOptions(), inverter: { kva: 10, batteryV: 48, name: "Inverter 10kVA", productSlug: "inv10" }, batteryModuleId: "li-48-100" });
  const p = priceDesign(d, catalogue, { panelWatt: 550, inverterSlug: "inv10", chemistry: "lithium" });
  const names = p.priced.map((x) => x.product.slug).sort();
  assert.deepEqual(names, ["bat512", "inv10", "pan550"]);
  assert.equal(p.mainEquipmentPriced, true);
  assert.equal(p.pricedSubtotalNgn, p.priced.reduce((s, x) => s + x.unitPriceNgn * x.qty, 0));
  assert.ok(p.unpriced.some((b) => b.group === "Cables") && p.unpriced.every((b) => !p.priced.some((x) => x.bom === b)));
  assert.ok(!p.cartItems.some((c) => c.slug === "bat512"), "out-of-stock items are not added to cart");
});

test("no exact match means no price — a 15 kWh battery is not passed off as 10.24 kWh modules", () => {
  const d = computeDesign(input(), { ...defaultDesignOptions(), batteryModuleId: "li-48-200" });
  const p = priceDesign(d, catalogue, { panelWatt: 450, chemistry: "lithium" });
  assert.ok(!p.priced.some((x) => x.product.slug === "bat15" || x.product.slug === "pan550"));
  assert.equal(p.mainEquipmentPriced, false);
});

// ---------- savings ----------
test("savings are straight arithmetic on the customer's own spend", () => {
  const s = generatorSavings({ fuelPerWeekNgn: 30_000, maintenancePerMonthNgn: 10_000, systemCostNgn: 1_400_000 })!;
  assert.equal(s.monthlyNgn, Math.round((30_000 * 52) / 12 + 10_000));
  assert.equal(s.yearlyNgn, s.monthlyNgn * 12);
  assert.equal(s.paybackMonths, Math.round((1_400_000 / s.monthlyNgn) * 10) / 10);
  assert.equal(s.fiveYearNetNgn, s.monthlyNgn * 60 - 1_400_000);
  assert.equal(generatorSavings({ fuelPerWeekNgn: 20_000, maintenancePerMonthNgn: 0 })!.paybackMonths, null, "no cost → no payback claim");
  assert.equal(generatorSavings({ fuelPerWeekNgn: 0, maintenancePerMonthNgn: 0 }), null);
});

// ---------- PDF ----------
test("PDF builds, is a valid multi-section document and survives non-Latin characters", async () => {
  const d = computeDesign(defaultInput("office"), defaultDesignOptions());
  const bytes = await buildDesignPdf({
    company: { name: "Tobecat Technologies", legalName: "Tobecat Technologies Nigeria Limited", phone: "0800", whatsapp: "0700", email: "a@b.c", address: "Lagos", url: "https://tobecat.com" },
    design: d,
    input: defaultInput("office"),
    buildingLabel: "Office",
    regionLabel: "South-West",
    pricing: priceDesign(d, catalogue, { panelWatt: 550, chemistry: "lithium" }),
    savings: generatorSavings({ fuelPerWeekNgn: 25_000, maintenancePerMonthNgn: 5_000 }),
    preparedFor: "Ada ₦ Okafor → test ≤",
    date: new Date("2026-11-16"),
    reference: "TBC-CALC-1",
  });
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString(), "%PDF-");
  const loaded = await PDFDocument.load(bytes);
  assert.ok(loaded.getPageCount() >= 2, `pages: ${loaded.getPageCount()}`);
  assert.match(loaded.getTitle() ?? "", /TBC-CALC-1/);
  assert.equal(naira(1234567), "NGN 1,234,567");
});

// ---------- share codes ----------
import { decodeDesign, encodeDesign } from "./design-share";

test("share codes round-trip every setting, including night hours, growth and the chosen inverter", () => {
  const input = { ...defaultInput("office"), batterySizing: "night" as const, growthPct: 50 };
  input.loads[0] = { ...input.loads[0], name: "Ọ̀fíìsì lights ₦", nightHours: 3 };
  const options = { ...defaultDesignOptions(), pvRunM: 42, inverter: { kva: 10, batteryV: 48 as const, name: "Deye 10kVA", productSlug: "deye" } };
  const back = decodeDesign(encodeDesign({ input, options }))!;
  assert.equal(back.input.batterySizing, "night");
  assert.equal(back.input.growthPct, 50);
  assert.equal(back.input.loads[0].name, "Ọ̀fíìsì lights ₦");
  assert.equal(back.input.loads[0].nightHours, 3);
  assert.equal(back.options.pvRunM, 42);
  assert.deepEqual(back.options.inverter, options.inverter);
});

test("tampered or hostile share codes are rejected or clamped", () => {
  assert.equal(decodeDesign("not base64!!"), null);
  assert.equal(decodeDesign("x".repeat(9000)), null);
  const evil = Buffer.from(JSON.stringify({ i: { loads: [{ name: "x", quantity: 1e9, watts: -5, hoursPerDay: 99, nightHours: 50 }], growthPct: 9999 }, o: { pvRunM: -1, inverter: { kva: "abc" } } })).toString("base64url");
  const d = decodeDesign(evil)!;
  assert.equal(d.input.loads[0].quantity, 999);
  assert.equal(d.input.loads[0].watts, 0);
  assert.equal(d.input.loads[0].hoursPerDay, 24);
  assert.equal(d.input.loads[0].nightHours, 24);
  assert.equal(d.input.growthPct, 200);
  assert.equal(d.options.pvRunM, 1);
  assert.equal(d.options.inverter, undefined);
});
