"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { isLibraryUrl } from "@/lib/admin/media-library";
import { parseCampaignForm, FOCUS_RE, type CampaignErrors } from "@/lib/admin/campaign-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface BannerFormState {
  errors?: CampaignErrors;
}

function refreshSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners");
}

export async function saveBanner(_: BannerFormState | undefined, fd: FormData): Promise<BannerFormState> {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  if (id && !UUID.test(id)) return { errors: { form: "That banner no longer exists." } };

  // Images are checked against the media library before validation runs.
  const urls = ["desktop_image_url", "mobile_image_url"].map((k) => String(fd.get(k) ?? "").trim()).filter(Boolean);
  const known = new Set<string>();
  for (const u of urls) if (await isLibraryUrl(u)) known.add(u);
  const { row, errors } = parseCampaignForm((k) => fd.get(k), (u) => known.has(u));
  if (!row) return { errors };

  const admin = supabaseAdmin();
  const record = { ...row, updated_by: actor.userId, updated_at: new Date().toISOString() };
  let savedId = id;
  if (id) {
    const { data, error } = await admin.from("campaigns").update(record).eq("id", id).select("id");
    if (error) return { errors: { form: `Couldn't save: ${error.message}` } };
    if (!data?.length) return { errors: { form: "That banner no longer exists." } };
  } else {
    const { data, error } = await admin.from("campaigns").insert({ ...record, created_by: actor.userId }).select("id").single();
    if (error) return { errors: { form: `Couldn't save: ${error.message}` } };
    savedId = data.id;
  }
  await logActivity(actor, { action: id ? "banner.update" : "banner.create", entityType: "campaign", entityId: savedId, summary: `${id ? "Updated" : "Created"} banner “${row.title}”` });
  refreshSite();
  redirect(`/admin/banners?notice=${encodeURIComponent(`“${row.title}” saved.`)}`);
}

async function setArchived(fd: FormData, archived: boolean) {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/banners");
  const { data } = await supabaseAdmin()
    .from("campaigns")
    .update({ archived_at: archived ? new Date().toISOString() : null, ...(archived ? { active: false } : {}), updated_by: actor.userId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (!data) redirect("/admin/banners");
  await logActivity(actor, { action: archived ? "banner.archive" : "banner.restore", entityType: "campaign", entityId: id, summary: `${archived ? "Archived" : "Restored"} banner “${data.title}”` });
  refreshSite();
  redirect(`/admin/banners?${archived ? "" : "view=archived&"}notice=${encodeURIComponent(archived ? `“${data.title}” archived — it's off the site. Restore it from Archived.` : `“${data.title}” restored as a draft. Switch it on when ready.`)}`);
}

export async function archiveBanner(fd: FormData) {
  await setArchived(fd, true);
}

export async function restoreBanner(fd: FormData) {
  await setArchived(fd, false);
}

/** Permanent delete — only for banners already archived. */
export async function deleteBanner(fd: FormData) {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/banners?view=archived");
  const { data } = await supabaseAdmin().from("campaigns").delete().eq("id", id).not("archived_at", "is", null).select("title").maybeSingle();
  if (data) await logActivity(actor, { action: "banner.delete", entityType: "campaign", entityId: id, summary: `Deleted banner “${data.title}” permanently` });
  redirect(`/admin/banners?view=archived&notice=${encodeURIComponent(data ? `“${data.title}” deleted.` : "Only archived banners can be deleted.")}`);
}

// ---------------- homepage background slides ----------------

function slidesBack(notice: string): never {
  redirect(`/admin/banners/home-slides?notice=${encodeURIComponent(notice)}`);
}

export async function addHomeSlide(fd: FormData) {
  const actor = await requirePermission("content.manage");
  const url = String(fd.get("image_url") ?? "").trim();
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200);
  const position = String(fd.get("image_position") ?? "").trim() || null;
  if (!url) slidesBack("Choose an image for the slide.");
  if (alt.length < 5) slidesBack("Describe the photo in a few words (for screen readers).");
  if (position && !FOCUS_RE.test(position)) slidesBack("Choose a focal point.");
  const admin = supabaseAdmin();
  const { data: media } = await admin.from("media_assets").select("credit, credit_url, is_sample").eq("public_url", url).is("deleted_at", null).maybeSingle();
  if (!media) slidesBack("Pick the image from the media library.");
  const { data: last } = await admin.from("hero_slides").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { error } = await admin.from("hero_slides").insert({
    image_url: url,
    alt,
    image_position: position,
    credit_name: media.credit,
    credit_url: media.credit_url?.startsWith("https://") ? media.credit_url : null,
    is_sample: media.is_sample,
    sort_order: (last?.[0]?.sort_order ?? 0) + 1,
    updated_by: actor.userId,
  });
  if (error) slidesBack(`Couldn't add the slide: ${error.message}`);
  await logActivity(actor, { action: "slide.create", entityType: "hero_slide", summary: `Added homepage slide “${alt}”` });
  refreshSite();
  slidesBack("Slide added.");
}

export async function updateHomeSlide(fd: FormData) {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) slidesBack("That slide no longer exists.");
  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200);
  const position = String(fd.get("image_position") ?? "").trim() || null;
  if (alt.length < 5) slidesBack("Describe the photo in a few words (for screen readers).");
  if (position && !FOCUS_RE.test(position)) slidesBack("Choose a focal point.");
  const active = fd.get("active") === "on";
  if (!active) {
    const { count } = await supabaseAdmin().from("hero_slides").select("id", { count: "exact", head: true }).eq("active", true).neq("id", id);
    if (!count) slidesBack("Keep at least one visible slide — the homepage needs a background.");
  }
  await supabaseAdmin()
    .from("hero_slides")
    .update({ alt, image_position: position, active, updated_by: actor.userId, updated_at: new Date().toISOString() })
    .eq("id", id);
  await logActivity(actor, { action: "slide.update", entityType: "hero_slide", entityId: id, summary: `Updated homepage slide “${alt}”` });
  refreshSite();
  slidesBack("Slide updated.");
}

export async function moveHomeSlide(fd: FormData) {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const admin = supabaseAdmin();
  const { data: all } = await admin.from("hero_slides").select("id, sort_order").order("sort_order").order("created_at");
  const list = all ?? [];
  const i = list.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) slidesBack("Order unchanged.");
  [list[i], list[j]] = [list[j], list[i]];
  // renumber 1..n so the order is unambiguous
  await Promise.all(list.map((s, n) => admin.from("hero_slides").update({ sort_order: n + 1 }).eq("id", s.id)));
  await logActivity(actor, { action: "slide.reorder", entityType: "hero_slide", entityId: id, summary: "Reordered homepage slides" });
  refreshSite();
  slidesBack("Order updated.");
}

export async function deleteHomeSlide(fd: FormData) {
  const actor = await requirePermission("content.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) slidesBack("That slide no longer exists.");
  const admin = supabaseAdmin();
  const { count } = await admin.from("hero_slides").select("id", { count: "exact", head: true }).eq("active", true).neq("id", id);
  if (!count) slidesBack("Keep at least one visible slide — the homepage needs a background. Add another first.");
  const { data } = await admin.from("hero_slides").delete().eq("id", id).select("alt").maybeSingle();
  if (data) await logActivity(actor, { action: "slide.delete", entityType: "hero_slide", entityId: id, summary: `Removed homepage slide “${data.alt}” (the image stays in the media library)` });
  refreshSite();
  slidesBack("Slide removed. The image is still in the media library.");
}
