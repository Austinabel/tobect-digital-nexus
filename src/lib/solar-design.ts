/**
 * Advanced solar system design — builds on the sizing engine in
 * `calculator.ts` and turns its inverter / battery / array sizes into a
 * buildable design and shopping list:
 *
 *   location sun hours → battery bank (modules in series × parallel)
 *   → panel strings (inverter voltage window) → cable sizes and lengths
 *   → breakers / surge protection → mounting → bill of materials.
 *
 * Pure functions, no framework imports (unit-tested in solar-design.test.ts).
 * Every figure is a PLANNING ESTIMATE using the named, conservative
 * assumptions below; the final design must be checked on site and against
 * the actual datasheets by a qualified installer. The UI says so.
 */
import {
  BATTERY_CHEMISTRY,
  POWER_FACTOR,
  PV_SYSTEM_DERATE,
  PANEL_WATT_OPTIONS,
  computeSystemEstimate,
  type BatteryChemistry,
  type CalculatorInput,
  type CalculatorResult,
  type PanelWatt,
} from "./calculator";

/* ------------------------------------------------------------------ */
/* Assumptions                                                         */
/* ------------------------------------------------------------------ */

/** Copper resistivity at ~70 °C conductor temperature (Ω·mm²/m) — conservative for hot roofs. */
export const COPPER_RESISTIVITY = 0.0225;
/** Max voltage drop: PV DC and AC output 3 %, battery cable 1 % (low voltage, high current). */
export const MAX_DROP = { pv: 0.03, battery: 0.01, ac: 0.03 } as const;
/** PV conductors carry 125 % (continuous) × 125 % (irradiance) of short-circuit current. */
export const PV_CONDUCTOR_FACTOR = 1.56;
/** Breakers / fuses sized at 125 % of the expected current. */
export const PROTECTION_FACTOR = 1.25;
/** Cold-morning Voc rise (≈ 15 °C below STC × 0.3 %/°C) — used for the inverter's max input voltage. */
export const VOC_COLD_FACTOR = 1.05;
/** Hot-cell Vmp drop (≈ 45 °C above STC × 0.35 %/°C) — used for the inverter's MPPT minimum. */
export const VMP_HOT_FACTOR = 0.85;
/** Inverter DC→AC efficiency, for battery cable current. */
export const INVERTER_EFFICIENCY = 0.92;
/** Extra cable for routing, terminations and offcuts. */
export const CABLE_WASTAGE = 1.1;
/** Above this size, the inverter output is usually three-phase. */
export const THREE_PHASE_FROM_KVA = 15;

export const STANDARD_CABLE_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const;
export const STANDARD_BREAKER_A = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630] as const;
const DC_VOLTAGE_CLASSES = [250, 500, 600, 800, 1000, 1500] as const;

/**
 * Conservative current ratings (A) for copper cable.
 * - general: PVC/XLPE singles in conduit or trunking (PV and AC runs)
 * - battery: flexible single-core battery/welding cable, short run in free air
 */
const AMPACITY = {
  general: { 1.5: 17, 2.5: 23, 4: 31, 6: 40, 10: 54, 16: 73, 25: 95, 35: 117, 50: 141, 70: 179, 95: 216, 120: 249, 150: 285, 185: 324, 240: 380 },
  battery: { 1.5: 20, 2.5: 28, 4: 38, 6: 50, 10: 70, 16: 100, 25: 135, 35: 170, 50: 210, 70: 265, 95: 320, 120: 370, 150: 420, 185: 480, 240: 560 },
} as const;

/* ------------------------------------------------------------------ */
/* Locations                                                           */
/* ------------------------------------------------------------------ */

/**
 * Typical annual-average peak sun hours by region (kWh/m²/day). Nigeria's
 * solar resource rises from the coast to the north. Conservative
 * round figures — customers can override with a local value.
 */
export const REGIONS = [
  { id: "south-south", label: "South-South", examples: "Port Harcourt, Uyo, Benin", psh: 4.0 },
  { id: "south-east", label: "South-East", examples: "Enugu, Owerri, Awka", psh: 4.3 },
  { id: "south-west", label: "South-West", examples: "Lagos, Ibadan, Abeokuta", psh: 4.5 },
  { id: "north-central", label: "North-Central", examples: "Abuja, Jos, Ilorin", psh: 5.2 },
  { id: "north-west", label: "North-West", examples: "Kano, Kaduna, Sokoto", psh: 5.8 },
  { id: "north-east", label: "North-East", examples: "Maiduguri, Bauchi, Yola", psh: 5.8 },
] as const;
export type RegionId = (typeof REGIONS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Batteries                                                           */
/* ------------------------------------------------------------------ */

export interface BatteryModule {
  id: string;
  label: string;
  chemistry: BatteryChemistry;
  /** nominal voltage class used for series wiring */
  voltageClass: 12 | 24 | 48;
  /** nominal voltage (LiFePO₄ 12.8 / 25.6 / 51.2 V; lead-acid 12 V) */
  nominalV: number;
  ah: number;
}

export const BATTERY_MODULES: BatteryModule[] = [
  { id: "li-12-100", label: "12V 100Ah lithium", chemistry: "lithium", voltageClass: 12, nominalV: 12.8, ah: 100 },
  { id: "li-12-200", label: "12V 200Ah lithium", chemistry: "lithium", voltageClass: 12, nominalV: 12.8, ah: 200 },
  { id: "li-24-100", label: "24V 100Ah lithium", chemistry: "lithium", voltageClass: 24, nominalV: 25.6, ah: 100 },
  { id: "li-24-200", label: "24V 200Ah lithium", chemistry: "lithium", voltageClass: 24, nominalV: 25.6, ah: 200 },
  { id: "li-48-100", label: "48V 100Ah lithium", chemistry: "lithium", voltageClass: 48, nominalV: 51.2, ah: 100 },
  { id: "li-48-200", label: "48V 200Ah lithium", chemistry: "lithium", voltageClass: 48, nominalV: 51.2, ah: 200 },
  { id: "li-48-300", label: "48V 300Ah lithium", chemistry: "lithium", voltageClass: 48, nominalV: 51.2, ah: 300 },
  { id: "la-12-150", label: "12V 150Ah tubular", chemistry: "lead-acid", voltageClass: 12, nominalV: 12, ah: 150 },
  { id: "la-12-200", label: "12V 200Ah tubular", chemistry: "lead-acid", voltageClass: 12, nominalV: 12, ah: 200 },
  { id: "la-12-220", label: "12V 220Ah tubular", chemistry: "lead-acid", voltageClass: 12, nominalV: 12, ah: 220 },
];

export function moduleKwh(m: BatteryModule): number {
  return Math.round(m.nominalV * m.ah) / 1000;
}

/** Modules that fit a battery system voltage and chemistry (module voltage must divide the bank voltage). */
export function compatibleModules(chemistry: BatteryChemistry, systemV: number): BatteryModule[] {
  return BATTERY_MODULES.filter((m) => m.chemistry === chemistry && m.voltageClass <= systemV && systemV % m.voltageClass === 0);
}

/* ------------------------------------------------------------------ */
/* Panels                                                              */
/* ------------------------------------------------------------------ */

export interface PanelSpec {
  watt: PanelWatt;
  /** STC electrical values from the panel datasheet */
  vmp: number;
  voc: number;
  imp: number;
  isc: number;
  /** dimensions in mm */
  lengthMm: number;
  widthMm: number;
}

/**
 * Typical module classes by rating (STC voltages and size). Currents follow
 * from the rating. These are only starting points — the advanced section
 * lets the customer type the real datasheet values.
 */
const PANEL_CLASSES: { upTo: number; vmp: number; voc: number; lengthMm: number; widthMm: number }[] = [
  { upTo: 330, vmp: 31.5, voc: 38.5, lengthMm: 1650, widthMm: 992 }, // 60-cell
  { upTo: 480, vmp: 41.5, voc: 49.5, lengthMm: 2094, widthMm: 1038 }, // 72-cell / 144 half-cut
  { upTo: 580, vmp: 41.9, voc: 49.9, lengthMm: 2278, widthMm: 1134 }, // 182 mm, 144 half-cut
  { upTo: 640, vmp: 44.6, voc: 53.2, lengthMm: 2382, widthMm: 1134 }, // N-type 182 mm, 156 half-cut
  { upTo: Infinity, vmp: 40.2, voc: 48.3, lengthMm: 2384, widthMm: 1303 }, // 210 mm, 132 half-cut
];

/** Exact typical values kept for the sizes earlier designs were made with. */
const KNOWN_PANELS: Record<number, PanelSpec> = {
  450: { watt: 450, vmp: 41.5, voc: 49.5, imp: 10.85, isc: 11.5, lengthMm: 2094, widthMm: 1038 },
  550: { watt: 550, vmp: 41.9, voc: 49.9, imp: 13.13, isc: 13.9, lengthMm: 2278, widthMm: 1134 },
  600: { watt: 600, vmp: 34.9, voc: 41.7, imp: 17.2, isc: 18.3, lengthMm: 2172, widthMm: 1303 },
};

/** Typical datasheet values for a panel of the given rating — replace with the actual panel's datasheet. */
export function typicalPanel(watt: PanelWatt): PanelSpec {
  if (KNOWN_PANELS[watt]) return { ...KNOWN_PANELS[watt] };
  const c = PANEL_CLASSES.find((x) => watt <= x.upTo)!;
  const imp = Math.round((watt / c.vmp) * 100) / 100;
  return { watt, vmp: c.vmp, voc: c.voc, imp, isc: Math.round(imp * 1.06 * 100) / 100, lengthMm: c.lengthMm, widthMm: c.widthMm };
}

/** Typical values for every size offered in the calculators. */
export const TYPICAL_PANELS: Record<number, PanelSpec> = Object.fromEntries(PANEL_WATT_OPTIONS.map((w) => [w, typicalPanel(w)]));

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export interface DesignOptions {
  regionId: RegionId;
  /** overrides the region's value when set */
  peakSunHours: number;
  batteryModuleId: string;
  panel: PanelSpec;
  /** inverter datasheet: maximum PV input voltage and MPPT lower limit */
  inverterMaxPvV: number;
  mpptMinV: number;
  /** one-way cable runs in metres */
  pvRunM: number;
  batteryRunM: number;
  acRunM: number;
  mounting: "roof" | "ground";
  /** inverter also takes grid or generator input → changeover switch */
  gridOrGenerator: boolean;
  /**
   * A specific inverter the customer picked (e.g. one we stock). Its rating
   * and battery voltage replace the recommendation; its PV limits are copied
   * into inverterMaxPvV / mpptMinV only when its datasheet values are known.
   */
  inverter?: { kva: number; batteryV?: 12 | 24 | 48; name: string; productSlug?: string };
}

export function defaultDesignOptions(panelWatt: PanelWatt = 550): DesignOptions {
  return {
    regionId: "south-west",
    peakSunHours: REGIONS.find((r) => r.id === "south-west")!.psh,
    batteryModuleId: "li-48-100",
    panel: typicalPanel(panelWatt),
    inverterMaxPvV: 500,
    mpptMinV: 120,
    pvRunM: 15,
    batteryRunM: 2,
    acRunM: 10,
    mounting: "roof",
    gridOrGenerator: true,
  };
}

/* ------------------------------------------------------------------ */
/* Building blocks (exported for tests)                                */
/* ------------------------------------------------------------------ */

function clamp(v: number, min: number, max: number) {
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
}

export function nextStandard<T extends number>(value: number, list: readonly T[]): T | null {
  return list.find((s) => s >= value - 1e-9) ?? null;
}

export interface CableResult {
  sizeMm2: number | null;
  /** current the cable is designed for (A) */
  designCurrentA: number;
  /** voltage drop at the chosen size, % */
  dropPct: number;
  /** which requirement decided the size */
  limitedBy: "voltage drop" | "current rating" | "minimum size";
}

/**
 * Smallest standard copper size that meets the current rating AND keeps
 * voltage drop under the limit: A = 2·L·I·ρ / (V·drop) (out-and-back run).
 */
export function sizeCable(opts: {
  currentA: number;
  oneWayM: number;
  voltage: number;
  maxDrop: number;
  table: keyof typeof AMPACITY;
  minMm2: number;
  /** three-phase drop uses √3·L instead of 2·L */
  threePhase?: boolean;
}): CableResult {
  const factor = opts.threePhase ? Math.sqrt(3) : 2;
  const dropArea = (factor * opts.oneWayM * opts.currentA * COPPER_RESISTIVITY) / (opts.voltage * opts.maxDrop);
  const ratings = AMPACITY[opts.table] as Record<number, number>;
  const byCurrent = STANDARD_CABLE_MM2.find((s) => ratings[s] >= opts.currentA) ?? Infinity;
  const byDrop = STANDARD_CABLE_MM2.find((s) => s >= dropArea - 1e-9) ?? Infinity;
  const needed = Math.max(opts.minMm2, byCurrent, byDrop);
  const size = Number.isFinite(needed) ? needed : null;
  const limitedBy: CableResult["limitedBy"] = byDrop >= byCurrent && byDrop >= opts.minMm2 ? "voltage drop" : byCurrent >= opts.minMm2 ? "current rating" : "minimum size";
  const dropPct = size ? (factor * opts.oneWayM * opts.currentA * COPPER_RESISTIVITY) / size / opts.voltage * 100 : 0;
  return { sizeMm2: size, designCurrentA: Math.round(opts.currentA * 10) / 10, dropPct: Math.round(dropPct * 100) / 100, limitedBy };
}

export interface StringDesign {
  panelsPerString: number;
  strings: number;
  totalPanels: number;
  arrayKwp: number;
  /** worst-case (cold) open-circuit voltage of one string */
  stringVocColdV: number;
  /** operating voltage of one string on a hot day */
  stringVmpHotV: number;
  arrayIscA: number;
  fits: boolean;
  problem?: string;
}

export function designStrings(panelsNeeded: number, panel: PanelSpec, maxPvV: number, mpptMinV: number): StringDesign {
  const vocCold = panel.voc * VOC_COLD_FACTOR;
  const vmpHot = panel.vmp * VMP_HOT_FACTOR;
  const maxSeries = Math.floor(maxPvV / vocCold);
  const minSeries = Math.max(1, Math.ceil(mpptMinV / vmpHot));
  const n = Math.max(1, panelsNeeded);

  if (maxSeries < 1 || maxSeries < minSeries) {
    return {
      panelsPerString: 0, strings: 0, totalPanels: n, arrayKwp: (n * panel.watt) / 1000, stringVocColdV: 0, stringVmpHotV: 0, arrayIscA: 0, fits: false,
      problem: "This panel's voltage doesn't fit the inverter's PV input window — choose a different inverter or panel.",
    };
  }
  // Fewest strings within the voltage limit, balanced, and long enough to reach the MPPT minimum.
  let strings = Math.ceil(n / maxSeries);
  const perString = Math.max(minSeries, Math.ceil(n / strings));
  strings = Math.ceil(n / perString);
  const total = strings * perString;
  return {
    panelsPerString: perString,
    strings,
    totalPanels: total,
    arrayKwp: Math.round(total * panel.watt) / 1000,
    stringVocColdV: Math.round(perString * vocCold),
    stringVmpHotV: Math.round(perString * vmpHot),
    arrayIscA: Math.round(strings * panel.isc * 10) / 10,
    fits: true,
  };
}

export interface BatteryBank {
  module: BatteryModule;
  inSeries: number;
  inParallel: number;
  totalModules: number;
  bankKwh: number;
  bankAh: number;
  systemV: number;
  /** hours of backup this bank gives at the customer's backup load */
  backupHoursAchieved: number;
}

export function designBatteryBank(requiredKwh: number, systemV: number, module: BatteryModule, chemistry: BatteryChemistry, backupEnergyWh: number, backupHours: number): BatteryBank {
  const inSeries = Math.max(1, Math.round(systemV / module.voltageClass));
  const stringKwh = inSeries * moduleKwh(module);
  const inParallel = Math.max(1, Math.ceil(requiredKwh / stringKwh - 1e-9));
  const bankKwh = Math.round(inParallel * stringKwh * 100) / 100;
  const c = BATTERY_CHEMISTRY[chemistry];
  const usableWh = bankKwh * 1000 * c.depthOfDischarge * c.roundTripEfficiency;
  const backupLoadW = backupHours > 0 ? backupEnergyWh / backupHours : 0;
  return {
    module,
    inSeries,
    inParallel,
    totalModules: inSeries * inParallel,
    bankKwh,
    bankAh: inParallel * module.ah,
    systemV,
    backupHoursAchieved: backupLoadW > 0 ? Math.round((usableWh / backupLoadW) * 10) / 10 : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Full design                                                         */
/* ------------------------------------------------------------------ */

export interface CableLine {
  id: "pv" | "battery" | "ac" | "earth";
  label: string;
  sizeMm2: number | null;
  type: string;
  /** what to buy, e.g. "Red 35 m + Black 35 m" */
  lengths: { colour: string; metres: number }[];
  designCurrentA?: number;
  dropPct?: number;
  note?: string;
}

export interface ProtectionLine {
  label: string;
  rating: string;
  qty: number;
  note?: string;
}

export interface BomLine {
  group: "Main equipment" | "Batteries" | "Cables" | "Protection & switching" | "Mounting & accessories";
  item: string;
  spec: string;
  qty: number;
  unit: string;
  /** shop category for "buy" links */
  shop?: string;
}

export interface SolarDesign {
  base: CalculatorResult;
  /** inverter used in the design — the chosen model, or the recommendation */
  inverterKva: number;
  inverterName: string | null;
  systemV: 12 | 24 | 48;
  /** continuous watts the design's inverter can still take beyond today's load */
  growthHeadroomW: number;
  peakSunHours: number;
  battery: BatteryBank | null;
  strings: StringDesign;
  dailyGenerationKwh: number;
  /** share of daily use the array can generate on an average day */
  solarCoveragePct: number;
  phase: "single" | "three";
  acOutputCurrentA: number;
  cables: CableLine[];
  protection: ProtectionLine[];
  bom: BomLine[];
  warnings: string[];
}

const ceilM = (m: number) => Math.ceil(m * CABLE_WASTAGE);

export function computeDesign(input: CalculatorInput, options: DesignOptions): SolarDesign {
  const psh = clamp(options.peakSunHours, 2, 8);
  const base = computeSystemEstimate({ ...input, peakSunHours: psh });
  const panel = options.panel;
  const warnings: string[] = [];

  // --- battery bank
  const chosen = options.inverter && options.inverter.kva > 0 ? options.inverter : null;
  const inverterKva = chosen?.kva ?? base.inverterKva;
  const systemV: 12 | 24 | 48 = chosen?.batteryV ?? base.batteryVoltage;
  if (chosen && base.hasLoad && chosen.kva < base.inverterKva) {
    warnings.push(`${chosen.name} (${chosen.kva} kVA) is smaller than the ${base.inverterKva} kVA your load${(input.growthPct ?? 0) > 0 ? " and growth allowance" : ""} needs.`);
  }
  const growthHeadroomW = base.hasLoad ? Math.max(0, Math.round((inverterKva * 1000 * POWER_FACTOR) / 1.25 - base.simultaneousLoadW)) : 0;
  const fits = compatibleModules(input.chemistry, systemV);
  const batteryModule = fits.find((m) => m.id === options.batteryModuleId) ?? fits[fits.length - 1] ?? null;
  const battery = batteryModule && base.batteryKwh > 0 ? designBatteryBank(base.batteryKwh, systemV, batteryModule, input.chemistry, base.backupEnergyWh, input.backupHours) : null;
  if (battery && input.chemistry === "lead-acid" && battery.inParallel > 4) {
    warnings.push(`${battery.inParallel} parallel strings of lead-acid batteries is more than recommended (4) — consider lithium or larger cells.`);
  }

  // --- PV strings (panel count may round up so strings are equal)
  const strings = designStrings(base.panelCount, panel, clamp(options.inverterMaxPvV, 60, 1500), clamp(options.mpptMinV, 0, 1000));
  if (!strings.fits && strings.problem) warnings.push(strings.problem);
  if (strings.fits && strings.strings > 2) warnings.push(`${strings.strings} strings: use a PV combiner box with string fuses, or an inverter with enough MPPT inputs.`);
  const arrayKwp = strings.arrayKwp;
  const dailyGenerationKwh = Math.round(arrayKwp * psh * PV_SYSTEM_DERATE * 10) / 10;
  const solarCoveragePct = base.dailyEnergyWh > 0 ? Math.min(999, Math.round(((dailyGenerationKwh * 1000) / base.dailyEnergyWh) * 100)) : 0;

  // --- cables
  const pvRun = clamp(options.pvRunM, 1, 300);
  const batRun = clamp(options.batteryRunM, 0.5, 20);
  const acRun = clamp(options.acRunM, 1, 300);
  const cables: CableLine[] = [];

  // PV: each string runs back to the inverter (or combiner) on its own pair.
  const pv = strings.fits
    ? sizeCable({ currentA: panel.isc * PV_CONDUCTOR_FACTOR, oneWayM: pvRun, voltage: strings.stringVmpHotV, maxDrop: MAX_DROP.pv, table: "general", minMm2: 4 })
    : null;
  if (pv) {
    const m = ceilM(pvRun * strings.strings);
    cables.push({
      id: "pv", label: "Solar (PV) DC cable", sizeMm2: pv.sizeMm2, type: "Single-core solar cable (PV1-F, UV-resistant)",
      lengths: [{ colour: "Red (+)", metres: m }, { colour: "Black (−)", metres: m }],
      designCurrentA: pv.designCurrentA, dropPct: pv.dropPct,
      note: `${strings.strings} string${strings.strings > 1 ? "s" : ""} × ${pvRun} m run, each on its own pair.`,
    });
  }

  // Battery: full inverter power drawn from the bank at nominal voltage.
  const inverterKw = inverterKva * POWER_FACTOR;
  const batteryCurrentA = systemV > 0 ? (inverterKw * 1000) / (systemV * INVERTER_EFFICIENCY) : 0;
  const bat = inverterKva > 0
    ? sizeCable({ currentA: batteryCurrentA * PROTECTION_FACTOR, oneWayM: batRun, voltage: systemV, maxDrop: MAX_DROP.battery, table: "battery", minMm2: 10 })
    : null;
  if (bat) {
    const m = Math.max(1, ceilM(batRun));
    cables.push({
      id: "battery", label: "Battery cable", sizeMm2: bat.sizeMm2, type: "Flexible single-core battery cable with crimped lugs",
      lengths: [{ colour: "Red (+)", metres: m }, { colour: "Black (−)", metres: m }],
      designCurrentA: bat.designCurrentA, dropPct: bat.dropPct,
      note: "Keep this run as short as possible; module interconnects usually come with lithium batteries.",
    });
    if (bat.sizeMm2 === null) warnings.push("Battery current is too high for a single cable — use parallel cables or a higher battery voltage.");
  }

  // AC output.
  const phase: "single" | "three" = inverterKva >= THREE_PHASE_FROM_KVA ? "three" : "single";
  const acCurrentA = phase === "three" ? (inverterKva * 1000) / (Math.sqrt(3) * 400) : (inverterKva * 1000) / 230;
  const ac = inverterKva > 0
    ? sizeCable({ currentA: acCurrentA * PROTECTION_FACTOR, oneWayM: acRun, voltage: phase === "three" ? 400 : 230, maxDrop: MAX_DROP.ac, table: "general", minMm2: 2.5, threePhase: phase === "three" })
    : null;
  if (ac) {
    cables.push({
      id: "ac", label: "AC output cable (inverter → distribution board)", sizeMm2: ac.sizeMm2,
      type: phase === "three" ? "5-core (L1, L2, L3, N, E) armoured or in conduit" : "3-core (L, N, E) or singles in conduit",
      lengths: [{ colour: phase === "three" ? "5-core" : "3-core", metres: ceilM(acRun) }],
      designCurrentA: ac.designCurrentA, dropPct: ac.dropPct,
    });
  }

  // Earthing.
  const earthMm2 = ac?.sizeMm2 && ac.sizeMm2 > 16 ? 16 : ac?.sizeMm2 && ac.sizeMm2 > 6 ? 10 : 6;
  cables.push({
    id: "earth", label: "Earth cable", sizeMm2: earthMm2, type: "Green/yellow single-core",
    lengths: [{ colour: "Green/yellow", metres: ceilM(acRun + (options.mounting === "roof" ? pvRun : 5)) }],
    note: "Bonds the inverter, panel frames and mounting to the earth rod.",
  });

  // --- protection
  const protection: ProtectionLine[] = [];
  const dcV = (v: number) => `${nextStandard(v, DC_VOLTAGE_CLASSES) ?? Math.ceil(v)} V DC`;
  if (strings.fits) {
    protection.push({
      label: "PV DC isolator / breaker", qty: 1,
      rating: `${nextStandard(strings.arrayIscA * PROTECTION_FACTOR, STANDARD_BREAKER_A) ?? "—"} A, ${dcV(strings.stringVocColdV)}`,
      note: "Between the array and the inverter; must be DC-rated.",
    });
    if (strings.strings >= 3) {
      protection.push({ label: "PV string fuses (gPV)", qty: strings.strings * 2, rating: `${nextStandard(panel.isc * PV_CONDUCTOR_FACTOR, STANDARD_BREAKER_A)} A, ${dcV(strings.stringVocColdV)}`, note: "One on each pole of every string, in the combiner box." });
    }
    protection.push({ label: "DC surge protection device (SPD), Type 2", qty: 1, rating: `${dcV(strings.stringVocColdV)} PV-rated` });
  }
  if (inverterKva > 0) {
    protection.push({
      label: "Battery DC breaker / fuse", qty: 1,
      rating: `${nextStandard(batteryCurrentA * PROTECTION_FACTOR, STANDARD_BREAKER_A) ?? "—"} A, ${dcV(systemV * 1.2)}`,
      note: "As close to the battery as possible.",
    });
    const acBreaker = nextStandard(acCurrentA * PROTECTION_FACTOR, STANDARD_BREAKER_A);
    protection.push({ label: "AC output breaker (MCB/MCCB)", qty: 1, rating: `${acBreaker ?? "—"} A, ${phase === "three" ? "4-pole" : "2-pole"}` });
    protection.push({ label: "AC surge protection device (SPD), Type 2", qty: 1, rating: phase === "three" ? "3-phase + N, 275 V" : "1-phase + N, 275 V" });
    if (options.gridOrGenerator) protection.push({ label: "Changeover switch (manual or ATS)", qty: 1, rating: `${acBreaker ?? "—"} A, ${phase === "three" ? "4-pole" : "2-pole"}`, note: "For grid / generator input." });
    protection.push({ label: "Earth rod with clamp", qty: 1, rating: "Copper-bonded, 1.2 m or longer" });
  }

  // --- mounting & accessories
  const rows = Math.max(1, strings.strings || 1);
  const perRow = strings.fits ? strings.panelsPerString : strings.totalPanels;
  const railM = Math.ceil(rows * 2 * perRow * (panel.widthMm / 1000 + 0.02) * 1.05);

  // --- bill of materials
  const bom: BomLine[] = [];
  if (inverterKva > 0) {
    bom.push({ group: "Main equipment", item: chosen ? chosen.name : "Hybrid inverter", spec: `${inverterKva} kVA, ${systemV} V battery, ${phase === "three" ? "three-phase" : "single-phase"} output, PV input ≥ ${strings.fits ? strings.stringVocColdV : "—"} V`, qty: 1, unit: "unit", shop: "inverters" });
  }
  bom.push({ group: "Main equipment", item: "Solar panels", spec: `${panel.watt} W (${strings.fits ? `${strings.strings} × ${strings.panelsPerString} in series` : "see warnings"})`, qty: strings.totalPanels, unit: "panels", shop: "solar-panels" });
  if (battery) {
    bom.push({ group: "Batteries", item: "Battery modules", spec: `${battery.module.label} (${moduleKwh(battery.module)} kWh) — ${battery.inSeries} in series × ${battery.inParallel} parallel = ${battery.bankKwh} kWh @ ${systemV} V`, qty: battery.totalModules, unit: "modules", shop: input.chemistry === "lithium" ? "lithium-batteries" : undefined });
    if (battery.totalModules > 1) bom.push({ group: "Batteries", item: "Battery interconnects / busbar", spec: "Matched to the battery cable size", qty: 1, unit: "set" });
  }
  for (const c of cables) {
    for (const l of c.lengths) {
      bom.push({ group: "Cables", item: `${c.label} — ${l.colour}`, spec: `${c.sizeMm2 ?? "—"} mm² · ${c.type}`, qty: l.metres, unit: "m" });
    }
  }
  if (strings.fits) bom.push({ group: "Mounting & accessories", item: "MC4 connector pairs", spec: "Matched to the PV cable size", qty: strings.strings * 2 + 2, unit: "pairs" });
  if (bat?.sizeMm2) bom.push({ group: "Mounting & accessories", item: "Battery cable lugs", spec: `${bat.sizeMm2} mm² copper, crimped`, qty: 4, unit: "pcs" });
  for (const p of protection) bom.push({ group: "Protection & switching", item: p.label, spec: p.rating, qty: p.qty, unit: "pcs" });
  if (options.mounting === "roof") {
    bom.push({ group: "Mounting & accessories", item: "Mounting rails", spec: `${rows} row${rows > 1 ? "s" : ""} of ${perRow} panels, portrait`, qty: railM, unit: "m" });
    bom.push({ group: "Mounting & accessories", item: "Mid clamps", spec: "Panel-to-panel", qty: rows * Math.max(0, perRow - 1) * 2, unit: "pcs" });
    bom.push({ group: "Mounting & accessories", item: "End clamps", spec: "Row ends", qty: rows * 4, unit: "pcs" });
    bom.push({ group: "Mounting & accessories", item: "Roof hooks / L-feet", spec: "≈ every 1.2 m of rail", qty: Math.ceil(railM / 1.2), unit: "pcs" });
  } else {
    bom.push({ group: "Mounting & accessories", item: "Ground-mount structure", spec: `For ${strings.totalPanels} × ${panel.watt} W panels (${panel.lengthMm} × ${panel.widthMm} mm)`, qty: 1, unit: "set" });
  }
  bom.push({ group: "Mounting & accessories", item: "Conduit / trunking", spec: "For DC and AC runs", qty: ceilM(pvRun + acRun), unit: "m" });

  if (base.needsSiteAssessment) warnings.push("This is a large system — a site assessment is needed before buying.");
  if (solarCoveragePct > 0 && solarCoveragePct < 90) warnings.push("The array covers less than your daily use on an average day — add panels if you want full solar independence.");

  return { base, inverterKva, inverterName: chosen?.name ?? null, systemV, growthHeadroomW, peakSunHours: psh, battery, strings, dailyGenerationKwh, solarCoveragePct, phase, acOutputCurrentA: Math.round(acCurrentA * 10) / 10, cables, protection, bom, warnings };
}

/** Plain-text bill of materials for WhatsApp / quote requests. */
export function formatDesignSummary(design: SolarDesign): string {
  const groups = [...new Set(design.bom.map((b) => b.group))];
  return [
    `Advanced solar design — ${design.inverterName ?? `${design.inverterKva} kVA`} system`,
    `Daily use ${(design.base.dailyEnergyWh / 1000).toFixed(1)} kWh · Peak sun ${design.peakSunHours} h · Array ${design.strings.arrayKwp} kWp (~${design.dailyGenerationKwh} kWh/day)`,
    design.battery ? `Battery bank ${design.battery.bankKwh} kWh @ ${design.battery.systemV} V (~${design.battery.backupHoursAchieved} h backup)` : "",
    "",
    ...groups.flatMap((g) => [`${g}:`, ...design.bom.filter((b) => b.group === g).map((b) => `- ${b.qty} ${b.unit} × ${b.item} (${b.spec})`), ""]),
    ...(design.warnings.length ? ["Notes:", ...design.warnings.map((w) => `- ${w}`)] : []),
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n")
    .trim();
}
