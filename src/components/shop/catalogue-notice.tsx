"use client";

import { useCatalog } from "@/components/catalog-provider";
import { hasSampleProducts } from "@/lib/catalog";
import { IconInfo } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Shown wherever prices appear while the shop still lists starter sample
 * products, so nobody mistakes an unconfirmed price for a final one.
 * Disappears by itself once the samples are deleted in the admin.
 */
export function CatalogueNotice({ className }: { className?: string }) {
  const catalog = useCatalog();
  if (!hasSampleProducts(catalog)) return null;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-[#f3dca9] bg-[#fff8e8] px-3.5 py-2.5 text-[0.8rem] leading-snug text-[#6b5216]",
        className,
      )}
    >
      <IconInfo className="mt-px size-4 shrink-0" />
      <span>
        Prices shown are indicative. We confirm the current price, stock and delivery with you before any payment.
      </span>
    </p>
  );
}
