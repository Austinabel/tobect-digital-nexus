"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { mediaReferences } from "@/lib/admin/media-library";
import { MAX_IMAGE_BYTES } from "@/lib/admin/image-file";
import { storeImage } from "@/lib/admin/media-store";

export interface UploadState {
  ok?: string;
  errors?: string[];
  /** newly created library images (so a product form can add them straight away); includes reused duplicates */
  created?: { id: string; url: string; alt: string; filename: string }[];
  /** how many of the files were already in the library (identical file) and were reused instead of stored again */
  reused?: number;
}

const MAX_FILES = 10;

export async function uploadMedia(_: UploadState | undefined, fd: FormData): Promise<UploadState> {
  const actor = await requirePermission("media.manage");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { errors: ["Choose at least one image."] };
  if (files.length > MAX_FILES) return { errors: [`Upload up to ${MAX_FILES} images at a time.`] };

  const errors: string[] = [];
  const created: NonNullable<UploadState["created"]> = [];
  let uploaded = 0;
  let reused = 0;

  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name.slice(0, 120)}: larger than 5 MB — please resize it.`);
      continue;
    }
    const res = await storeImage(new Uint8Array(await file.arrayBuffer()), file.name, actor);
    if ("error" in res) {
      errors.push(res.error);
      continue;
    }
    if (res.reused) reused++;
    else uploaded++;
    if (!created.some((c) => c.id === res.image.id)) created.push(res.image);
  }
  revalidatePath("/admin/media");
  const reusedNote = reused ? ` ${reused} ${reused === 1 ? "was" : "were"} already in the library, so the existing ${reused === 1 ? "copy was" : "copies were"} used.` : "";
  return {
    ok: uploaded || reused ? `${uploaded ? `Uploaded ${uploaded} image${uploaded > 1 ? "s" : ""}. Add alt text so screen readers and search engines can describe ${uploaded > 1 ? "them" : "it"}.` : ""}${reusedNote}`.trim() : undefined,
    errors: errors.length ? errors : undefined,
    created,
    reused,
  };
}

function back(view: string | null, notice?: string): never {
  const sp = new URLSearchParams();
  if (view) sp.set("view", view);
  if (notice) sp.set("notice", notice);
  redirect(`/admin/media${sp.size ? `?${sp}` : ""}`);
}

export async function updateMedia(fd: FormData) {
  const actor = await requirePermission("media.manage");
  const id = String(fd.get("id") ?? "");
  const creditUrl = String(fd.get("credit_url") ?? "").trim();
  if (creditUrl && !/^https:\/\/\S+$/.test(creditUrl)) back(String(fd.get("view") || "") || null, "Credit links must start with https://");
  const patch = {
    alt: String(fd.get("alt") ?? "").trim().slice(0, 250),
    credit: String(fd.get("credit") ?? "").trim().slice(0, 120) || null,
    credit_url: creditUrl.slice(0, 300) || null,
    license: String(fd.get("license") ?? "").trim().slice(0, 120) || null,
    updated_at: new Date().toISOString(),
  };
  await supabaseAdmin().from("media_assets").update(patch).eq("id", id);
  await logActivity(actor, { action: "media.update", entityType: "media", entityId: id, summary: `Updated details of image ${String(fd.get("filename") ?? "")}` });
  revalidatePath("/admin/media");
}

export async function deleteMedia(fd: FormData) {
  const actor = await requirePermission("media.manage");
  const id = String(fd.get("id") ?? "");
  const view = String(fd.get("view") || "") || null;
  const { data: asset } = await supabaseAdmin().from("media_assets").select("filename, usage, public_url").eq("id", id).maybeSingle();
  if (!asset) back(view, "That image no longer exists.");
  const live = (await mediaReferences([asset.public_url])).get(asset.public_url) ?? [];
  if (live.length) back(view, `${asset.filename} is still used (${live.join(", ")}). Replace it there first.`);
  if (asset.usage?.length) back(view, `${asset.filename} is still used on the site (${asset.usage.join(", ")}). Replace it there first.`);
  const { data: productUse } = await supabaseAdmin().from("product_images").select("product_slug").eq("media_id", id);
  if (productUse?.length) back(view, `${asset.filename} is a photo of ${productUse.map((p) => p.product_slug).join(", ")}. Remove it from the product first.`);
  await supabaseAdmin().from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  await logActivity(actor, { action: "media.delete", entityType: "media", entityId: id, summary: `Moved image ${asset.filename} to recently deleted` });
  back(view, `${asset.filename} moved to Recently deleted — you can restore it.`);
}

export async function restoreMedia(fd: FormData) {
  const actor = await requirePermission("media.manage");
  const id = String(fd.get("id") ?? "");
  await supabaseAdmin().from("media_assets").update({ deleted_at: null }).eq("id", id);
  await logActivity(actor, { action: "media.restore", entityType: "media", entityId: id, summary: `Restored image ${String(fd.get("filename") ?? "")}` });
  back("deleted", "Image restored.");
}
