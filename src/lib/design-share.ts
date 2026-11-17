/**
 * Share-link / saved-design encoding for the solar calculator.
 * A design travels as URL-safe base64 JSON. Decoding is defensive: every
 * field is validated and anything malformed falls back to safe defaults,
 * because the string can come from anyone's link.
 */
import {
  APPLICATION_TYPES,
  BATTERY_CHEMISTRY,
  PANEL_WATT_OPTIONS,
  defaultInput,
  type CalculatorInput,
  type LoadLine,
  type PanelWatt,
} from "./calculator";
import { REGIONS, defaultDesignOptions, type DesignOptions } from "./solar-design";

export interface SharedDesign {
  input: CalculatorInput;
  options: DesignOptions;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeDesign(s: SharedDesign): string {
  const loads = s.input.loads.map((l) => ({ name: l.name, quantity: l.quantity, watts: l.watts, hoursPerDay: l.hoursPerDay, surge: l.surge, nightHours: l.nightHours }));
  return toBase64Url(JSON.stringify({ v: 2, i: { ...s.input, loads }, o: s.options }));
}

const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function decodeDesign(raw: string | undefined | null): SharedDesign | null {
  if (!raw || raw.length > 8000 || !/^[A-Za-z0-9_-]+$/.test(raw)) return null;
  try {
    const { i, o } = JSON.parse(fromBase64Url(raw));
    const type = typeof i?.applicationType === "string" && i.applicationType in APPLICATION_TYPES ? i.applicationType : "home";
    const base = defaultInput(type);
    const loads: LoadLine[] = Array.isArray(i?.loads)
      ? i.loads.slice(0, 60).map((l: Record<string, unknown>, index: number) => {
          const hours = num(l?.hoursPerDay, 0, 0, 24);
          return {
            key: `shared-${index}`, // deterministic: server and browser renders must match
            name: String(l?.name ?? "Appliance").slice(0, 60),
            quantity: num(l?.quantity, 0, 0, 999),
            watts: num(l?.watts, 0, 0, 100_000),
            hoursPerDay: hours,
            surge: l?.surge === true,
            nightHours: l?.nightHours === undefined || l?.nightHours === null ? undefined : num(l.nightHours, 0, 0, hours),
          };
        })
      : base.loads;
    const panelWatt: PanelWatt = (PANEL_WATT_OPTIONS as readonly number[]).includes(i?.panelWatt) ? i.panelWatt : base.panelWatt;
    const input: CalculatorInput = {
      ...base,
      loads,
      simultaneity: num(i?.simultaneity, base.simultaneity, 0.1, 1),
      backupHours: num(i?.backupHours, base.backupHours, 0, 72),
      chemistry: typeof i?.chemistry === "string" && i.chemistry in BATTERY_CHEMISTRY ? i.chemistry : base.chemistry,
      panelWatt,
      batterySizing: i?.batterySizing === "night" ? "night" : "backup",
      growthPct: num(i?.growthPct, 0, 0, 200),
    };
    const d = defaultDesignOptions(panelWatt);
    const panel = { ...d.panel };
    for (const k of ["vmp", "voc", "imp", "isc", "lengthMm", "widthMm"] as const) panel[k] = num(o?.panel?.[k], d.panel[k], 0, 5000);
    const inv = o?.inverter;
    const options: DesignOptions = {
      regionId: REGIONS.some((r) => r.id === o?.regionId) ? o.regionId : d.regionId,
      peakSunHours: num(o?.peakSunHours, d.peakSunHours, 2, 8),
      batteryModuleId: typeof o?.batteryModuleId === "string" ? o.batteryModuleId.slice(0, 40) : d.batteryModuleId,
      panel,
      inverterMaxPvV: num(o?.inverterMaxPvV, d.inverterMaxPvV, 60, 1500),
      mpptMinV: num(o?.mpptMinV, d.mpptMinV, 0, 1000),
      pvRunM: num(o?.pvRunM, d.pvRunM, 1, 300),
      batteryRunM: num(o?.batteryRunM, d.batteryRunM, 0.5, 20),
      acRunM: num(o?.acRunM, d.acRunM, 1, 300),
      mounting: o?.mounting === "ground" ? "ground" : "roof",
      gridOrGenerator: o?.gridOrGenerator !== false,
      inverter:
        inv && num(inv.kva, 0) > 0
          ? {
              kva: num(inv.kva, 0, 0.5, 500),
              batteryV: [12, 24, 48].includes(inv.batteryV) ? inv.batteryV : undefined,
              name: String(inv.name ?? "Selected inverter").slice(0, 80),
              productSlug: typeof inv.productSlug === "string" ? inv.productSlug.slice(0, 120) : undefined,
            }
          : undefined,
    };
    return { input, options };
  } catch {
    return null;
  }
}
