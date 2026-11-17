"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/data/products";

interface Point {
  day: string;
  value: number;
  orders: number;
}

const fmtDay = (d: string, withYear = false) => new Date(`${d}T12:00:00+01:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", ...(withYear && { year: "numeric" }) });

/** Compact axis label: ₦0 / ₦500K / ₦1.2M. */
function compact(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
  return `₦${n}`;
}

/** Round the axis top up to a clean step (1, 2, 2.5, 5 × 10ⁿ). */
function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => x >= v)!;
}

/**
 * Single-series column chart of confirmed sales: one hue, thin columns with
 * a rounded data-end, hairline grid, a per-column hover/focus tooltip, and a
 * table view for screen readers and exact values.
 */
export function SalesChart({ points, unit }: { points: Point[]; unit: "day" | "week" }) {
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = niceMax(Math.max(...points.map((p) => p.value)));
  const ticks = [0, max / 2, max];
  const H = 180;
  const label = (p: Point) => (unit === "week" ? `Week of ${fmtDay(p.day)}` : fmtDay(p.day, false));

  return (
    <figure>
      <div className="relative" style={{ height: H + 28 }}>
        {/* y-axis grid + ticks */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: 28 + (t / max) * H - 6 }}>
            <span className="w-12 shrink-0 text-right text-[0.68rem] tabular-nums text-slate-light">{compact(t)}</span>
            <span className="h-px grow bg-hair" />
          </div>
        ))}
        <div className="absolute bottom-[28px] left-14 right-0 flex items-end gap-[2px]" style={{ height: H }} onMouseLeave={() => setActive(null)}>
          {points.map((p, i) => {
            const h = p.value ? Math.max(2, (p.value / max) * H) : 0;
            return (
              <button
                key={p.day}
                type="button"
                className="relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${label(p)}: ${formatNaira(p.value)} from ${p.orders} order${p.orders === 1 ? "" : "s"}`}
              >
                <span className="block w-full max-w-[24px] rounded-t-[4px] bg-blue transition-opacity" style={{ height: h, opacity: active === null || active === i ? 1 : 0.45 }} />
                {active === i && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg border border-hair bg-white px-2.5 py-1.5 text-left text-[0.74rem] shadow-[0_10px_24px_-12px_rgba(13,27,47,0.35)]"
                    style={{ [i > points.length / 2 ? "right" : "left"]: 0 }}
                  >
                    <span className="block font-semibold text-ink">{label(p)}</span>
                    <span className="block tabular-nums text-ink">{formatNaira(p.value)}</span>
                    <span className="block text-slate">
                      {p.orders} order{p.orders === 1 ? "" : "s"}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* x-axis: first, middle, last labels only */}
        <div className="absolute bottom-0 left-14 right-0 flex justify-between text-[0.68rem] text-slate-light">
          <span>{fmtDay(points[0].day)}</span>
          {points.length > 2 && <span>{fmtDay(points[Math.floor(points.length / 2)].day)}</span>}
          <span>{fmtDay(points[points.length - 1].day)}</span>
        </div>
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-2 text-[0.74rem] text-slate">
        <span>Confirmed sales per {unit}, by the date the order was placed.</span>
        <button type="button" onClick={() => setShowTable((s) => !s)} className="font-semibold text-blue hover:underline" aria-expanded={showTable}>
          {showTable ? "Hide table" : "Show as table"}
        </button>
      </figcaption>
      {showTable && (
        <div className="results-scroll mt-2 max-h-[260px] overflow-y-auto rounded-xl border border-hair">
          <table className="w-full text-left text-[0.8rem]">
            <thead className="sticky top-0 bg-white text-[0.7rem] uppercase tracking-[0.08em] text-slate">
              <tr>
                <th className="px-3 py-2 font-semibold">{unit === "week" ? "Week of" : "Day"}</th>
                <th className="px-3 py-2 text-right font-semibold">Orders</th>
                <th className="px-3 py-2 text-right font-semibold">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {points.map((p) => (
                <tr key={p.day}>
                  <td className="px-3 py-1.5">{fmtDay(p.day, true)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{p.orders}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatNaira(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
