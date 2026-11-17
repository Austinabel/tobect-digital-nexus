"use client";

import { createContext, useContext, type ReactNode } from "react";
import { APPLIANCE_LIBRARY, type ApplianceTemplate } from "@/lib/calculator";

const AppliancesContext = createContext<readonly ApplianceTemplate[]>(APPLIANCE_LIBRARY);

/** The appliance list from Admin → Calculator settings, for the calculators. */
export function AppliancesProvider({ value, children }: { value: ApplianceTemplate[]; children: ReactNode }) {
  return <AppliancesContext.Provider value={value}>{children}</AppliancesContext.Provider>;
}

export function useAppliances(): readonly ApplianceTemplate[] {
  return useContext(AppliancesContext);
}
