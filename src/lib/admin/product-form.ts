/**
 * Server-side validation for the admin product form. Pure (unit-tested in
 * product-form.test.ts): takes the submitted fields, returns either a clean
 * database row or per-field error messages. The browser form is never trusted.
 */
import { chipsFromAttributes, cleanFieldValue, fieldsFor, productTypeFor } from "../shop/product-fields";
import { cleanBarcode, cleanSku } from "./product-dedupe";

export interface ProductRowInput {
  slug: string;
  name: string;
  brand: string | null;
  model: string | null;
  /** your own shop code */
  sku: string | null;
  /** manufacturer barcode (EAN/UPC digits) */
  barcode: string | null;
  category_slug: string;
  price_ngn: number;
  compare_at_price_ngn: number | null;
  availability: "in-stock" | "pre-order" | "out-of-stock" | null;
  stock_quantity: number | null;
  specs: string[];
  attributes: Record<string, string>;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  inverter_spec: { batteryV?: 12 | 24 | 48; maxPvV?: number; mpptMinV?: number } | null;
  featured: boolean;
  published: boolean;
  /** media library ids, in display order */
  imageIds: string[];
}

/** `attr_<key>` holds the message for one product-detail field */
export type FieldErrors = Partial<Record<keyof ProductRowInput | "form" | "duplicates" | `attr_${string}`, string>>;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_IMAGES = 8;
const MAX_PRICE = 10_000_000_000;

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

type Fields = Record<string, string | undefined>;

const text = (v: string | undefined, max: number) => {
  const t = (v ?? "").trim();
  return t ? t.slice(0, max) : null;
};

/** "" → null; otherwise a whole number in range, or NaN for invalid input. */
const whole = (v: string | undefined, min: number, max: number): number | null => {
  const t = (v ?? "").replace(/[,₦\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= min && n <= max ? n : NaN;
};

/**
 * @param ctx.rootOf the top-level category of a category (a subcategory's parent) —
 *   subcategories use their parent's spec filters and inverter datasheet fields.
 */
export function parseProductForm(f: Fields, ctx: { categories: string[]; isNew: boolean; fixedSlug?: string; rootOf?: (slug: string) => string }): { value?: ProductRowInput; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const name = text(f.name, 120);
  if (!name || name.length < 2) errors.name = "Enter the product name.";

  const slug = ctx.isNew ? text(f.slug, 80) ?? slugify(name ?? "") : (ctx.fixedSlug ?? "");
  if (!slug || !SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and dashes only (e.g. deye-8kw-inverter).";

  const category = (f.category ?? "").trim();
  if (!ctx.categories.includes(category)) errors.category_slug = "Choose a category.";
  const root = ctx.rootOf?.(category) ?? category;

  const skuRaw = (f.sku ?? "").trim();
  const sku = cleanSku(skuRaw);
  if (skuRaw && !sku) errors.sku = "Use letters, numbers and - _ . / only (up to 40).";
  const barcodeRaw = (f.barcode ?? "").trim();
  const barcode = cleanBarcode(barcodeRaw);
  if (barcodeRaw && !barcode) errors.barcode = "A barcode is 6–14 digits (e.g. the EAN/UPC under the bars).";

  const price = whole(f.price, 0, MAX_PRICE);
  if (price === null || Number.isNaN(price)) errors.price_ngn = "Enter the price in naira (whole number).";
  const was = whole(f.compare_at_price, 0, MAX_PRICE);
  if (Number.isNaN(was)) errors.compare_at_price_ngn = "Enter a whole number, or leave empty.";
  else if (was !== null && price !== null && !Number.isNaN(price) && was <= price) errors.compare_at_price_ngn = "The previous price must be higher than the current price (or leave it empty).";

  const availabilityRaw = (f.availability ?? "").trim();
  const availability = availabilityRaw === "" ? null : (["in-stock", "pre-order", "out-of-stock"].includes(availabilityRaw) ? availabilityRaw : undefined);
  if (availability === undefined) errors.availability = "Choose an availability.";

  const stock = whole(f.stock_quantity, 0, 1_000_000);
  if (Number.isNaN(stock)) errors.stock_quantity = "Enter a whole number of units, or leave empty if you don't track stock.";

  let specs = (f.specs ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (specs.length > 8) errors.specs = "Up to 8 key specs.";
  if (specs.some((s) => s.length > 40)) errors.specs = "Keep each key spec under 40 characters.";

  // Product details: only the fields defined for this category's product type.
  // A choice field's "Other" button sends its typed value in attr_<key>_other.
  const detailFields = ctx.categories.includes(category) ? fieldsFor(category, root) : [];
  const attributes: Record<string, string> = {};
  for (const field of detailFields) {
    const submitted = f[`attr_${field.key}`];
    const raw = submitted === "__other" ? f[`attr_${field.key}_other`] : submitted;
    const { value, error } = cleanFieldValue(field, raw);
    if (error) errors[`attr_${field.key}`] = error;
    else if (value) attributes[field.key] = value;
  }
  // No key specs typed: build the card chips from the details (e.g. "5.12 kWh, 100 Ah, 51.2 V").
  if (!specs.length) specs = chipsFromAttributes(detailFields, attributes);

  let inverter_spec: ProductRowInput["inverter_spec"] = null;
  if (ctx.categories.includes(category) && productTypeFor(category, root).id === "inverter") {
    const bv = (f.inv_battery_v ?? "").trim();
    const maxPv = whole(f.inv_max_pv_v, 1, 1500);
    const mppt = whole(f.inv_mppt_min_v, 0, 1500);
    if (bv && !["12", "24", "48"].includes(bv)) errors.inverter_spec = "Battery voltage must be 12, 24 or 48 V.";
    else if (Number.isNaN(maxPv) || Number.isNaN(mppt)) errors.inverter_spec = "Datasheet voltages must be whole numbers (or empty).";
    else if (maxPv !== null && mppt !== null && mppt >= maxPv) errors.inverter_spec = "The MPPT minimum must be below the maximum PV voltage.";
    else {
      const spec = { ...(bv ? { batteryV: Number(bv) as 12 | 24 | 48 } : {}), ...(maxPv !== null ? { maxPvV: maxPv } : {}), ...(mppt !== null ? { mpptMinV: mppt } : {}) };
      inverter_spec = Object.keys(spec).length ? spec : null;
    }
  }

  let imageIds: string[] = [];
  try {
    const parsed: unknown = JSON.parse(f.images || "[]");
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string" && UUID_RE.test(x))) throw new Error();
    imageIds = [...new Set(parsed as string[])];
  } catch {
    errors.imageIds = "The photo selection couldn't be read — please reselect the photos.";
  }
  if (imageIds.length > MAX_IMAGES) errors.imageIds = `Up to ${MAX_IMAGES} photos per product.`;

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    value: {
      slug: slug!,
      name: name!,
      brand: text(f.brand, 60),
      model: text(f.model, 60),
      sku,
      barcode,
      category_slug: category,
      price_ngn: price as number,
      compare_at_price_ngn: was,
      availability: availability as ProductRowInput["availability"],
      stock_quantity: stock,
      specs,
      attributes,
      description: text(f.description, 4000),
      seo_title: text(f.seo_title, 70),
      seo_description: text(f.seo_description, 170),
      inverter_spec,
      featured: f.featured === "on",
      published: f.published === "on",
      imageIds,
    },
  };
}
