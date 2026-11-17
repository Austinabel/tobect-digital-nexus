"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import type { KitConfig } from "@/lib/shop/kits";
import { IconCart, IconCheck } from "@/components/icons";

/** Adds a kit (in a given, already-validated configuration) to the cart. */
export function KitAddButton({
  slug,
  name,
  config,
  quantity = 1,
  disabled,
  size = "md",
  className,
}: {
  slug: string;
  name: string;
  config: KitConfig;
  quantity?: number;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const { addKit } = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addKit(slug, config, quantity);
        setAdded(true);
      }}
      aria-label={size === "md" ? `Add ${name} to cart` : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-heading font-semibold text-white transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "h-10 whitespace-nowrap rounded-[10px] px-2 text-[0.8rem]" : "h-12 rounded-full px-7 text-[0.94rem] shadow-[0_14px_26px_-14px_var(--color-blue)]",
        added ? "bg-whatsapp" : "bg-blue hover:bg-blue-deep",
        className,
      )}
    >
      {added ? <IconCheck className="size-4" /> : <IconCart className="size-4" />}
      <span aria-live="polite">{added ? "Added" : "Add to Cart"}</span>
    </button>
  );
}
