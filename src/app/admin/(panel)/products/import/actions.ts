"use server";

import { revalidatePath } from "next/cache";
import { readSheet } from "read-excel-file/node";
import { supabaseAdmin } from "@/lib/supabase/server";
import { can, requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { parseProductForm, slugify } from "@/lib/admin/product-form";
import { findDuplicates } from "@/lib/admin/product-dedupe";
import { MAX_IMAGES } from "@/lib/admin/product-form";
import { parseCsv, sheetToRecords, splitImageUrls, validateImport, type ImportCategory, type ImportRow } from "@/lib/admin/product-import";
import { fetchRemoteImage } from "@/lib/admin/remote-image";
import { storeImage } from "@/lib/admin/media-store";
import { fileNameFromUrl } from "@/lib/admin/url-safety";
import { existingProducts } from "../data";

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_BATCH = 25;

async function importContext() {
  const admin = supabaseAdmin();
  const [{ data: cats }, existing] = await Promise.all([admin.from("categories").select("slug, name, parent_slug").order("sort_order"), existingProducts()]);
  const categories: ImportCategory[] = (cats ?? []).map((c) => ({ slug: c.slug, name: c.name, parent: c.parent_slug }));
  return { categories, existing, existingSlugs: new Set(existing.map((p) => p.slug)) };
}

/** Excel cells → text the way staff typed them. */
function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  return String(v);
}

export interface PreviewState {
  error?: string;
  fileName?: string;
  rows?: ImportRow[];
  unknownHeaders?: string[];
}

/** Step 1: read the file and check every row. Nothing is saved. */
export async function previewImport(fd: FormData): Promise<PreviewState> {
  await requirePermission("products.manage");
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose a .csv or .xlsx file." };
  if (file.size > MAX_FILE_BYTES) return { error: "The file is larger than 3 MB — split it into smaller files." };
  const name = file.name.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());

  let rows: string[][];
  try {
    if (name.endsWith(".xlsx")) {
      if (bytes.subarray(0, 2).toString("latin1") !== "PK") return { error: "That isn't a valid Excel (.xlsx) file." };
      rows = (await readSheet(bytes)).map((r) => r.map(cellText));
    } else if (name.endsWith(".csv") || name.endsWith(".txt")) {
      rows = parseCsv(bytes.toString("utf8"));
    } else if (name.endsWith(".xls")) {
      return { error: "Old Excel (.xls) files aren't supported. In Excel choose File → Save As → Excel Workbook (.xlsx) or CSV." };
    } else {
      return { error: "Use a .csv or .xlsx file." };
    }
  } catch {
    return { error: "The file couldn't be read. Save it again as .xlsx or CSV (UTF-8) and retry." };
  }
  rows = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) return { error: "The file has no product rows under the header row." };

  const sheet = sheetToRecords(rows);
  if (sheet.missingRequired.length) {
    return { error: `The header row needs these columns: ${sheet.missingRequired.join(", ")}. Download the template to see the column names.` };
  }
  const ctx = await importContext();
  const publishDefault = fd.get("publish") === "on";
  return { fileName: file.name.slice(0, 120), rows: validateImport(sheet, { ...ctx, publishDefault }), unknownHeaders: sheet.unknownHeaders };
}

export interface BatchResult {
  line: number;
  status: "imported" | "skipped" | "failed";
  slug?: string;
  name: string;
  message: string;
  imageNotes: string[];
}

/**
 * Step 2: import a batch of previewed rows. Each row is checked again here
 * (the browser is never trusted) — form rules, categories, duplicates
 * against the live shop, unique web address — then its image links are
 * downloaded into the media library.
 */
export async function importBatch(batch: { line: number; fields: Record<string, string>; imageUrls: string[] }[], opts: { includePossible: boolean }): Promise<BatchResult[]> {
  const actor = await requirePermission("products.manage");
  const mayAddImages = can(actor, "media.manage");
  const admin = supabaseAdmin();
  const { categories, existing, existingSlugs } = await importContext();
  const rootOf = (slug: string) => categories.find((c) => c.slug === slug)?.parent ?? slug;
  const results: BatchResult[] = [];

  for (const item of batch.slice(0, MAX_BATCH)) {
    const raw = Object.fromEntries(Object.entries(item.fields ?? {}).map(([k, v]) => [String(k).slice(0, 60), String(v ?? "").slice(0, 4000)]));
    const name = (raw.name ?? "").slice(0, 120);
    const line = Number(item.line) || 0;

    // unique web address, decided now against the live shop
    const base = (raw.slug || slugify(name) || "product").slice(0, 76);
    let slug = base;
    for (let n = 2; existingSlugs.has(slug); n++) slug = `${base}-${n}`;
    raw.slug = slug;
    raw.images = "[]";

    const { value, errors } = parseProductForm(raw, { categories: categories.map((c) => c.slug), isNew: true, rootOf });
    if (!value) {
      results.push({ line, name, status: "failed", message: Object.values(errors).join(" "), imageNotes: [] });
      continue;
    }
    const dupes = findDuplicates({ name: value.name, brand: value.brand, model: value.model, sku: value.sku, barcode: value.barcode }, existing);
    const certain = dupes.find((d) => d.strength === "certain");
    if (certain || (dupes.length && !opts.includePossible)) {
      const d = certain ?? dupes[0];
      results.push({ line, name, status: "skipped", message: `${certain ? "Already listed" : "Possibly already listed"} as “${d.name}” (${d.reason.toLowerCase()}).`, imageNotes: [] });
      continue;
    }

    const { imageIds: _none, ...row } = value;
    void _none;
    const now = new Date().toISOString();
    const { error } = await admin.from("products").insert({ ...row, is_sample: false, created_by: actor.userId, updated_by: actor.userId, added_at: now, updated_at: now });
    if (error) {
      results.push({ line, name, status: "failed", message: error.message.includes("_key") ? "A product with the same barcode, SKU or brand + model already exists." : `Couldn't save (${error.message}).`, imageNotes: [] });
      continue;
    }
    existingSlugs.add(slug);
    existing.push({ slug, name: value.name, brand: value.brand, model: value.model, sku: value.sku, barcode: value.barcode });

    // images from links
    const imageNotes: string[] = [];
    const urls = splitImageUrls((item.imageUrls ?? []).join(" ")).slice(0, MAX_IMAGES);
    const ids: string[] = [];
    if (urls.length && !mayAddImages) imageNotes.push("Images skipped — your role can't add to the media library.");
    else
      for (const u of urls) {
        const fetched = await fetchRemoteImage(u);
        if ("error" in fetched) {
          imageNotes.push(`${u.slice(0, 80)}: ${fetched.error}`);
          continue;
        }
        const stored = await storeImage(fetched.bytes, fileNameFromUrl(fetched.url), actor, { alt: value.name, source: "Imported", creditUrl: fetched.url.protocol === "https:" ? fetched.url.toString().slice(0, 500) : undefined });
        if ("error" in stored) imageNotes.push(stored.error);
        else if (!ids.includes(stored.image.id)) ids.push(stored.image.id);
      }
    if (ids.length) await admin.from("product_images").insert(ids.map((media_id, i) => ({ product_slug: slug, media_id, sort_order: i })));

    await logActivity(actor, { action: "product.create", entityType: "product", entityId: slug, summary: `Imported product ${value.name}${value.published ? "" : " (draft)"}` });
    results.push({ line, name: value.name, slug, status: "imported", message: `Added${ids.length ? ` with ${ids.length} photo${ids.length > 1 ? "s" : ""}` : ""}${value.published ? "" : " as a draft"}.`, imageNotes });
  }
  if (results.some((r) => r.status === "imported")) {
    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
  }
  return results;
}
