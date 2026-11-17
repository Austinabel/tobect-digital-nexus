"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { IconCart, IconCheck } from "@/components/icons";

interface AddToCartButtonProps {
  slug: string;
  name: string;
  disabled?: boolean;
  quantity?: number;
  variant?: "compact" | "block" | "full";
  className?: string;
}

export function AddToCartButton({ slug, name, disabled, quantity = 1, variant = "compact", className }: AddToCartButtonProps) {
  const { add } = useCart();
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
        add(slug, quantity);
        setAdded(true);
      }}
      aria-label={variant === "full" ? undefined : `Add ${name} to cart`}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-heading font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        variant === "compact" && "h-10 rounded-[10px] px-3.5 text-[0.82rem]",
        variant === "block" && "h-10 w-full rounded-[10px] px-3 text-[0.82rem]",
        variant === "full" && "h-12 rounded-full px-7 text-[0.94rem] shadow-[0_14px_26px_-14px_var(--color-blue)]",
        added ? "bg-whatsapp text-white" : "bg-blue text-white hover:bg-blue-deep",
        className,
      )}
    >
      {added ? <IconCheck className="size-4" /> : <IconCart className="size-4" />}
      <span aria-live="polite">{added ? "Added" : variant === "compact" ? "Add" : "Add to Cart"}</span>
    </button>
  );
}
