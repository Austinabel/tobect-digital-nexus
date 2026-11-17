"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useWishlist } from "@/lib/wishlist";
import { useCatalog } from "@/components/catalog-provider";
import { findProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { IconHeart } from "@/components/icons";

const noopSubscribe = () => () => {};

export function WishlistView() {
  const catalog = useCatalog();
  const { slugs } = useWishlist();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-field" aria-label="Loading saved items" />;

  const products = slugs.map((s) => findProduct(catalog, s)).filter((p) => p !== undefined);
  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#c9d8f2] bg-white px-6 py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mist text-red">
          <IconHeart className="size-6" />
        </span>
        <h2 className="mt-4 font-heading text-[1.25rem] font-bold text-ink">No saved items yet</h2>
        <p className="mt-1.5 text-slate">Tap the heart on any product to save it here for later.</p>
        <Link href="/shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-red px-7 font-heading text-[0.92rem] font-semibold text-white hover:bg-red-dark">
          Browse the Shop
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
