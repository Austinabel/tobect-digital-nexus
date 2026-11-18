/**
 * The business's details: name, contacts, address, branding. Edited in
 * Admin → Site settings (table `site_settings`); every page, the footer,
 * structured data and every WhatsApp / phone / email action reads them, so a
 * change of number only ever happens in one place.
 *
 * Pure (no server or framework imports): the server loads the settings once
 * per request (src/lib/site-server.ts), client components read the same
 * snapshot through <SiteProvider>, and the parser below is unit-tested.
 */

export const SOCIAL_LABELS = ["Facebook", "Instagram", "YouTube", "LinkedIn"] as const;
export type SocialLabel = (typeof SOCIAL_LABELS)[number];

export interface SiteSettings {
  /** trading name, e.g. "Tobecat Technologies" */
  name: string;
  /** what customers call you in messages, e.g. "Tobecat" ("Hello Tobecat, …") */
  shortName: string;
  legalName: string;
  /** public web address, no trailing slash */
  url: string;
  /** slogan; the home page title is "name | tagline" */
  tagline: string;
  /** default description for search engines and link previews */
  description: string;
  email: string;
  /** display format, Nigerian local number */
  phone: string;
  whatsapp: string;
  address: { street: string; city: string; country: string };
  branches: string[];
  hours: string;
  social: { label: SocialLabel; href: string }[];
  brand: {
    /** big word in the logo, e.g. "TOBECAT" */
    wordmark: string;
    /** small line under it, e.g. "TECHNOLOGIES NIG LTD" */
    wordmarkSub: string;
    /** optional square logo mark (media library) shown before the logo word, instead of the bolt badge */
    logoUrl?: string;
    /** full logo image for the header (replaces the bolt badge and logo word); wide, no slogan */
    logoHeaderUrl?: string;
    /** full logo image for the footer, shown on a white panel (may include the slogan) */
    logoFooterUrl?: string;
  };
  /** short company description in the footer */
  footerBlurb: string;
  /** where new-order and new-quote alerts are emailed (empty = the contact email) */
  alertEmail: string;
  /**
   * Bank account for "Pay by bank transfer" at checkout. The option is offered
   * only when all three details are filled in.
   */
  bank: { bankName: string; accountName: string; accountNumber: string };
}

/** The bank account to show customers, or null when bank transfer isn't set up. */
export function bankTransferDetails(site: SiteSettings): SiteSettings["bank"] | null {
  const b = site.bank;
  return b.bankName && b.accountName && /^\d{10}$/.test(b.accountNumber) ? b : null;
}

/** The details the site launched with — used for anything not yet saved in the admin. */
export const DEFAULT_SITE: SiteSettings = {
  name: "Tobecat Technologies",
  shortName: "Tobecat",
  legalName: "Tobecat Technologies Nigeria Limited",
  url: "https://www.tobecat.com",
  tagline: "Powering the Future with Renewable Energy",
  description:
    "Tobecat Technologies Nigeria Limited supplies and installs solar panels, inverters, lithium batteries, solar generators, CCTV and security systems for homes and businesses across Nigeria.",
  email: "Tobecattech@gmail.com",
  phone: "08037946368",
  whatsapp: "07066056267",
  address: { street: "H106 Alaba International Market", city: "Lagos", country: "Nigeria" },
  branches: ["Abuja", "Awka"],
  hours: "Mon – Sat: 8AM – 6PM",
  // No verified profile URLs yet; a dead "#" link is worse than no link.
  social: [],
  // The owner's logo (public/brand). The logo word stays as the text fallback and for screen readers.
  brand: { wordmark: "TOBECAT", wordmarkSub: "TECHNOLOGIES NIG LTD", logoHeaderUrl: "/brand/logo-header.png", logoFooterUrl: "/brand/logo-full.png" },
  footerBlurb: "solar energy products, installation, CCTV and security systems for homes, businesses and industries across Nigeria.",
  alertEmail: "",
  bank: { bankName: "", accountName: "", accountNumber: "" },
};

/** Convert a Nigerian local number (0803…) to international digits (234803…). */
export function toInternational(local: string): string {
  const digits = local.replace(/\D/g, "");
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
}

/**
 * Contact links for a settings snapshot. Destructure it at the top of a
 * component: `const { SITE, PHONE_HREF, whatsappHref } = siteLinks(site)`.
 */
export function siteLinks(site: SiteSettings) {
  const EMAIL_HREF = `mailto:${site.email}`;
  return {
    SITE: site,
    PHONE_HREF: `tel:+${toInternational(site.phone)}`,
    EMAIL_HREF,
    /**
     * wa.me link, optionally pre-filled with a message. Messages written as
     * "Hello Tobecat, …" greet the business by its current short name.
     */
    whatsappHref(message?: string): string {
      const base = `https://wa.me/${toInternational(site.whatsapp)}`;
      const text = message?.replace(/^Hello Tobecat(?=[\s,!.])/, `Hello ${site.shortName}`);
      return text ? `${base}?text=${encodeURIComponent(text)}` : base;
    },
    mailtoHref(subject: string, body: string): string {
      return `${EMAIL_HREF}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
  };
}

// ---------------------------------------------------------------------------
// Validation — used when staff save the settings AND when the site reads them,
// so a bad value can never break a page (it falls back to the default).

export type SettingsErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function isNigerianPhone(v: string): boolean {
  const d = v.replace(/\D/g, "");
  return (d.length === 11 && d.startsWith("0")) || (d.length === 13 && d.startsWith("234"));
}

export function safeHttpsUrl(v: string): string | null {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password ? u.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

/**
 * Turn raw input (saved JSON, or form fields gathered into an object) into
 * clean settings. Missing or invalid fields get the default and an error
 * message, so the admin form can show what's wrong while the public site
 * simply keeps working.
 */
export function parseSiteSettings(raw: unknown, fallback: SiteSettings = DEFAULT_SITE): { site: SiteSettings; errors: SettingsErrors } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: SettingsErrors = {};
  const pick = (key: string, max: number, def: string, check?: (v: string) => string | null): string => {
    const v = str(r[key], max);
    if (!v) {
      if (key in r) errors[key] = "Required.";
      return def;
    }
    const problem = check?.(v);
    if (problem) {
      errors[key] = problem;
      return def;
    }
    return v;
  };

  const addr = (r.address && typeof r.address === "object" ? r.address : {}) as Record<string, unknown>;
  const brand = (r.brand && typeof r.brand === "object" ? r.brand : {}) as Record<string, unknown>;
  const url = str(r.url, 200);
  const cleanUrl = url ? safeHttpsUrl(url) : null;
  if (url && !cleanUrl) errors.url = "Use the full https:// address, e.g. https://tobecat.com";

  const branches = (Array.isArray(r.branches) ? r.branches : fallback.branches).map((b) => str(b, 40)).filter(Boolean).slice(0, 8);

  const social: SiteSettings["social"] = [];
  for (const [i, s] of (Array.isArray(r.social) ? r.social : fallback.social).entries()) {
    const o = (s ?? {}) as Record<string, unknown>;
    const label = str(o.label, 20) as SocialLabel;
    const href = str(o.href, 300);
    if (!href) continue;
    const clean = safeHttpsUrl(href);
    if (!SOCIAL_LABELS.includes(label)) errors[`social_${i}`] = "Choose the network.";
    else if (!clean) errors[`social_${i}`] = "Use the full https:// link to your profile.";
    else social.push({ label, href: clean });
  }

  const logo = str(brand.logoUrl, 600);
  const logoUrl = logo ? safeHttpsUrl(logo) ?? undefined : undefined;
  if (logo && !logoUrl) errors.logoUrl = "Pick the logo from the media library.";
  // Logo images: a media-library (https) image, or one of the logo files that ship with the site.
  const logoImage = (key: "logoHeaderUrl" | "logoFooterUrl"): string | undefined => {
    if (!(key in brand)) return fallback.brand[key];
    const v = str(brand[key], 600);
    if (!v) return undefined;
    const ok = /^\/brand\/[\w.-]+\.(png|svg|webp|jpe?g)$/.test(v) ? v : safeHttpsUrl(v);
    if (!ok) errors[key] = "Pick the logo from the media library.";
    return ok ?? fallback.brand[key];
  };
  const bankRaw = (r.bank && typeof r.bank === "object" ? r.bank : fallback.bank) as Record<string, unknown>;
  const bank = { bankName: str(bankRaw.bankName, 60), accountName: str(bankRaw.accountName, 100), accountNumber: str(bankRaw.accountNumber, 20).replace(/\s/g, "") };
  if (bank.accountNumber && !/^\d{10}$/.test(bank.accountNumber)) errors.accountNumber = "Nigerian account numbers have 10 digits.";
  const filled = [bank.bankName, bank.accountName, bank.accountNumber].filter(Boolean).length;
  if (filled > 0 && filled < 3) for (const k of ["bankName", "accountName", "accountNumber"] as const) if (!bank[k]) errors[k] = "Fill in all three bank details, or leave all empty.";
  const alertEmail = str(r.alertEmail ?? fallback.alertEmail, 120);
  if (alertEmail && !EMAIL_RE.test(alertEmail)) errors.alertEmail = "Enter a valid email address.";

  const logoHeaderUrl = logoImage("logoHeaderUrl");
  const logoFooterUrl = logoImage("logoFooterUrl");

  const site: SiteSettings = {
    name: pick("name", 80, fallback.name),
    shortName: pick("shortName", 40, fallback.shortName),
    legalName: pick("legalName", 120, fallback.legalName),
    url: cleanUrl ?? fallback.url,
    tagline: pick("tagline", 160, fallback.tagline),
    description: pick("description", 300, fallback.description, (v) => (v.length < 30 ? "Write at least a full sentence (30+ characters)." : null)),
    email: pick("email", 120, fallback.email, (v) => (EMAIL_RE.test(v) ? null : "Enter a valid email address.")),
    phone: pick("phone", 20, fallback.phone, (v) => (isNigerianPhone(v) ? null : "Enter a Nigerian number, e.g. 08031234567.")),
    whatsapp: pick("whatsapp", 20, fallback.whatsapp, (v) => (isNigerianPhone(v) ? null : "Enter a Nigerian number, e.g. 07031234567.")),
    address: {
      street: str(addr.street, 120) || fallback.address.street,
      city: str(addr.city, 60) || fallback.address.city,
      country: str(addr.country, 60) || fallback.address.country,
    },
    branches,
    hours: pick("hours", 80, fallback.hours),
    social,
    brand: {
      wordmark: str(brand.wordmark, 24) || fallback.brand.wordmark,
      wordmarkSub: "wordmarkSub" in brand ? str(brand.wordmarkSub, 40) : fallback.brand.wordmarkSub,
      ...(logoUrl ? { logoUrl } : {}),
      ...(logoHeaderUrl ? { logoHeaderUrl } : {}),
      ...(logoFooterUrl ? { logoFooterUrl } : {}),
    },
    footerBlurb: "footerBlurb" in r ? str(r.footerBlurb, 300) : fallback.footerBlurb,
    alertEmail: alertEmail && EMAIL_RE.test(alertEmail) ? alertEmail : "",
    bank: errors.accountNumber || errors.bankName || errors.accountName ? fallback.bank : bank,
  };
  return { site, errors };
}
