import type { SVGProps } from "react";

/**
 * Shared line-icon set for the Tobecat marketing site.
 * Every icon takes the same props as a plain <svg>, so size/color
 * are controlled with `className` (e.g. `className="size-5 text-blue"`).
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBolt(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6h15l-1.5 9h-12L5 3H2" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.6} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconQuote(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

export function IconWhatsApp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 0 1 12 4Zm4.5 10.3c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2l-.1-.5-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.9 1-1 2.3-.2 3.6a11 11 0 0 0 4.2 3.9c2 .9 2.4.8 2.9.7.7-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2Z" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  );
}

export function IconCalculator(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h3M13 12h3M8 16h3M13 16h3" />
    </svg>
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 6a2 2 0 1 1 4 0c0 1.6-2 3-2 3M3 21l4-1 10-10-3-3L4 17l-1 4Z" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1" />
    </svg>
  );
}

export function IconSupport(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 11.5a8.5 8.5 0 1 1-3.4-6.8M21 4v5h-5" />
    </svg>
  );
}

export function IconHouse(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01" />
    </svg>
  );
}

export function IconFactory(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 21V10l7-4v4l7-4v15M7 21v-4M13 21v-4" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2 3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.6 3.2L6.7 14l-5-4.8 7-.9L12 2Z" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 2 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 22v-8h3l1-4h-4V8c0-1 .3-2 2-2h2V2h-3c-3 0-5 2-5 5v3H7v4h3v8Z" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconYoutube(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12s0-3.4-.4-5a2.7 2.7 0 0 0-1.9-1.9C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.7.4A2.7 2.7 0 0 0 2.4 7C2 8.6 2 12 2 12s0 3.4.4 5a2.7 2.7 0 0 0 1.9 1.9c1.8.4 7.7.4 7.7.4s5.9 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9c.4-1.6.4-5 .4-5ZM10 15V9l5 3Z" />
    </svg>
  );
}

export function IconLinkedin(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 9v10H3V9h3ZM4.5 3A1.8 1.8 0 1 1 4.5 7 1.8 1.8 0 0 1 4.5 3ZM21 19h-3v-5c0-1.4-.5-2.3-1.7-2.3-1 0-1.5.6-1.8 1.3-.1.3-.1.6-.1 1V19h-3V9h3v1.4c.5-.7 1.3-1.6 3-1.6 2.2 0 3.6 1.4 3.6 4.4V19Z" />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function IconImageOff(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M3 3l18 18M10.5 5H19a2 2 0 0 1 2 2v8.5M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7c0-.8.5-1.5 1.2-1.8" />
      <path d="m3 16 5-5 3 3M14.5 11.5 16 10l5 5" />
    </svg>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth={2.6} />
    </svg>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </svg>
  );
}

export function IconHardHat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18h18M5 18v-3a7 7 0 0 1 14 0v3" />
      <path d="M10 8.3V6h4v2.3M12 6v5" />
    </svg>
  );
}

export function IconCoins(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="9" cy="7" rx="6" ry="2.5" />
      <path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7" />
      <path d="M9 13.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4c0-1.4-2.7-2.5-6-2.5" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

export function IconBatteryCharge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="7" width="17" height="10" rx="2" />
      <path d="M21.5 10.5v3M11.5 9l-2.5 3.5h3.5L10 16" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconReturn(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

export function IconCard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6.5 15h4" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7.5-4.6-9.3-9.2C1.6 8 3.2 4.5 6.6 4.5c2 0 3.4 1.1 4.4 2.6l1 1.4 1-1.4c1-1.5 2.4-2.6 4.4-2.6 3.4 0 5 3.5 3.9 6.3C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5Z" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconTag(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M8 5.2l8.5 4.6" />
    </svg>
  );
}

/** Product / category glyphs — one per catalogue type. */
export const categoryGlyphs = {
  panel: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M3 8h18M3 12h18M9 4v12M15 4v12M12 16v5M8 21h8" />
    </svg>
  ),
  inverter: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M10 8l-3 4h4l-3 4M15 8v8" />
    </svg>
  ),
  battery: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="3" y="7" width="15" height="10" rx="1.5" />
      <path d="M18 10h3v4h-3M7 10v4M11 10v4" />
    </svg>
  ),
  generator: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <circle cx="9" cy="12.5" r="2.6" />
      <path d="M15 10h3M15 15h3M7 7V5h4v2" />
    </svg>
  ),
  camera: (
    <svg {...base} strokeWidth={1.5}>
      <path d="M3 8a4 4 0 0 1 4-4h7l6 5v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <circle cx="10" cy="9" r="2.6" />
      <path d="M8 21l2-4M16 21l-2-4" />
    </svg>
  ),
  light: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="7" y="3" width="10" height="6" rx="1.5" />
      <path d="M12 9v3M9 15h6l-1 6h-4l-1-6Z" />
    </svg>
  ),
  fan: (
    <svg {...base} strokeWidth={1.5}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 10c0-4 1-7 3-7s2 4-1 6M14 12c4 0 7 1 7 3s-4 2-6-1M12 14c0 4-1 7-3 7s-2-4 1-6M10 12c-4 0-7-1-7-3s4-2 6 1" />
    </svg>
  ),
  freezer: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 10h16M8 6v1M8 13v4" />
    </svg>
  ),
  pump: (
    <svg {...base} strokeWidth={1.5}>
      <circle cx="10" cy="12" r="6" />
      <path d="M10 12V7M10 12l4-2M16 8h4v4M18 8v10a2 2 0 0 1-2 2H8" />
    </svg>
  ),
  kit: (
    <svg {...base} strokeWidth={1.5}>
      <path d="M14.5 3.5l6 6M17 6l-6.5 6.5M4 20l4.5-4.5M6.5 13.5l4 4" />
      <path d="M3.5 8.5 8.5 3.5l3 3-5 5ZM13.5 16.5l3-3 4 4-3 3Z" />
    </svg>
  ),
  /** cables & accessories: a coiled cable with a plug end */
  cable: (
    <svg {...base} strokeWidth={1.5}>
      <path d="M4 20c0-4 3-5 6-5s6-1 6-5-2.5-6-6-6-6 2-6 5" />
      <path d="M16 10h3M19 7.5v5M21 8.5v3" />
    </svg>
  ),
  /** small appliances: a plug */
  appliance: (
    <svg {...base} strokeWidth={1.5}>
      <path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0Z" />
      <path d="M12 17v4" />
    </svg>
  ),
  all: (
    <svg {...base} strokeWidth={1.5}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  ),
} as const;

export type CategoryGlyphKey = keyof typeof categoryGlyphs;
