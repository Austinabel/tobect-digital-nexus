/**
 * Shop catalogue querying: URL ⇄ filter state, filtering, sorting,
 * facet counts and pagination. Pure and framework-free so the server page
 * and the unit tests share exactly the same logic.
 */

export type AvailabilityFilter = "in-stock" | "pre-order" | "out-of-stock";
export type SortKey = "featured" | "price-asc" | "price-desc" | "name" | "newest";
export type ViewMode = "grid" | "list";

export interface CatalogueItem {
  slug: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  /** the product's category followed by its parent category, e.g. ["hybrid-inverters", "inverters"] */
  categoryPath?: string[];
  priceNgn: number;
  specs: string[];
  availability?: AvailabilityFilter;
  attributes?: Record<string, string>;
  featured?: boolean;
  addedAt?: string;
}

export interface CatalogueQuery {
  q: string;
  categories: string[];
  brands: string[];
  min?: number;
  max?: number;
  availability: AvailabilityFilter[];
  /** technical-spec filters, keyed by attribute (e.g. { capacity: ["10 kVA"] }) */
  attrs: Record<string, string[]>;
  sort: SortKey;
  view: ViewMode;
  page: number;
}

export const PAGE_SIZE = 12;
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name: A–Z" },
];
export const AVAILABILITY_OPTIONS: { key: AvailabilityFilter; label: string }[] = [
  { key: "in-stock", label: "In Stock" },
  { key: "pre-order", label: "Pre-Order" },
  { key: "out-of-stock", label: "Out of Stock" },
];

/** Spec filters per category. A facet only appears when products actually carry that attribute. */
export const SPEC_FILTERS: Record<string, { key: string; label: string }[]> = {
  "solar-panels": [
    { key: "wattage", label: "Wattage" },
    { key: "panelType", label: "Panel type" },
    { key: "technology", label: "Technology" },
  ],
  inverters: [
    { key: "capacity", label: "Capacity" },
    { key: "phase", label: "Phase" },
    { key: "inverterType", label: "Hybrid / off-grid" },
    { key: "mppt", label: "MPPT configuration" },
  ],
  "lithium-batteries": [
    { key: "voltage", label: "Voltage" },
    { key: "capacity", label: "Capacity" },
    { key: "chemistry", label: "Chemistry" },
    { key: "bms", label: "BMS rating" },
  ],
  "solar-generators": [{ key: "output", label: "Output" }],
  "cctv-security": [
    { key: "resolution", label: "Resolution" },
    { key: "cameraType", label: "Camera type" },
    { key: "connectivity", label: "Connectivity" },
    { key: "nightVision", label: "Night vision" },
  ],
  "solar-lights": [{ key: "wattage", label: "Wattage" }],
};

type Params = Record<string, string | string[] | undefined>;

function list(v: string | string[] | undefined): string[] {
  const raw = Array.isArray(v) ? v : v ? [v] : [];
  return [...new Set(raw.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean))].slice(0, 30);
}

function num(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(s.replace(/[\s,₦]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export function parseCatalogueQuery(params: Params): CatalogueQuery {
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const viewRaw = Array.isArray(params.view) ? params.view[0] : params.view;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 100);
  const attrs: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k.startsWith("spec_")) {
      const values = list(v);
      if (values.length) attrs[k.slice(5)] = values;
    }
  }
  let min = num(params.min);
  let max = num(params.max);
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    q,
    categories: list(params.category),
    brands: list(params.brand),
    min,
    max,
    availability: list(params.availability).filter((a): a is AvailabilityFilter => AVAILABILITY_OPTIONS.some((o) => o.key === a)),
    attrs,
    sort: SORT_OPTIONS.some((o) => o.key === sortRaw) ? (sortRaw as SortKey) : "featured",
    view: viewRaw === "list" ? "list" : "grid",
    page: Math.max(1, Math.min(500, num(params.page) ?? 1)),
  };
}

/** Query → URL search string. Defaults are left out so URLs stay short and canonical. */
export function catalogueSearch(query: CatalogueQuery, overrides: Partial<CatalogueQuery> = {}): string {
  const q = { ...query, ...overrides };
  const sp = new URLSearchParams();
  if (q.q) sp.set("q", q.q);
  q.categories.forEach((c) => sp.append("category", c));
  q.brands.forEach((b) => sp.append("brand", b));
  if (q.min !== undefined) sp.set("min", String(q.min));
  if (q.max !== undefined) sp.set("max", String(q.max));
  q.availability.forEach((a) => sp.append("availability", a));
  for (const [k, values] of Object.entries(q.attrs)) values.forEach((v) => sp.append(`spec_${k}`, v));
  if (q.sort !== "featured") sp.set("sort", q.sort);
  if (q.view !== "grid") sp.set("view", q.view);
  if (q.page > 1) sp.set("page", String(q.page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function hasActiveFilters(q: CatalogueQuery): boolean {
  return Boolean(
    q.q || q.categories.length || q.brands.length || q.min !== undefined || q.max !== undefined || q.availability.length || Object.keys(q.attrs).length,
  );
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function matchesText(item: CatalogueItem, q: string, categoryNames: Record<string, string>): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = [item.name, item.brand, item.model, ...item.specs, ...Object.values(item.attributes ?? {}), categoryNames[item.category] ?? item.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

type Dimension = "category" | "brand" | "price" | "availability" | "attrs" | "q";

/** Categories a product belongs to: its own and (for a subcategory) the parent's. */
const pathOf = (item: CatalogueItem) => item.categoryPath ?? [item.category];
/** The top-level category — spec filters are defined per top-level category. */
export const rootCategory = (item: CatalogueItem) => pathOf(item)[pathOf(item).length - 1];

/** Filter by everything except `skip` — facet counts use this so each facet shows what selecting it would add. */
function filterItems(items: CatalogueItem[], q: CatalogueQuery, categoryNames: Record<string, string>, skip?: Dimension, skipAttr?: string) {
  return items.filter((item) => {
    if (skip !== "q" && !matchesText(item, q.q, categoryNames)) return false;
    if (skip !== "category" && q.categories.length && !pathOf(item).some((c) => q.categories.includes(c))) return false;
    if (skip !== "brand" && q.brands.length && !(item.brand && q.brands.includes(slugify(item.brand)))) return false;
    if (skip !== "price") {
      if (q.min !== undefined && item.priceNgn < q.min) return false;
      if (q.max !== undefined && item.priceNgn > q.max) return false;
    }
    if (skip !== "availability" && q.availability.length && !(item.availability && q.availability.includes(item.availability))) return false;
    for (const [key, values] of Object.entries(q.attrs)) {
      if (skip === "attrs" && skipAttr === key) continue;
      const v = item.attributes?.[key];
      if (!v || !values.includes(v)) return false;
    }
    return true;
  });
}

function sortItems(items: CatalogueItem[], sort: SortKey): CatalogueItem[] {
  const out = [...items];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.priceNgn - b.priceNgn || a.name.localeCompare(b.name));
    case "price-desc":
      return out.sort((a, b) => b.priceNgn - a.priceNgn || a.name.localeCompare(b.name));
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return out.sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "") || a.name.localeCompare(b.name));
    default:
      return out.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

export interface Facet {
  value: string;
  label: string;
  count: number;
  /** a subcategory, shown indented under its parent */
  sub?: boolean;
}

export interface CatalogueResult<T extends CatalogueItem> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    categories: Facet[];
    brands: Facet[];
    availability: Facet[];
    specs: { key: string; label: string; values: Facet[] }[];
    priceRange: { min: number; max: number } | null;
  };
}

function countBy(items: CatalogueItem[], keyOf: (i: CatalogueItem) => string | undefined) {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = keyOf(i);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export function runCatalogueQuery<T extends CatalogueItem>(
  all: T[],
  query: CatalogueQuery,
  categoryNames: Record<string, string>,
): CatalogueResult<T> {
  const filtered = filterItems(all, query, categoryNames) as T[];
  const sorted = sortItems(filtered, query.sort) as T[];
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.page, totalPages);

  // a product counts towards its subcategory and its parent category
  const catCounts = new Map<string, number>();
  for (const i of filterItems(all, query, categoryNames, "category")) for (const c of pathOf(i)) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  const brandCounts = countBy(filterItems(all, query, categoryNames, "brand"), (i) => i.brand);
  const availCounts = countBy(filterItems(all, query, categoryNames, "availability"), (i) => i.availability);

  // Spec facets: for the selected category (or the only top-level category in view); subcategories use their parent's filters.
  const inView = new Set(filterItems(all, query, categoryNames, "attrs").map(rootCategory));
  const specCategory = query.categories.length === 1 ? query.categories[0] : inView.size === 1 ? [...inView][0] : undefined;
  const specRoot = specCategory ? all.find((i) => pathOf(i).includes(specCategory)) : undefined;
  const specList = specCategory ? SPEC_FILTERS[specCategory] ?? (specRoot ? SPEC_FILTERS[rootCategory(specRoot)] : undefined) ?? [] : [];
  const specs = specList
    .map(({ key, label }) => {
      const counts = countBy(
        filterItems(all, query, categoryNames, "attrs", key).filter((i) => pathOf(i).includes(specCategory!)),
        (i) => i.attributes?.[key],
      );
      return { key, label, values: [...counts].map(([value, count]) => ({ value, label: value, count })).sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true })) };
    })
    .filter((s) => s.values.length > 0);

  const brandNames = new Map(all.filter((i) => i.brand).map((i) => [slugify(i.brand!), i.brand!]));
  const prices = all.map((i) => i.priceNgn);

  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    page,
    totalPages,
    facets: {
      categories: [...catCounts].map(([value, count]) => ({ value, label: categoryNames[value] ?? value, count })),
      brands: [...brandNames]
        .map(([value, label]) => ({ value, label, count: brandCounts.get(label) ?? 0 }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      availability: AVAILABILITY_OPTIONS.map((o) => ({ value: o.key, label: o.label, count: availCounts.get(o.key) ?? 0 })),
      specs,
      priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    },
  };
}
