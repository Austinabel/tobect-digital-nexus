import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import { getCatalog } from "@/lib/catalog-server";
import { categoryNames } from "@/lib/catalog";
import { PAGE_SIZE, catalogueSearch, hasActiveFilters, runCatalogueQuery, type CatalogueQuery } from "@/lib/shop/catalogue-query";
import { ProductCard } from "@/components/shop/product-card";
import { CatalogueShell, CatalogueResults } from "@/components/shop/catalogue-shell";
import { FilterDrawerButton, FilterSidebar, type FilterPanelProps } from "@/components/shop/filter-panel";
import { CatalogueToolbar } from "@/components/shop/catalogue-toolbar";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { EmptyCatalogue } from "@/components/shop/empty-catalogue";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

function pageList(current: number, total: number): (number | "…")[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]));
}

function Pagination({ basePath, query, page, totalPages }: { basePath: string; query: CatalogueQuery; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${basePath}${catalogueSearch(query, { page: p })}#catalogue`;
  const box = "grid size-10 place-items-center rounded-xl border font-heading text-[0.86rem] font-semibold";
  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" aria-label="Previous page" className={cn(box, "border-hair bg-white text-ink hover:border-blue")}>
              <IconChevronLeft className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(box, "border-hair text-slate-light")}>
              <IconChevronLeft className="size-4" />
            </span>
          )}
        </li>
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-slate">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(box, p === page ? "border-blue bg-blue text-white" : "border-hair bg-white text-ink hover:border-blue")}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} rel="next" aria-label="Next page" className={cn(box, "border-hair bg-white text-ink hover:border-blue")}>
              <IconChevronRight className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(box, "border-hair text-slate-light")}>
              <IconChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

/**
 * "Shop Our Products": filter sidebar / drawer, toolbar, results and
 * pagination. All state lives in the URL; filtering runs on the server.
 */
export async function Catalogue({ query, basePath, lockedCategory, title = "Shop Our Products" }: { query: CatalogueQuery; basePath: string; lockedCategory?: string; title?: string }) {
  const effective: CatalogueQuery = lockedCategory ? { ...query, categories: [lockedCategory] } : query;
  const catalog = await getCatalog();
  const { products: PRODUCTS, categories: CATEGORIES } = catalog;
  const CATEGORY_NAMES = categoryNames(catalog);
  const result = runCatalogueQuery<Product>(PRODUCTS, effective, CATEGORY_NAMES);

  const allCounts = new Map<string, number>();
  for (const p of PRODUCTS) for (const c of p.categoryPath ?? [p.category]) allCounts.set(c, (allCounts.get(c) ?? 0) + 1);
  // top-level categories, each followed by its subcategories
  const ordered = CATEGORIES.filter((c) => !c.parent).flatMap((t) => [t, ...CATEGORIES.filter((c) => c.parent === t.slug)]);
  const lockedRoot = lockedCategory ? CATEGORIES.find((c) => c.slug === lockedCategory)?.parent ?? lockedCategory : undefined;

  const facets: FilterPanelProps["facets"] = {
    ...result.facets,
    // Every category is listed (with its count), even before it has products; subcategories follow their parent.
    categories: ordered.map((c) => ({ value: c.slug, label: c.name, count: result.facets.categories.find((f) => f.value === c.slug)?.count ?? 0, ...(c.parent ? { sub: true } : {}) })),
  };
  const categoryLinks = lockedCategory
    ? [
        { slug: "all", name: "All Products", href: "/shop#catalogue", count: PRODUCTS.length, active: false },
        // every top-level category; the subcategories of the one being viewed are listed under it
        ...ordered
          .filter((c) => !c.parent || c.parent === lockedRoot)
          .map((c) => ({ slug: c.slug, name: c.name, href: `/shop/${c.slug}#catalogue`, count: allCounts.get(c.slug) ?? 0, active: c.slug === lockedCategory, ...(c.parent ? { sub: true } : {}) })),
        { slug: "installation-kits", name: "Installation Kits", href: "/shop/installation-kits", count: catalog.kits.length, active: false },
      ]
    : undefined;

  const activeCount =
    query.categories.length + query.brands.length + query.availability.length + Object.values(query.attrs).flat().length + (query.min !== undefined || query.max !== undefined ? 1 : 0) + (query.q ? 1 : 0);
  const panel: FilterPanelProps = { basePath, query, facets, categoryLinks, activeCount };
  const from = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(result.total, result.page * PAGE_SIZE);
  const filtered = hasActiveFilters(query);

  return (
    <section id="catalogue" aria-labelledby="catalogue-title" className="scroll-mt-20 bg-white py-8 lg:py-10">
      <CatalogueShell>
        <div className="mx-auto grid max-w-[1240px] gap-6 px-4 sm:px-6 lg:grid-cols-[250px_1fr] lg:px-9">
          <FilterSidebar {...panel} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="flex items-center gap-2 font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red">
                  <span aria-hidden className="h-0.5 w-6 rounded bg-red" />
                  {query.q ? "Search results" : lockedCategory ? CATEGORY_NAMES[lockedCategory] : "All Products"}
                </span>
                <h2 id="catalogue-title" className="mt-1 font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight text-ink">
                  {query.q ? <>Results for &ldquo;{query.q}&rdquo;</> : title}
                </h2>
                <p className="mt-0.5 text-[0.86rem] text-slate" aria-live="polite">
                  {result.total > 0 ? (
                    <>
                      Showing {from}–{to} of {result.total} {result.total === 1 ? "product" : "products"}
                    </>
                  ) : (
                    "No products match"
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FilterDrawerButton {...panel} />
                <CatalogueToolbar basePath={basePath} query={query} />
              </div>
            </div>

            <CatalogueResults>
              <div className="mt-5">
                {result.items.length > 0 ? (
                  query.view === "list" ? (
                    <div className="grid gap-3">
                      {result.items.map((p) => (
                        <ProductCard key={p.slug} product={p} layout="list" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                      {result.items.map((p, i) => (
                        <ProductCard key={p.slug} product={p} priority={i < 4} />
                      ))}
                    </div>
                  )
                ) : filtered ? (
                  <EmptyCatalogue
                    title="No products match these filters"
                    message="Try removing a filter, or tell us what you need — not everything we supply is listed online yet."
                    whatsappMessage={`Hello Tobecat, I'm looking for${query.q ? `: ${query.q}` : " a product that isn't listed on your website"}.`}
                  />
                ) : (
                  <EmptyCatalogue
                    title={lockedCategory ? `${CATEGORY_NAMES[lockedCategory]} — ask for current models` : "No products listed yet"}
                    message="We supply these, but they aren't listed online yet. Message us for the models in stock and today's prices."
                    whatsappMessage={`Hello Tobecat, which ${lockedCategory ? CATEGORY_NAMES[lockedCategory].toLowerCase() : "products"} do you have in stock, and at what price?`}
                  />
                )}
              </div>
              <Pagination basePath={basePath} query={query} page={result.page} totalPages={result.totalPages} />
              {result.items.length > 0 && <CatalogueNotice className="mt-6" />}
            </CatalogueResults>
          </div>
        </div>
      </CatalogueShell>
    </section>
  );
}
