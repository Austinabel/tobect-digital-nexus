"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { SLUG_RE } from "@/lib/admin/product-form";
import { COLLECTIONS, MAX_COLLECTION, type CollectionKey } from "@/lib/admin/collections";

function back(notice: string): never {
  redirect(`/admin/collections?notice=${encodeURIComponent(notice)}`);
}

function readInput(fd: FormData) {
  const collection = String(fd.get("collection") ?? "") as CollectionKey;
  const slug = String(fd.get("slug") ?? "");
  if (!COLLECTIONS.some((c) => c.key === collection) || !SLUG_RE.test(slug)) back("Choose a product.");
  return { collection, slug, name: COLLECTIONS.find((c) => c.key === collection)!.title };
}

async function listOf(collection: CollectionKey) {
  const { data } = await supabaseAdmin().from("collection_items").select("product_slug, sort_order").eq("collection", collection).order("sort_order");
  return (data ?? []).map((r) => r.product_slug);
}

/** Rewrites the whole list with sort orders 1..n. */
async function writeList(collection: CollectionKey, slugs: string[]) {
  const admin = supabaseAdmin();
  await admin.from("collection_items").delete().eq("collection", collection);
  if (slugs.length) await admin.from("collection_items").insert(slugs.map((s, i) => ({ collection, product_slug: s, sort_order: i + 1 })));
  revalidatePath("/", "layout");
}

export async function addToCollection(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const { collection, slug, name } = readInput(fd);
  const list = await listOf(collection);
  if (list.includes(slug)) back("That product is already in the list.");
  if (list.length >= MAX_COLLECTION) back(`A list holds up to ${MAX_COLLECTION} products — remove one first.`);
  const { data: p } = await supabaseAdmin().from("products").select("name").eq("slug", slug).is("deleted_at", null).maybeSingle();
  if (!p) back("That product no longer exists.");
  await writeList(collection, [...list, slug]);
  await logActivity(actor, { action: "collection.add", entityType: "collection", entityId: collection, summary: `Added ${p.name} to ${name}` });
  back(`${p.name} added to ${name}.`);
}

export async function removeFromCollection(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const { collection, slug, name } = readInput(fd);
  const list = await listOf(collection);
  await writeList(collection, list.filter((s) => s !== slug));
  await logActivity(actor, { action: "collection.remove", entityType: "collection", entityId: collection, summary: `Removed ${slug} from ${name}` });
  back(`Removed from ${name}.`);
}

export async function moveInCollection(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const { collection, slug, name } = readInput(fd);
  const list = await listOf(collection);
  const i = list.indexOf(slug);
  const j = i + (fd.get("dir") === "up" ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) back("Order unchanged.");
  [list[i], list[j]] = [list[j], list[i]];
  await writeList(collection, list);
  await logActivity(actor, { action: "collection.reorder", entityType: "collection", entityId: collection, summary: `Reordered ${name}` });
  back(`${name} order updated.`);
}
