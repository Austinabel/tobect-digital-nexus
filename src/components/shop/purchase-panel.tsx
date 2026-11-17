"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { IconMinus, IconPlus, IconWhatsApp } from "@/components/icons";

/**
 * Quantity stepper, Add to Cart and Buy Now on the product page. On phones
 * the same actions also sit in a bar fixed to the bottom of the screen, so
 * buying is always one tap away while reading the details.
 */
export function PurchasePanel({ slug, name, disabled, askHref }: { slug: string; name: string; disabled?: boolean; askHref: string }) {
  const [qty, setQty] = useState(1);
  const { lines, add, setQuantity } = useCart();
  const router = useRouter();

  // Buy Now: the cart holds exactly the chosen quantity of this product, then straight to checkout.
  const buyNow = () => {
    if (lines.some((l) => l.id === slug)) setQuantity(slug, qty);
    else add(slug, qty);
    router.push("/checkout");
  };

  const buyNowClass =
    "inline-flex items-center justify-center rounded-full bg-red font-heading font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-colors hover:bg-red-dark active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
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
        <button type="button" onClick={buyNow} disabled={disabled} className={`${buyNowClass} h-12 w-full px-7 text-[0.94rem] sm:w-auto`}>
          Buy Now
        </button>
      </div>

      {/* phones & tablets: buy bar fixed to the bottom of the screen */}
      <div className="shop-actionbar fixed inset-x-0 bottom-0 z-[65] border-t border-hair bg-white/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-16px_rgba(13,27,47,0.35)] backdrop-blur-md print:hidden lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-2">
          <a
            href={askHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ask about this product on WhatsApp"
            className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#bfe4cd] text-whatsapp"
          >
            <IconWhatsApp className="size-5" />
          </a>
          <AddToCartButton slug={slug} name={name} quantity={qty} variant="full" disabled={disabled} className="h-12 min-w-0 flex-1 px-3 text-[0.88rem]" />
          <button type="button" onClick={buyNow} disabled={disabled} className={`${buyNowClass} h-12 min-w-0 flex-1 px-3 text-[0.88rem]`}>
            Buy Now{qty > 1 ? ` (${qty})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
