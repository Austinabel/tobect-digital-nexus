"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Catalog } from "@/lib/catalog";

const CatalogContext = createContext<Catalog | null>(null);

/** Hands the server-fetched catalogue to client components (cart, checkout, calculator…). */
export function CatalogProvider({ value, children }: { value: Catalog; children: ReactNode }) {
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const c = useContext(CatalogContext);
  if (!c) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return c;
}
