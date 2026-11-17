"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_SITE, siteLinks, type SiteSettings } from "@/lib/site";

const SiteContext = createContext<SiteSettings>(DEFAULT_SITE);

/** Hands the server-loaded site settings to client components (forms, calculator, header…). */
export function SiteProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteSettings {
  return useContext(SiteContext);
}

/** Settings + contact links, for client components. */
export function useSiteLinks() {
  const site = useSite();
  return useMemo(() => siteLinks(site), [site]);
}
