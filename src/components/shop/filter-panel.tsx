"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useCatalogueNav } from "@/components/shop/catalogue-shell";
import { IconChevronDown, IconClose, IconFilter } from "@/components/icons";
import type { CatalogueQuery, Facet } from "@/lib/shop/catalogue-query";

export interface FilterPanelProps {
  basePath: string;
  query: CatalogueQuery;
  facets: {
    categories: Facet[];
    brands: Facet[];
    availability: Facet[];
    specs: { key: string; label: string; values: Facet[] }[];
    priceRange: { min: number; max: number } | null;
  };
  /** on a category page the category list is navigation, not a checkbox filter */
  categoryLinks?: { slug: string; name: string; href: string; count: number; active: boolean; sub?: boolean }[];
  activeCount: number;
}

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-t border-hair py-3 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-[0.88rem] font-bold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <IconChevronDown className="size-4 text-slate transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2.5">{children}</div>
    </details>
  );
}

function Check({ name, value, label, count, checked, sub }: { name: string; value: string; label: string; count: number; checked: boolean; sub?: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-[0.86rem] hover:bg-field", sub && "ml-5 text-[0.82rem]", count === 0 && !checked && "opacity-50")}>
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="size-5 shrink-0 accent-[var(--color-blue)]" />
      <span className="grow text-ink">{label}</span>
      <span className="text-[0.76rem] tabular-nums text-slate-light">({count})</span>
    </label>
  );
}

/** Filter form shared by the desktop sidebar and the mobile drawer. */
function FilterForm({ basePath, query, facets, categoryLinks, autoApply, onApplied }: FilterPanelProps & { autoApply: boolean; onApplied?: () => void }) {
  const { navigate } = useCatalogueNav();
  const formRef = useRef<HTMLFormElement>(null);
  const [brandsExpanded, setBrandsExpanded] = useState(false);

  const hrefFromForm = (form: HTMLFormElement) => {
    const sp = new URLSearchParams();
    for (const [k, v] of new FormData(form).entries()) {
      const s = String(v).trim();
      if (s) sp.append(k, s);
    }
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}#catalogue`;
  };
  const apply = () => {
    if (!formRef.current) return;
    navigate(hrefFromForm(formRef.current));
    onApplied?.();
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apply();
  };

  const brands = brandsExpanded ? facets.brands : facets.brands.slice(0, 7);
  const keep = { q: query.q, sort: query.sort !== "featured" ? query.sort : "", view: query.view !== "grid" ? query.view : "" };

  return (
    <form
      ref={formRef}
      action={basePath}
      method="get"
      onSubmit={onSubmit}
      onChange={(e) => {
        // Checkboxes apply instantly on desktop; typed prices wait for Apply / Enter.
        const target = e.target as EventTarget;
        if (autoApply && target instanceof HTMLInputElement && target.type === "checkbox") apply();
      }}
      // Re-mount on URL change so defaultChecked reflects the current filters.
      key={JSON.stringify(query)}
    >
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}

      <Group title="Category">
        {categoryLinks ? (
          <ul className="space-y-0.5">
            {categoryLinks.map((c) => (
              <li key={c.slug}>
                <Link
                  href={c.href}
                  aria-current={c.active ? "page" : undefined}
                  className={cn("flex justify-between rounded-lg px-1 py-2 text-[0.86rem] hover:bg-field", c.sub && "ml-4 text-[0.82rem]", c.active ? "font-bold text-blue" : "text-ink")}
                >
                  {c.name}
                  <span className="text-[0.76rem] font-normal text-slate-light">({c.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          facets.categories.map((f) => <Check key={f.value} name="category" value={f.value} label={f.label} count={f.count} sub={f.sub} checked={query.categories.includes(f.value)} />)
        )}
      </Group>

      {facets.brands.length > 0 && (
        <Group title="Brand">
          {brands.map((f) => (
            <Check key={f.value} name="brand" value={f.value} label={f.label} count={f.count} checked={query.brands.includes(f.value)} />
          ))}
          {facets.brands.length > 7 && (
            <button type="button" onClick={() => setBrandsExpanded((x) => !x)} className="mt-1 px-1 text-[0.8rem] font-semibold text-blue hover:underline">
              {brandsExpanded ? "Show less" : `Show all ${facets.brands.length}`}
            </button>
          )}
        </Group>
      )}

      <Group title="Price Range (₦)">
        <div className="grid grid-cols-2 gap-2">
          {(["min", "max"] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1 block text-[0.72rem] font-semibold text-slate">{k === "min" ? "Minimum" : "Maximum"}</span>
              <input
                type="number"
                name={k}
                inputMode="numeric"
                min={0}
                step={1000}
                defaultValue={query[k] ?? ""}
                placeholder={facets.priceRange ? `₦${(k === "min" ? facets.priceRange.min : facets.priceRange.max).toLocaleString("en-NG")}` : k === "min" ? "₦0" : "Any"}
                className="h-10 w-full rounded-lg border border-hair px-2.5 text-[0.84rem] tabular-nums outline-none focus:border-blue"
              />
            </label>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        {facets.availability.map((f) => (
          <Check key={f.value} name="availability" value={f.value} label={f.label} count={f.count} checked={query.availability.includes(f.value as never)} />
        ))}
        <p className="mt-1.5 px-1 text-[0.72rem] leading-snug text-slate">Products without a status need availability confirmed by our team.</p>
      </Group>

      {facets.specs.map((spec) => (
        <Group key={spec.key} title={spec.label}>
          {spec.values.map((f) => (
            <Check key={f.value} name={`spec_${spec.key}`} value={f.value} label={f.label} count={f.count} checked={query.attrs[spec.key]?.includes(f.value) ?? false} />
          ))}
        </Group>
      ))}

      <div className="sticky bottom-0 -mx-1 mt-2 grid gap-2 bg-white px-1 pb-1 pt-3">
        <button type="submit" className="h-11 rounded-xl bg-red font-heading text-[0.9rem] font-semibold text-white hover:bg-red-dark">
          Apply Filters
        </button>
      </div>
    </form>
  );
}

function ClearAll({ basePath, query, onDone }: { basePath: string; query: CatalogueQuery; onDone?: () => void }) {
  const { navigate } = useCatalogueNav();
  const sp = new URLSearchParams();
  if (query.sort !== "featured") sp.set("sort", query.sort);
  if (query.view !== "grid") sp.set("view", query.view);
  const href = `${basePath}${sp.size ? `?${sp}` : ""}#catalogue`;
  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
        onDone?.();
      }}
      className="text-[0.8rem] font-semibold text-red hover:underline"
    >
      Clear All
    </Link>
  );
}

export function FilterSidebar(props: FilterPanelProps) {
  return (
    <aside aria-label="Filter products" className="hidden self-start rounded-2xl border border-hair bg-white p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-[1rem] font-bold text-ink">
          <IconFilter className="size-4 text-blue" />
          Filter Products
        </h2>
        {props.activeCount > 0 && <ClearAll basePath={props.basePath} query={props.query} />}
      </div>
      <FilterForm {...props} autoApply />
    </aside>
  );
}

export function FilterDrawerButton(props: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-hair bg-white px-3.5 font-heading text-[0.84rem] font-semibold text-ink hover:border-blue"
      >
        <IconFilter className="size-4 text-blue" />
        Filters
        {props.activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-blue text-[0.68rem] text-white">{props.activeCount}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filter products">
          <button type="button" aria-label="Close filters" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-hair px-4 py-3">
              <h2 className="font-heading text-[1.02rem] font-bold text-ink">Filter Products</h2>
              <div className="flex items-center gap-3">
                {props.activeCount > 0 && <ClearAll basePath={props.basePath} query={props.query} onDone={() => setOpen(false)} />}
                <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full hover:bg-field">
                  <IconClose className="size-5" />
                </button>
              </div>
            </div>
            <div className="grow overflow-y-auto px-4 pb-4">
              <FilterForm {...props} autoApply={false} onApplied={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
