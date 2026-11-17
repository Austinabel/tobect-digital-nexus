import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { MAX_IMAGE_BYTES, imageSize, sniffImage } from "@/lib/admin/image-file";
import type { Staff } from "@/lib/admin/auth";

const BUCKET = "media";

export interface StoredImage {
  id: string;
  url: string;
  alt: string;
  filename: string;
}

/**
 * Puts one image into the media library — the single path used by uploads,
 * "image from a link" and bulk import, so every route gets the same checks:
 * real image format (from the bytes, not the name), size limit, and no
 * duplicates (an identical file reuses the existing library image).
 */
export async function storeImage(
  bytes: Uint8Array,
  filename: string,
  actor: Pick<Staff, "userId" | "email">,
  extra: { alt?: string; creditUrl?: string; source?: string } = {},
): Promise<{ image: StoredImage; reused: boolean } | { error: string }> {
  const name = filename.slice(0, 120) || "image";
  if (bytes.length > MAX_IMAGE_BYTES) return { error: `${name}: larger than 5 MB — please use a smaller image.` };
  const kind = sniffImage(bytes);
  if (!kind) return { error: `${name}: not a JPEG, PNG, WebP or AVIF image.` };

  const admin = supabaseAdmin();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const { data: same } = await admin.from("media_assets").select("id, public_url, alt, filename").eq("sha256", sha256).is("deleted_at", null).maybeSingle();
  if (same) return { image: { id: same.id, url: same.public_url, alt: same.alt, filename: same.filename }, reused: true };

  const now = new Date();
  const storagePath = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${kind.ext}`;
  const { error: upErr } = await admin.storage.from(BUCKET).upload(storagePath, bytes, { contentType: kind.mime, cacheControl: "31536000", upsert: false });
  if (upErr) return { error: `${name}: upload failed (${upErr.message}).` };
  const url = admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const size = imageSize(bytes);
  const { data: row, error: dbErr } = await admin
    .from("media_assets")
    .insert({
      storage_path: storagePath,
      public_url: url,
      filename: name,
      mime_type: kind.mime,
      size_bytes: bytes.length,
      width: size?.width ?? null,
      height: size?.height ?? null,
      sha256,
      alt: (extra.alt ?? "").slice(0, 200),
      credit_url: extra.creditUrl ?? null,
      uploaded_by: actor.userId,
    })
    .select("id")
    .single();
  if (dbErr || !row) {
    await admin.storage.from(BUCKET).remove([storagePath]); // don't leave an orphaned file
    // two uploads of the same new file at once: the other one won — reuse it
    const { data: winner } = await admin.from("media_assets").select("id, public_url, alt, filename").eq("sha256", sha256).is("deleted_at", null).maybeSingle();
    if (winner) return { image: { id: winner.id, url: winner.public_url, alt: winner.alt, filename: winner.filename }, reused: true };
    return { error: `${name}: couldn't be saved.` };
  }
  await logActivity(actor, { action: "media.upload", entityType: "media", entityId: row.id, summary: `${extra.source ?? "Uploaded"} image ${name}` });
  return { image: { id: row.id, url, alt: extra.alt ?? "", filename: name }, reused: false };
}
