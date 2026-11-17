import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeSystemEstimate,
  defaultInput,
  formatEstimateSummary,
  normaliseLine,
  type CalculatorInput,
  type LoadLine,
} from "./calculator";

function line(partial: Partial<LoadLine> & Pick<LoadLine, "watts">): LoadLine {
  return { key: "k", name: "Test", quantity: 1, hoursPerDay: 1, surge: false, ...partial };
}

function input(loads: LoadLine[], overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return { applicationType: "home", loads, simultaneity: 1, backupHours: 6, chemistry: "lithium", panelWatt: 550, ...overrides };
}

test("empty selection returns no load and no recommendation", () => {
  const r = computeSystemEstimate(input([]));
  assert.equal(r.hasLoad, false);
  assert.equal(r.inverterKva, 0);
  assert.equal(r.matchingPackage, null);
});

test("connected load and daily energy multiply quantity × watts (× hours)", () => {
  const r = computeSystemEstimate(input([line({ watts: 100, quantity: 3, hoursPerDay: 5 })]));
  assert.equal(r.connectedLoadW, 300);
  assert.equal(r.dailyEnergyWh, 1500);
});

test("simultaneous load applies the factor but never drops below the largest single appliance", () => {
  const loads = [line({ watts: 1200 }), line({ watts: 100, quantity: 2 })];
  const half = computeSystemEstimate(input(loads, { simultaneity: 0.5 }));
  assert.equal(half.connectedLoadW, 1400);
  assert.equal(half.simultaneousLoadW, 1200); // 700 would be below the 1200 W AC
  const full = computeSystemEstimate(input(loads, { simultaneity: 1 }));
  assert.equal(full.simultaneousLoadW, 1400);
});

test("motor start-up surge can push the inverter up a size", () => {
  const noSurge = computeSystemEstimate(input([line({ watts: 1200, surge: false })]));
  const surge = computeSystemEstimate(input([line({ watts: 1200, surge: true })]));
  assert.equal(noSurge.startupSurgeW, 0);
  assert.equal(surge.startupSurgeW, 2400);
  assert.ok(surge.inverterKva >= noSurge.inverterKva);
  // 1200 W continuous → 1.875 kVA → 2.5; with surge (3600/0.8/2 = 2.25) still 2.5
  assert.equal(noSurge.inverterKva, 2.5);
});

test("inverter is rounded up to a standard size", () => {
  const r = computeSystemEstimate(input([line({ watts: 3000 })]));
  // 3000 / 0.8 × 1.25 = 4.69 kVA → 5 kVA
  assert.equal(r.inverterKva, 5);
  assert.equal(r.needsSiteAssessment, false);
});

test("very large loads are flagged for a site assessment", () => {
  const r = computeSystemEstimate(input([line({ watts: 40_000 })]));
  assert.equal(r.needsSiteAssessment, true);
  assert.ok(r.inverterKva >= 50);
});

test("backup energy is limited by each appliance's own daily hours", () => {
  const r = computeSystemEstimate(
    input([line({ watts: 750, hoursPerDay: 1 }), line({ watts: 100, hoursPerDay: 10 })], { backupHours: 6 }),
  );
  // pump: 750 × min(1,6) = 750 ; fan: 100 × min(10,6) = 600
  assert.equal(r.backupEnergyWh, 1350);
});

test("lead-acid needs a bigger bank than lithium for the same backup", () => {
  const loads = [line({ watts: 500, hoursPerDay: 8 })];
  const li = computeSystemEstimate(input(loads, { chemistry: "lithium" }));
  const pb = computeSystemEstimate(input(loads, { chemistry: "lead-acid" }));
  assert.ok(pb.batteryKwh > li.batteryKwh);
  // lithium: 500×6×1.1 = 3.3 kWh usable / (0.9×0.95) = 3.86 → 4.0
  assert.equal(li.batteryKwh, 4);
});

test("panel count follows the chosen panel wattage", () => {
  const loads = [line({ watts: 1000, hoursPerDay: 5 })];
  const p550 = computeSystemEstimate(input(loads, { panelWatt: 550 }));
  const p450 = computeSystemEstimate(input(loads, { panelWatt: 450 }));
  // 5000 × 1.1 / (4.4 × 0.72) = 1736 W
  assert.equal(p550.pvKwp, 1.74);
  assert.equal(p550.panelCount, 4);
  assert.equal(p450.panelCount, 4);
});

test("bad input is sanitised instead of producing NaN", () => {
  const cleaned = normaliseLine(line({ watts: Number.NaN, quantity: -4, hoursPerDay: 99 }));
  assert.equal(cleaned.quantity, 0);
  assert.equal(cleaned.watts, 0);
  assert.equal(cleaned.hoursPerDay, 24);
  const r = computeSystemEstimate(input([line({ watts: Number.NaN })]));
  assert.equal(r.hasLoad, false);
});

test("every application preset produces a full recommendation", () => {
  for (const type of ["home", "office", "business", "industrial"] as const) {
    const i = defaultInput(type);
    const r = computeSystemEstimate(i);
    assert.equal(r.hasLoad, true, type);
    assert.ok(r.inverterKva > 0 && r.batteryKwh > 0 && r.panelCount > 0, type);
    assert.match(formatEstimateSummary(i, r), /Suggested inverter/);
  }
});
