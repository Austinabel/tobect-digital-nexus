"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { CONTENT_KEYS, CONTENT_SCHEMAS, parseContent, type ContentErrors, type ContentKey } from "@/lib/content";

export interface PageContentState {
  errors?: ContentErrors;
  saved?: boolean;
}

export async function savePageContent(_: PageContentState | undefined, fd: FormData): Promise<PageContentState> {
  const key = String(fd.get("key") ?? "") as ContentKey;
  if (!CONTENT_KEYS.includes(key)) return { errors: { form: "Unknown page." } };
  const actor = await requirePermission(CONTENT_SCHEMAS[key].permission ?? "content.manage");
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("data") ?? "{}"));
  } catch {
    return { errors: { form: "The form couldn't be read — please reload the page and try again." } };
  }

  // Images must already be in the media library.
  const admin = supabaseAdmin();
  const { data: media } = await admin.from("media_assets").select("public_url").is("deleted_at", null);
  const library = new Set((media ?? []).map((m) => m.public_url));
  const { value, errors } = parseContent(key, raw, { isLibraryUrl: (u) => library.has(u) });
  if (Object.keys(errors).length) return { errors };

  const { error } = await admin.from("page_content").upsert({ key, data: value, updated_at: new Date().toISOString(), updated_by: actor.userId });
  if (error) return { errors: { form: `Couldn't save: ${error.message}` } };
  await logActivity(actor, { action: "page.update", entityType: "page", entityId: key, summary: `Updated ${CONTENT_SCHEMAS[key].title}` });
  revalidatePath("/", "layout");
  return { saved: true };
}
