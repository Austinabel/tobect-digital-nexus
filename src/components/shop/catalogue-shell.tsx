"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Ctx {
  pending: boolean;
  navigate: (href: string) => void;
}

const CatalogueCtx = createContext<Ctx>({ pending: false, navigate: () => {} });
export const useCatalogueNav = () => useContext(CatalogueCtx);

/**
 * Wraps the catalogue so filter, sort and view changes navigate in a
 * transition: the URL updates (shareable, back-button friendly), the
 * server re-renders the results, and the old results dim meanwhile.
 */
export function CatalogueShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <CatalogueCtx.Provider value={{ pending, navigate: (href) => start(() => router.push(href, { scroll: false })) }}>
      {children}
    </CatalogueCtx.Provider>
  );
}

export function CatalogueResults({ children }: { children: ReactNode }) {
  const { pending } = useCatalogueNav();
  return (
    <div aria-busy={pending} className={cn("transition-opacity duration-150", pending && "pointer-events-none opacity-50")}>
      {children}
    </div>
  );
}
