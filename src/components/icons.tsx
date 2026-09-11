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
} as const;

export type CategoryGlyphKey = keyof typeof categoryGlyphs;
