"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";
import { IconHeart } from "@/components/icons";

const noopSubscribe = () => () => {};

export function WishlistButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const saved = hydrated && has(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved items` : `Save ${name}`}
      className={cn(
        "grid size-10 place-items-center rounded-full border bg-white/95 shadow-sm transition-colors",
        saved ? "border-red/30 text-red" : "border-hair text-slate hover:border-red/40 hover:text-red",
        className,
      )}
    >
      <IconHeart className={cn("size-[17px]", saved && "fill-current")} />
    </button>
  );
}
