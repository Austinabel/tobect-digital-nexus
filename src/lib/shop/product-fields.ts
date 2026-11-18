/**
 * Product details per product type (battery, inverter, power system, …).
 *
 * The admin product form shows these fields for the chosen category, the
 * product page lists them, and the ones marked `filter` become shop filters.
 * Values are stored in `products.attributes` as short text — numbers with
 * their unit ("48 V", "200 Ah", "10 kVA") so the same rating always reads
 * the same way across products.
 *
 * A category gets its type from its web address (slug) or its parent's, so
 * new categories made in the admin ("tubular-batteries", "power-systems")
 * pick up the right fields automatically. Pure — unit-tested.
 */

export interface ProductField {
  key: string;
  label: string;
  kind: "choice" | "number" | "text";
  /** choice: the buttons offered (staff can also type another value) */
  options?: string[];
  /** number: unit stored after the number, e.g. "V" */
  unit?: string;
  /** number: one-tap common values */
  quick?: number[];
  /** shown as a filter in the shop */
  filter?: boolean;
  /** used (in order) to build the key-spec chips when staff leave them empty */
  chip?: number;
  hint?: string;
}

export interface ProductType {
  id: string;
  /** e.g. "Battery details" */
  label: string;
  fields: ProductField[];
}

const condition: ProductField = { key: "condition", label: "Condition", kind: "choice", options: ["New", "Used", "Refurbished"], filter: true };
const warranty: ProductField = { key: "warranty", label: "Warranty", kind: "number", unit: "years", quick: [1, 2, 5, 10] };

export const PRODUCT_TYPES: Record<string, ProductType> = {
  battery: {
    id: "battery",
    label: "Battery details",
    fields: [
      { key: "chemistry", label: "Battery type", kind: "choice", options: ["Lithium (LiFePO4)", "Lithium-ion (NMC)", "Tubular", "Gel", "AGM", "Lead-acid (flooded)"], filter: true, chip: 3 },
      { key: "voltage", label: "Voltage", kind: "number", unit: "V", quick: [12, 24, 48, 51.2], filter: true, chip: 2 },
      { key: "ah", label: "Capacity (Ah)", kind: "number", unit: "Ah", quick: [100, 200, 220, 280, 314], filter: true, chip: 1 },
      { key: "capacity", label: "Energy (kWh)", kind: "number", unit: "kWh", quick: [2.5, 5, 10, 15], filter: true, chip: 0, hint: "Volts × Ah ÷ 1000, e.g. 51.2 V × 100 Ah = 5.12 kWh" },
      { key: "power", label: "Max output power (W)", kind: "number", unit: "W" },
      { key: "cycles", label: "Cycle life", kind: "number", unit: "cycles", quick: [1500, 3000, 6000, 8000] },
      { key: "bms", label: "BMS rating (A)", kind: "number", unit: "A", quick: [100, 200] },
      condition,
      warranty,
    ],
  },
  inverter: {
    id: "inverter",
    label: "Inverter details",
    fields: [
      { key: "inverterType", label: "Inverter type", kind: "choice", options: ["Hybrid", "Off-grid", "On-grid (grid-tie)", "Pure sine wave UPS"], filter: true, chip: 1 },
      { key: "capacity", label: "Capacity (kVA)", kind: "number", unit: "kVA", quick: [1, 1.5, 2.5, 3.5, 5, 6, 8, 10, 12], filter: true, chip: 0 },
      { key: "power", label: "Rated output (kW)", kind: "number", unit: "kW", quick: [3.6, 5, 6, 8, 10, 12] },
      { key: "phase", label: "Phase", kind: "choice", options: ["Single phase", "Split phase", "Three phase"], filter: true },
      { key: "mppt", label: "MPPT trackers", kind: "number", unit: "MPPT", quick: [1, 2, 3, 4] },
      { key: "pvPower", label: "Max solar input (W)", kind: "number", unit: "W" },
      { key: "chargeCurrent", label: "Max charge current (A)", kind: "number", unit: "A", quick: [80, 100, 120, 190] },
      { key: "parallel", label: "Parallel capable", kind: "choice", options: ["Yes", "No"] },
      { key: "monitoring", label: "Wi-Fi monitoring", kind: "choice", options: ["Built-in", "Optional dongle", "None"] },
      condition,
      warranty,
    ],
  },
  "power-system": {
    id: "power-system",
    label: "Power system details",
    fields: [
      { key: "output", label: "Output power (W)", kind: "number", unit: "W", quick: [300, 600, 1000, 2000, 3600], filter: true, chip: 0 },
      { key: "storage", label: "Battery capacity (Wh)", kind: "number", unit: "Wh", quick: [500, 1000, 2000, 5000], filter: true, chip: 1 },
      { key: "chemistry", label: "Battery type", kind: "choice", options: ["Lithium (LiFePO4)", "Lithium-ion (NMC)", "Lead-acid / Gel"], filter: true, chip: 2 },
      { key: "solarInput", label: "Max solar input (W)", kind: "number", unit: "W" },
      { key: "outputVoltage", label: "AC output", kind: "choice", options: ["220 V AC", "230 V AC", "12 V DC only"] },
      { key: "outlets", label: "AC sockets", kind: "number", unit: "sockets", quick: [1, 2, 4, 6] },
      { key: "panelsIncluded", label: "Solar panels included", kind: "choice", options: ["Yes", "No"] },
      condition,
      warranty,
    ],
  },
  "solar-panel": {
    id: "solar-panel",
    label: "Solar panel details",
    fields: [
      { key: "wattage", label: "Wattage", kind: "number", unit: "W", quick: [100, 200, 450, 550, 600, 650], filter: true, chip: 0 },
      { key: "panelType", label: "Panel type", kind: "choice", options: ["Monocrystalline", "Polycrystalline", "Thin-film"], filter: true, chip: 1 },
      { key: "technology", label: "Technology", kind: "choice", options: ["PERC", "N-type TOPCon", "HJT", "Bifacial", "Half-cut"], filter: true, chip: 2 },
      { key: "vmp", label: "Voltage at max power (Vmp)", kind: "number", unit: "V" },
      { key: "voc", label: "Open-circuit voltage (Voc)", kind: "number", unit: "V" },
      { key: "efficiency", label: "Efficiency (%)", kind: "number", unit: "%" },
      condition,
      warranty,
    ],
  },
  cctv: {
    id: "cctv",
    label: "Camera & security details",
    fields: [
      { key: "resolution", label: "Resolution", kind: "choice", options: ["2 MP", "4 MP", "5 MP", "8 MP (4K)"], filter: true, chip: 0 },
      { key: "cameraType", label: "Camera type", kind: "choice", options: ["Bullet", "Dome", "PTZ", "Turret", "Complete kit"], filter: true, chip: 1 },
      { key: "connectivity", label: "Connectivity", kind: "choice", options: ["IP / PoE", "Analog HD", "Wi-Fi", "4G / SIM"], filter: true, chip: 2 },
      { key: "nightVision", label: "Night vision", kind: "choice", options: ["Infrared", "Full colour", "None"], filter: true },
      { key: "power", label: "Power source", kind: "choice", options: ["Mains", "PoE", "Solar"] },
      { key: "channels", label: "Recorder channels", kind: "number", unit: "ch", quick: [4, 8, 16, 32] },
      condition,
      warranty,
    ],
  },
  lighting: {
    id: "lighting",
    label: "Light details",
    fields: [
      { key: "lightType", label: "Light type", kind: "choice", options: ["Street light", "Flood light", "Wall light", "Garden light", "Bulb"], filter: true, chip: 1 },
      { key: "wattage", label: "Wattage", kind: "number", unit: "W", quick: [50, 100, 200, 300, 500], filter: true, chip: 0 },
      { key: "storage", label: "Battery capacity (Wh)", kind: "number", unit: "Wh" },
      { key: "runtime", label: "Lighting time (hours)", kind: "number", unit: "hours", quick: [8, 10, 12] },
      condition,
      warranty,
    ],
  },
  fan: {
    id: "fan",
    label: "Fan details",
    fields: [
      { key: "fanType", label: "Fan type", kind: "choice", options: ["Standing", "Ceiling", "Table", "Wall", "Rechargeable"], filter: true, chip: 1 },
      { key: "size", label: "Size (inches)", kind: "number", unit: "in", quick: [12, 16, 18, 56] },
      { key: "wattage", label: "Power (W)", kind: "number", unit: "W", chip: 0 },
      { key: "supply", label: "Power supply", kind: "choice", options: ["12 V DC", "24 V DC", "AC / DC", "Rechargeable battery"], filter: true, chip: 2 },
      condition,
      warranty,
    ],
  },
  freezer: {
    id: "freezer",
    label: "Freezer & fridge details",
    fields: [
      { key: "fridgeType", label: "Type", kind: "choice", options: ["Chest freezer", "Upright freezer", "Fridge", "Fridge-freezer"], filter: true, chip: 1 },
      { key: "volume", label: "Capacity (litres)", kind: "number", unit: "L", quick: [100, 150, 200, 300, 400], filter: true, chip: 0 },
      { key: "supply", label: "Power supply", kind: "choice", options: ["12 V DC", "24 V DC", "12/24 V DC", "AC / DC"], filter: true, chip: 2 },
      { key: "wattage", label: "Power (W)", kind: "number", unit: "W" },
      condition,
      warranty,
    ],
  },
  pump: {
    id: "pump",
    label: "Pump details",
    fields: [
      { key: "pumpType", label: "Pump type", kind: "choice", options: ["Submersible (borehole)", "Surface", "Pool"], filter: true, chip: 1 },
      { key: "power", label: "Power (W)", kind: "number", unit: "W", quick: [370, 750, 1100, 1500, 2200], filter: true, chip: 0 },
      { key: "head", label: "Max head (m)", kind: "number", unit: "m" },
      { key: "flow", label: "Max flow (m³/h)", kind: "number", unit: "m³/h" },
      { key: "supply", label: "Power supply", kind: "choice", options: ["DC (solar)", "AC", "AC / DC"], chip: 2 },
      condition,
      warranty,
    ],
  },
  general: { id: "general", label: "Other details", fields: [condition, warranty] },
};

/** Keyword → product type, checked against the category's web address. Order matters. */
const MATCHERS: [RegExp, string][] = [
  [/generator|power-?station|power-?system|power-?bank|\bups\b/, "power-system"],
  [/batter/, "battery"],
  [/inverter/, "inverter"],
  [/panel|\bpv\b|module/, "solar-panel"],
  [/cctv|camera|security|surveillance/, "cctv"],
  [/freezer|fridge|refrigerator/, "freezer"],
  [/pump/, "pump"],
  [/\bfans?\b/, "fan"],
  [/light|lamp|flood|bulb/, "lighting"],
];

function match(slug: string | undefined): ProductType | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase().replace(/-/g, " ");
  const hit = MATCHERS.find(([re]) => re.test(s) || re.test(slug.toLowerCase()));
  return hit ? PRODUCT_TYPES[hit[1]] : undefined;
}

/** The product type for a category (its own slug first, then its parent's). */
export function productTypeFor(slug: string | undefined, parentSlug?: string | null): ProductType {
  return match(slug) ?? match(parentSlug ?? undefined) ?? PRODUCT_TYPES.general;
}

/** The detail fields for a category. */
export function fieldsFor(slug: string | undefined, parentSlug?: string | null): ProductField[] {
  return slug ? productTypeFor(slug, parentSlug).fields : [];
}

/** Every field key across all types, by key and label (first label wins) — for spreadsheet columns. */
export function allFields(): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const t of Object.values(PRODUCT_TYPES)) for (const f of t.fields) if (!seen.has(f.key)) seen.set(f.key, f.label);
  return [...seen].map(([key, label]) => ({ key, label }));
}

/** "48 V" → "48"; "" when the stored value isn't a number (e.g. older free text). */
export function numberPart(value: string | undefined): string {
  const m = (value ?? "").trim().match(/^(\d+(?:\.\d+)?)/);
  return m ? m[1] : "";
}

/**
 * Clean a submitted value for a field. Numbers accept "48", "48V", "48 v",
 * "1,500" and store "48 V"; choices and text are trimmed. Returns
 * `{ value: null }` for empty, `{ error }` for a bad number.
 */
export function cleanFieldValue(field: ProductField, raw: string | undefined): { value: string | null; error?: string } {
  const t = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!t) return { value: null };
  if (field.kind !== "number") return { value: t.slice(0, 40) };
  const n = Number(t.replace(/,/g, "").replace(/[^\d.].*$/, ""));
  if (!Number.isFinite(n) || n <= 0 || n > 10_000_000 || !/^\d/.test(t)) return { value: null, error: `${field.label}: enter a number${field.unit ? ` (in ${field.unit})` : ""}.` };
  const num = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  return { value: field.unit ? `${num} ${field.unit}` : num };
}

/** Key-spec chips built from the details, for when staff leave "Key specs" empty. */
export function chipsFromAttributes(fields: ProductField[], attributes: Record<string, string>): string[] {
  return fields
    .filter((f) => f.chip !== undefined && attributes[f.key])
    .sort((a, b) => a.chip! - b.chip!)
    .map((f) => attributes[f.key])
    .slice(0, 4);
}
