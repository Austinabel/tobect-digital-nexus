/**
 * Server-side validation for the admin banner (campaign) form. Pure and
 * unit-tested (campaign-form.test.ts): takes the submitted fields and
 * returns a clean database row or per-field errors. The browser is never trusted.
 */
import { safeCampaignHref, type CampaignPosition } from "../shop/campaigns";

export const POSITIONS: { value: CampaignPosition; label: string; hint: string }[] = [
  { value: "shop-hero", label: "Hero slideshow (homepage & shop)", hint: "Slanted slideshow at the top of the homepage and the shop. Image 1600×1000; keep text in the middle 75%." },
  { value: "shop-primary", label: "Shop banner — large", hint: "Large banner under the shop header. Image about 1200×560." },
  { value: "shop-secondary", label: "Shop banner — side", hint: "Smaller banner beside the large one. Image about 1200×560." },
  { value: "shop-tile", label: "Shop tile (up to 3)", hint: "Row of up to three tiles under the banners. Image about 1200×560." },
  { value: "shop-wide", label: "Shop wide banner", hint: "Full-width banner between product sections. Designed banner 1240×300 (mobile 800×600)." },
];
export const THEMES = ["navy", "blue", "red"] as const;

export interface CampaignRowInput {
  position: CampaignPosition;
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
  theme: (typeof THEMES)[number] | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  evergreen: boolean;
  priority: number;
}

export type CampaignErrors = Partial<Record<keyof CampaignRowInput | "form", string>>;

/** Nigeria is UTC+1 all year (no daylight saving), so local times convert exactly. */
const LAGOS_OFFSET = "+01:00";

/** "2026-12-01T09:00" typed in Lagos time → ISO timestamp (UTC). */
export function lagosLocalToIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}:00${LAGOS_OFFSET}`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** ISO timestamp → value for an <input type="datetime-local"> in Lagos time. */
export function isoToLagosLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t + 60 * 60 * 1000).toISOString().slice(0, 16);
}

/** Focal points offered for cropping: where the important part of the photo is. */
export const FOCUS_OPTIONS = [
  ["", "Centre"],
  ["50% 20%", "Top"],
  ["50% 80%", "Bottom"],
  ["20% 50%", "Left"],
  ["80% 50%", "Right"],
  ["20% 20%", "Top left"],
  ["80% 20%", "Top right"],
  ["20% 80%", "Bottom left"],
  ["80% 80%", "Bottom right"],
] as const;

export const FOCUS_RE = /^(100|[1-9]?[0-9])% (100|[1-9]?[0-9])%$/;

const text = (v: FormDataEntryValue | null | undefined, max: number) => String(v ?? "").trim().slice(0, max);
const opt = (v: FormDataEntryValue | null | undefined, max: number) => text(v, max) || null;

/**
 * @param isLibraryUrl tells whether an image URL belongs to the media library
 *   (checked by the caller against the database).
 */
export function parseCampaignForm(get: (k: string) => FormDataEntryValue | null, isLibraryUrl: (url: string) => boolean): { row?: CampaignRowInput; errors: CampaignErrors } {
  const errors: CampaignErrors = {};
  const position = text(get("position"), 20) as CampaignPosition;
  if (!POSITIONS.some((p) => p.value === position)) errors.position = "Choose where the banner appears.";

  const title = text(get("title"), 200);
  if (title.length < 3) errors.title = "Give the banner a title (it's also used for screen readers).";
  else if (title.length > 120) errors.title = "Keep the title under 120 characters.";

  const cta_text = text(get("cta_text"), 60);
  if (!cta_text) errors.cta_text = "Button text is required, e.g. “Shop the Promo”.";
  else if (cta_text.length > 40) errors.cta_text = "Keep the button text under 40 characters.";

  const rawHref = text(get("cta_href"), 500);
  const cta_href = safeCampaignHref(rawHref);
  if (!rawHref) errors.cta_href = "Where should the button go? e.g. /shop/inverters";
  else if (!cta_href) errors.cta_href = "Use a page on this site (starting with /) or a full https:// link.";

  const image = (k: "desktop_image_url" | "mobile_image_url") => {
    const url = opt(get(k), 600);
    if (url && !isLibraryUrl(url)) errors[k] = "Pick the image from the media library.";
    return url;
  };
  const desktop_image_url = image("desktop_image_url");
  const mobile_image_url = image("mobile_image_url");
  if (mobile_image_url && !desktop_image_url) errors.mobile_image_url = "Add the main (desktop) image first.";

  const designed_banner = get("designed_banner") === "on";
  if (designed_banner && !desktop_image_url) errors.designed_banner = "A designed banner needs its artwork image.";

  const image_alt = opt(get("image_alt"), 200);
  if (designed_banner && !image_alt) errors.image_alt = "Describe what the banner says — screen readers can't read text inside an image.";

  const image_position = opt(get("image_position"), 10);
  if (image_position && !FOCUS_RE.test(image_position)) errors.image_position = "Choose a focal point.";

  const themeRaw = text(get("theme"), 10);
  const theme = (THEMES as readonly string[]).includes(themeRaw) ? (themeRaw as CampaignRowInput["theme"]) : null;

  const evergreen = get("evergreen") === "on";
  const discount_label = opt(get("discount_label"), 80);
  const startsRaw = text(get("starts_at"), 20);
  const endsRaw = text(get("ends_at"), 20);
  const starts_at = startsRaw ? lagosLocalToIso(startsRaw) : null;
  const ends_at = endsRaw ? lagosLocalToIso(endsRaw) : null;
  if (startsRaw && !starts_at) errors.starts_at = "Enter a valid start date and time.";
  if (endsRaw && !ends_at) errors.ends_at = "Enter a valid end date and time.";
  if (starts_at && ends_at && Date.parse(ends_at) <= Date.parse(starts_at)) errors.ends_at = "The end must be after the start.";
  if (evergreen) {
    // Evergreen banners fill empty slots indefinitely, so they must make no time-limited offer.
    if (discount_label) errors.discount_label = "Always-on banners can't carry an offer badge. Untick “Always-on” for a promotion.";
    if (starts_at || ends_at) errors.ends_at = "Always-on banners don't have dates. Untick “Always-on” to schedule a promotion.";
  }

  const priorityRaw = text(get("priority"), 6) || "0";
  const priority = Number(priorityRaw);
  if (!Number.isInteger(priority) || priority < -100 || priority > 100) errors.priority = "Use a whole number from -100 to 100.";

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    row: {
      position,
      title,
      kicker: opt(get("kicker"), 40),
      description: opt(get("description"), 400),
      discount_label,
      cta_text,
      cta_href: cta_href!,
      desktop_image_url,
      mobile_image_url,
      image_alt,
      image_position,
      designed_banner,
      theme,
      starts_at,
      ends_at,
      active: get("active") === "on",
      evergreen,
      priority,
    },
  };
}

export type CampaignState = "live" | "scheduled" | "ended" | "draft" | "always-on";

/** Plain-words status for the admin list. */
export function campaignState(c: { active: boolean; evergreen: boolean; starts_at: string | null; ends_at: string | null }, now: Date): CampaignState {
  if (!c.active) return "draft";
  if (c.evergreen) return "always-on";
  if (c.ends_at && Date.parse(c.ends_at) <= now.getTime()) return "ended";
  if (c.starts_at && Date.parse(c.starts_at) > now.getTime()) return "scheduled";
  return "live";
}
