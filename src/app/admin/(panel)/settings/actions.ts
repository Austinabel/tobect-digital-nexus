"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { isLibraryUrl } from "@/lib/admin/media-library";
import { SOCIAL_LABELS, parseSiteSettings, type SettingsErrors } from "@/lib/site";

export interface SettingsState {
  errors?: SettingsErrors;
  saved?: boolean;
}

export async function saveSettings(_: SettingsState | undefined, fd: FormData): Promise<SettingsState> {
  const actor = await requirePermission("settings.manage");
  const v = (k: string) => String(fd.get(k) ?? "");
  const raw = {
    name: v("name"),
    shortName: v("shortName"),
    legalName: v("legalName"),
    url: v("url"),
    tagline: v("tagline"),
    description: v("description"),
    email: v("email"),
    phone: v("phone"),
    whatsapp: v("whatsapp"),
    address: { street: v("street"), city: v("city"), country: v("country") },
    branches: v("branches").split(",").map((b) => b.trim()).filter(Boolean),
    hours: v("hours"),
    social: SOCIAL_LABELS.map((label) => ({ label, href: v(`social_${label}`) })),
    brand: { wordmark: v("wordmark"), wordmarkSub: v("wordmarkSub"), logoUrl: v("logoUrl"), logoHeaderUrl: v("logoHeaderUrl"), logoFooterUrl: v("logoFooterUrl") },
    footerBlurb: v("footerBlurb"),
  };
  const { site, errors } = parseSiteSettings(raw);
  if (raw.brand.logoUrl && !(await isLibraryUrl(raw.brand.logoUrl))) errors.logoUrl = "Pick the logo from the media library.";
  // header/footer logos: a media-library image, or the logo files that ship with the site (/brand/…)
  for (const k of ["logoHeaderUrl", "logoFooterUrl"] as const) {
    const u = raw.brand[k];
    if (u && !u.startsWith("/brand/") && !(await isLibraryUrl(u))) errors[k] = "Pick the logo from the media library.";
  }
  for (const k of ["street", "city", "country"] as const) if (!raw.address[k].trim()) errors[k] = "Required.";
  if (!raw.brand.wordmark.trim()) errors.wordmark = "Required.";
  // social errors are reported by position; map them back to the network's field
  for (const [i, label] of SOCIAL_LABELS.entries()) {
    if (errors[`social_${i}`]) {
      errors[`social_${label}`] = errors[`social_${i}`];
      delete errors[`social_${i}`];
    }
  }
  if (Object.keys(errors).length) return { errors };

  const { error } = await supabaseAdmin()
    .from("site_settings")
    .upsert({ id: 1, data: site, updated_at: new Date().toISOString(), updated_by: actor.userId });
  if (error) return { errors: { form: `Couldn't save: ${error.message}` } };
  await logActivity(actor, { action: "settings.update", entityType: "settings", summary: "Updated site settings" });
  revalidatePath("/", "layout");
  return { saved: true };
}
