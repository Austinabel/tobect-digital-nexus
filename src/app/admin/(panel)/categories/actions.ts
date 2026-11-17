"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { SLUG_RE, slugify } from "@/lib/admin/product-form";
import { categoryGlyphs } from "@/components/icons";

function back(notice: string): never {
  redirect(`/admin/categories?notice=${encodeURIComponent(notice)}`);
}

export async function saveCategory(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const admin = supabaseAdmin();
  const existing = String(fd.get("existing_slug") ?? "") || null;
  const name = String(fd.get("name") ?? "").trim().slice(0, 60);
  const glyph = String(fd.get("glyph") ?? "");
  const sort = Number(fd.get("sort_order") ?? 0);
  const parentRaw = String(fd.get("parent_slug") ?? "").trim();
  if (name.length < 2) back("Give the category a name.");
  if (!(glyph in categoryGlyphs)) back("Choose an icon.");
  const sort_order = Number.isInteger(sort) && sort >= 0 && sort <= 999 ? sort : 0;

  // Subcategories go one level deep: the parent must be a top-level category.
  let parent_slug: string | null = null;
  if (parentRaw) {
    const { data: parent } = await admin.from("categories").select("slug, name, parent_slug").eq("slug", parentRaw).maybeSingle();
    if (!parent) back("That parent category no longer exists.");
    if (parent.parent_slug) back(`${parent.name} is itself a subcategory — choose a main category as the parent.`);
    if (parent.slug === existing) back("A category can't be its own parent.");
    parent_slug = parent.slug;
  }
  if (existing && parent_slug) {
    const { count } = await admin.from("categories").select("slug", { count: "exact", head: true }).eq("parent_slug", existing);
    if (count) back(`${name} has its own subcategories, so it can't become a subcategory. Move those first.`);
  }

  if (existing) {
    const { error } = await admin.from("categories").update({ name, glyph, sort_order, parent_slug }).eq("slug", existing);
    if (error) back(error.message.includes("subcategory_depth") ? "Subcategories can only go one level deep." : `Couldn't save (${error.message}).`);
    await logActivity(actor, { action: "category.update", entityType: "category", entityId: existing, summary: `Updated category ${name}${parent_slug ? ` (under ${parent_slug})` : ""}` });
  } else {
    const slug = String(fd.get("slug") ?? "").trim() || slugify(name);
    if (!SLUG_RE.test(slug)) back("The web address may only use lowercase letters, numbers and dashes.");
    if (slug === "installation-kits") back("That address is reserved for solar kits.");
    const { data: clash } = await admin.from("categories").select("slug").eq("slug", slug).maybeSingle();
    if (clash) back(`A category already uses /shop/${slug}.`);
    const { error } = await admin.from("categories").insert({ slug, name, glyph, sort_order, parent_slug });
    if (error) back(error.message.includes("subcategory_depth") ? "Subcategories can only go one level deep." : `Couldn't add the category (${error.message}).`);
    await logActivity(actor, { action: "category.create", entityType: "category", entityId: slug, summary: `Added ${parent_slug ? "subcategory" : "category"} ${name}${parent_slug ? ` under ${parent_slug}` : ""}` });
  }
  revalidatePath("/", "layout");
  back(existing ? `${name} saved.` : parent_slug ? `${name} added as a subcategory — it appears on its parent's shop page and in the filters.` : `${name} added — it now appears in the shop menu and filters.`);
}

export async function deleteCategory(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const slug = String(fd.get("slug") ?? "");
  const admin = supabaseAdmin();
  const [{ count }, { count: children }] = await Promise.all([
    admin.from("products").select("slug", { count: "exact", head: true }).eq("category_slug", slug),
    admin.from("categories").select("slug", { count: "exact", head: true }).eq("parent_slug", slug),
  ]);
  if ((count ?? 0) > 0) back(`This category still has ${count} product${count === 1 ? "" : "s"} (including any in the trash). Move them to another category first.`);
  if ((children ?? 0) > 0) back(`This category has ${children} subcategor${children === 1 ? "y" : "ies"}. Delete or move ${children === 1 ? "it" : "them"} first.`);
  const { data } = await admin.from("categories").delete().eq("slug", slug).select("name").maybeSingle();
  if (data) await logActivity(actor, { action: "category.delete", entityType: "category", entityId: slug, summary: `Deleted category ${data.name}` });
  revalidatePath("/", "layout");
  back(data ? `${data.name} deleted.` : "Category not found.");
}
