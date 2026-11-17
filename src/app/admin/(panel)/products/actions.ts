"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { parseProductForm, type FieldErrors } from "@/lib/admin/product-form";
import { findDuplicates, type DuplicateMatch } from "@/lib/admin/product-dedupe";
import { existingProducts } from "./data";

export interface ProductFormState {
  errors?: FieldErrors;
  /** products this one looks like — shown with links so staff can open or restore them */
  duplicates?: DuplicateMatch[];
}

/** Database unique-index names → what staff should hear. */
function duplicateMessage(message: string): string | null {
  if (message.includes("products_barcode_key")) return "Another product already has this barcode.";
  if (message.includes("products_sku_key")) return "Another product already uses this SKU.";
  if (message.includes("products_brand_model_key")) return "A product with this brand and model number is already listed (it may be in the trash).";
  if (message.includes("products_pkey")) return "Another product already uses this web address — change it slightly.";
  return null;
}

/** Product changes affect the shop, product pages, search, cart and calculator — refresh the whole public site. */
function refreshSite(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/admin/products/${slug}`);
}

export async function saveProduct(_: ProductFormState | undefined, fd: FormData): Promise<ProductFormState> {
  const actor = await requirePermission("products.manage");
  const admin = supabaseAdmin();
  const existingSlug = String(fd.get("existing_slug") ?? "") || null;

  const { data: cats } = await admin.from("categories").select("slug, parent_slug");
  const parents = new Map((cats ?? []).map((c) => [c.slug, c.parent_slug as string | null]));
  const fields = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const { value, errors } = parseProductForm(fields, {
    categories: (cats ?? []).map((c) => c.slug),
    isNew: !existingSlug,
    fixedSlug: existingSlug ?? undefined,
    rootOf: (slug) => parents.get(slug) ?? slug,
  });
  if (!value) return { errors };

  // Never list the same item twice: exact matches block saving; likely matches need confirming.
  const duplicates = findDuplicates({ slug: existingSlug ?? undefined, name: value.name, brand: value.brand, model: value.model, sku: value.sku, barcode: value.barcode }, await existingProducts());
  const certain = duplicates.filter((d) => d.strength === "certain");
  if (certain.length) {
    const d = certain[0];
    return {
      duplicates,
      errors: { duplicates: `Already listed: “${d.name}” (${d.reason.toLowerCase()}).${d.deleted ? " It's in the trash — restore it instead of listing it again." : " Open it and update it instead of listing it again."}` },
    };
  }
  if (duplicates.length && fd.get("confirm_different") !== "on") {
    return { duplicates, errors: { duplicates: "This looks like a product you've already listed. Check the matches, then tick “This is a different product” to save it anyway." } };
  }

  // Photos must be live media-library images.
  if (value.imageIds.length) {
    const { data: media } = await admin.from("media_assets").select("id").in("id", value.imageIds).is("deleted_at", null);
    if ((media?.length ?? 0) !== value.imageIds.length) return { errors: { imageIds: "One of the selected photos was deleted — please reselect." } };
  }

  const { imageIds, ...row } = value;
  const now = new Date().toISOString();
  if (!existingSlug) {
    const { data: clash } = await admin.from("products").select("slug").eq("slug", row.slug).maybeSingle();
    if (clash) return { errors: { slug: "Another product already uses this web address — change it slightly." } };
    const { error } = await admin.from("products").insert({ ...row, is_sample: false, created_by: actor.userId, updated_by: actor.userId, added_at: now, updated_at: now });
    if (error) return { errors: { form: duplicateMessage(error.message) ?? `Couldn't save the product (${error.message}).` } };
  } else {
    const { error } = await admin.from("products").update({ ...row, updated_by: actor.userId, updated_at: now }).eq("slug", existingSlug);
    if (error) return { errors: { form: duplicateMessage(error.message) ?? `Couldn't save the product (${error.message}).` } };
  }

  // Replace the ordered photo list.
  await admin.from("product_images").delete().eq("product_slug", row.slug);
  if (imageIds.length) {
    const { error } = await admin.from("product_images").insert(imageIds.map((media_id, i) => ({ product_slug: row.slug, media_id, sort_order: i })));
    if (error) return { errors: { imageIds: "The product was saved, but its photos couldn't be — please try again." } };
  }

  await logActivity(actor, {
    action: existingSlug ? "product.update" : "product.create",
    entityType: "product",
    entityId: row.slug,
    summary: `${existingSlug ? "Updated" : "Added"} product ${row.name}${row.published ? "" : " (draft)"}`,
  });
  refreshSite(row.slug);
  redirect(`/admin/products/${row.slug}?saved=1`);
}

function backToList(params: Record<string, string>): never {
  redirect(`/admin/products?${new URLSearchParams(params)}`);
}

export async function trashProduct(fd: FormData) {
  const actor = await requirePermission("products.manage");
  const slug = String(fd.get("slug") ?? "");
  const { data: p } = await supabaseAdmin().from("products").update({ deleted_at: new Date().toISOString(), updated_by: actor.userId }).eq("slug", slug).select("name").maybeSingle();
  if (p) await logActivity(actor, { action: "product.trash", entityType: "product", entityId: slug, summary: `Moved product ${p.name} to the trash` });
  refreshSite();
  backToList({ notice: p ? `${p.name} moved to the trash — it's hidden from the shop and can be restored.` : "Product not found." });
}

export async function restoreProduct(fd: FormData) {
  const actor = await requirePermission("products.manage");
  const slug = String(fd.get("slug") ?? "");
  const { data: p } = await supabaseAdmin().from("products").update({ deleted_at: null, updated_by: actor.userId }).eq("slug", slug).select("name").maybeSingle();
  if (p) await logActivity(actor, { action: "product.restore", entityType: "product", entityId: slug, summary: `Restored product ${p.name} from the trash` });
  refreshSite();
  backToList({ status: "trash", notice: p ? `${p.name} restored.` : "Product not found." });
}

export async function deleteProductForever(fd: FormData) {
  const actor = await requirePermission("products.manage");
  const slug = String(fd.get("slug") ?? "");
  const admin = supabaseAdmin();
  const { data: p } = await admin.from("products").select("name, deleted_at").eq("slug", slug).maybeSingle();
  if (!p || !p.deleted_at) backToList({ status: "trash", notice: "Only products in the trash can be deleted permanently." });
  const { data: kitUse } = await admin.from("kit_slot_choices").select("kit_slug").eq("product_slug", slug);
  if (kitUse?.length) backToList({ status: "trash", notice: `${p.name} is a component of the solar kit(s) ${[...new Set(kitUse.map((k) => k.kit_slug))].join(", ")} — it stays in the trash until it's removed from those kits.` });
  const { error } = await admin.from("products").delete().eq("slug", slug);
  if (error) backToList({ status: "trash", notice: `Couldn't delete ${p.name}: ${error.message}` });
  await logActivity(actor, { action: "product.delete", entityType: "product", entityId: slug, summary: `Permanently deleted product ${p.name}` });
  refreshSite();
  backToList({ status: "trash", notice: `${p.name} deleted permanently.` });
}

export async function trashAllSamples(fd: FormData) {
  const actor = await requirePermission("products.manage");
  if (fd.get("confirm") !== "yes") backToList({ notice: "Tick the box to confirm moving all sample products to the trash." });
  const { data } = await supabaseAdmin().from("products").update({ deleted_at: new Date().toISOString(), updated_by: actor.userId }).eq("is_sample", true).is("deleted_at", null).select("slug");
  const n = data?.length ?? 0;
  await logActivity(actor, { action: "product.trash_samples", entityType: "product", summary: `Moved ${n} sample product${n === 1 ? "" : "s"} to the trash` });
  refreshSite();
  backToList({ notice: `${n} sample product${n === 1 ? "" : "s"} moved to the trash. You can restore them from the Trash tab.` });
}
