/**
 * Promotional campaigns: scheduling and selection.
 *
 * Campaign records come from the `campaigns` table (edited in Admin →
 * Banners & slides). Whether a
 * campaign shows is decided here at request time, so an expired campaign
 * disappears on its own without anyone editing or redeploying the site.
 */

/** shop-hero = the parallelogram slideshow in the shop header; shop-wide = full-width banner between product sections */
export type CampaignPosition = "shop-hero" | "shop-primary" | "shop-secondary" | "shop-tile" | "shop-wide";

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  /** e.g. "Free 20,000mAh power bank" — only a genuine, approved offer */
  discountLabel?: string;
  ctaText: string;
  /** site path ("/shop/solar-generators") or full https URL */
  ctaHref: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  /**
   * true = the image is a finished banner design (text and offer already in
   * the artwork), shown as-is; false/omitted = a photo the site writes the
   * title and button over.
   */
  designedBanner?: boolean;
  /** ISO date-time; omitted = no limit on that side */
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  /** higher shows first */
  priority: number;
  position: CampaignPosition;
  /** colour scheme when there is no image (or behind a transparent one) */
  theme?: "blue" | "navy" | "red";
  kicker?: string;
  /**
   * Evergreen "house" banner: no offer, no dates — fills its slot only when no
   * dated promotion is running (in the hero slideshow it follows them).
   */
  evergreen?: boolean;
  /** CSS object-position focal point, e.g. "50% 78%" */
  imagePosition?: string;
}

export function isCampaignLive(c: Campaign, now: Date): boolean {
  if (!c.active) return false;
  const t = now.getTime();
  if (c.startsAt) {
    const start = Date.parse(c.startsAt);
    if (Number.isNaN(start) || t < start) return false;
  }
  if (c.endsAt) {
    const end = Date.parse(c.endsAt);
    if (Number.isNaN(end) || t >= end) return false;
  }
  return true;
}

/** Live campaigns for one banner slot, highest priority first, then the one ending soonest. */
export function selectCampaigns(all: Campaign[], position: CampaignPosition, now: Date, limit = Infinity): Campaign[] {
  return all
    .filter((c) => c.position === position && isCampaignLive(c, now))
    .sort((a, b) => b.priority - a.priority || (Date.parse(a.endsAt ?? "9999") - Date.parse(b.endsAt ?? "9999")) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/**
 * Only same-site paths and https links may be used as a banner link, so a
 * mistyped or malicious destination (e.g. `javascript:`) can't be published.
 */
export function safeCampaignHref(href: string): string | null {
  const h = href.trim();
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  try {
    const url = new URL(h);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * What a banner slot shows: live promotions first (by priority). The hero
 * slideshow then continues with the evergreen slides, up to `limit`; every
 * other slot shows evergreen banners only when no promotion is live.
 */
export function slotCampaigns(all: Campaign[], position: CampaignPosition, now: Date, limit: number): Campaign[] {
  const promos = selectCampaigns(all.filter((c) => !c.evergreen), position, now, limit);
  const house = selectCampaigns(all.filter((c) => c.evergreen), position, now, limit);
  if (position === "shop-hero") return [...promos, ...house].slice(0, limit);
  return promos.length ? promos : house;
}
