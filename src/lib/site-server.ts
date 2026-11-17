import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/server";
import { DEFAULT_SITE, parseSiteSettings, siteLinks, type SiteSettings } from "@/lib/site";

/**
 * The saved site settings, once per request. If the database can't be
 * reached the site keeps working with the launch details (DEFAULT_SITE).
 */
export const getSite = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await supabasePublic().from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) {
    console.error("Site settings unavailable:", error.message);
    return DEFAULT_SITE;
  }
  return parseSiteSettings(data?.data ?? {}).site;
});

/** Settings + ready-made contact links, for server components. */
export async function getSiteLinks() {
  return siteLinks(await getSite());
}
