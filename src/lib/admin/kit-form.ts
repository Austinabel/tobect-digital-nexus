/**
 * Server-side validation for the admin solar-kit form. Pure and unit-tested
 * (kit-form.test.ts). A kit's price is never typed in — it is added up from
 * its component products — so this only checks the structure: which
 * products may fill each position and in what quantities.
 */
import { SLUG_RE, slugify } from "./product-form";
import { FOCUS_RE } from "./campaign-form";

/** The three swappable positions a kit can have, in display order. */
export const KIT_SLOTS = [
  { key: "inverter", role: "inverter", label: "Hybrid inverter", category: "inverters" },
  { key: "battery", role: "battery", label: "Lithium battery", category: "lithium-batteries" },
  { key: "panels", role: "panel", label: "Solar panels", category: "solar-panels" },
] as const;
export const MAX_ADDONS = 4;
const MAX_QTY = 999;
const MAX_PRICE = 10_000_000_000;

export interface KitInput {
  kit: {
    slug: string;
    name: string;
    capacity_label: string;
    tag: string | null;
    summary: string;
    applications: string[];
    outline: string[];
    image_url: string | null;
    image_alt: string | null;
    image_position: string | null;
    purchasable: boolean;
    accessories_price_ngn: number | null;
    installation_note: string | null;
    published: boolean;
    sort_order: number;
  };
  slots: { key: string; label: string; role: string; qty_default: number; qty_min: number; qty_max: number; sort_order: number; choices: string[] }[];
  accessories: { name: string; detail: string | null; sort_order: number }[];
  addons: { key: string; label: string; description: string | null; price_ngn: number | null }[];
}

export type KitErrors = Record<string, string>;

const text = (v: FormDataEntryValue | null | undefined, max: number) => String(v ?? "").trim().slice(0, max);
const lines = (v: FormDataEntryValue | null | undefined, maxLines: number, maxLen: number) =>
  [...new Set(String(v ?? "").split(/\r?\n/).map((l) => l.trim().slice(0, maxLen)).filter(Boolean))].slice(0, maxLines);

function naira(raw: string, field: string, errors: KitErrors): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[,\s₦]/g, ""));
  if (!Number.isInteger(n) || n < 0 || n > MAX_PRICE) {
    errors[field] = "Enter a whole naira amount, or leave empty for “quoted”.";
    return null;
  }
  return n;
}

/**
 * @param isProduct whether a slug is a product (any status) in the database
 * @param isLibraryUrl whether an image URL belongs to the media library
 */
export function parseKitForm(
  get: (k: string) => FormDataEntryValue | null,
  opts: { mode: "new" | "edit"; existingSlug?: string; isProduct: (slug: string) => boolean; isLibraryUrl: (url: string) => boolean },
): { input?: KitInput; errors: KitErrors } {
  const errors: KitErrors = {};
  const name = text(get("name"), 140);
  if (name.length < 3) errors.name = "Give the kit a name, e.g. “5KVA Complete Solar Kit”.";
  else if (name.length > 120) errors.name = "Keep the name under 120 characters.";

  let slug = opts.mode === "edit" ? opts.existingSlug ?? "" : text(get("slug"), 90) || slugify(name);
  if (opts.mode === "new" && !SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and hyphens only.";
  slug = slug.slice(0, 80);

  const capacity_label = text(get("capacity_label"), 20);
  if (!capacity_label) errors.capacity_label = "e.g. 5KVA";
  const summary = text(get("summary"), 400);
  if (summary.length < 10) errors.summary = "Write one sentence about who the kit is for.";

  const image_url = text(get("image_url"), 600) || null;
  if (image_url && !opts.isLibraryUrl(image_url)) errors.image_url = "Pick the photo from the media library.";
  const image_position = text(get("image_position"), 10) || null;
  if (image_position && !FOCUS_RE.test(image_position)) errors.image_position = "Choose a focal point.";

  const sortRaw = text(get("sort_order"), 6) || "0";
  const sort_order = Number(sortRaw);
  if (!Number.isInteger(sort_order) || sort_order < 0 || sort_order > 999) errors.sort_order = "Use a whole number from 0 to 999.";

  const purchasable = get("purchasable") === "on";
  const accessories_price_ngn = naira(text(get("accessories_price"), 20), "accessories_price", errors);

  // ---- component positions
  const slots: KitInput["slots"] = [];
  KIT_SLOTS.forEach((def, i) => {
    if (get(`slot_${def.key}_on`) !== "on") return;
    let choices: string[] = [];
    try {
      const parsed = JSON.parse(String(get(`slot_${def.key}_choices`) ?? "[]"));
      if (Array.isArray(parsed)) choices = [...new Set(parsed.filter((s): s is string => typeof s === "string"))].slice(0, 12);
    } catch {
      /* treated as empty */
    }
    const label = text(get(`slot_${def.key}_label`), 60) || def.label;
    const q = (k: string) => Number(text(get(`slot_${def.key}_${k}`), 4));
    const [qty_min, qty_default, qty_max] = [q("qmin"), q("qdef"), q("qmax")];
    if (!choices.length) errors[`slot_${def.key}`] = `Choose at least one product for “${label}”.`;
    else if (choices.some((c) => !opts.isProduct(c))) errors[`slot_${def.key}`] = `A product chosen for “${label}” no longer exists.`;
    else if (![qty_min, qty_default, qty_max].every((n) => Number.isInteger(n) && n >= 1 && n <= MAX_QTY))
      errors[`slot_${def.key}`] = `Quantities for “${label}” must be whole numbers from 1 to ${MAX_QTY}.`;
    else if (!(qty_min <= qty_default && qty_default <= qty_max)) errors[`slot_${def.key}`] = `For “${label}”, the quantities must go fewest ≤ standard ≤ most.`;
    slots.push({ key: def.key, label, role: def.role, qty_default, qty_min, qty_max, sort_order: i, choices });
  });
  if (purchasable && !slots.length) errors.purchasable = "To sell online, switch on at least one component (inverter, battery or panels) and choose its products.";

  // ---- accessories: one per line, optional "Name — detail"
  const accessories = lines(get("accessories"), 30, 160).map((l, i) => {
    const [n, ...rest] = l.split(/\s+[—–-]\s+/);
    return { name: n.slice(0, 80), detail: rest.join(" - ").slice(0, 120) || null, sort_order: i };
  });
  const seenAcc = new Set<string>();
  const uniqueAccessories = accessories.filter((a) => !seenAcc.has(a.name.toLowerCase()) && seenAcc.add(a.name.toLowerCase()));

  // ---- optional extras
  const addons: KitInput["addons"] = [];
  for (let i = 0; i < MAX_ADDONS; i++) {
    const label = text(get(`addon_${i}_label`), 100);
    if (!label) continue;
    const key = slugify(label).slice(0, 40) || `extra-${i + 1}`;
    if (addons.some((a) => a.key === key)) {
      errors[`addon_${i}`] = "Two extras have the same name.";
      continue;
    }
    addons.push({ key, label, description: text(get(`addon_${i}_desc`), 240) || null, price_ngn: naira(text(get(`addon_${i}_price`), 20), `addon_${i}`, errors) });
  }

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    input: {
      kit: {
        slug,
        name,
        capacity_label,
        tag: text(get("tag"), 30) || null,
        summary,
        applications: lines(get("applications"), 8, 80),
        outline: lines(get("outline"), 8, 80),
        image_url,
        image_alt: text(get("image_alt"), 200) || null,
        image_position,
        purchasable,
        accessories_price_ngn,
        installation_note: text(get("installation_note"), 600) || null,
        published: get("published") === "on",
        sort_order,
      },
      slots,
      accessories: uniqueAccessories,
      addons,
    },
  };
}
