"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { MAX_IMAGE_BYTES, sniffImage } from "@/lib/admin/image-file";
import { findDuplicates, type DedupeCandidate, type DuplicateMatch } from "@/lib/admin/product-dedupe";
import { existingProducts } from "./data";
import { readProductPhotos, scanAvailable, type ScanResult } from "@/lib/admin/product-scan";
import { fetchRemoteImage } from "@/lib/admin/remote-image";
import { storeImage } from "@/lib/admin/media-store";
import { fileNameFromUrl } from "@/lib/admin/url-safety";

/** Live check while staff type (and after a scan). */
export async function checkDuplicates(c: DedupeCandidate): Promise<DuplicateMatch[]> {
  await requirePermission("products.manage");
  const candidate: DedupeCandidate = {
    slug: typeof c.slug === "string" ? c.slug.slice(0, 80) : undefined,
    name: String(c.name ?? "").slice(0, 120),
    brand: c.brand ? String(c.brand).slice(0, 60) : null,
    model: c.model ? String(c.model).slice(0, 60) : null,
    sku: c.sku ? String(c.sku).slice(0, 40) : null,
    barcode: c.barcode ? String(c.barcode).slice(0, 20) : null,
  };
  if (!candidate.name.trim() && !candidate.model && !candidate.sku && !candidate.barcode) return [];
  return findDuplicates(candidate, await existingProducts());
}

export interface ScanState {
  result?: ScanResult;
  error?: string;
  duplicates?: DuplicateMatch[];
}

/** Read product photos with AI and suggest listing details (also reports likely duplicates). */
export async function scanProduct(fd: FormData): Promise<ScanState> {
  const actor = await requirePermission("products.manage");
  if (!scanAvailable()) return { error: "Scanning isn't set up yet. The site owner adds an ANTHROPIC_API_KEY to the server settings (see ADMIN.md)." };
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  if (!files.length) return { error: "Take or choose a photo of the product or its label first." };

  const images: Uint8Array[] = [];
  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES * 2) return { error: `${f.name.slice(0, 60)} is too large — use a photo under 10 MB.` };
    const bytes = new Uint8Array(await f.arrayBuffer());
    if (!sniffImage(bytes)) return { error: `${f.name.slice(0, 60)} isn't a photo (JPEG, PNG, WebP or AVIF).` };
    images.push(bytes);
  }

  const { data: cats } = await supabaseAdmin().from("categories").select("slug, name, parent_slug").order("sort_order");
  const categories = (cats ?? []).map((c) => ({ slug: c.slug, name: c.name, parent: c.parent_slug }));
  const { result, error } = await readProductPhotos(images, categories);
  if (!result) return { error };

  // Only trust a category the shop actually has.
  if (result.category && !categories.some((c) => c.slug === result.category)) result.category = null;
  await logActivity(actor, { action: "product.scan", entityType: "product", summary: `Scanned a product photo${result.name ? `: ${result.name}` : ""}` });
  const duplicates = findDuplicates({ name: result.name ?? "", brand: result.brand, model: result.model, barcode: result.barcode }, await existingProducts());
  return { result, duplicates };
}

export interface LinkImageState {
  image?: { id: string; url: string; alt: string; filename: string };
  reused?: boolean;
  error?: string;
}

/** "Add image from a link": downloads a public image into the media library. */
export async function addImageFromUrl(link: string): Promise<LinkImageState> {
  const actor = await requirePermission("media.manage");
  const fetched = await fetchRemoteImage(String(link ?? "").slice(0, 2000));
  if ("error" in fetched) return { error: fetched.error };
  const stored = await storeImage(fetched.bytes, fileNameFromUrl(fetched.url), actor, {
    source: "Downloaded",
    creditUrl: fetched.url.protocol === "https:" ? fetched.url.toString().slice(0, 500) : undefined,
  });
  if ("error" in stored) return { error: stored.error.replace(/^[^:]*: /, "") };
  return { image: stored.image, reused: stored.reused };
}
