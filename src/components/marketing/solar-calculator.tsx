"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSiteLinks } from "@/components/site-provider";
import { useAppliances } from "@/components/calculator-provider";
import {
  APPLICATION_TYPES,
  BACKUP_HOUR_OPTIONS,
  BATTERY_CHEMISTRY,
  PANEL_WATT_OPTIONS,
  PEAK_SUN_HOURS,
  SIMULTANEITY_OPTIONS,
  computeSystemEstimate,
  defaultInput,
  formatEstimateSummary,
  formatKwh,
  formatWatts,
  getApplianceTemplate,
  lineFromTemplate,
  newLineKey,
  presetLines,
  type ApplicationType,
  type BatteryChemistry,
  type CalculatorInput,
  type LoadLine,
  type PanelWatt,
} from "@/lib/calculator";
import { IconCalculator, IconArrowRight, IconWhatsApp, IconMinus, IconPlus, IconTrash, IconInfo, IconChevronDown } from "@/components/icons";

export const fieldClass =
  "h-10 w-full rounded-[10px] border border-[#cdddf1] bg-white px-2.5 text-[0.88rem] font-semibold tabular-nums text-ink outline-none transition-colors focus:border-blue focus:ring-3 focus:ring-blue/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function numberValue(n: number): number | "" {
  return Number.isFinite(n) ? n : "";
}

function ResultCell({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn("p-3 sm:p-3.5", highlight ? "bg-blue text-white" : "bg-white")}>
      <dt className={cn("font-heading text-[0.62rem] font-semibold uppercase tracking-[0.12em]", highlight ? "text-white/75" : "text-slate")}>
        {label}
      </dt>
      <dd className={cn("mt-1 font-heading text-[1.02rem] font-bold leading-tight tabular-nums", highlight ? "text-white" : "text-ink")}>
        {value}
      </dd>
      {sub && <dd className={cn("mt-0.5 text-[0.7rem] leading-snug", highlight ? "text-white/75" : "text-slate")}>{sub}</dd>}
    </div>
  );
}

export function LoadRow({
  line,
  onChange,
  onRemove,
}: {
  line: LoadLine;
  onChange: (patch: Partial<LoadLine>) => void;
  onRemove: () => void;
}) {
  const id = `load-${line.key}`;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 border-b border-[#dfe8f5] py-2.5 last:border-none sm:grid-cols-[minmax(0,1fr)_96px_84px_64px_36px]">
      <input
        aria-label="Appliance name"
        value={line.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="min-w-0 truncate rounded-md bg-transparent px-1 py-1 text-[0.88rem] font-semibold text-ink outline-none hover:bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue/20"
      />

      <div className="col-span-2 row-start-2 grid grid-cols-[96px_1fr_1fr] gap-2 sm:contents">
        <div className="flex h-10 items-center rounded-[10px] border border-[#cdddf1] bg-white">
          <button
            type="button"
            aria-label={`Fewer ${line.name}`}
            onClick={() => onChange({ quantity: Math.max(0, (Number.isFinite(line.quantity) ? line.quantity : 0) - 1) })}
            className="grid h-full w-8 place-items-center text-slate hover:text-blue"
          >
            <IconMinus className="size-3.5" />
          </button>
          <input
            id={`${id}-qty`}
            aria-label={`${line.name} quantity`}
            inputMode="numeric"
            type="number"
            min={0}
            max={999}
            value={numberValue(line.quantity)}
            onChange={(e) => onChange({ quantity: e.target.valueAsNumber })}
            className="h-full w-full min-w-0 bg-transparent text-center text-[0.88rem] font-bold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label={`More ${line.name}`}
            onClick={() => onChange({ quantity: Math.min(999, (Number.isFinite(line.quantity) ? line.quantity : 0) + 1) })}
            className="grid h-full w-8 place-items-center text-slate hover:text-blue"
          >
            <IconPlus className="size-3.5" />
          </button>
        </div>
        <label className="relative block">
          <span className="sr-only">{line.name} power rating in watts</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={numberValue(line.watts)}
            onChange={(e) => onChange({ watts: e.target.valueAsNumber })}
            className={cn(fieldClass, "pr-6")}
          />
          <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[0.7rem] text-slate">
            W
          </span>
        </label>
        <label className="relative block">
          <span className="sr-only">{line.name} hours of use per day</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.5}
            value={numberValue(line.hoursPerDay)}
            onChange={(e) => onChange({ hoursPerDay: e.target.valueAsNumber })}
            className={cn(fieldClass, "pr-5")}
          />
          <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[0.7rem] text-slate">
            h
          </span>
        </label>
      </div>

      <button
        type="button"
        aria-label={`Remove ${line.name}`}
        onClick={onRemove}
        className="col-start-2 row-start-1 grid size-9 place-items-center rounded-[10px] text-slate transition-colors hover:bg-white hover:text-red sm:col-start-auto sm:row-start-auto"
      >
        <IconTrash className="size-4" />
      </button>
    </li>
  );
}

function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const picked = options.find((o) => String(o.value) === e.target.value);
          if (picked) onChange(picked.value);
        }}
        className={cn(fieldClass, "cursor-pointer font-semibold")}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SolarCalculator({ initialType = "home", className }: { initialType?: ApplicationType; className?: string }) {
  const { SITE, whatsappHref } = useSiteLinks();
  const appliances = useAppliances();
  const [input, setInput] = useState<CalculatorInput>(() => defaultInput(initialType, appliances));
  const [editorOpen, setEditorOpen] = useState(false);
  const result = useMemo(() => computeSystemEstimate(input), [input]);
  const summary = useMemo(() => formatEstimateSummary(input, result), [input, result]);

  const update = (patch: Partial<CalculatorInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const updateLine = (key: string, patch: Partial<LoadLine>) =>
    setInput((prev) => ({ ...prev, loads: prev.loads.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));

  function setApplication(type: ApplicationType) {
    setInput((prev) => ({
      ...prev,
      applicationType: type,
      loads: presetLines(type, appliances),
      simultaneity: APPLICATION_TYPES[type].simultaneity,
    }));
  }

  function addAppliance(id: string) {
    const template = getApplianceTemplate(id, appliances);
    const line: LoadLine = template
      ? lineFromTemplate(template)
      : { key: newLineKey(), name: "My appliance", quantity: 1, watts: 100, hoursPerDay: 4, surge: false };
    setInput((prev) => ({ ...prev, loads: [...prev.loads, line] }));
  }

  const applianceCount = input.loads.filter((l) => Number.isFinite(l.quantity) && l.quantity > 0).length;

  const simultaneityOptions = SIMULTANEITY_OPTIONS.some((o) => o.value === input.simultaneity)
    ? SIMULTANEITY_OPTIONS
    : [...SIMULTANEITY_OPTIONS, { value: input.simultaneity, label: `${Math.round(input.simultaneity * 100)}% at once` }];

  return (
    <div
      id="calculator"
      className={cn(
        "flex scroll-mt-24 flex-col rounded-3xl border border-[#d5e2f4] bg-gradient-to-br from-[#f1f6ff] to-[#e4edfb] p-4 shadow-[0_20px_44px_-22px_rgba(13,27,47,0.2)] sm:p-7",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-blue">
        <IconCalculator className="size-[15px]" />
        Solar Calculator
      </span>
      <h3 className="mt-2 font-heading text-[1.35rem] font-bold text-ink">Not sure what you need?</h3>
      <p className="mt-1 text-[0.88rem] text-slate">
        Tell us about your power needs and get an estimated system recommendation instantly.
      </p>

      {/* Main inputs — compact 2×2, as in the reference design */}
      <div className="mt-5 grid grid-cols-2 items-end gap-3">
        <Select<ApplicationType>
          label="Application"
          value={input.applicationType}
          options={(Object.keys(APPLICATION_TYPES) as ApplicationType[]).map((t) => ({ value: t, label: APPLICATION_TYPES[t].label }))}
          onChange={setApplication}
        />
        <Select
          label="Backup duration"
          value={input.backupHours}
          options={BACKUP_HOUR_OPTIONS.map((h) => ({ value: h, label: `${h} hours` }))}
          onChange={(v) => update({ backupHours: v })}
        />
        <div>
          <span className="mb-1.5 block font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">
            Appliances
          </span>
          <button
            type="button"
            aria-expanded={editorOpen}
            aria-controls="calculator-appliances"
            onClick={() => setEditorOpen((o) => !o)}
            className={cn(fieldClass, "flex cursor-pointer items-center justify-between gap-2 text-left")}
          >
            <span className="truncate">
              {applianceCount} {applianceCount === 1 ? "appliance" : "appliances"}
              <span className="hidden font-medium text-slate min-[420px]:inline"> · {formatWatts(result.connectedLoadW)}</span>
            </span>
            <IconChevronDown className={cn("size-4 shrink-0 text-slate transition-transform", editorOpen && "rotate-180")} />
          </button>
        </div>
        <Select<BatteryChemistry>
          label="Battery type"
          value={input.chemistry}
          options={(Object.keys(BATTERY_CHEMISTRY) as BatteryChemistry[]).map((c) => ({ value: c, label: BATTERY_CHEMISTRY[c].label }))}
          onChange={(v) => update({ chemistry: v })}
        />
      </div>

      {/* Appliance editor — quantity, watts and hours per appliance (collapsed by default) */}
      {editorOpen && (
      <div id="calculator-appliances" className="mt-4 rounded-2xl bg-white/60 p-3 ring-1 ring-[#d5e2f4] sm:p-4">
        <div className="mb-1 flex items-end justify-between gap-2">
          <h4 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">
            Your appliances
          </h4>
          <div aria-hidden className="hidden grid-cols-[96px_84px_64px_36px] gap-x-2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-slate sm:grid">
            <span>Qty</span>
            <span>Watts</span>
            <span>Hrs/day</span>
            <span />
          </div>
        </div>
        {input.loads.length > 0 ? (
          <ul className="rounded-[14px] bg-white/55 px-2.5 ring-1 ring-[#d5e2f4]">
            {input.loads.map((line) => (
              <LoadRow
                key={line.key}
                line={line}
                onChange={(patch) => updateLine(line.key, patch)}
                onRemove={() => update({ loads: input.loads.filter((l) => l.key !== line.key) })}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-[14px] bg-white/55 px-4 py-5 text-center text-[0.85rem] text-slate ring-1 ring-[#d5e2f4]">
            No appliances yet — add one below.
          </p>
        )}
        <label className="mt-2.5 block">
          <span className="sr-only">Add an appliance</span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) addAppliance(e.target.value);
            }}
            className={cn(fieldClass, "cursor-pointer border-dashed bg-white/70 text-blue")}
          >
            <option value="">+ Add an appliance…</option>
            {appliances.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (~{a.watts} W)
              </option>
            ))}
            <option value="custom">Other / custom appliance</option>
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 items-end gap-3">
          <Select
            label="Running together"
            value={input.simultaneity}
            options={simultaneityOptions}
            onChange={(v) => update({ simultaneity: v })}
          />
          <Select<PanelWatt>
            label="Panel size"
            value={input.panelWatt}
            options={PANEL_WATT_OPTIONS.map((w) => ({ value: w, label: `${w} W panels` }))}
            onChange={(v) => update({ panelWatt: v })}
          />
        </div>
        <button
          type="button"
          onClick={() => setEditorOpen(false)}
          className="mt-3 w-full rounded-[10px] py-2 font-heading text-[0.82rem] font-semibold text-blue hover:bg-white/70"
        >
          Done
        </button>
      </div>
      )}

      {/* Results */}
      <div className="mt-5" aria-live="polite">
        <h4 className="mb-2 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">
          Your estimated system
        </h4>
        {result.hasLoad ? (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-[#d5e2f4] bg-[#d5e2f4] sm:grid-cols-3">
            <ResultCell label="Daily energy" value={formatKwh(result.dailyEnergyWh)} sub="Estimated use per day" />
            <ResultCell
              label="Running together"
              value={formatWatts(result.simultaneousLoadW)}
              sub={`of ${formatWatts(result.connectedLoadW)} connected`}
            />
            <ResultCell label="Solar capacity" value={`${result.pvKwp} kWp`} sub="Recommended array" />
            <ResultCell
              label="Inverter"
              value={`${result.inverterKva} kVA`}
              sub={result.startupSurgeW > 0 ? "Incl. motor start-up surge" : "With 25% headroom"}
              highlight
            />
            <ResultCell
              label="Battery"
              value={`${result.batteryKwh} kWh`}
              sub={`${result.batteryVoltage} V · ~${result.batteryAh} Ah`}
              highlight
            />
            <ResultCell
              label="Solar panels"
              value={`${result.panelCount} × ${result.panelWatt} W`}
              sub="Number of panels"
              highlight
            />
          </dl>
        ) : (
          <p className="rounded-[14px] border border-[#d5e2f4] bg-white px-4 py-5 text-center text-[0.86rem] text-slate">
            Add at least one appliance with a quantity and wattage to see your estimate.
          </p>
        )}

        {result.hasLoad && (
          <p className="mt-2.5 text-[0.8rem] text-slate">
            Closest {SITE.shortName} package: <b className="font-heading text-blue-deep">{result.matchingPackage}</b>
          </p>
        )}
        {result.needsSiteAssessment && (
          <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-[#f3dca9] bg-[#fff8e8] px-3 py-2 text-[0.78rem] leading-snug text-[#6b5216]">
            <IconInfo className="mt-px size-4 shrink-0" />
            A system this size usually needs a site visit and may require three-phase or parallel inverters. Our
            engineers will design it with you.
          </p>
        )}
      </div>

      <p className="mt-3 text-[0.72rem] leading-relaxed text-slate">
        This is an estimate, not a final design. It assumes ~{PEAK_SUN_HOURS} peak sun hours (typical for Nigeria) and
        standard efficiency margins. A {SITE.shortName} engineer confirms sizing after a site assessment.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <Link
          href={result.hasLoad ? `/quote?estimate=${encodeURIComponent(summary)}` : "/quote"}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-blue px-5 font-heading text-[0.92rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-blue)] transition-all hover:-translate-y-0.5 hover:bg-blue-deep"
        >
          <IconCalculator className="size-4" />
          Request a Quote for This System
          <IconArrowRight className="size-4" />
        </Link>
        <a
          href={whatsappHref(result.hasLoad ? `Hello ${SITE.shortName}, please quote for this system:\n\n${summary}` : undefined)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#bfe4cd] bg-white px-5 font-heading text-[0.9rem] font-semibold text-whatsapp transition-colors hover:border-whatsapp"
        >
          <IconWhatsApp className="size-4" />
          WhatsApp
        </a>
      </div>
      <Link
        href={`/solar-calculator?type=${input.applicationType}`}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#c9d8f2] px-4 py-2.5 text-center text-[0.84rem] font-semibold text-blue transition-colors hover:border-blue hover:bg-mist"
      >
        Need cable sizes, breakers and a full shopping list? Open the advanced calculator
        <IconArrowRight className="size-4 shrink-0" />
      </Link>
    </div>
  );
}
