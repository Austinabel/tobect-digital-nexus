import { supabaseAdmin } from "@/lib/supabase/server";
import type { PickerImage } from "@/components/admin/image-picker";

/** Images available to pick in admin forms (newest first). */
export async function libraryImages(): Promise<PickerImage[]> {
  const { data } = await supabaseAdmin().from("media_assets").select("id, public_url, alt, filename").is("deleted_at", null).order("created_at", { ascending: false }).limit(400);
  return (data ?? []).map((m) => ({ id: m.id, url: m.public_url, alt: m.alt, filename: m.filename }));
}

/** true when the URL is a (non-deleted) media-library image — forms only accept those. */
export async function isLibraryUrl(url: string): Promise<boolean> {
  const { data } = await supabaseAdmin().from("media_assets").select("id").eq("public_url", url).is("deleted_at", null).limit(1);
  return Boolean(data?.length);
}

/**
 * Where images are used by banners, slides and kits, keyed by URL — so the
 * media library can show it and refuse to delete an image that is in use.
 */
export async function mediaReferences(urls?: string[]): Promise<Map<string, string[]>> {
  const admin = supabaseAdmin();
  const [{ data: camps }, { data: slides }, { data: kits }] = await Promise.all([
    admin.from("campaigns").select("title, desktop_image_url, mobile_image_url").is("archived_at", null),
    admin.from("hero_slides").select("alt, image_url"),
    admin.from("solar_kits").select("name, image_url"),
  ]);
  const refs = new Map<string, string[]>();
  const add = (url: string | null, label: string) => {
    if (!url || (urls && !urls.includes(url))) return;
    refs.set(url, [...(refs.get(url) ?? []), label]);
  };
  for (const c of camps ?? []) {
    add(c.desktop_image_url, `Banner: ${c.title}`);
    add(c.mobile_image_url, `Banner (mobile): ${c.title}`);
  }
  for (const s of slides ?? []) add(s.image_url, "Homepage slideshow");
  for (const k of kits ?? []) add(k.image_url, `Kit: ${k.name}`);
  return refs;
}
