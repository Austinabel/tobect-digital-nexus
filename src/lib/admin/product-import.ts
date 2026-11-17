/**
 * Bulk product import from a spreadsheet (CSV or Excel). Pure and
 * unit-tested (product-import.test.ts): turns sheet rows into the same
 * fields the product form submits, then validates them with the same rules
 * (parseProductForm + duplicate detection), so an import can never create a
 * product the form would refuse.
 */
import { SPEC_FILTERS } from "../shop/catalogue-query";
import { parseProductForm, slugify, MAX_IMAGES, type ProductRowInput } from "./product-form";
import { findDuplicates, type DuplicateMatch, type ExistingProduct } from "./product-dedupe";

export const MAX_IMPORT_ROWS = 500;

/** Columns staff can use, with the header names we recognise for each (any case, spaces or underscores). */
export const IMPORT_COLUMNS: { key: string; label: string; aliases: string[]; required?: boolean; help: string }[] = [
  { key: "name", label: "name", aliases: ["product name", "title", "product"], required: true, help: "Product name, e.g. Deye 8kW Hybrid Inverter" },
  { key: "category", label: "category", aliases: ["category slug", "subcategory"], required: true, help: "Category or subcategory name (or its web address), e.g. Inverters or Hybrid Inverters" },
  { key: "price", label: "price", aliases: ["price ngn", "price (ngn)", "selling price", "amount"], required: true, help: "Price in naira, e.g. 985000" },
  { key: "brand", label: "brand", aliases: ["make", "manufacturer"], help: "e.g. Deye" },
  { key: "model", label: "model", aliases: ["model number", "model no", "model no."], help: "Exactly as on the label" },
  { key: "sku", label: "sku", aliases: ["code", "product code", "item code"], help: "Your own code (optional, unique)" },
  { key: "barcode", label: "barcode", aliases: ["ean", "upc", "gtin", "ean13"], help: "EAN/UPC digits (optional, unique)" },
  { key: "compare_at_price", label: "previous_price", aliases: ["previous price", "old price", "was price", "compare at price"], help: "Only for a genuine reduction" },
  { key: "availability", label: "availability", aliases: ["stock status", "status"], help: "in stock / pre-order / out of stock (or empty)" },
  { key: "stock_quantity", label: "stock", aliases: ["quantity", "qty", "units", "stock quantity"], help: "Units in stock (empty = not tracked)" },
  { key: "specs", label: "key_specs", aliases: ["specs", "key specs", "features"], help: "Up to 8, separated by commas, e.g. 8 kW, Hybrid, 48 V" },
  { key: "description", label: "description", aliases: ["details", "long description"], help: "Shown on the product page" },
  { key: "image_urls", label: "image_urls", aliases: ["images", "image", "image url", "image link", "image links", "photo", "photos"], help: `Up to ${MAX_IMAGES} image links, separated by spaces or |` },
  { key: "published", label: "published", aliases: ["live", "visible", "publish"], help: "yes / no (empty = the choice on the import page)" },
  { key: "featured", label: "featured", aliases: ["homepage"], help: "yes / no" },
  { key: "inv_battery_v", label: "battery_voltage", aliases: ["battery v", "battery voltage (v)"], help: "Inverters: 12, 24 or 48" },
  { key: "inv_max_pv_v", label: "max_pv_voltage", aliases: ["max pv v", "max pv input"], help: "Inverters: max PV input voltage" },
  { key: "inv_mppt_min_v", label: "mppt_min_voltage", aliases: ["mppt min v", "mppt minimum"], help: "Inverters: lowest MPPT voltage" },
  { key: "seo_title", label: "seo_title", aliases: ["search title"], help: "Optional" },
  { key: "seo_description", label: "seo_description", aliases: ["search description", "meta description"], help: "Optional" },
];

/** Every spec-filter column ("capacity", "wattage", …) across categories, by key and label. */
export function specColumns(): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const list of Object.values(SPEC_FILTERS)) for (const s of list) if (!seen.has(s.key)) seen.set(s.key, s.label);
  return [...seen].map(([key, label]) => ({ key, label }));
}

const norm = (h: string) => h.toLowerCase().replace(/[\s_\-()./]+/g, " ").trim();

/* ---------------------------------------------------------------- CSV */

/** RFC-4180 CSV with quotes, embedded commas/newlines, a BOM, and comma / semicolon / tab detection. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1] as const);
  const delim = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ---------------------------------------------------------------- sheet → records */

export interface SheetRecords {
  /** column key per sheet column (null = not recognised) */
  columns: (string | null)[];
  unknownHeaders: string[];
  missingRequired: string[];
  /** one entry per data row, with its line number in the sheet (header = line 1) */
  records: { line: number; values: Record<string, string> }[];
}

export function sheetToRecords(rows: string[][]): SheetRecords {
  const [header = [], ...body] = rows;
  const specs = specColumns();
  const columns = header.map((h) => {
    const n = norm(String(h ?? ""));
    if (!n) return null;
    const col = IMPORT_COLUMNS.find((c) => norm(c.label) === n || norm(c.key) === n || c.aliases.some((a) => norm(a) === n));
    if (col) return col.key;
    const spec = specs.find((s) => norm(s.key) === n || norm(s.label) === n);
    return spec ? `attr_${spec.key}` : null;
  });
  const unknownHeaders = header.filter((h, i) => String(h ?? "").trim() && columns[i] === null).map((h) => String(h).trim());
  const missingRequired = IMPORT_COLUMNS.filter((c) => c.required && !columns.includes(c.key)).map((c) => c.label);
  const records = body.map((r, i) => {
    const values: Record<string, string> = {};
    columns.forEach((key, ci) => {
      if (key) values[key] = String(r[ci] ?? "").trim();
    });
    return { line: i + 2, values };
  });
  return { columns, unknownHeaders, missingRequired, records };
}

/* ---------------------------------------------------------------- validation */

export interface ImportCategory {
  slug: string;
  name: string;
  parent: string | null;
}

export type RowStatus = "ready" | "duplicate" | "possible-duplicate" | "error" | "skipped";

export interface ImportRow {
  line: number;
  status: RowStatus;
  name: string;
  messages: string[];
  /** the form fields to submit for this row (ready / possible-duplicate rows) */
  fields?: Record<string, string>;
  imageUrls: string[];
  duplicateOf?: DuplicateMatch;
  value?: Omit<ProductRowInput, "imageIds">;
}

const YES = /^(y|yes|true|1|live|published|on)$/i;
const NO = /^(n|no|false|0|draft|off|hidden)$/i;

export function resolveCategory(input: string, cats: ImportCategory[]): ImportCategory | null {
  const raw = input.trim();
  if (!raw) return null;
  // "Inverters > Hybrid Inverters" or "Inverters / Hybrid Inverters"
  const parts = raw.split(/\s*[>/›]\s*/).filter(Boolean);
  const last = parts[parts.length - 1];
  const matches = cats.filter((c) => c.slug === slugify(last) || norm(c.name) === norm(last));
  if (parts.length > 1) {
    const parent = cats.find((c) => c.slug === slugify(parts[0]) || norm(c.name) === norm(parts[0]));
    return matches.find((m) => m.parent === parent?.slug) ?? null;
  }
  return matches.find((m) => !m.parent) ?? matches[0] ?? null;
}

function availability(v: string): string | null {
  const n = norm(v);
  if (!n) return "";
  if (/^(in stock|instock|available|yes)$/.test(n)) return "in-stock";
  if (/^(pre order|preorder|on order|coming soon)$/.test(n)) return "pre-order";
  if (/^(out of stock|outofstock|sold out|unavailable|no)$/.test(n)) return "out-of-stock";
  return null;
}

export function splitImageUrls(v: string): string[] {
  return [...new Set(v.split(/[\s|;,]+/).map((u) => u.trim()).filter((u) => /^https?:\/\//i.test(u)))];
}

/**
 * Validate every row. `existing` = products already in the shop (trash
 * included); rows are also checked against earlier rows in the same file.
 */
export function validateImport(
  sheet: SheetRecords,
  ctx: { categories: ImportCategory[]; existing: ExistingProduct[]; existingSlugs: Set<string>; publishDefault: boolean },
): ImportRow[] {
  const out: ImportRow[] = [];
  const accepted: ExistingProduct[] = [];
  const slugs = new Set(ctx.existingSlugs);
  const rootOf = (slug: string) => ctx.categories.find((c) => c.slug === slug)?.parent ?? slug;

  for (const { line, values } of sheet.records.slice(0, MAX_IMPORT_ROWS)) {
    const name = values.name ?? "";
    const imageUrls = splitImageUrls(values.image_urls ?? "");
    const row: ImportRow = { line, status: "ready", name, messages: [], imageUrls };
    if (/^example\b/i.test(name.trim())) {
      out.push({ ...row, status: "skipped", messages: ["Example row from the template — skipped."] });
      continue;
    }

    const messages: string[] = [];
    const cat = resolveCategory(values.category ?? "", ctx.categories);
    if (!cat) messages.push(values.category ? `Unknown category “${values.category}”. Use a category name from Categories & brands.` : "Category is missing.");
    const avail = availability(values.availability ?? "");
    if (avail === null) messages.push(`Availability “${values.availability}” isn't one of: in stock, pre-order, out of stock.`);
    const pub = values.published ?? "";
    if (pub && !YES.test(pub) && !NO.test(pub)) messages.push(`Published “${pub}” should be yes or no.`);
    const feat = values.featured ?? "";
    if (feat && !YES.test(feat) && !NO.test(feat)) messages.push(`Featured “${feat}” should be yes or no.`);
    if (imageUrls.length > MAX_IMAGES) messages.push(`Only the first ${MAX_IMAGES} image links will be used.`);
    const badLinks = (values.image_urls ?? "").split(/[\s|;,]+/).filter((u) => u && !/^https?:\/\//i.test(u));
    if (badLinks.length) messages.push(`Ignored ${badLinks.length} image link${badLinks.length > 1 ? "s" : ""} that don't start with http:// or https://.`);

    // a unique web address for each new product
    const base = slugify(name) || "product";
    let slug = base;
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`.slice(0, 80);

    const fields: Record<string, string> = {
      ...values,
      slug,
      category: cat?.slug ?? "",
      availability: avail ?? "",
      published: (pub ? YES.test(pub) : ctx.publishDefault) ? "on" : "",
      featured: YES.test(feat) ? "on" : "",
      images: "[]",
    };
    delete fields.image_urls;
    const { value, errors } = parseProductForm(fields, { categories: ctx.categories.map((c) => c.slug), isNew: true, rootOf });
    const fieldErrors = Object.entries(errors)
      .filter(([k]) => k !== "category_slug" || cat) // the category message above is clearer
      .map(([, m]) => m as string);
    const hard = [...messages.filter((m) => !m.startsWith("Only the first") && !m.startsWith("Ignored")), ...fieldErrors];
    if (!value || hard.length) {
      out.push({ ...row, status: "error", messages: [...messages, ...fieldErrors] });
      continue;
    }

    const dupes = findDuplicates({ name: value.name, brand: value.brand, model: value.model, sku: value.sku, barcode: value.barcode }, [...ctx.existing, ...accepted]);
    const certain = dupes.find((d) => d.strength === "certain");
    const { imageIds: _ignored, ...rest } = value;
    void _ignored;
    if (certain) {
      const inFile = accepted.some((a) => a.slug === certain.slug);
      out.push({
        ...row,
        status: "duplicate",
        duplicateOf: certain,
        messages: [inFile ? `Same product as an earlier row (“${certain.name}”, ${certain.reason.toLowerCase()}).` : `Already listed as “${certain.name}” (${certain.reason.toLowerCase()})${certain.deleted ? " — it's in the trash" : ""}.`, ...messages],
      });
      continue;
    }
    slugs.add(slug);
    accepted.push({ slug, name: value.name, brand: value.brand, model: value.model, sku: value.sku, barcode: value.barcode });
    const likely = dupes[0];
    out.push({
      ...row,
      status: likely ? "possible-duplicate" : "ready",
      duplicateOf: likely,
      fields,
      value: rest,
      messages: likely ? [`Looks like “${likely.name}” (${likely.reason.toLowerCase()}) — imported only if you tick “Also import possible duplicates”.`, ...messages] : messages,
    });
  }
  if (sheet.records.length > MAX_IMPORT_ROWS) {
    out.push({ line: MAX_IMPORT_ROWS + 2, status: "error", name: "", imageUrls: [], messages: [`Only the first ${MAX_IMPORT_ROWS} rows are read — split the file and import the rest separately.`] });
  }
  return out;
}

/** The downloadable template: header row + one example row (skipped automatically). */
export function templateCsv(): string {
  const cols = IMPORT_COLUMNS.map((c) => c.label);
  const example: Record<string, string> = {
    name: "EXAMPLE Deye 8kW Hybrid Inverter (this row is skipped)",
    category: "Inverters",
    price: "1250000",
    brand: "Deye",
    model: "SUN-8K-SG04LP3-EU",
    sku: "",
    barcode: "",
    previous_price: "",
    availability: "in stock",
    stock: "5",
    key_specs: "8 kW, Hybrid, 48 V",
    description: "Three-phase hybrid inverter for homes and offices.",
    image_urls: "https://example.com/deye-8kw-front.jpg | https://example.com/deye-8kw-label.jpg",
    published: "yes",
    featured: "no",
    battery_voltage: "48",
    max_pv_voltage: "",
    mppt_min_voltage: "",
    seo_title: "",
    seo_description: "",
  };
  const extra = specColumns().map((s) => s.key);
  const header = [...cols, ...extra];
  const exampleRow = header.map((h) => (h === "capacity" ? "8 kW" : example[h] ?? ""));
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return "﻿" + [header.map(q).join(","), exampleRow.map(q).join(",")].join("\r\n") + "\r\n";
}
