"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { findKit, kitCatalogueFrom } from "@/lib/data/kits";
import { formatNaira } from "@/lib/data/products";
import { useCatalog } from "@/components/catalog-provider";
import { findProduct } from "@/lib/catalog";
import { describeKitConfig, kitAvailability, normaliseKitConfig, priceKit, validateKitConfig, type KitConfig } from "@/lib/shop/kits";
import { KitAddButton } from "@/components/shop/kit-add-button";
import { AvailabilityBadge } from "@/components/shop/availability-badge";
import { IconMinus, IconPlus, IconQuote, IconCheck, IconInfo } from "@/components/icons";

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex h-10 items-center rounded-full border-[1.5px] border-hair bg-white" role="group" aria-label={label}>
      <button type="button" aria-label={`Fewer — ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-full w-11 place-items-center text-slate hover:text-blue disabled:opacity-35">
        <IconMinus className="size-3.5" />
      </button>
      <span className="w-8 text-center font-heading font-bold tabular-nums text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={`More — ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-full w-11 place-items-center text-slate hover:text-blue disabled:opacity-35">
        <IconPlus className="size-3.5" />
      </button>
    </div>
  );
}

/** Component-by-component kit builder with live price, summary and compatibility checks. */
export function KitConfigurator({ slug }: { slug: string }) {
  // Live catalogue (from the database), shared via <CatalogProvider>.
  const catalog = useCatalog();
  const kitCatalogue = useMemo(() => kitCatalogueFrom(catalog.products), [catalog]);
  const getProduct = (slug: string) => findProduct(catalog, slug);
  const kit = findKit(catalog.kits, slug)!;
  const [config, setConfig] = useState<KitConfig>(() => normaliseKitConfig(kit));
  const [kits, setKits] = useState(1);

  const price = useMemo(() => priceKit(kit, config, kitCatalogue), [kit, config, kitCatalogue]);
  const { errors } = useMemo(() => validateKitConfig(kit, config, kitCatalogue), [kit, config, kitCatalogue]);
  const availability = kitAvailability(kit, config, kitCatalogue);
  const summary = describeKitConfig(kit, config, kitCatalogue);

  const update = (next: Partial<KitConfig>) => setConfig((c) => ({ ...c, ...next }));
  const quoteText = [`Quote request: ${kits} × ${kit.name}`, "", ...summary.map((s) => `- ${s}`), "", `Website price (main components): ${formatNaira(price.totalNgn)} per kit`].join("\n");

  return (
    <div className="rounded-3xl border border-hair bg-white p-5 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-6">
      <h2 className="font-heading text-[1.1rem] font-bold text-ink">Customise your kit</h2>
      <p className="mt-0.5 text-[0.84rem] text-slate">Change components and quantities — the price and summary update as you go.</p>

      <div className="mt-5 space-y-4">
        {kit.slots.map((slot) => {
          const chosen = getProduct(config.choices[slot.key]);
          return (
            <fieldset key={slot.key} className="rounded-2xl border border-hair p-3.5">
              <legend className="px-1 font-heading text-[0.8rem] font-bold uppercase tracking-[0.08em] text-slate">{slot.label}</legend>
              {slot.choices.length > 1 ? (
                <div className="grid gap-2">
                  {slot.choices.map((choice) => {
                    const p = getProduct(choice);
                    if (!p) return null;
                    const on = config.choices[slot.key] === choice;
                    return (
                      <label key={choice} className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-[0.88rem]", on ? "border-blue bg-mist" : "border-hair hover:border-[#c9d8f2]")}>
                        <span className="flex items-center gap-2.5">
                          <input type="radio" name={`slot-${slot.key}`} checked={on} onChange={() => update({ choices: { ...config.choices, [slot.key]: choice } })} className="accent-[var(--color-blue)]" />
                          <span className="font-semibold text-ink">{p.name}</span>
                        </span>
                        <span className="tabular-nums text-slate">{formatNaira(p.priceNgn)}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                chosen && (
                  <p className="flex flex-wrap items-baseline justify-between gap-2 text-[0.9rem]">
                    <Link href={`/product/${chosen.slug}`} className="font-semibold text-ink hover:text-blue">
                      {chosen.name}
                    </Link>
                    <span className="tabular-nums text-slate">{formatNaira(chosen.priceNgn)} each</span>
                  </p>
                )
              )}
              {slot.quantity.min < slot.quantity.max ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[0.8rem] text-slate">
                    Quantity ({slot.quantity.min}–{slot.quantity.max})
                  </span>
                  <Stepper
                    label={`${slot.label} quantity`}
                    value={config.quantities[slot.key]}
                    min={slot.quantity.min}
                    max={slot.quantity.max}
                    onChange={(n) => update({ quantities: { ...config.quantities, [slot.key]: n } })}
                  />
                </div>
              ) : (
                <p className="mt-2 text-[0.8rem] text-slate">Quantity: {config.quantities[slot.key]}</p>
              )}
            </fieldset>
          );
        })}

        {kit.addons.length > 0 && (
          <fieldset className="rounded-2xl border border-hair p-3.5">
            <legend className="px-1 font-heading text-[0.8rem] font-bold uppercase tracking-[0.08em] text-slate">Optional extras</legend>
            <div className="grid gap-2">
              {kit.addons.map((a) => {
                const on = config.addons.includes(a.key);
                const addonPrice = a.productSlug ? getProduct(a.productSlug)?.priceNgn : a.priceNgn;
                return (
                  <label key={a.key} className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[0.86rem]", on ? "border-blue bg-mist" : "border-hair")}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => update({ addons: on ? config.addons.filter((x) => x !== a.key) : [...config.addons, a.key].sort() })}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--color-blue)]"
                    />
                    <span className="grow">
                      <span className="block font-semibold text-ink">{a.label}</span>
                      {a.description && <span className="block text-[0.78rem] text-slate">{a.description}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate">{addonPrice !== undefined ? formatNaira(addonPrice) : "Quoted"}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-field p-4">
        <h3 className="font-heading text-[0.86rem] font-bold text-ink">Your configuration</h3>
        <ul className="mt-2 space-y-1 text-[0.84rem]">
          {price.lines.map((l) => (
            <li key={l.slotKey} className="flex justify-between gap-3">
              <span className="text-ink">
                {l.quantity} × {l.productName}
              </span>
              <span className="shrink-0 tabular-nums text-slate">{formatNaira(l.totalNgn)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3">
            <span className="text-ink">Installation accessories</span>
            <span className="text-right text-slate">{kit.accessoriesPriceNgn !== undefined ? formatNaira(kit.accessoriesPriceNgn) : "Included · confirmed with order"}</span>
          </li>
          {price.addons.map((a) => (
            <li key={a.key} className="flex justify-between gap-3">
              <span className="text-ink">{a.label}</span>
              <span className="shrink-0 tabular-nums text-slate">{a.priceNgn !== undefined ? formatNaira(a.priceNgn) : "Quoted"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-hair pt-3">
          <span className="font-semibold text-ink">Kit price</span>
          <span className="font-heading text-[1.6rem] font-extrabold tabular-nums text-red-dark">{formatNaira(price.totalNgn)}</span>
        </div>
        {price.hasUnpricedParts && <p className="text-right text-[0.74rem] text-slate">Main components. Accessories{config.addons.length ? " and quoted extras" : ""} are confirmed before you pay.</p>}
        <div className="mt-2 flex justify-end">
          <AvailabilityBadge availability={availability} />
        </div>
      </div>

      {errors.length > 0 ? (
        <ul role="alert" className="mt-4 space-y-1 rounded-xl border border-red/30 bg-red/5 px-3.5 py-3 text-[0.82rem] text-red-dark">
          {errors.map((e) => (
            <li key={e} className="flex gap-2">
              <IconInfo className="mt-px size-4 shrink-0" />
              {e}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-[0.8rem] font-semibold text-[#17733b]">
          <IconCheck className="size-4" /> Components are compatible with this kit
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Stepper label="Number of kits" value={kits} min={1} max={20} onChange={setKits} />
        <KitAddButton slug={kit.slug} name={kit.name} config={config} quantity={kits} size="lg" disabled={errors.length > 0} className="grow" />
      </div>
      <Link
        href={`/quote?estimate=${encodeURIComponent(quoteText)}`}
        className="mt-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] font-heading text-[0.9rem] font-semibold text-blue transition-colors hover:border-blue"
      >
        <IconQuote className="size-4" />
        Request a Quote for this configuration
      </Link>
    </div>
  );
}
