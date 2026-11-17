import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/server";
import { slotCampaigns, type Campaign, type CampaignPosition } from "@/lib/shop/campaigns";

/**
 * Banners and slides, read as an anonymous visitor (row-level security
 * only returns active, non-archived rows). Admin → Banners & slides edits
 * them. Banners are decoration: if the database can't be reached the page
 * still renders, just without them.
 */

interface CampaignRow {
  id: string;
  title: string;
  kicker: string | null;
  description: string | null;
  discount_label: string | null;
  cta_text: string;
  cta_href: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  image_alt: string | null;
  image_position: string | null;
  designed_banner: boolean;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  evergreen: boolean;
  priority: number;
  position: CampaignPosition;
  theme: Campaign["theme"] | null;
}

export function mapCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    title: r.title,
    kicker: r.kicker ?? undefined,
    description: r.description ?? undefined,
    discountLabel: r.discount_label ?? undefined,
    ctaText: r.cta_text,
    ctaHref: r.cta_href,
    desktopImage: r.desktop_image_url ?? undefined,
    mobileImage: r.mobile_image_url ?? undefined,
    imageAlt: r.image_alt ?? undefined,
    imagePosition: r.image_position ?? undefined,
    designedBanner: r.designed_banner,
    startsAt: r.starts_at ?? undefined,
    endsAt: r.ends_at ?? undefined,
    active: r.active,
    evergreen: r.evergreen,
    priority: r.priority,
    position: r.position,
    theme: r.theme ?? undefined,
  };
}

export const getCampaigns = cache(async (): Promise<Campaign[]> => {
  const { data, error } = await supabasePublic().from("campaigns").select("*");
  if (error) {
    console.error("Banners unavailable:", error.message);
    return [];
  }
  return (data as CampaignRow[]).map(mapCampaign);
});

/** Banners for one slot right now (see slotCampaigns for the rules). */
export async function campaignsFor(position: CampaignPosition, now: Date, limit: number): Promise<Campaign[]> {
  return slotCampaigns(await getCampaigns(), position, now, limit);
}

export interface HeroSlide {
  id: string;
  url: string;
  alt: string;
  /** focal point for object-position, so the subject stays in frame on narrow screens */
  position?: string;
}

/** Homepage background slideshow, in order. */
export const getHomeSlides = cache(async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabasePublic().from("hero_slides").select("id, image_url, alt, image_position").order("sort_order").order("created_at");
  if (error) {
    console.error("Hero slides unavailable:", error.message);
    return [];
  }
  return data.map((s) => ({ id: s.id, url: s.image_url, alt: s.alt, position: s.image_position ?? undefined }));
});
