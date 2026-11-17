"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCatalogueNav } from "@/components/shop/catalogue-shell";
import { IconGrid, IconList } from "@/components/icons";
import { SORT_OPTIONS, catalogueSearch, type CatalogueQuery, type SortKey } from "@/lib/shop/catalogue-query";

export function CatalogueToolbar({ basePath, query }: { basePath: string; query: CatalogueQuery }) {
  const { navigate } = useCatalogueNav();
  const href = (o: Partial<CatalogueQuery>) => `${basePath}${catalogueSearch(query, { page: 1, ...o })}#catalogue`;

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-[0.8rem] text-slate">
        <span className="hidden sm:inline">Sort by:</span>
        <select
          value={query.sort}
          onChange={(e) => navigate(href({ sort: e.target.value as SortKey }))}
          aria-label="Sort products"
          className="h-10 max-w-[150px] rounded-xl border border-hair bg-white px-2 text-[0.84rem] font-semibold text-ink outline-none focus:border-blue sm:max-w-none sm:px-2.5"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex rounded-xl border border-hair bg-white p-0.5" role="group" aria-label="Layout">
        {(
          [
            ["grid", IconGrid, "Grid view"],
            ["list", IconList, "List view"],
          ] as const
        ).map(([mode, Icon, label]) => (
          <Link
            key={mode}
            href={href({ view: mode, page: query.page })}
            onClick={(e) => {
              e.preventDefault();
              navigate(href({ view: mode, page: query.page }));
            }}
            aria-label={label}
            aria-pressed={query.view === mode}
            className={cn("grid size-10 place-items-center rounded-[10px]", query.view === mode ? "bg-blue text-white" : "text-slate hover:text-blue")}
          >
            <Icon className="size-[18px]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
