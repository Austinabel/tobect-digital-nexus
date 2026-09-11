/**
 * Rough-order-of-magnitude solar sizing engine used by the homepage
 * "Solar Calculator" widget and (later) the full /solutions/calculator
 * page. Numbers are deliberately conservative planning estimates, not
 * an engineering design — every result carries that disclaimer in the UI.
 *
 * Assumptions:
 *  - ~4.4 peak sun hours/day (typical for Nigeria)
 *  - 1.3x system loss factor (wiring, inverter/charge-controller efficiency)
 *  - 0.72 effective panel derate (temperature, soiling, orientation)
 *  - inductive loads (compressors, motors) get a surge allowance when
 *    sizing the inverter, since their start-up draw is well above
 *    their running watts
 */

export type ApplianceId =
  | "lights"
  | "tv"
  | "fans"
  | "fridge"
  | "freezer"
  | "ac"
  | "pump"
  | "office";

export interface Appliance {
  id: ApplianceId;
  name: string;
  /** typical running watts */
  watts: number;
  /** typical hours of use per day */
  hoursPerDay: number;
  /** true for compressor/motor loads that need inverter surge headroom */
  hasSurge?: boolean;
}

export const APPLIANCES: Appliance[] = [
  { id: "lights", name: "Lights", watts: 150, hoursPerDay: 5 },
  { id: "tv", name: "TV + decoder", watts: 130, hoursPerDay: 6 },
  { id: "fans", name: "Fans ×3", watts: 240, hoursPerDay: 10 },
  { id: "fridge", name: "Fridge", watts: 200, hoursPerDay: 8, hasSurge: true },
  { id: "freezer", name: "Freezer", watts: 300, hoursPerDay: 9, hasSurge: true },
  { id: "ac", name: "1.5HP AC", watts: 1200, hoursPerDay: 5, hasSurge: true },
  { id: "pump", name: "1HP pump", watts: 750, hoursPerDay: 1.5, hasSurge: true },
  { id: "office", name: "Home office", watts: 220, hoursPerDay: 6 },
];

/** Standard inverter sizes Tobecat stocks, in kVA. */
const STANDARD_INVERTER_SIZES = [1.5, 2.5, 3.5, 5, 7.5, 10];

export type PackageMatch =
  | "Home Backup"
  | "Small Business"
  | "Office Power"
  | "Complete System";

export interface CalculatorResult {
  /** true once at least one appliance is selected */
  hasSelection: boolean;
  peakLoadKw: number;
  dailyEnergyKwh: number;
  inverterKva: number;
  batteryKwhLow: number;
  batteryKwhHigh: number;
  panelCountLow: number;
  panelCountHigh: number;
  /** panel wattage the panel count assumes */
  panelWatt: 550;
  matchingPackage: PackageMatch | null;
}

const PEAK_SUN_HOURS = 4.4;
const PANEL_DERATE = 0.72;
const SYSTEM_LOSS_FACTOR = 1.3;
const SURGE_ALLOWANCE = 0.6; // extra headroom, as a fraction of the surge load's running watts
const INVERTER_HEADROOM = 1.2;
const INVERTER_EFFICIENCY = 0.8;
const PANEL_WATT = 550;

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function computeSystemEstimate(selectedIds: Set<ApplianceId>): CalculatorResult {
  let runningWatts = 0;
  let surgeWatts = 0;
  let dailyWattHours = 0;

  for (const appliance of APPLIANCES) {
    if (!selectedIds.has(appliance.id)) continue;
    runningWatts += appliance.watts;
    dailyWattHours += appliance.watts * appliance.hoursPerDay;
    if (appliance.hasSurge) surgeWatts += appliance.watts * SURGE_ALLOWANCE;
  }

  const peakWatts = runningWatts + surgeWatts;

  if (peakWatts === 0) {
    return {
      hasSelection: false,
      peakLoadKw: 0,
      dailyEnergyKwh: 0,
      inverterKva: 0,
      batteryKwhLow: 0,
      batteryKwhHigh: 0,
      panelCountLow: 0,
      panelCountHigh: 0,
      panelWatt: PANEL_WATT,
      matchingPackage: null,
    };
  }

  const rawInverterKva = (peakWatts / INVERTER_EFFICIENCY / 1000) * INVERTER_HEADROOM;
  const inverterKva =
    STANDARD_INVERTER_SIZES.find((size) => size >= rawInverterKva) ??
    STANDARD_INVERTER_SIZES[STANDARD_INVERTER_SIZES.length - 1];

  const batteryKwhLow = Math.max(2.4, roundToStep((dailyWattHours * SYSTEM_LOSS_FACTOR) / 1000, 0.5));
  const batteryKwhHigh = roundToStep((dailyWattHours * SYSTEM_LOSS_FACTOR * 1.4) / 1000, 0.5);

  const requiredPanelWatts = dailyWattHours / PEAK_SUN_HOURS / PANEL_DERATE;
  const panelCountLow = Math.max(2, Math.ceil(requiredPanelWatts / PANEL_WATT));
  const panelCountHigh = panelCountLow + 2;

  let matchingPackage: PackageMatch;
  if (inverterKva <= 2.5) matchingPackage = "Home Backup";
  else if (inverterKva <= 5) matchingPackage = "Small Business";
  else if (inverterKva <= 7.5) matchingPackage = "Office Power";
  else matchingPackage = "Complete System";

  return {
    hasSelection: true,
    peakLoadKw: peakWatts / 1000,
    dailyEnergyKwh: dailyWattHours / 1000,
    inverterKva,
    batteryKwhLow,
    batteryKwhHigh,
    panelCountLow,
    panelCountHigh,
    panelWatt: PANEL_WATT,
    matchingPackage,
  };
}

export const DEFAULT_SELECTION: ApplianceId[] = ["lights", "tv", "fans", "fridge"];
