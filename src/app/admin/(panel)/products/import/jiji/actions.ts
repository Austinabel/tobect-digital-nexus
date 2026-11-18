"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { findDuplicates, type DuplicateMatch } from "@/lib/admin/product-dedupe";
import { classifyJijiLink, isServiceListing, listingLinksOnSellerPage, listingToFields, parseJijiListing } from "@/lib/admin/jiji-import";
import { productTypeFor } from "@/lib/shop/product-fields";
import { existingProducts } from "../../data";

const UA = "Mozilla/5.0 (compatible; ShopListingImporter/1.0)";
const MAX_PAGE_BYTES = 3 * 1024 * 1024;
/** Listings read per call — each is fetched one after another, with a pause, so Jiji isn't flooded. */
const MAX_PER_CALL = 5;
const PAUSE_MS = 700;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a page from jiji.ng only (the address is checked here, and on every
 * redirect), with a time and size limit. Jiji answers fast requests with an
 * empty page, so an empty or refused answer is retried after a pause.
 */
async function fetchJiji(raw: string): Promise<{ html: string } | { error: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(1500 * attempt);
    let url = raw;
    let res: Response | null = null;
    try {
      for (let hop = 0; hop < 3; hop++) {
        const u = new URL(url);
        if (u.protocol !== "https:" || !["jiji.ng", "www.jiji.ng"].includes(u.hostname)) return { error: "Only jiji.ng pages can be read." };
        res = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(15_000), headers: { "user-agent": UA, accept: "text/html" } });
        if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
          url = new URL(res.headers.get("location")!, u).toString();
          continue;
        }
        break;
      }
    } catch {
      continue;
    }
    if (!res) continue;
    if (res.status === 404 || res.status === 410) return { error: "This listing no longer exists on Jiji." };
    if (!res.ok) continue;
    const reader = res.body?.getReader();
    if (!reader) continue;
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_PAGE_BYTES) {
        await reader.cancel();
        return { error: "The Jiji page was unexpectedly large." };
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks).toString("utf8");
    if (html.length > 2000) return { html };
  }
  return { error: "Jiji didn't answer — try again in a minute." };
}

/** One page (20 listings) of a Jiji seller's shop. */
export async function readJijiSellerPage(sellerUrl: string, page: number): Promise<{ links: string[] } | { error: string }> {
  await requirePermission("products.manage");
  const link = classifyJijiLink(String(sellerUrl));
  if (!link || link.kind !== "seller") return { error: "That isn't a Jiji seller page." };
  const n = Math.max(1, Math.min(50, Math.floor(Number(page)) || 1));
  const got = await fetchJiji(`${link.url}?page=${n}`);
  if ("error" in got) return got;
  return { links: listingLinksOnSellerPage(got.html) };
}

export type JijiRowStatus = "ready" | "possible-duplicate" | "duplicate" | "service" | "unreadable";

export interface JijiRow {
  url: string;
  status: JijiRowStatus;
  title: string;
  price: number;
  imageUrls: string[];
  fields: Record<string, string>;
  /** product type guessed from the title (null = staff choose the category) */
  typeId: string | null;
  message?: string;
  duplicateOf?: DuplicateMatch;
}

/** Read up to 5 listings and turn each into product fields, checked against the shop for duplicates. */
export async function readJijiListings(urls: string[]): Promise<JijiRow[]> {
  await requirePermission("products.manage");
  const admin = supabaseAdmin();
  const [{ data: cats }, { data: brandRows }, existing] = await Promise.all([
    admin.from("categories").select("slug, name, parent_slug").order("sort_order"),
    admin.from("products").select("brand").not("brand", "is", null),
    existingProducts(),
  ]);
  const categories = (cats ?? []).map((c) => ({ slug: c.slug, name: c.name, parent: c.parent_slug }));
  const shopBrands = [...new Set((brandRows ?? []).map((b) => String(b.brand)).filter(Boolean))];
  const typeOf = (slug: string, parent: string | null) => productTypeFor(slug, parent).id;

  const rows: JijiRow[] = [];
  const list = (Array.isArray(urls) ? urls : []).slice(0, MAX_PER_CALL);
  for (const [i, raw] of list.entries()) {
    const link = classifyJijiLink(String(raw));
    const base = { url: String(raw).slice(0, 300), title: "", price: 0, imageUrls: [], fields: {}, typeId: null };
    if (!link || link.kind !== "listing") {
      rows.push({ ...base, status: "unreadable", message: "Not a Jiji listing link." });
      continue;
    }
    if (i) await sleep(PAUSE_MS);
    const got = await fetchJiji(link.url);
    if ("error" in got) {
      rows.push({ ...base, url: link.url, status: "unreadable", message: got.error });
      continue;
    }
    const listing = parseJijiListing(got.html, link.url);
    if (!listing) {
      rows.push({ ...base, url: link.url, status: "unreadable", message: "Couldn't read this listing — it may have been closed." });
      continue;
    }
    const draft = listingToFields(listing, { categories, typeOf, shopBrands });
    const row: JijiRow = { url: link.url, status: "ready", title: listing.title, price: listing.price, imageUrls: draft.imageUrls, fields: draft.fields, typeId: draft.typeId };
    if (isServiceListing(listing)) {
      rows.push({ ...row, status: "service", message: "A services advert, not a product — skipped." });
      continue;
    }
    const dupes = findDuplicates({ name: draft.fields.name, brand: draft.fields.brand }, existing);
    const certain = dupes.find((d) => d.strength === "certain");
    if (certain) rows.push({ ...row, status: "duplicate", duplicateOf: certain, message: `Already in the shop as “${certain.name}”${certain.deleted ? " (in the trash)" : ""}.` });
    else if (dupes[0]) rows.push({ ...row, status: "possible-duplicate", duplicateOf: dupes[0], message: `Looks like “${dupes[0].name}” already in the shop.` });
    else rows.push(row);
  }
  return rows;
}
