/**
 * Solar system sizing engine.
 *
 * Pure functions only — no React, no DOM — so the same module powers the
 * homepage calculator, the quote hand-off and the unit tests
 * (`calculator.test.ts`). Results are planning ESTIMATES for a customer
 * conversation, never an engineering design; the UI says so every time.
 *
 * Method (all assumptions are named constants below):
 *  1. Connected load      = Σ quantity × watts               (everything on at once)
 *  2. Simultaneous load   = connected × simultaneity factor  (what realistically runs together),
 *                           never less than the single largest appliance
 *  3. Start-up surge      = the largest motor/compressor unit × extra start-up multiple
 *                           (motors rarely start at the same instant, so only the largest is added)
 *  4. Inverter            = max(simultaneous ÷ power factor × headroom,
 *                               (simultaneous + surge) ÷ power factor ÷ inverter surge rating),
 *                           rounded up to a standard size
 *  5. Daily energy        = Σ quantity × watts × hours per day
 *  6. Backup energy       = Σ quantity × watts × min(hours per day, backup hours)
 *                           (an appliance can't use more during the outage than it runs in a day)
 *  7. Battery (nominal)   = backup energy × margin ÷ (depth of discharge × round-trip efficiency)
 *  8. Solar array         = daily energy × margin ÷ (peak sun hours × system derate)
 */

/* ------------------------------------------------------------------ */
/* Assumptions                                                         */
/* ------------------------------------------------------------------ */

/** Conservative average peak sun hours across Nigeria. */
export const PEAK_SUN_HOURS = 4.4;
/** Temperature, soiling, wiring and charge-controller losses. */
export const PV_SYSTEM_DERATE = 0.72;
/** Extra solar so batteries still recharge on hazy days. */
export const PV_DESIGN_MARGIN = 1.1;
/** Inverter power factor (kVA → kW). */
export const POWER_FACTOR = 0.8;
/** Continuous headroom so the inverter never runs flat-out. */
export const INVERTER_HEADROOM = 1.25;
/** Typical inverter short-term surge capability, × rated power. */
export const INVERTER_SURGE_RATING = 2;
/** Extra start-up draw of a motor/compressor, × its running watts (i.e. ~3× total at start). */
export const MOTOR_STARTUP_EXTRA = 2;
/** Battery sizing margin for ageing and cold-start reserve. */
export const BATTERY_DESIGN_MARGIN = 1.1;

export const STANDARD_INVERTER_KVA = [1, 1.5, 2.5, 3.5, 5, 7.5, 10, 12, 15, 20, 30, 50] as const;
/** Above this, a site assessment (and often three-phase / parallel units) is needed. */
export const SITE_ASSESSMENT_KVA = 10;

export type BatteryChemistry = "lithium" | "lead-acid";

export const BATTERY_CHEMISTRY: Record<
  BatteryChemistry,
  { label: string; depthOfDischarge: number; roundTripEfficiency: number; note: string }
> = {
  lithium: {
    label: "Lithium (LiFePO₄)",
    depthOfDischarge: 0.9,
    roundTripEfficiency: 0.95,
    note: "Longer life, deeper discharge, no maintenance",
  },
  "lead-acid": {
    label: "Tubular / lead-acid",
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.85,
    note: "Lower upfront cost, needs a bigger bank",
  },
};

export const PANEL_WATT_OPTIONS = [450, 550, 600] as const;
export type PanelWatt = (typeof PANEL_WATT_OPTIONS)[number];

/* ------------------------------------------------------------------ */
/* Appliances & presets                                                */
/* ------------------------------------------------------------------ */

export interface ApplianceTemplate {
  id: string;
  name: string;
  /** typical running watts per unit */
  watts: number;
  /** typical hours of use per day */
  hoursPerDay: number;
  /** compressor / motor load with a start-up surge */
  surge?: boolean;
  /** of the daily hours, how many are after dark (no solar) — typical, editable */
  nightHours?: number;
}

/** Typical ratings — customers can overwrite watts and hours per line. */
export const APPLIANCE_LIBRARY: ApplianceTemplate[] = [
  { id: "led-bulb", name: "LED bulb", watts: 10, hoursPerDay: 6, nightHours: 6 },
  { id: "fan", name: "Fan", watts: 70, hoursPerDay: 10, nightHours: 6 },
  { id: "tv", name: "LED TV", watts: 100, hoursPerDay: 6, nightHours: 4 },
  { id: "decoder", name: "Decoder / router", watts: 20, hoursPerDay: 8, nightHours: 4 },
  { id: "laptop", name: "Laptop", watts: 65, hoursPerDay: 6, nightHours: 2 },
  { id: "desktop", name: "Desktop computer", watts: 200, hoursPerDay: 8, nightHours: 1 },
  { id: "fridge", name: "Refrigerator", watts: 150, hoursPerDay: 10, nightHours: 5, surge: true },
  { id: "freezer", name: "Chest freezer", watts: 200, hoursPerDay: 12, nightHours: 6, surge: true },
  { id: "ac-1hp", name: "Air conditioner 1HP", watts: 900, hoursPerDay: 6, nightHours: 4, surge: true },
  { id: "ac-15hp", name: "Air conditioner 1.5HP", watts: 1200, hoursPerDay: 6, nightHours: 4, surge: true },
  { id: "pump", name: "Water pump 1HP", watts: 750, hoursPerDay: 1, nightHours: 0, surge: true },
  { id: "washer", name: "Washing machine", watts: 500, hoursPerDay: 1, nightHours: 0, surge: true },
  { id: "microwave", name: "Microwave", watts: 1000, hoursPerDay: 0.3, nightHours: 0 },
  { id: "iron", name: "Pressing iron", watts: 1000, hoursPerDay: 0.5, nightHours: 0 },
  { id: "printer", name: "Printer / photocopier", watts: 300, hoursPerDay: 1, nightHours: 0 },
  { id: "pos", name: "POS terminal", watts: 15, hoursPerDay: 10, nightHours: 2 },
  { id: "network", name: "Network switch & Wi-Fi", watts: 30, hoursPerDay: 24, nightHours: 12 },
  { id: "cctv", name: "CCTV kit (4 cams + DVR)", watts: 60, hoursPerDay: 24, nightHours: 12 },
];

/** `library` = the appliance list in use (edited in Admin → Calculator settings; defaults to the built-in one). */
export function getApplianceTemplate(id: string, library: readonly ApplianceTemplate[] = APPLIANCE_LIBRARY): ApplianceTemplate | undefined {
  return library.find((a) => a.id === id);
}

export type ApplicationType = "home" | "office" | "business" | "industrial";

export const APPLICATION_TYPES: Record<
  ApplicationType,
  { label: string; simultaneity: number; preset: { id: string; quantity: number }[] }
> = {
  home: {
    label: "Home",
    simultaneity: 0.7,
    preset: [
      { id: "led-bulb", quantity: 8 },
      { id: "fan", quantity: 3 },
      { id: "tv", quantity: 1 },
      { id: "decoder", quantity: 1 },
      { id: "fridge", quantity: 1 },
      { id: "laptop", quantity: 1 },
    ],
  },
  office: {
    label: "Office",
    simultaneity: 0.85,
    preset: [
      { id: "led-bulb", quantity: 10 },
      { id: "laptop", quantity: 4 },
      { id: "desktop", quantity: 2 },
      { id: "printer", quantity: 1 },
      { id: "network", quantity: 1 },
      { id: "fan", quantity: 4 },
    ],
  },
  business: {
    label: "Business",
    simultaneity: 0.8,
    preset: [
      { id: "led-bulb", quantity: 12 },
      { id: "freezer", quantity: 1 },
      { id: "pos", quantity: 2 },
      { id: "fan", quantity: 4 },
      { id: "tv", quantity: 1 },
      { id: "cctv", quantity: 1 },
    ],
  },
  industrial: {
    label: "Industrial",
    simultaneity: 0.85,
    preset: [
      { id: "led-bulb", quantity: 20 },
      { id: "pump", quantity: 2 },
      { id: "ac-15hp", quantity: 2 },
      { id: "desktop", quantity: 3 },
      { id: "freezer", quantity: 2 },
      { id: "cctv", quantity: 1 },
    ],
  },
};

/** How much of the connected load the customer expects to run together. */
export const SIMULTANEITY_OPTIONS = [
  { value: 0.5, label: "About half" },
  { value: 0.7, label: "Most things" },
  { value: 0.85, label: "Nearly all" },
  { value: 1, label: "Everything" },
] as const;

export const BACKUP_HOUR_OPTIONS = [2, 4, 6, 8, 12, 24] as const;

/* ------------------------------------------------------------------ */
/* Inputs & results                                                    */
/* ------------------------------------------------------------------ */

export interface LoadLine {
  /** stable row key for UI lists */
  key: string;
  name: string;
  quantity: number;
  watts: number;
  hoursPerDay: number;
  surge: boolean;
  /** hours of use after dark (≤ hoursPerDay); used when the battery is sized for night use */
  nightHours?: number;
}

/**
 * How the battery is sized:
 * - "backup": carry the load through an outage of `backupHours` (grid-connected homes)
 * - "night":  run everything used after dark on stored solar (off-grid / solar-first)
 */
export type BatterySizing = "backup" | "night";

export interface CalculatorInput {
  applicationType: ApplicationType;
  loads: LoadLine[];
  /** 0–1 share of connected load running together */
  simultaneity: number;
  /** hours the batteries must carry the load without grid or sun */
  backupHours: number;
  chemistry: BatteryChemistry;
  panelWatt: PanelWatt;
  /** location-specific peak sun hours (advanced calculator); defaults to PEAK_SUN_HOURS */
  peakSunHours?: number;
  /** defaults to "backup" */
  batterySizing?: BatterySizing;
  /** extra continuous load (%) the inverter, cables and breakers must allow for later — defaults to 0 */
  growthPct?: number;
}

export type PackageMatch = "Home Backup" | "Small Business" | "Office Power" | "Complete System";

export interface CalculatorResult {
  hasLoad: boolean;
  connectedLoadW: number;
  simultaneousLoadW: number;
  /** extra start-up draw of the largest motor load (0 if none) */
  startupSurgeW: number;
  dailyEnergyWh: number;
  /** energy the battery must deliver: outage backup, or night-time use */
  backupEnergyWh: number;
  /** energy used after dark (Σ quantity × watts × night hours) */
  nightEnergyWh: number;
  /** continuous load the inverter can still take beyond today's simultaneous load */
  growthHeadroomW: number;
  inverterKva: number;
  /** larger than the biggest standard size or above the site-assessment threshold */
  needsSiteAssessment: boolean;
  /** nominal (nameplate) battery capacity */
  batteryKwh: number;
  /** usable energy the bank actually delivers */
  batteryUsableKwh: number;
  batteryVoltage: 12 | 24 | 48;
  batteryAh: number;
  pvKwp: number;
  panelCount: number;
  panelWatt: PanelWatt;
  matchingPackage: PackageMatch | null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step - 1e-9) * step;
}

/** Sanitise a line so bad input (negative, NaN, absurd) can never break the maths. */
export function normaliseLine(line: LoadLine): LoadLine {
  return {
    ...line,
    quantity: Math.round(clamp(line.quantity, 0, 999)),
    watts: clamp(line.watts, 0, 100_000),
    hoursPerDay: clamp(line.hoursPerDay, 0, 24),
    nightHours: line.nightHours === undefined ? undefined : clamp(line.nightHours, 0, clamp(line.hoursPerDay, 0, 24)),
  };
}

let keyCounter = 0;
export function newLineKey(): string {
  keyCounter += 1;
  return `line-${keyCounter}`;
}

export function lineFromTemplate(template: ApplianceTemplate, quantity = 1, key = newLineKey()): LoadLine {
  return {
    key,
    name: template.name,
    quantity,
    watts: template.watts,
    hoursPerDay: template.hoursPerDay,
    surge: Boolean(template.surge),
    nightHours: template.nightHours,
  };
}

/**
 * Deterministic preset (keys derived from position) so server and client
 * render identically. Appliances removed from the library are skipped.
 */
export function presetLines(type: ApplicationType, library: readonly ApplianceTemplate[] = APPLIANCE_LIBRARY): LoadLine[] {
  return APPLICATION_TYPES[type].preset.flatMap(({ id, quantity }, index) => {
    const template = getApplianceTemplate(id, library);
    return template ? [lineFromTemplate(template, quantity, `${type}-${index}`)] : [];
  });
}

export function defaultInput(type: ApplicationType = "home", library: readonly ApplianceTemplate[] = APPLIANCE_LIBRARY): CalculatorInput {
  return {
    applicationType: type,
    loads: presetLines(type, library),
    simultaneity: APPLICATION_TYPES[type].simultaneity,
    backupHours: 6,
    chemistry: "lithium",
    panelWatt: 550,
  };
}

function pickInverter(rawKva: number): { kva: number; oversize: boolean } {
  const size = STANDARD_INVERTER_KVA.find((s) => s >= rawKva - 1e-9);
  if (size !== undefined) return { kva: size, oversize: false };
  // Beyond the largest single unit: round up to the next 10 kVA (parallel / three-phase).
  return { kva: roundUpTo(rawKva, 10), oversize: true };
}

function batteryVoltageFor(inverterKva: number): 12 | 24 | 48 {
  if (inverterKva <= 1) return 12;
  if (inverterKva <= 2.5) return 24;
  return 48;
}

function matchPackage(inverterKva: number): PackageMatch {
  if (inverterKva <= 2.5) return "Home Backup";
  if (inverterKva <= 5) return "Small Business";
  if (inverterKva <= 7.5) return "Office Power";
  return "Complete System";
}

/* ------------------------------------------------------------------ */
/* Core calculation                                                    */
/* ------------------------------------------------------------------ */

export function computeSystemEstimate(input: CalculatorInput): CalculatorResult {
  const lines = input.loads.map(normaliseLine).filter((l) => l.quantity > 0 && l.watts > 0);
  const simultaneity = clamp(input.simultaneity, 0.1, 1);
  const backupHours = clamp(input.backupHours, 0, 72);
  const chemistry = BATTERY_CHEMISTRY[input.chemistry] ?? BATTERY_CHEMISTRY.lithium;

  let connectedLoadW = 0;
  let dailyEnergyWh = 0;
  let backupEnergyWh = 0;
  let nightEnergyWh = 0;
  let largestUnitW = 0;
  let largestSurgeUnitW = 0;

  for (const l of lines) {
    connectedLoadW += l.quantity * l.watts;
    dailyEnergyWh += l.quantity * l.watts * l.hoursPerDay;
    backupEnergyWh += l.quantity * l.watts * Math.min(l.hoursPerDay, backupHours);
    // Without a stated night share, assume half the use falls after dark.
    nightEnergyWh += l.quantity * l.watts * (l.nightHours ?? l.hoursPerDay / 2);
    largestUnitW = Math.max(largestUnitW, l.watts);
    if (l.surge) largestSurgeUnitW = Math.max(largestSurgeUnitW, l.watts);
  }

  if (connectedLoadW === 0) {
    return {
      hasLoad: false,
      connectedLoadW: 0,
      simultaneousLoadW: 0,
      startupSurgeW: 0,
      dailyEnergyWh: 0,
      backupEnergyWh: 0,
      nightEnergyWh: 0,
      growthHeadroomW: 0,
      inverterKva: 0,
      needsSiteAssessment: false,
      batteryKwh: 0,
      batteryUsableKwh: 0,
      batteryVoltage: 12,
      batteryAh: 0,
      pvKwp: 0,
      panelCount: 0,
      panelWatt: input.panelWatt,
      matchingPackage: null,
    };
  }

  const simultaneousLoadW = Math.min(connectedLoadW, Math.max(connectedLoadW * simultaneity, largestUnitW));
  const startupSurgeW = largestSurgeUnitW * MOTOR_STARTUP_EXTRA;

  // Growth allowance: size the inverter (and so its cables and breakers) for planned extra load.
  const growth = 1 + clamp(input.growthPct ?? 0, 0, 200) / 100;
  const plannedLoadW = simultaneousLoadW * growth;
  const continuousKva = (plannedLoadW / POWER_FACTOR / 1000) * INVERTER_HEADROOM;
  const surgeKva = (plannedLoadW + startupSurgeW) / POWER_FACTOR / 1000 / INVERTER_SURGE_RATING;
  const inverter = pickInverter(Math.max(continuousKva, surgeKva));

  if (input.batterySizing === "night") backupEnergyWh = nightEnergyWh;
  const batteryUsableKwh = (backupEnergyWh * BATTERY_DESIGN_MARGIN) / 1000;
  const batteryKwh =
    backupEnergyWh > 0
      ? Math.max(1.2, roundUpTo(batteryUsableKwh / (chemistry.depthOfDischarge * chemistry.roundTripEfficiency), 0.5))
      : 0;
  const batteryVoltage = batteryVoltageFor(inverter.kva);
  const batteryAh = batteryKwh > 0 ? roundUpTo((batteryKwh * 1000) / batteryVoltage, 10) : 0;

  const peakSunHours = input.peakSunHours === undefined ? PEAK_SUN_HOURS : clamp(input.peakSunHours, 2, 8);
  const pvWatts = (dailyEnergyWh * PV_DESIGN_MARGIN) / (peakSunHours * PV_SYSTEM_DERATE);
  const panelCount = Math.max(1, Math.ceil(pvWatts / input.panelWatt - 1e-9));

  return {
    hasLoad: true,
    connectedLoadW,
    simultaneousLoadW,
    startupSurgeW,
    dailyEnergyWh,
    backupEnergyWh,
    nightEnergyWh,
    // continuous watts the chosen inverter supports (kVA × PF ÷ headroom) beyond today's load
    growthHeadroomW: Math.max(0, Math.round((inverter.kva * 1000 * POWER_FACTOR) / INVERTER_HEADROOM - simultaneousLoadW)),
    inverterKva: inverter.kva,
    needsSiteAssessment: inverter.oversize || inverter.kva > SITE_ASSESSMENT_KVA,
    batteryKwh,
    batteryUsableKwh: Math.round(batteryUsableKwh * 10) / 10,
    batteryVoltage,
    batteryAh,
    pvKwp: Math.round(pvWatts / 10) / 100,
    panelCount,
    panelWatt: input.panelWatt,
    matchingPackage: matchPackage(inverter.kva),
  };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatWatts(w: number): string {
  return w >= 1000 ? `${(w / 1000).toFixed(w >= 10_000 ? 0 : 1)} kW` : `${Math.round(w)} W`;
}

export function formatKwh(wh: number): string {
  return `${(wh / 1000).toFixed(1)} kWh`;
}

/** Plain-text summary used for the quote request (WhatsApp / email / quote form). */
export function formatEstimateSummary(input: CalculatorInput, result: CalculatorResult): string {
  const appliances = input.loads
    .map(normaliseLine)
    .filter((l) => l.quantity > 0 && l.watts > 0)
    .map((l) => `- ${l.quantity} × ${l.name} (${l.watts} W, ${l.hoursPerDay} h/day)`)
    .join("\n");

  return [
    `Solar calculator estimate — ${APPLICATION_TYPES[input.applicationType].label}`,
    "",
    "Appliances:",
    appliances || "- none",
    "",
    `Backup required: ${input.backupHours} hours`,
    `Battery preference: ${BATTERY_CHEMISTRY[input.chemistry].label}`,
    "",
    `Connected load: ${formatWatts(result.connectedLoadW)}`,
    `Simultaneous load: ${formatWatts(result.simultaneousLoadW)}`,
    `Daily energy: ${formatKwh(result.dailyEnergyWh)}`,
    `Suggested inverter: ${result.inverterKva} kVA`,
    `Suggested battery: ${result.batteryKwh} kWh (${result.batteryVoltage} V, ~${result.batteryAh} Ah)`,
    `Suggested solar: ${result.pvKwp} kWp (${result.panelCount} × ${result.panelWatt} W panels)`,
    result.needsSiteAssessment ? "Note: system size needs a site assessment." : "",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}
