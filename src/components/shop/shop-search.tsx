"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconSearch } from "@/components/icons";

export interface SearchSuggestion {
  label: string;
  kind: "Product" | "Brand" | "Category" | "Kit";
  href: string;
  /** extra words to match on (brand, specs…) */
  keywords?: string;
}

const POPULAR = ["Inverter", "Lithium Battery", "Solar Panel", "Generator", "CCTV"];

/**
 * Shop search with product / brand / category autocomplete (ARIA combobox).
 * Suggestions come from the real catalogue, passed in by the server. A plain
 * submit runs a full catalogue search, so it still works without JavaScript.
 */
export function ShopSearch({ suggestions, defaultValue = "" }: { suggestions: SearchSuggestion[]; defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return suggestions
      .filter((s) => {
        const hay = `${s.label} ${s.keywords ?? ""} ${s.kind}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 7);
  }, [value, suggestions]);

  const go = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query)}#catalogue`);
  };

  return (
    <div>
      <form
        action="/shop"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (open && active >= 0 && matches[active]) {
            setOpen(false);
            router.push(matches[active].href);
          } else go(value);
        }}
        className="relative"
      >
        <label htmlFor="shop-search" className="sr-only">
          Search products, brands or models
        </label>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" />
        <input
          ref={inputRef}
          id="shop-search"
          name="q"
          type="search"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(matches.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search products, brands or models…"
          className="h-14 w-full rounded-full border border-white/30 bg-white pl-12 pr-[7.5rem] text-[0.95rem] text-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] outline-none placeholder:text-slate-light focus:ring-4 focus:ring-blue/30 sm:text-[1rem]"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-full bg-red px-6 font-heading text-[0.92rem] font-semibold text-white transition-colors hover:bg-red-dark"
        >
          Search
        </button>

        {open && matches.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-hair bg-white py-1.5 shadow-[0_30px_60px_-20px_rgba(13,27,47,0.45)]"
          >
            {matches.map((s, i) => (
              <li
                key={`${s.kind}-${s.href}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  router.push(s.href);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn("flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[0.92rem]", i === active ? "bg-mist" : "")}
              >
                <span className="truncate font-semibold text-ink">{s.label}</span>
                <span className="shrink-0 rounded-full bg-field px-2 py-0.5 text-[0.68rem] font-semibold text-slate">{s.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 text-[0.8rem] [scrollbar-width:none] sm:mx-0 sm:px-0 lg:mt-3.5 lg:flex-wrap [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 font-semibold text-white/70">Popular:</span>
        {POPULAR.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setValue(term);
              go(term);
            }}
            className="inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-3.5 font-semibold text-white transition-colors hover:bg-white/20"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
