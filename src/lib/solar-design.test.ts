import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultInput } from "./calculator";
import {
  BATTERY_MODULES,
  TYPICAL_PANELS,
  compatibleModules,
  computeDesign,
  defaultDesignOptions,
  designBatteryBank,
  designStrings,
  formatDesignSummary,
  nextStandard,
  sizeCable,
  STANDARD_BREAKER_A,
} from "./solar-design";

const mod = (id: string) => BATTERY_MODULES.find((m) => m.id === id)!;

test("battery cable for a 5 kVA / 48 V inverter is sized by voltage drop (hand-checked: 25 mm²)", () => {
  // I = 4000 W / (48 V × 0.92) = 90.6 A → ×1.25 = 113.2 A ; A_drop = 2·2·113.2·0.0225 / (48·0.01) = 21.2 mm²
  const c = sizeCable({ currentA: 113.2, oneWayM: 2, voltage: 48, maxDrop: 0.01, table: "battery", minMm2: 10 });
  assert.equal(c.sizeMm2, 25);
  assert.equal(c.limitedBy, "voltage drop");
  assert.ok(c.dropPct < 1);
});

test("short PV runs fall back to the 4 mm² solar-cable minimum", () => {
  const c = sizeCable({ currentA: 13.9 * 1.56, oneWayM: 15, voltage: 214, maxDrop: 0.03, table: "general", minMm2: 4 });
  assert.equal(c.sizeMm2, 4);
  assert.equal(c.limitedBy, "minimum size");
});

test("long runs need thicker cable; AC output limited by current rating when short", () => {
  const short = sizeCable({ currentA: 27.2, oneWayM: 10, voltage: 230, maxDrop: 0.03, table: "general", minMm2: 2.5 });
  assert.equal(short.sizeMm2, 4);
  assert.equal(short.limitedBy, "current rating");
  const long = sizeCable({ currentA: 27.2, oneWayM: 80, voltage: 230, maxDrop: 0.03, table: "general", minMm2: 2.5 });
  assert.ok((long.sizeMm2 ?? 0) > 4, `got ${long.sizeMm2}`);
  assert.ok(long.dropPct <= 3);
});

test("cable sizing reports impossible currents instead of guessing", () => {
  assert.equal(sizeCable({ currentA: 5000, oneWayM: 2, voltage: 48, maxDrop: 0.01, table: "battery", minMm2: 10 }).sizeMm2, null);
});

test("strings fit the inverter voltage window and are balanced", () => {
  // 550 W: Voc_cold = 52.4 V → max 9 in series at 500 V ; Vmp_hot = 35.6 V → min 4 for a 120 V MPPT
  const s = designStrings(12, TYPICAL_PANELS[550], 500, 120);
  assert.equal(s.fits, true);
  assert.equal(s.strings, 2);
  assert.equal(s.panelsPerString, 6);
  assert.equal(s.totalPanels, 12);
  assert.ok(s.stringVocColdV <= 500);
  assert.ok(s.stringVmpHotV >= 120);
});

test("too few panels are rounded up to reach the MPPT minimum", () => {
  const s = designStrings(2, TYPICAL_PANELS[550], 500, 120);
  assert.equal(s.panelsPerString, 4);
  assert.equal(s.totalPanels, 4);
});

test("panels that can't fit the inverter's PV window are flagged", () => {
  const s = designStrings(6, TYPICAL_PANELS[550], 60, 120);
  assert.equal(s.fits, false);
  assert.match(s.problem ?? "", /window/);
});

test("battery banks wire modules in series to the system voltage, then in parallel for capacity", () => {
  const li = designBatteryBank(9, 48, mod("li-48-100"), "lithium", 6000, 6);
  assert.deepEqual([li.inSeries, li.inParallel, li.totalModules, li.bankKwh], [1, 2, 2, 10.24]);
  assert.equal(li.backupHoursAchieved, 8.8); // 10.24 kWh × 0.9 × 0.95 / 1000 W
  const la = designBatteryBank(10, 24, mod("la-12-200"), "lead-acid", 4000, 4);
  assert.deepEqual([la.inSeries, la.inParallel, la.totalModules, la.bankKwh], [2, 3, 6, 14.4]);
});

test("only modules that divide the bank voltage are offered", () => {
  const ids = compatibleModules("lithium", 24).map((m) => m.id);
  assert.ok(ids.includes("li-12-100") && ids.includes("li-24-200"));
  assert.ok(!ids.some((id) => id.startsWith("li-48")));
  assert.ok(compatibleModules("lead-acid", 48).every((m) => m.voltageClass === 12));
});

test("standard ratings round up", () => {
  assert.equal(nextStandard(113.2, STANDARD_BREAKER_A), 125);
  assert.equal(nextStandard(16, STANDARD_BREAKER_A), 16);
});

test("full design: sunnier regions need fewer panels; BOM covers every part", () => {
  const input = defaultInput("home");
  const south = computeDesign(input, { ...defaultDesignOptions(), peakSunHours: 4.0 });
  const north = computeDesign(input, { ...defaultDesignOptions(), peakSunHours: 5.8 });
  assert.ok(north.strings.totalPanels <= south.strings.totalPanels);
  assert.ok(south.strings.totalPanels >= south.base.panelCount);

  const groups = new Set(south.bom.map((b) => b.group));
  for (const g of ["Main equipment", "Batteries", "Cables", "Protection & switching", "Mounting & accessories"]) assert.ok(groups.has(g as never), g);
  assert.deepEqual(south.cables.map((c) => c.id), ["pv", "battery", "ac", "earth"]);
  assert.ok(south.cables.every((c) => c.sizeMm2 !== null && c.lengths.every((l) => l.metres > 0)));
  assert.ok(south.protection.some((p) => p.label.startsWith("Changeover")));
  assert.ok(south.bom.some((b) => b.item === "Mounting rails"));

  const ground = computeDesign(input, { ...defaultDesignOptions(), gridOrGenerator: false, mounting: "ground" });
  assert.ok(!ground.protection.some((p) => p.label.startsWith("Changeover")));
  assert.ok(ground.bom.some((b) => b.item === "Ground-mount structure") && !ground.bom.some((b) => b.item === "Mounting rails"));
});

test("cable lengths include both conductors and wastage", () => {
  const d = computeDesign(defaultInput("home"), { ...defaultDesignOptions(), pvRunM: 20 });
  const pv = d.cables.find((c) => c.id === "pv")!;
  assert.equal(pv.lengths.length, 2);
  assert.equal(pv.lengths[0].metres, Math.ceil(20 * d.strings.strings * 1.1));
});

test("summary text lists the bill of materials", () => {
  const text = formatDesignSummary(computeDesign(defaultInput("office"), defaultDesignOptions()));
  assert.match(text, /Cables:/);
  assert.match(text, /mm²/);
  assert.match(text, /Battery bank/);
});
