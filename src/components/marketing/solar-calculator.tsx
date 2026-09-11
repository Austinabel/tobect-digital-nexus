"use client";

import { useMemo, useState } from "react";
import {
  APPLIANCES,
  DEFAULT_SELECTION,
  computeSystemEstimate,
  type ApplianceId,
} from "@/lib/calculator";
import { IconCalculator, IconArrowRight } from "@/components/icons";

function ResultCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white p-3">
      <dt className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-slate">{label}</dt>
      <dd className={`mt-[3px] font-heading text-[0.98rem] font-bold tabular-nums ${highlight ? "text-blue" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}

export function SolarCalculator() {
  const [selected, setSelected] = useState<Set<ApplianceId>>(new Set(DEFAULT_SELECTION));

  const result = useMemo(() => computeSystemEstimate(selected), [selected]);

  function toggle(id: ApplianceId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      id="calculator"
      className="flex flex-col rounded-3xl border border-[#d5e2f4] bg-gradient-to-br from-[#f1f6ff] to-[#e4edfb] p-6 shadow-[0_20px_44px_-22px_rgba(13,27,47,0.2)] sm:p-8"
    >
      <span className="inline-flex items-center gap-2 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-blue">
        <IconCalculator className="size-[15px]" />
        Solar Calculator
      </span>
      <h3 className="mt-2.5 font-heading text-[1.3rem] font-bold text-ink">Not sure what you need?</h3>
      <p className="mt-1 text-[0.88rem] text-slate">
        Tell us what you want to power and get a personalized system recommendation.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Appliances to power">
        {APPLIANCES.map((appliance) => {
          const pressed = selected.has(appliance.id);
          return (
            <button
              key={appliance.id}
              type="button"
              id={`chip-${appliance.id}`}
              aria-pressed={pressed}
              onClick={() => toggle(appliance.id)}
              className={`rounded-full border-[1.5px] px-3 py-1.5 font-body text-[0.8rem] font-semibold transition-colors ${
                pressed
                  ? "border-blue bg-blue text-white"
                  : "border-[#cdddf1] bg-white/75 text-slate hover:border-blue hover:text-ink"
              }`}
            >
              {appliance.name}
            </button>
          );
        })}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-[#d5e2f4] bg-[#d5e2f4]">
        {result.hasSelection ? (
          <>
            <ResultCell label="Peak load" value={`${result.peakLoadKw.toFixed(1)} kW`} />
            <ResultCell label="Daily energy" value={`${result.dailyEnergyKwh.toFixed(1)} kWh`} />
            <ResultCell label="Inverter" value={`${result.inverterKva} kVA`} />
            <ResultCell label="Battery" value={`${result.batteryKwhLow}–${result.batteryKwhHigh} kWh`} />
            <ResultCell label="Panels" value={`${result.panelCountLow}–${result.panelCountHigh} × ${result.panelWatt}W`} />
            <ResultCell label="Closest package" value={result.matchingPackage ?? "—"} highlight />
          </>
        ) : (
          <>
            <ResultCell label="Status" value="Pick an appliance" />
            <ResultCell label=" " value=" " />
          </>
        )}
      </dl>

      <p className="mt-3 text-[0.72rem] text-slate">
        Estimate based on typical Nigerian usage (~4.4 peak sun hours). A site assessment confirms the details.
      </p>

      <a
        href="/quote"
        className="mt-4 inline-flex w-fit items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-heading text-[0.92rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-22px_rgba(13,27,47,0.35)]"
      >
        Calculate Now
        <IconArrowRight className="size-4" />
      </a>
    </div>
  );
}
