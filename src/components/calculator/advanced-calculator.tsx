"use client";

import Link from "next/link";
import { useActionState, useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSiteLinks } from "@/components/site-provider";
import { useAppliances } from "@/components/calculator-provider";
import { cartActions } from "@/lib/cart";
import { formatNaira, type Product } from "@/lib/data/products";
import { useCatalog } from "@/components/catalog-provider";
import {
  APPLICATION_TYPES,
  BACKUP_HOUR_OPTIONS,
  BATTERY_CHEMISTRY,
  SIMULTANEITY_OPTIONS,
  defaultInput,
  formatKwh,
  formatWatts,
  lineFromTemplate,
  newLineKey,
  presetLines,
  type ApplicationType,
  type BatteryChemistry,
  type CalculatorInput,
  type LoadLine,
} from "@/lib/calculator";
import {
  REGIONS,
  typicalPanel,
  compatibleModules,
  computeDesign,
  defaultDesignOptions,
  formatDesignSummary,
  moduleKwh,
  type BomLine,
  type DesignOptions,
  type RegionId,
} from "@/lib/solar-design";
import { attrNumber, generatorSavings, priceDesign, type CatalogueEntry } from "@/lib/design-pricing";
import { decodeDesign, encodeDesign } from "@/lib/design-share";
import { saveDesign } from "@/app/(marketing)/solar-calculator/actions";
import { LoadRow, fieldClass, numberValue } from "@/components/marketing/solar-calculator";
import { PanelSizeField } from "@/components/calculator/panel-size-field";
import { IconArrowRight, IconCart, IconCheck, IconChevronDown, IconInfo, IconPlus, IconQuote, IconWhatsApp } from "@/components/icons";

/* ---------------- catalogue (real shop data, from the database) ---------------- */

const toCatalogue = (products: Product[]): CatalogueEntry[] => products.map((p) => ({
  slug: p.slug,
  name: p.name,
  // subcategories (e.g. hybrid inverters) count as their top-level category
  category: p.categoryPath?.at(-1) ?? p.category,
  priceNgn: p.priceNgn,
  attributes: p.attributes,
  availability: p.availability,
}));

/** Inverters we list, with their rating parsed from the verified "capacity" attribute. */
const stockedInverters = (products: Product[]) => products.flatMap((p) => {
  const kva = (p.categoryPath?.at(-1) ?? p.category) === "inverters" ? attrNumber(p.attributes?.capacity, /kva/i) : null;
  return kva ? [{ slug: p.slug, name: p.name, kva, priceNgn: p.priceNgn, spec: p.inverterSpec }] : [];
});

/* ---------------- small UI pieces ---------------- */

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">{children}</span>;
}

function NumberField({ label, value, onChange, unit, min = 0, max, step = 1, placeholder }: { label: string; value: number; onChange: (n: number) => void; unit: string; min?: number; max?: number; step?: number; placeholder?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <span className="relative block">
        <input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder={placeholder} value={numberValue(value)} onChange={(e) => onChange(e.target.valueAsNumber)} className={cn(fieldClass, "pr-12")} />
        <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] text-slate">
          {unit}
        </span>
      </span>
    </label>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "cursor-pointer rounded-xl border-[1.5px] px-3.5 py-2 font-heading text-[0.84rem] font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-blue/25",
              value === o.value ? "border-blue bg-blue text-white" : "border-hair text-slate hover:border-blue",
            )}
          >
            <input type="radio" className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Expandable panel used for every step and result section, so the page stays calm. */
function Panel({
  n,
  title,
  summary,
  open,
  onToggle,
  children,
  onNext,
  tone = "white",
}: {
  n?: number;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  onNext?: () => void;
  tone?: "white" | "mist";
}) {
  const id = useId();
  return (
    <section className={cn("overflow-hidden rounded-3xl border transition-shadow", open ? "border-[#c9d8f2] shadow-[0_24px_50px_-36px_rgba(13,27,47,0.4)]" : "border-hair", tone === "mist" ? "bg-mist/60" : "bg-white")}>
      <h2>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-6">
          {n !== undefined && (
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl font-heading text-[0.95rem] font-extrabold", open ? "bg-blue text-white" : "bg-mist text-blue")}>{n}</span>
          )}
          <span className="min-w-0 grow">
            <span className="block font-heading text-[1.05rem] font-bold text-ink">{title}</span>
            {!open && summary && <span className="mt-0.5 block truncate text-[0.82rem] text-slate">{summary}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-[0.78rem] font-semibold text-blue">
            <span className="hidden sm:inline">{open ? "Close" : "Edit"}</span>
            <IconChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
          </span>
        </button>
      </h2>
      <div id={id} hidden={!open} className="border-t border-hair px-5 pb-5 pt-4 sm:px-6">
        {children}
        {onNext && (
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={onNext} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 font-heading text-[0.84rem] font-semibold text-white hover:bg-blue-deep">
              Next step <IconArrowRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, sub, tone = "white" }: { label: string; value: string; sub?: string; tone?: "white" | "blue" }) {
  return (
    <div className={cn("rounded-2xl px-3.5 py-3", tone === "blue" ? "bg-blue text-white" : "bg-white/[0.08] text-white ring-1 ring-white/10")}>
      <dt className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70">{label}</dt>
      <dd className="mt-1 font-heading text-[1.12rem] font-extrabold leading-tight tabular-nums">{value}</dd>
      {sub && <dd className="mt-0.5 text-[0.72rem] leading-snug text-white/70">{sub}</dd>}
    </div>
  );
}

const BOM_GROUPS: BomLine["group"][] = ["Main equipment", "Batteries", "Cables", "Protection & switching", "Mounting & accessories"];
const GROWTH_OPTIONS = [0, 25, 50, 100];

/* ---------------- main ---------------- */

export function AdvancedCalculator({ initialType = "home", shared, signedIn }: { initialType?: ApplicationType; shared?: string; signedIn: boolean }) {
  const { SITE, whatsappHref } = useSiteLinks();
  const appliances = useAppliances();
  const catalog = useCatalog();
  const CATALOGUE = useMemo(() => toCatalogue(catalog.products), [catalog]);
  const STOCKED_INVERTERS = useMemo(() => stockedInverters(catalog.products), [catalog]);
  const initial = useMemo(() => decodeDesign(shared), [shared]);
  const [input, setInput] = useState<CalculatorInput>(() => initial?.input ?? { ...defaultInput(initialType, appliances), batterySizing: "backup", growthPct: 0 });
  const [options, setOptions] = useState<DesignOptions>(() => initial?.options ?? defaultDesignOptions());
  const [open, setOpen] = useState<Set<string>>(() => new Set(initial ? ["shopping"] : ["s1"]));
  const [addId, setAddId] = useState("");
  const [copied, setCopied] = useState(false);
  const [cartAdded, setCartAdded] = useState<number | null>(null);
  const [preparedFor, setPreparedFor] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [money, setMoney] = useState({ fuel: NaN, maint: NaN, cost: NaN });
  const [saveName, setSaveName] = useState("");
  const [saveState, saveAction, saving] = useActionState(saveDesign, undefined);

  const design = useMemo(() => computeDesign(input, options), [input, options]);
  const { base, battery, strings } = design;
  const pricing = useMemo(
    () => priceDesign(design, CATALOGUE, { panelWatt: input.panelWatt, inverterSlug: options.inverter?.productSlug, chemistry: input.chemistry }),
    [design, input.panelWatt, input.chemistry, options.inverter?.productSlug, CATALOGUE],
  );
  const savings = generatorSavings({ fuelPerWeekNgn: money.fuel, maintenancePerMonthNgn: money.maint, systemCostNgn: money.cost });
  const modules = compatibleModules(input.chemistry, design.systemV);
  const summary = formatDesignSummary(design);
  const region = REGIONS.find((r) => r.id === options.regionId);
  const code = useMemo(() => encodeDesign({ input, options }), [input, options]);
  const night = input.batterySizing === "night";
  const activeLoads = input.loads.filter((l) => l.quantity > 0 && l.watts > 0);

  const isOpen = (k: string) => open.has(k);
  const toggle = (k: string) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  const next = (from: string, to: string) => {
    setOpen((s) => {
      const n = new Set(s);
      n.delete(from);
      n.add(to);
      return n;
    });
    window.setTimeout(() => document.getElementById(`panel-${to}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const setLoads = (fn: (l: LoadLine[]) => LoadLine[]) => setInput((s) => ({ ...s, loads: fn(s.loads) }));
  const opt = (patch: Partial<DesignOptions>) => setOptions((o) => ({ ...o, ...patch }));

  const chooseInverter = (value: string) => {
    if (value === "recommended") return opt({ inverter: undefined });
    if (value === "custom") return opt({ inverter: { kva: options.inverter?.kva ?? base.inverterKva, batteryV: design.systemV, name: "My inverter" } });
    const inv = STOCKED_INVERTERS.find((x) => x.slug === value);
    if (!inv) return;
    opt({
      inverter: { kva: inv.kva, batteryV: inv.spec?.batteryV ?? design.systemV, name: inv.name, productSlug: inv.slug },
      ...(inv.spec?.maxPvV ? { inverterMaxPvV: inv.spec.maxPvV } : {}),
      ...(inv.spec?.mpptMinV !== undefined ? { mpptMinV: inv.spec.mpptMinV } : {}),
    });
  };
  const chosenStocked = STOCKED_INVERTERS.find((x) => x.slug === options.inverter?.productSlug);
  const inverterChoice = options.inverter ? (options.inverter.productSlug ?? "custom") : "recommended";

  const share = async () => {
    const url = `${window.location.origin}/solar-calculator?d=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link to share your design:", url);
    }
  };

  const addToCart = () => {
    pricing.cartItems.forEach((c) => cartActions.add(c.slug, c.qty));
    setCartAdded(pricing.cartItems.length);
  };

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const { buildDesignPdf } = await import("@/lib/design-pdf");
      const now = new Date();
      const reference = `TBC-CALC-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const bytes = await buildDesignPdf({
        company: {
          name: SITE.name,
          legalName: SITE.legalName,
          phone: SITE.phone,
          whatsapp: SITE.whatsapp,
          email: SITE.email,
          address: `${SITE.address.street}, ${SITE.address.city}`,
          url: SITE.url,
        },
        design,
        input,
        buildingLabel: APPLICATION_TYPES[input.applicationType].label,
        regionLabel: region?.label ?? "Nigeria",
        pricing,
        savings,
        preparedFor: preparedFor.trim() || undefined,
        date: now,
        reference,
      });
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${SITE.shortName.replace(/[^\w-]+/g, "-")}-solar-design-${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setPdfBusy(false);
    }
  };

  /* --------------- step summaries (shown when a step is closed) --------------- */
  const s1 = `${APPLICATION_TYPES[input.applicationType].label} · ${activeLoads.length} appliance${activeLoads.length === 1 ? "" : "s"} · ${formatKwh(base.dailyEnergyWh)}/day`;
  const s2 = `${night ? "Battery for night use" : `${input.backupHours} h backup`} · ${BATTERY_CHEMISTRY[input.chemistry].label}${battery ? ` · ${battery.module.label}` : ""}`;
  const s3 = `${region?.label} (${options.peakSunHours} sun hours) · ${input.panelWatt} W panels`;
  const s4 = `${options.inverter ? `${options.inverter.name}, ${options.inverter.kva} kVA` : `Recommended ${base.inverterKva} kVA`}${(input.growthPct ?? 0) > 0 ? ` · +${input.growthPct}% growth` : ""}`;
  const s5 = `Panels ${options.pvRunM} m · battery ${options.batteryRunM} m · board ${options.acRunM} m · ${options.mounting} mount`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0 space-y-3.5">
        {/* 1. Loads */}
        <div id="panel-s1" className="scroll-mt-24">
          <Panel n={1} title="What do you want to power?" summary={s1} open={isOpen("s1")} onToggle={() => toggle("s1")} onNext={() => next("s1", "s2")}>
            <Segmented
              label="Type of building"
              value={input.applicationType}
              options={(Object.keys(APPLICATION_TYPES) as ApplicationType[]).map((t) => ({ value: t, label: APPLICATION_TYPES[t].label }))}
              onChange={(t) => setInput((s) => ({ ...s, applicationType: t, loads: presetLines(t, appliances), simultaneity: APPLICATION_TYPES[t].simultaneity }))}
            />
            <div className="mt-4 rounded-2xl bg-field px-3 sm:px-4">
              <div aria-hidden className="hidden grid-cols-[minmax(0,1fr)_112px_84px_64px_40px] gap-2 border-b border-[#dfe8f5] py-2 font-heading text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-slate sm:grid">
                <span>Appliance</span>
                <span className="text-center">Qty</span>
                <span>Watts</span>
                <span>Hrs/day</span>
                <span />
              </div>
              <ul>
                {input.loads.map((line) => (
                  <LoadRow
                    key={line.key}
                    line={line}
                    onChange={(patch) => setLoads((ls) => ls.map((l) => (l.key === line.key ? { ...l, ...patch } : l)))}
                    onRemove={() => setLoads((ls) => ls.filter((l) => l.key !== line.key))}
                  />
                ))}
              </ul>
              {input.loads.length === 0 && <p className="py-4 text-center text-[0.86rem] text-slate">No appliances yet — add some below.</p>}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                aria-label="Add an appliance"
                value={addId}
                onChange={(e) => {
                  const t = appliances.find((a) => a.id === e.target.value);
                  if (t) setLoads((ls) => [...ls, lineFromTemplate(t)]);
                  setAddId("");
                }}
                className={cn(fieldClass, "cursor-pointer sm:max-w-[280px]")}
              >
                <option value="">+ Add a common appliance…</option>
                {appliances.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.watts} W)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setLoads((ls) => [...ls, { key: newLineKey(), name: "My appliance", quantity: 1, watts: 100, hoursPerDay: 4, surge: false, nightHours: 2 }])}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[#c9d8f2] px-4 font-heading text-[0.84rem] font-semibold text-blue hover:border-blue"
              >
                <IconPlus className="size-4" /> Custom appliance
              </button>
            </div>
            <div className="mt-4 max-w-[280px]">
              <label className="block">
                <Label>How much runs at the same time?</Label>
                <select value={input.simultaneity} onChange={(e) => setInput((s) => ({ ...s, simultaneity: Number(e.target.value) }))} className={cn(fieldClass, "cursor-pointer")}>
                  {SIMULTANEITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Panel>
        </div>

        {/* 2. Backup & batteries (+ day/night) */}
        <div id="panel-s2" className="scroll-mt-24">
          <Panel n={2} title="Backup & batteries" summary={s2} open={isOpen("s2")} onToggle={() => toggle("s2")} onNext={() => next("s2", "s3")}>
            <Segmented
              label="What should the batteries do?"
              value={night ? "night" : "backup"}
              options={[
                { value: "backup", label: "Cover power outages" },
                { value: "night", label: "Run everything at night (off-grid)" },
              ]}
              onChange={(v) => setInput((s) => ({ ...s, batterySizing: v }))}
            />
            <p className="mt-2 text-[0.78rem] text-slate">
              {night
                ? "Solar runs the day; the battery stores enough to run everything you use after dark, until the sun comes back."
                : "The battery carries your load through an outage of the length you choose; solar recharges it."}
            </p>

            {night ? (
              <div className="mt-4 rounded-2xl bg-field p-3 sm:p-4">
                <p className="font-heading text-[0.86rem] font-bold text-ink">Hours each appliance runs after dark</p>
                <p className="text-[0.76rem] text-slate">Pre-filled with typical habits — change any that don&rsquo;t match yours.</p>
                <ul className="mt-2 divide-y divide-[#dfe8f5]">
                  {activeLoads.map((l) => (
                    <li key={l.key} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate text-[0.86rem] font-semibold text-ink">
                        {l.quantity} × {l.name} <span className="font-normal text-slate">({l.hoursPerDay} h/day)</span>
                      </span>
                      <label className="relative w-[92px] shrink-0">
                        <span className="sr-only">{l.name} hours after dark</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={l.hoursPerDay}
                          step={0.5}
                          value={numberValue(l.nightHours ?? l.hoursPerDay / 2)}
                          onChange={(e) => setLoads((ls) => ls.map((x) => (x.key === l.key ? { ...x, nightHours: Math.min(x.hoursPerDay, e.target.valueAsNumber) } : x)))}
                          className={cn(fieldClass, "pr-9")}
                        />
                        <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.7rem] text-slate">
                          h
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.8rem] font-semibold text-ink">
                  Night use: {formatKwh(base.nightEnergyWh)} of {formatKwh(base.dailyEnergyWh)} per day
                </p>
              </div>
            ) : (
              <label className="mt-4 block max-w-[280px]">
                <Label>Outage length to cover</Label>
                <select value={input.backupHours} onChange={(e) => setInput((s) => ({ ...s, backupHours: Number(e.target.value) }))} className={cn(fieldClass, "cursor-pointer")}>
                  {BACKUP_HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Segmented
                label="Battery type"
                value={input.chemistry}
                options={(Object.keys(BATTERY_CHEMISTRY) as BatteryChemistry[]).map((c) => ({ value: c, label: BATTERY_CHEMISTRY[c].label }))}
                onChange={(c) => {
                  setInput((s) => ({ ...s, chemistry: c }));
                  const last = compatibleModules(c, design.systemV).at(-1);
                  if (last) opt({ batteryModuleId: last.id });
                }}
              />
              <label className="block">
                <Label>Battery module ({design.systemV} V system)</Label>
                <select value={battery?.module.id ?? ""} onChange={(e) => opt({ batteryModuleId: e.target.value })} className={cn(fieldClass, "cursor-pointer")} disabled={!modules.length}>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} — {moduleKwh(m)} kWh
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 text-[0.78rem] text-slate">{BATTERY_CHEMISTRY[input.chemistry].note}.</p>
          </Panel>
        </div>

        {/* 3. Location & panels */}
        <div id="panel-s3" className="scroll-mt-24">
          <Panel n={3} title="Location & solar panels" summary={s3} open={isOpen("s3")} onToggle={() => toggle("s3")} onNext={() => next("s3", "s4")}>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <label className="block">
                <Label>Where is the installation?</Label>
                <select
                  value={options.regionId}
                  onChange={(e) => {
                    const r = REGIONS.find((x) => x.id === e.target.value)!;
                    opt({ regionId: r.id as RegionId, peakSunHours: r.psh });
                  }}
                  className={cn(fieldClass, "cursor-pointer")}
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.examples}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField label="Peak sun hours" unit="h/day" value={options.peakSunHours} step={0.1} min={2} max={8} onChange={(n) => opt({ peakSunHours: n })} />
            </div>
            <p className="mt-1.5 text-[0.76rem] text-slate">Typical annual average for {region?.label}. The north gets more sun than the coast, so it needs fewer panels.</p>
            <div className="mt-4">
              <PanelSizeField
                className="sm:max-w-[260px]"
                value={input.panelWatt}
                onChange={(watt) => {
                  setInput((s) => ({ ...s, panelWatt: watt }));
                  opt({ panel: typicalPanel(watt) });
                }}
              />
            </div>
            <details className="group mt-4 rounded-2xl border border-hair bg-field/60">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-heading text-[0.86rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Panel &amp; inverter datasheet values (advanced)
                <IconChevronDown className="size-4 text-slate transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-hair px-4 pb-4 pt-3">
                <p className="mb-3 text-[0.78rem] text-slate">Pre-filled with typical values for a {input.panelWatt} W panel. For an exact design, copy the figures from your panel and inverter datasheets.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <NumberField label="Vmp" unit="V" step={0.1} value={options.panel.vmp} onChange={(n) => opt({ panel: { ...options.panel, vmp: n } })} />
                  <NumberField label="Voc" unit="V" step={0.1} value={options.panel.voc} onChange={(n) => opt({ panel: { ...options.panel, voc: n } })} />
                  <NumberField label="Imp" unit="A" step={0.01} value={options.panel.imp} onChange={(n) => opt({ panel: { ...options.panel, imp: n } })} />
                  <NumberField label="Isc" unit="A" step={0.01} value={options.panel.isc} onChange={(n) => opt({ panel: { ...options.panel, isc: n } })} />
                  <NumberField label="Panel length" unit="mm" value={options.panel.lengthMm} onChange={(n) => opt({ panel: { ...options.panel, lengthMm: n } })} />
                  <NumberField label="Panel width" unit="mm" value={options.panel.widthMm} onChange={(n) => opt({ panel: { ...options.panel, widthMm: n } })} />
                  <NumberField label="Inverter max PV" unit="V" value={options.inverterMaxPvV} onChange={(n) => opt({ inverterMaxPvV: n })} />
                  <NumberField label="MPPT minimum" unit="V" value={options.mpptMinV} onChange={(n) => opt({ mpptMinV: n })} />
                </div>
              </div>
            </details>
          </Panel>
        </div>

        {/* 4. Inverter & growth */}
        <div id="panel-s4" className="scroll-mt-24">
          <Panel n={4} title="Inverter & future growth" summary={s4} open={isOpen("s4")} onToggle={() => toggle("s4")} onNext={() => next("s4", "s5")}>
            <label className="block">
              <Label>Inverter</Label>
              <select value={inverterChoice} onChange={(e) => chooseInverter(e.target.value)} className={cn(fieldClass, "cursor-pointer")}>
                <option value="recommended">Recommended size — {base.inverterKva} kVA</option>
                {STOCKED_INVERTERS.length > 0 && (
                  <optgroup label="Inverters in our shop">
                    {STOCKED_INVERTERS.map((inv) => (
                      <option key={inv.slug} value={inv.slug}>
                        {inv.name} — {inv.kva} kVA ({formatNaira(inv.priceNgn)})
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="custom">Another inverter (enter its rating)</option>
              </select>
            </label>

            {options.inverter && (
              <div className="mt-3 grid gap-3 rounded-2xl bg-field p-3.5 sm:grid-cols-2">
                {!options.inverter.productSlug && (
                  <NumberField label="Inverter rating" unit="kVA" step={0.5} min={0.5} value={options.inverter.kva} onChange={(n) => opt({ inverter: { ...options.inverter!, kva: n } })} />
                )}
                {!(chosenStocked?.spec?.batteryV) && (
                  <label className="block">
                    <Label>Battery voltage of this inverter</Label>
                    <select
                      value={options.inverter.batteryV ?? design.systemV}
                      onChange={(e) => opt({ inverter: { ...options.inverter!, batteryV: Number(e.target.value) as 12 | 24 | 48 } })}
                      className={cn(fieldClass, "cursor-pointer")}
                    >
                      {[12, 24, 48].map((v) => (
                        <option key={v} value={v}>
                          {v} V
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <p className="flex gap-2 text-[0.76rem] text-slate sm:col-span-2">
                  <IconInfo className="mt-px size-4 shrink-0" />
                  {chosenStocked?.spec?.maxPvV
                    ? `Using the datasheet PV limits for this model (${chosenStocked.spec.maxPvV} V max${chosenStocked.spec.mpptMinV !== undefined ? `, ${chosenStocked.spec.mpptMinV} V MPPT minimum` : ""}).`
                    : "This model's PV input limits aren't listed yet — check its datasheet and set them under step 3 → datasheet values."}
                </p>
              </div>
            )}

            <div className="mt-5">
              <Segmented
                label="Allow for more appliances later?"
                value={String(input.growthPct ?? 0)}
                options={GROWTH_OPTIONS.map((g) => ({ value: String(g), label: g === 0 ? "No" : `+${g}%` }))}
                onChange={(v) => setInput((s) => ({ ...s, growthPct: Number(v) }))}
              />
              <p className="mt-2 text-[0.78rem] text-slate">
                Sizes the inverter, cables and breakers for extra load now, so you can add panels and batteries later without replacing them.
                {base.hasLoad && (
                  <>
                    {" "}
                    This inverter leaves room for about <strong className="text-ink">{formatWatts(design.growthHeadroomW)}</strong> more running load.
                  </>
                )}
              </p>
            </div>
          </Panel>
        </div>

        {/* 5. Installation */}
        <div id="panel-s5" className="scroll-mt-24">
          <Panel n={5} title="Installation distances" summary={s5} open={isOpen("s5")} onToggle={() => toggle("s5")} onNext={() => next("s5", "shopping")}>
            <p className="mb-3 text-[0.8rem] text-slate">Measure the one-way cable route — cable sizes and the lengths to buy depend on it.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Panels → inverter" unit="m" value={options.pvRunM} min={1} max={300} onChange={(n) => opt({ pvRunM: n })} />
              <NumberField label="Battery → inverter" unit="m" step={0.5} value={options.batteryRunM} min={0.5} max={20} onChange={(n) => opt({ batteryRunM: n })} />
              <NumberField label="Inverter → DB" unit="m" value={options.acRunM} min={1} max={300} onChange={(n) => opt({ acRunM: n })} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Segmented label="Panel mounting" value={options.mounting} options={[{ value: "roof", label: "Roof" }, { value: "ground", label: "Ground" }]} onChange={(m) => opt({ mounting: m })} />
              <Segmented
                label="Grid or generator input?"
                value={options.gridOrGenerator ? "yes" : "no"}
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Solar only" }]}
                onChange={(v) => opt({ gridOrGenerator: v === "yes" })}
              />
            </div>
          </Panel>
        </div>

        {base.hasLoad && (
          <>
            <p className="px-1 pt-3 font-heading text-[0.72rem] font-bold uppercase tracking-[0.16em] text-red">Your results</p>

            {/* Shopping list & cost */}
            <div id="panel-shopping" className="scroll-mt-24">
              <Panel
                title="Shopping list & cost"
                summary={`${design.bom.length} items · ${pricing.priced.length ? `${formatNaira(pricing.pricedSubtotalNgn)} priced + ${pricing.unpriced.length} quoted` : "all items quoted"}`}
                open={isOpen("shopping")}
                onToggle={() => toggle("shopping")}
              >
                <div className="rounded-2xl bg-mist p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-heading text-[0.86rem] font-bold text-ink">Priced from our shop</span>
                    <span className="font-heading text-[1.4rem] font-extrabold tabular-nums text-ink">{pricing.priced.length ? formatNaira(pricing.pricedSubtotalNgn) : "—"}</span>
                  </div>
                  <p className="mt-1 text-[0.78rem] text-slate">
                    {pricing.priced.length
                      ? `${pricing.priced.length} item${pricing.priced.length > 1 ? "s" : ""} matched products in our shop exactly. ${pricing.unpriced.length} item${pricing.unpriced.length === 1 ? " is" : "s are"} priced in your quotation (we don't guess prices).`
                      : "None of this design's main equipment exactly matches a product listed in our shop right now, so everything is priced in your quotation."}
                  </p>
                  {pricing.cartItems.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={addToCart} className="inline-flex h-10 items-center gap-2 rounded-full bg-blue px-4 font-heading text-[0.84rem] font-semibold text-white hover:bg-blue-deep">
                        <IconCart className="size-4" /> Add {pricing.cartItems.length} shop item{pricing.cartItems.length > 1 ? "s" : ""} to cart
                      </button>
                      {cartAdded !== null && (
                        <span role="status" className="text-[0.8rem] font-semibold text-[#17733b]">
                          Added {cartAdded} item{cartAdded > 1 ? "s" : ""}.{" "}
                          <Link href="/cart" className="underline">
                            View cart
                          </Link>{" "}
                          — the rest is in your quote request.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {BOM_GROUPS.map((g) => {
                  const items = design.bom.filter((b) => b.group === g);
                  if (!items.length) return null;
                  return (
                    <div key={g} className="mt-5">
                      <h3 className="font-heading text-[0.72rem] font-bold uppercase tracking-[0.14em] text-red">{g}</h3>
                      <ul className="mt-2 divide-y divide-hair rounded-2xl border border-hair">
                        {items.map((b, i) => {
                          const p = pricing.priced.find((x) => x.bom === b);
                          return (
                            <li key={`${b.item}-${i}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-3.5 py-2.5 sm:px-4">
                              <div className="min-w-0">
                                <p className="text-[0.9rem] font-semibold text-ink">{b.item}</p>
                                <p className="text-[0.76rem] text-slate">{p && p.product.name !== b.item ? `${p.product.name} · ` : ""}{b.spec}</p>
                              </div>
                              <div className="text-right">
                                <span className="block whitespace-nowrap font-heading text-[0.95rem] font-extrabold tabular-nums text-ink">
                                  {b.qty} <span className="text-[0.74rem] font-semibold text-slate">{b.unit}</span>
                                </span>
                                <span className={cn("block text-[0.74rem] tabular-nums", p ? "font-semibold text-blue-deep" : "text-slate-light")}>{p ? formatNaira(p.totalNgn) : "Quoted"}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </Panel>
            </div>

            {/* Cables */}
            <Panel title="Cables — sizes & lengths to buy" summary={design.cables.map((c) => `${c.label.split(" (")[0]} ${c.sizeMm2 ?? "—"} mm²`).join(" · ")} open={isOpen("cables")} onToggle={() => toggle("cables")}>
              <p className="text-[0.82rem] text-slate">Copper cable sized for current rating and voltage drop (PV &amp; AC ≤ 3 %, battery ≤ 1 %), with 10 % extra for routing.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {design.cables.map((c) => (
                  <article key={c.id} className="rounded-2xl border border-hair p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-[0.95rem] font-bold text-ink">{c.label}</h3>
                      <span className="shrink-0 rounded-lg bg-blue px-2.5 py-1 font-heading text-[0.95rem] font-extrabold text-white">{c.sizeMm2 ?? "—"} mm²</span>
                    </div>
                    <p className="mt-1 text-[0.78rem] text-slate">{c.type}</p>
                    <ul className="mt-2.5 space-y-1 text-[0.86rem]">
                      {c.lengths.map((l) => (
                        <li key={l.colour} className="flex justify-between">
                          <span className="text-ink">{l.colour}</span>
                          <strong className="tabular-nums">{l.metres} m</strong>
                        </li>
                      ))}
                    </ul>
                    {(c.designCurrentA !== undefined || c.note) && (
                      <p className="mt-2 border-t border-hair pt-2 text-[0.74rem] text-slate">
                        {c.designCurrentA !== undefined && `Design current ${c.designCurrentA} A · voltage drop ${c.dropPct}%. `}
                        {c.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </Panel>

            {/* Protection */}
            <Panel title="Breakers & protection" summary={`${design.protection.length} devices`} open={isOpen("protection")} onToggle={() => toggle("protection")}>
              <ul className="divide-y divide-hair">
                {design.protection.map((p) => (
                  <li key={p.label} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
                    <div>
                      <p className="font-semibold text-ink">
                        {p.qty > 1 && `${p.qty} × `}
                        {p.label}
                      </p>
                      {p.note && <p className="text-[0.78rem] text-slate">{p.note}</p>}
                    </div>
                    <span className="font-heading text-[0.9rem] font-bold text-blue-deep">{p.rating}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Generator savings */}
            <Panel
              title="Savings vs. your generator"
              summary={savings ? `About ${formatNaira(savings.monthlyNgn)} a month${savings.paybackMonths !== null ? ` · payback ~${savings.paybackMonths} months` : ""}` : "Enter what you spend on your generator"}
              open={isOpen("savings")}
              onToggle={() => toggle("savings")}
            >
              <p className="text-[0.82rem] text-slate">Use your own figures — fuel prices change, so we don&rsquo;t assume them.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <NumberField label="Fuel spend per week" unit="₦" step={1000} placeholder="e.g. 25000" value={money.fuel} onChange={(n) => setMoney((m) => ({ ...m, fuel: n }))} />
                <NumberField label="Servicing per month" unit="₦" step={1000} placeholder="e.g. 10000" value={money.maint} onChange={(n) => setMoney((m) => ({ ...m, maint: n }))} />
                <NumberField label="System price (from your quote)" unit="₦" step={10000} placeholder="optional" value={money.cost} onChange={(n) => setMoney((m) => ({ ...m, cost: n }))} />
              </div>
              {pricing.mainEquipmentPriced && Number.isNaN(money.cost) && (
                <button type="button" onClick={() => setMoney((m) => ({ ...m, cost: pricing.pricedSubtotalNgn }))} className="mt-2 text-[0.8rem] font-semibold text-blue hover:underline">
                  Use the priced equipment ({formatNaira(pricing.pricedSubtotalNgn)}) — excludes {pricing.unpriced.length} quoted items
                </button>
              )}
              {savings ? (
                <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    ["Per month", formatNaira(savings.monthlyNgn)],
                    ["Per year", formatNaira(savings.yearlyNgn)],
                    ["Payback", savings.paybackMonths !== null ? `~${savings.paybackMonths} months` : "Add system price"],
                    ["After 5 years", savings.fiveYearNetNgn !== null ? `${savings.fiveYearNetNgn < 0 ? "−" : ""}${formatNaira(Math.abs(savings.fiveYearNetNgn))}` : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-mist p-3">
                      <dt className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate">{k}</dt>
                      <dd className="mt-1 font-heading text-[1rem] font-extrabold tabular-nums text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {savings && design.solarCoveragePct < 100 && (
                <p className="mt-2 flex gap-2 text-[0.76rem] text-slate">
                  <IconInfo className="mt-px size-4 shrink-0" />
                  This design covers about {design.solarCoveragePct}% of your daily use, so some generator use may remain — savings will be lower than shown.
                </p>
              )}
            </Panel>
          </>
        )}
      </div>

      {/* Sticky summary */}
      <aside id="calculator-results" aria-labelledby="results-title" className="relative scroll-mt-24 overflow-hidden rounded-3xl bg-ink text-white lg:sticky lg:top-24">
        {/* Inner scroller: keeps the (slim, themed) scrollbar inside the rounded panel */}
        <div className="results-scroll p-5 sm:p-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-8">
        <h2 id="results-title" className="font-heading text-[1.1rem] font-bold">
          Your system
        </h2>
        {base.hasLoad ? (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-2.5" aria-live="polite">
              <Stat tone="blue" label="Inverter" value={`${design.inverterKva} kVA`} sub={`${design.inverterName ?? (design.phase === "three" ? "Three-phase" : "Single-phase")} · ${design.systemV} V`} />
              <Stat tone="blue" label="Battery bank" value={battery ? `${battery.bankKwh} kWh` : "—"} sub={battery ? `${battery.totalModules} × ${battery.module.label}` : undefined} />
              <Stat label="Solar panels" value={`${strings.totalPanels} × ${input.panelWatt} W`} sub={`${strings.arrayKwp} kWp${strings.fits ? ` · ${strings.strings} string${strings.strings > 1 ? "s" : ""} of ${strings.panelsPerString}` : ""}`} />
              <Stat label={night ? "Night covered" : "Backup achieved"} value={battery ? `~${battery.backupHoursAchieved} h` : "—"} sub={night ? `Night use ${formatKwh(base.nightEnergyWh)}` : `Target ${input.backupHours} h`} />
              <Stat label="Daily use" value={formatKwh(base.dailyEnergyWh)} sub={`Peak load ${formatWatts(base.simultaneousLoadW)}`} />
              <Stat label="Daily solar" value={`${design.dailyGenerationKwh} kWh`} sub={`Covers ~${design.solarCoveragePct}% of use`} />
            </dl>
            <div className="mt-2.5 rounded-2xl bg-white/[0.08] p-3.5 ring-1 ring-white/10">
              <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70">Cost from our shop</p>
              <p className="mt-1 font-heading text-[1.12rem] font-extrabold tabular-nums">
                {pricing.priced.length ? formatNaira(pricing.pricedSubtotalNgn) : "Quoted"}
                {pricing.priced.length > 0 && <span className="ml-1.5 text-[0.74rem] font-semibold text-white/70">+ {pricing.unpriced.length} items quoted</span>}
              </p>
            </div>
            {design.warnings.length > 0 && (
              <ul className="mt-3 space-y-2">
                {design.warnings.map((w) => (
                  <li key={w} className="flex gap-2 rounded-xl bg-gold/15 px-3 py-2 text-[0.78rem] text-white">
                    <IconInfo className="mt-px size-4 shrink-0 text-gold" />
                    {w}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid gap-2.5 print:hidden">
              <Link
                href={`/quote?estimate=${encodeURIComponent(summary.slice(0, 2900))}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red font-heading text-[0.92rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] hover:bg-red-dark"
              >
                <IconQuote className="size-4" /> Get a Quote for This Design
              </Link>

              <div className="flex gap-2 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                <label className="min-w-0 grow">
                  <span className="sr-only">Name on the PDF (optional)</span>
                  <input value={preparedFor} onChange={(e) => setPreparedFor(e.target.value.slice(0, 80))} placeholder="Name on PDF (optional)" className="h-10 w-full rounded-[10px] border border-white/20 bg-white/10 px-3 text-[0.86rem] text-white outline-none placeholder:text-white/40 focus:border-white/50" />
                </label>
                <button type="button" onClick={downloadPdf} disabled={pdfBusy} className="h-10 shrink-0 rounded-full bg-white px-4 font-heading text-[0.82rem] font-semibold text-blue-deep hover:bg-white/90 disabled:opacity-60">
                  {pdfBusy ? "Preparing…" : "Download PDF"}
                </button>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                {signedIn ? (
                  saveState?.ok ? (
                    <p role="status" className="flex items-center gap-2 text-[0.84rem] font-semibold text-white">
                      <IconCheck className="size-4 text-whatsapp" /> Saved to{" "}
                      <Link href="/account" className="underline">
                        My Account
                      </Link>
                    </p>
                  ) : (
                    <form action={saveAction} className="flex gap-2">
                      <input type="hidden" name="code" value={code} />
                      <input type="hidden" name="inverterKva" value={design.inverterKva} />
                      <input type="hidden" name="batteryKwh" value={battery?.bankKwh ?? 0} />
                      <input type="hidden" name="panels" value={strings.totalPanels} />
                      <input type="hidden" name="panelWatt" value={input.panelWatt} />
                      <input type="hidden" name="dailyKwh" value={(base.dailyEnergyWh / 1000).toFixed(1)} />
                      <label className="min-w-0 grow">
                        <span className="sr-only">Design name</span>
                        <input name="name" value={saveName} onChange={(e) => setSaveName(e.target.value.slice(0, 80))} required placeholder="Name this design" className="h-10 w-full rounded-[10px] border border-white/20 bg-white/10 px-3 text-[0.86rem] text-white outline-none placeholder:text-white/40 focus:border-white/50" />
                      </label>
                      <button type="submit" disabled={saving} className="h-10 shrink-0 rounded-full border border-white/30 px-4 font-heading text-[0.82rem] font-semibold hover:bg-white/10 disabled:opacity-60">
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </form>
                  )
                ) : (
                  <Link href={`/account/login?next=${encodeURIComponent(`/solar-calculator?d=${code}`)}`} className="block py-2.5 text-center text-[0.84rem] font-semibold text-white hover:underline">
                    Sign in to save this design to your account
                  </Link>
                )}
                {saveState?.error && <p className="mt-1.5 text-[0.78rem] text-gold">{saveState.error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={whatsappHref(`Hello ${SITE.shortName}, please quote for this design:\n\n${summary}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-whatsapp/60 font-heading text-[0.82rem] font-semibold hover:bg-whatsapp/20"
                >
                  <IconWhatsApp className="size-4" /> WhatsApp
                </a>
                <button type="button" onClick={share} className="h-10 rounded-full border border-white/25 font-heading text-[0.82rem] font-semibold hover:bg-white/10">
                  {copied ? "Link copied ✓" : "Copy share link"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 text-[0.9rem] text-white/75">Add at least one appliance to see your system.</p>
        )}
        <p className="mt-4 flex gap-2 text-[0.72rem] leading-snug text-white/60">
          <IconInfo className="mt-px size-3.5 shrink-0" />
          Planning estimate using typical values and conservative assumptions. A {SITE.shortName} engineer confirms the final design, cable routes and protection on site before installation.
        </p>
        </div>
        {/* soft fade at the bottom edge hints that the panel scrolls */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-8 bg-gradient-to-b from-transparent to-ink lg:block" />
      </aside>

      {/* Mobile results bar */}
      {base.hasLoad && (
        <a
          href="#calculator-results"
          className="fixed bottom-3 left-3 right-[88px] z-40 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] lg:hidden print:hidden"
        >
          <span className="min-w-0 truncate text-[0.82rem]">
            <strong className="font-heading">{design.inverterKva} kVA</strong> · {battery?.bankKwh ?? 0} kWh · {strings.totalPanels} panels
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-heading text-[0.8rem] font-semibold text-gold">
            Results <IconArrowRight className="size-3.5" />
          </span>
        </a>
      )}
    </div>
  );
}
