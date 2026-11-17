"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { IconMinus, IconPlus } from "@/components/icons";

/** Quantity stepper + add to cart on the product page. */
export function PurchasePanel({ slug, name, disabled }: { slug: string; name: string; disabled?: boolean }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-12 items-center rounded-full border-[1.5px] border-hair bg-white" role="group" aria-label="Quantity">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-full w-11 place-items-center text-slate hover:text-blue disabled:opacity-40"
        >
          <IconMinus className="size-4" />
        </button>
        <span className="w-8 text-center font-heading text-[1rem] font-bold tabular-nums text-ink" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= 99}
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="grid h-full w-11 place-items-center text-slate hover:text-blue disabled:opacity-40"
        >
          <IconPlus className="size-4" />
        </button>
      </div>
      <AddToCartButton slug={slug} name={name} quantity={qty} variant="full" disabled={disabled} className="grow sm:grow-0" />
    </div>
  );
}
