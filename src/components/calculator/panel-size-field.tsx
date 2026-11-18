"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PANEL_WATT_OPTIONS, PANEL_WATT_RANGE, cleanPanelWatt, type PanelWatt } from "@/lib/calculator";
import { fieldClass } from "@/components/marketing/solar-calculator";

const CUSTOM = "custom";
const isListed = (w: number) => (PANEL_WATT_OPTIONS as readonly number[]).includes(w);

/**
 * Panel size picker: the common sizes in a dropdown, plus "Custom size…"
 * which opens a box for any other rating (e.g. 410 W).
 */
export function PanelSizeField({
  value,
  onChange,
  label = "Panel size",
  optionSuffix = "",
  className,
}: {
  value: PanelWatt;
  onChange: (watt: PanelWatt) => void;
  label?: string;
  optionSuffix?: string;
  className?: string;
}) {
  const id = useId();
  const box = useRef<HTMLInputElement>(null);
  const [custom, setCustom] = useState(() => !isListed(value));
  const [draft, setDraft] = useState(() => (isListed(value) ? "" : String(value)));
  // a shared design or reset can bring in a size that is not in the list
  const isCustom = custom || !isListed(value);
  const text = custom ? draft : String(value);
  const showError = isCustom && text.trim() !== "" && cleanPanelWatt(text) === null;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate">
        {label}
      </label>
      <select
        id={id}
        value={isCustom ? CUSTOM : String(value)}
        onChange={(e) => {
          if (e.target.value === CUSTOM) {
            setCustom(true);
            setDraft(String(value));
            requestAnimationFrame(() => box.current?.select());
            return;
          }
          setCustom(false);
          onChange(Number(e.target.value));
        }}
        className={cn(fieldClass, "cursor-pointer font-semibold")}
      >
        {PANEL_WATT_OPTIONS.map((w) => (
          <option key={w} value={w}>
            {w} W{optionSuffix}
          </option>
        ))}
        <option value={CUSTOM}>Custom size…</option>
      </select>
      {isCustom && (
        <span className="relative mt-2 block">
          <input
            type="number"
            inputMode="numeric"
            min={PANEL_WATT_RANGE.min}
            max={PANEL_WATT_RANGE.max}
            step={5}
            ref={box}
            aria-label="Custom panel size in watts"
            aria-invalid={showError || undefined}
            placeholder="e.g. 410"
            value={text}
            onChange={(e) => {
              setCustom(true);
              setDraft(e.target.value);
              const w = cleanPanelWatt(e.target.value);
              if (w !== null) onChange(w);
            }}
            className={cn(fieldClass, "pr-10", showError && "border-red")}
          />
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.8rem] text-slate">
            W
          </span>
        </span>
      )}
      {showError && (
        <p className="mt-1 text-[0.76rem] text-red-dark">
          Enter a size between {PANEL_WATT_RANGE.min} and {PANEL_WATT_RANGE.max} W.
        </p>
      )}
    </div>
  );
}
