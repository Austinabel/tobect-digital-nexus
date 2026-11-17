"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { isLibraryUrl } from "@/lib/admin/media-library";
import { parseKitForm, type KitErrors } from "@/lib/admin/kit-form";
import { SLUG_RE } from "@/lib/admin/product-form";

export interface KitFormState {
  errors?: KitErrors;
}

export async function saveKit(_: KitFormState | undefined, fd: FormData): Promise<KitFormState> {
  const actor = await requirePermission("catalog.manage");
  const existing = String(fd.get("existing_slug") ?? "") || undefined;
  if (existing && !SLUG_RE.test(existing)) return { errors: { form: "That kit no longer exists." } };

  const admin = supabaseAdmin();
  const { data: prods } = await admin.from("products").select("slug").is("deleted_at", null);
  const products = new Set((prods ?? []).map((p) => p.slug));
  const image = String(fd.get("image_url") ?? "").trim();
  const imageOk = image ? await isLibraryUrl(image) : true;

  const { input, errors } = parseKitForm((k) => fd.get(k), {
    mode: existing ? "edit" : "new",
    existingSlug: existing,
    isProduct: (s) => products.has(s),
    isLibraryUrl: () => imageOk,
  });
  if (!input) return { errors };

  if (!existing) {
    const { data: clash } = await admin.from("solar_kits").select("slug").eq("slug", input.kit.slug).maybeSingle();
    if (clash) return { errors: { slug: "Another kit already uses this web address — change it slightly." } };
  }

  const { error } = await admin.rpc("save_kit", {
    p_existing: existing ?? null,
    p_kit: input.kit,
    p_slots: input.slots,
    p_accessories: input.accessories,
    p_addons: input.addons,
    p_actor: actor.userId,
  });
  if (error) return { errors: { form: error.message.includes("kit_not_found") ? "That kit no longer exists." : `Couldn't save the kit (${error.message}).` } };

  await logActivity(actor, {
    action: existing ? "kit.update" : "kit.create",
    entityType: "kit",
    entityId: input.kit.slug,
    summary: `${existing ? "Updated" : "Created"} kit “${input.kit.name}”${input.kit.published ? "" : " (hidden)"}`,
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/kits");
  redirect(`/admin/kits?notice=${encodeURIComponent(`“${input.kit.name}” saved.`)}`);
}

/** Permanent delete — only for hidden kits (old orders keep their own copy of what was bought). */
export async function deleteKit(fd: FormData) {
  const actor = await requirePermission("catalog.manage");
  const slug = String(fd.get("slug") ?? "");
  if (!SLUG_RE.test(slug)) redirect("/admin/kits");
  const { data } = await supabaseAdmin().from("solar_kits").delete().eq("slug", slug).eq("published", false).select("name").maybeSingle();
  if (data) {
    await logActivity(actor, { action: "kit.delete", entityType: "kit", entityId: slug, summary: `Deleted kit “${data.name}”` });
    revalidatePath("/", "layout");
  }
  redirect(`/admin/kits?notice=${encodeURIComponent(data ? `“${data.name}” deleted.` : "Hide the kit first (untick “Show in the shop”), then delete it.")}`);
}
