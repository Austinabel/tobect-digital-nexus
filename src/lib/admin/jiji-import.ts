/**
 * Import the shop's own listings from Jiji (jiji.ng). Pure and unit-tested
 * (jiji-import.test.ts): the server action fetches the pages, this file
 * reads them and turns each listing into the same fields the product form
 * submits, so the normal import rules (validation, duplicates, photo
 * download) apply unchanged.
 *
 * Only facts written in the listing are used. Details are read from the
 * title, and a value is left empty when the title is ambiguous (e.g. two
 * different voltages) — staff fill it in while reviewing the draft.
 */
import { PRODUCT_TYPES, cleanFieldValue, type ProductField } from "../shop/product-fields";

/* ---------------------------------------------------------------- links */

const JIJI_HOSTS = new Set(["jiji.ng", "www.jiji.ng"]);

export type JijiLink = { kind: "listing" | "seller"; url: string };

/** A pasted address → a Jiji listing or seller page (canonical https, no tracking query), or null. */
export function classifyJijiLink(raw: string): JijiLink | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!JIJI_HOSTS.has(u.hostname.toLowerCase()) || (u.protocol !== "https:" && u.protocol !== "http:")) return null;
  const path = u.pathname.replace(/\/+$/, "");
  if (/^\/[\w-]+\/[\w-]+\/[\w-]+\.html$/i.test(path)) return { kind: "listing", url: `https://jiji.ng${path}` };
  if (/^\/sellerpage-[\w-]+$/i.test(path) || /^\/shop\/[\w-]+$/i.test(path)) return { kind: "seller", url: `https://jiji.ng${path}` };
  return null;
}

/** Every Jiji link in pasted text (one per line, or mixed with other words), without repeats. */
export function jijiLinksIn(text: string): { links: JijiLink[]; ignored: string[] } {
  const found = text.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  const links: JijiLink[] = [];
  const ignored: string[] = [];
  for (const raw of found) {
    const l = classifyJijiLink(raw);
    if (!l) ignored.push(raw.slice(0, 120));
    else if (!links.some((x) => x.url === l.url)) links.push(l);
  }
  return { links, ignored };
}

/** The listing links on one page of a seller's shop. */
export function listingLinksOnSellerPage(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/href="(\/[\w-]+\/[\w-]+\/[\w-]+\.html)/g)) {
    const url = `https://jiji.ng${m[1]}`;
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

/* ---------------------------------------------------------------- page data */

/**
 * Jiji pages carry their data as Nuxt's "devalue" payload: a flat JSON
 * array where objects refer to other entries by index.
 */
export function readNuxtData(html: string): unknown {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  let arr: unknown[];
  try {
    arr = JSON.parse(m[1]);
  } catch {
    return null;
  }
  if (!Array.isArray(arr)) return null;
  const memo = new Map<number, unknown>();
  const WRAPPERS = new Set(["Reactive", "ShallowReactive", "Ref", "ShallowRef", "EmptyRef", "EmptyShallowRef", "NuxtError", "Set", "Map", "Date"]);
  const hydrate = (i: unknown, depth: number): unknown => {
    if (typeof i !== "number" || i < 0 || i >= arr.length || depth > 60) return undefined;
    if (memo.has(i)) return memo.get(i);
    const v = arr[i];
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) {
      if (typeof v[0] === "string" && WRAPPERS.has(v[0])) {
        const r = hydrate(v[1], depth + 1);
        memo.set(i, r);
        return r;
      }
      const out: unknown[] = [];
      memo.set(i, out);
      for (const x of v) out.push(hydrate(x, depth + 1));
      return out;
    }
    const o: Record<string, unknown> = {};
    memo.set(i, o);
    for (const [k, x] of Object.entries(v)) o[k] = hydrate(x, depth + 1);
    return o;
  };
  return hydrate(0, 0);
}

export interface JijiListing {
  id: string;
  url: string;
  title: string;
  /** naira; 0 when the listing has no price */
  price: number;
  description: string;
  /** full-size photo links, main photo first */
  images: string[];
  /** Jiji's own fields, e.g. { Brand: "Felicity", Condition: "Brand New" } */
  attrs: Record<string, string>;
  /** Jiji's category, e.g. "power-equipments" */
  jijiCategory: string;
  jijiCategoryName: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** The listing on a Jiji listing page, or null when the page isn't one. */
export function parseJijiListing(html: string, url: string): JijiListing | null {
  const root = readNuxtData(html);
  let ad: Record<string, unknown> | undefined;
  const seen = new Set<unknown>();
  const walk = (x: unknown, d: number) => {
    if (ad || !x || typeof x !== "object" || seen.has(x) || d > 14) return;
    seen.add(x);
    const o = x as Record<string, unknown>;
    if (o.price_obj && typeof o.title === "string" && Array.isArray(o.images)) {
      ad = o;
      return;
    }
    for (const v of Object.values(o)) walk(v, d + 1);
  };
  walk(root, 0);
  if (!ad) return null;

  const priceObj = (ad.price_obj ?? {}) as Record<string, unknown>;
  const price = Number(priceObj.value);
  const imgs = (ad.images as unknown[])
    .map((i) => (i && typeof i === "object" ? (i as Record<string, unknown>) : {}))
    .sort((a, b) => Number(Boolean(b.is_main)) - Number(Boolean(a.is_main)))
    .map((i) => str(i.url))
    .filter((u) => /^https:\/\/[\w.-]+\.jijistatic\.net\//.test(u));
  const attrs: Record<string, string> = {};
  for (const a of Array.isArray(ad.attrs) ? ad.attrs : []) {
    if (!a || typeof a !== "object") continue;
    const name = str((a as Record<string, unknown>).name).trim();
    const value = str((a as Record<string, unknown>).value).trim();
    if (name && value) attrs[name] = value;
  }
  return {
    id: str(ad.id),
    url,
    title: str(ad.title).replace(/\s+/g, " ").trim(),
    price: Number.isFinite(price) && price > 0 ? Math.round(price) : 0,
    description: str(ad.description).replace(/\r\n/g, "\n").trim(),
    images: [...new Set(imgs)],
    attrs,
    jijiCategory: str(ad.category_slug),
    jijiCategoryName: str(ad.category_name),
  };
}

/* ---------------------------------------------------------------- product type */

/** Title keyword → product type. Checked in order; the first match wins. */
const TITLE_TYPES: [RegExp, string][] = [
  [/\bgenerator\b|power ?station|power ?tank|power ?bank|all in one|\bess\b|\bkit\b|set ?up|solar system|\bcombo\b|\d\s*w output\b/, "power-system"],
  [/\bcctv\b|\bcamera|\bcamer\b|\bptz\b|\blens(es)?\b/, "cctv"],
  [/freezer|fridge|refrigerator|ice (block )?maker/, "freezer"],
  [/\bpump\b/, "pump"],
  [/\bfans?\b/, "fan"],
  [/inverter batter/, "battery"],
  [/inverter/, "inverter"],
  [/batter|lifepo4/, "battery"],
  [/street ?lights?|flood ?lights?|\blights?\b|\blamps?\b|\bbulbs?\b/, "lighting"],
  [/\bpanels?\b|\bmono\b|bifacial|half cut/, "solar-panel"],
  [/\d\s*kwh\b.*\d\s*v\b|\d\s*v\b.*\d\s*kwh\b/, "battery"], // "Haisic 8kWh 24V"
];

const plain = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9.]+/g, " ").replace(/\s+/g, " ").trim()} `;

/** The product type a listing title describes, or null when it isn't clear. */
export function productTypeFromTitle(title: string, jijiCategory = ""): string | null {
  const t = plain(title);
  // "Solar panels for solar fans", "Standing fan with solar panel": the product is named before "for"/"with"
  const head = t.split(/ (?:for|with) /)[0];
  const hit = TITLE_TYPES.find(([re]) => re.test(` ${head.trim()} `)) ?? TITLE_TYPES.find(([re]) => re.test(t));
  if (hit) return hit[1];
  if (/security|surveillance/.test(jijiCategory)) return "cctv";
  return null;
}

/* ---------------------------------------------------------------- details from the title */

/** Unit spellings sellers use, per field unit. Units not listed here are never read from titles. */
const UNIT_WORDS: Record<string, string> = {
  V: "v|volts?",
  Ah: "ah",
  kWh: "kwh",
  Wh: "wh",
  W: "w|watts?",
  kW: "kw",
  kVA: "kva",
  L: "l|ltrs?|litres?|liters?",
  in: "inch|inches",
  cycles: "cycles",
};

/** Every distinct number written with this unit in the text, e.g. "48V" or "51.2 V" → [48, 51.2]. */
function numbersWithUnit(t: string, unit: string): number[] {
  const words = UNIT_WORDS[unit];
  if (!words) return [];
  const re = new RegExp(`(?<![\\d.])(\\d+(?:\\.\\d+)?)\\s?(?:${words})(?![a-z])`, "g");
  return [...new Set([...t.matchAll(re)].map((m) => Number(m[1])).filter((n) => n > 0))];
}

/** Other words for some choices (the option's own words always count). */
const OPTION_ALIASES: Record<string, string[]> = {
  "Lithium (LiFePO4)": ["lifepo4", "lithium iron phosphate", "lfp"],
  "Lithium-ion (NMC)": ["nmc"],
  Monocrystalline: ["mono"],
  Polycrystalline: ["poly"],
  "Half-cut": ["half cut"],
  "Wi-Fi": ["wifi", "wi fi", "wireless"],
  "4G / SIM": ["4g", "sim card"],
  "Chest freezer": ["deep freezer", "chest freezer"],
  "Submersible (borehole)": ["submersible", "borehole"],
  "Off-grid": ["off grid", "offgrid"],
  "On-grid (grid-tie)": ["on grid", "grid tie"],
  "AC / DC": ["ac dc"],
};
/**
 * Choices whose own words are too vague to read from a title (a bare
 * "lithium" doesn't say LiFePO4 or NMC). Their aliases above still count.
 */
const NEVER_FROM_TITLE = new Set(["Yes", "No", "None", "Lithium (LiFePO4)", "Lithium-ion (NMC)"]);

function chooseOption(t: string, field: ProductField): string | null {
  const hits: { option: string; word: string }[] = [];
  for (const option of field.options ?? []) {
    const own = plain(option.replace(/\(.*?\)/g, "")).trim();
    const words = [...(NEVER_FROM_TITLE.has(option) ? [] : [own]), ...(OPTION_ALIASES[option] ?? [])].filter(Boolean);
    const word = words.filter((w) => t.includes(` ${w} `) || t.includes(` ${w}s `)).sort((a, b) => b.length - a.length)[0];
    if (word) hits.push({ option, word });
  }
  // "off grid" also contains "grid": a match inside a longer match doesn't count
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.word !== h.word && o.word.includes(h.word)));
  return kept.length === 1 ? kept[0].option : null;
}

/** Jiji's Condition values → ours. */
export function conditionFrom(jiji: string | undefined, title: string): string | null {
  const c = (jiji ?? "").toLowerCase();
  if (/refurb/.test(c)) return "Refurbished";
  if (/used/.test(c)) return "Used";
  if (/new/.test(c)) return "New";
  const t = plain(title);
  if (/ brand new /.test(t)) return "New";
  if (/ (fairly |foreign |uk )?used /.test(t)) return "Used";
  return null;
}

/**
 * Product details (attr_<key> form fields) read from a listing title. A
 * number is used only when the title states exactly one value in that
 * unit; the first field with that unit gets it.
 */
export function detailsFromTitle(typeId: string, title: string): Record<string, string> {
  const type = PRODUCT_TYPES[typeId];
  if (!type) return {};
  const t = plain(title);
  const out: Record<string, string> = {};
  const usedUnits = new Set<string>();
  // "3 pieces of 16kWh battery", "2 x 450W": a number there is per piece, not the product's own rating
  const multiples = /(?<![\d.])\d+\s?(?:pieces?|pcs|units?|sets?) of | \d+\s?x\s?\d/.test(t);

  for (const f of type.fields) {
    if (f.key === "condition" || f.key === "warranty") continue;
    if (f.kind === "choice") {
      let pick = chooseOption(t, f);
      // a battery that only says "lithium": keep the seller's word rather than guess the chemistry
      if (!pick && f.key === "chemistry" && / lithium /.test(t)) pick = "Lithium";
      if (pick) out[`attr_${f.key}`] = pick;
      continue;
    }
    if (f.kind !== "number" || !f.unit || usedUnits.has(f.unit) || multiples) continue;
    usedUnits.add(f.unit);
    let n: number | undefined;
    if (typeId === "power-system" && f.key === "output") {
      // "1000W solar generator with 300W output": only the stated output counts
      const m = t.match(/(?<![\d.])(\d+(?:\.\d+)?)\s?w output\b/);
      n = m ? Number(m[1]) : undefined;
    } else if (typeId === "power-system" && f.key === "storage") {
      const wh = numbersWithUnit(t, "Wh");
      const kwh = numbersWithUnit(t, "kWh").map((k) => Math.round(k * 1000));
      const all = [...new Set([...wh, ...kwh])];
      // above 500 kWh is a typo in a title ("5012kwh"), not a product we sell
      n = all.length === 1 && all[0] <= 500_000 ? all[0] : undefined;
    } else {
      const all = numbersWithUnit(t, f.unit);
      n = all.length === 1 ? all[0] : undefined;
    }
    if (n !== undefined) {
      const clean = cleanFieldValue(f, String(n));
      if (clean.value) out[`attr_${f.key}`] = String(n);
    }
  }

  // "2yrs warranty", "10 years warranty"
  const w = t.match(/(?<![\d.])(\d{1,2})\s?(?:yrs?|years?)\s(?:of\s)?warranty/);
  if (w && type.fields.some((f) => f.key === "warranty")) out.attr_warranty = w[1];

  // inverters: the battery bank voltage feeds the solar calculator
  if (typeId === "inverter") {
    const v = numbersWithUnit(t, "V").filter((x) => [12, 24, 48].includes(x));
    if (v.length === 1) out.inv_battery_v = String(v[0]);
  }
  return out;
}

/* ---------------------------------------------------------------- brand */

/** Brands seen in our listings, with the misspellings that appear in titles. */
const KNOWN_BRANDS: [string, string[]][] = [
  ["Felicity Solar", ["felicity"]],
  ["Deye", ["deye"]],
  ["Luxwatt", ["luxwatt"]],
  ["Haisic", ["haisic", "hasic", "hiasic"]],
  ["BEVE Power", ["beve"]],
  ["Cola Solar", ["cola"]],
  ["itel", ["itel"]],
  ["Meco", ["meco"]],
  ["Sako", ["sako"]],
  ["SMS", ["sms"]],
  ["Sunfit", ["sunfit"]],
  ["Cworth", ["cworth"]],
  ["Hithium", ["hithium", "hthium"]],
  ["JCNS", ["jcns"]],
  ["Kulpower", ["kulpower"]],
  ["Ronma", ["ronma"]],
  ["Lumin", ["lumin"]],
  ["Wakatek", ["wakatek"]],
  ["Ecolion", ["ecolion"]],
  ["Howfar", ["howfar"]],
  ["Lutian", ["lutian"]],
  ["Omnibat", ["omnibat"]],
  ["Panasonic", ["panasonic"]],
  ["LG", ["lg"]],
  ["Jinko Solar", ["jinko"]],
  ["Growatt", ["growatt"]],
  ["Must", ["must solar"]],
];

/** The brand: Jiji's Brand field when it names one, else a known brand in the title, else an existing shop brand in the title. */
export function brandFrom(jijiBrand: string | undefined, title: string, shopBrands: string[] = []): string | null {
  const b = (jijiBrand ?? "").trim();
  const squashed = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sameAs = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "") === squashed;
  if (b && !/^(other|others|no brand|unbranded|generic|solar|quality|original|none)$/i.test(b)) {
    // "Felicitysolar" → "Felicity Solar": prefer the spelling already used in the shop, then ours
    const shop = shopBrands.find(sameAs);
    if (shop) return shop;
    const known = KNOWN_BRANDS.find(([name, words]) => sameAs(name) || words.some((w) => squashed === w.replace(/\s/g, "") || squashed.startsWith(w.replace(/\s/g, ""))));
    return known ? known[0] : b.slice(0, 80);
  }
  const t = plain(title);
  for (const [name, words] of KNOWN_BRANDS) if (words.some((w) => t.includes(` ${w} `))) return name;
  for (const name of shopBrands) {
    const w = plain(name).trim();
    if (w.length >= 3 && t.includes(` ${w} `)) return name;
  }
  return null;
}

/* ---------------------------------------------------------------- listing → form fields */

export interface ShopCategory {
  slug: string;
  name: string;
  parent: string | null;
}

/** The shop category for a product type: the first top-level category of that type. */
export function categoryForType(typeId: string | null, categories: ShopCategory[], typeOf: (slug: string, parent: string | null) => string): string {
  if (!typeId) return "";
  const match = categories.filter((c) => typeOf(c.slug, c.parent) === typeId);
  return (match.find((c) => !c.parent) ?? match[0])?.slug ?? "";
}

/** Jiji categories that hold services or jobs, not products. */
export function isServiceListing(l: Pick<JijiListing, "jijiCategory">): boolean {
  return /services?|jobs?|cvs?$/.test(l.jijiCategory);
}

export interface JijiDraft {
  fields: Record<string, string>;
  imageUrls: string[];
  /** the product type read from the title (null = not clear, staff choose the category) */
  typeId: string | null;
}

/** The product-form fields for a Jiji listing. Published is decided by the caller. */
export function listingToFields(
  l: JijiListing,
  opts: { categories: ShopCategory[]; typeOf: (slug: string, parent: string | null) => string; shopBrands?: string[] },
): JijiDraft {
  const typeId = productTypeFromTitle(`${l.title} ${l.attrs.Type ?? ""}`, l.jijiCategory);
  const fields: Record<string, string> = {
    name: l.title.slice(0, 120),
    category: categoryForType(typeId, opts.categories, opts.typeOf),
    price: l.price ? String(l.price) : "",
    description: l.description.slice(0, 4000),
    availability: "in-stock",
  };
  const brand = brandFrom(l.attrs.Brand, l.title, opts.shopBrands);
  if (brand) fields.brand = brand;
  if (typeId) Object.assign(fields, detailsFromTitle(typeId, l.title));
  const cond = conditionFrom(l.attrs.Condition, l.title);
  if (cond) fields.attr_condition = cond;
  return { fields, imageUrls: l.images, typeId };
}
