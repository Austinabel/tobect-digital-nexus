import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNaira, type Product } from "@/lib/data/products";
import { ProductImage } from "@/components/shop/product-image";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { AvailabilityBadge } from "@/components/shop/availability-badge";
import { WishlistButton } from "@/components/shop/wishlist-button";

function Price({ product, large }: { product: Product; large?: boolean }) {
  const was = product.compareAtPriceNgn !== undefined && product.compareAtPriceNgn > product.priceNgn ? product.compareAtPriceNgn : undefined;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={cn("font-heading font-extrabold tabular-nums", was ? "text-red-dark" : "text-ink", large ? "text-[1.25rem]" : "text-[1.05rem] sm:text-[1.12rem]")}>
        {formatNaira(product.priceNgn)}
      </span>
      {was && (
        <s className="text-[0.78rem] tabular-nums text-slate-light">
          <span className="sr-only">Was </span>
          {formatNaira(was)}
        </s>
      )}
    </span>
  );
}

function SaleTag({ product }: { product: Product }) {
  if (!(product.compareAtPriceNgn && product.compareAtPriceNgn > product.priceNgn)) return null;
  const pct = Math.round((1 - product.priceNgn / product.compareAtPriceNgn) * 100);
  return <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-red px-2 py-0.5 font-heading text-[0.68rem] font-bold text-white">-{pct}%</span>;
}

export function ProductCard({ product, priority, layout = "grid" }: { product: Product; priority?: boolean; layout?: "grid" | "list" }) {
  const href = `/product/${product.slug}`;
  const soldOut = product.availability === "out-of-stock";

  const specs = product.specs.length > 0 && (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Key specifications">
      {product.specs.map((spec) => (
        <li key={spec} className="rounded-md bg-mist px-1.5 py-0.5 text-[0.68rem] font-semibold text-blue-deep">
          {spec}
        </li>
      ))}
    </ul>
  );

  if (layout === "list") {
    return (
      <article className="group relative grid grid-cols-[112px_1fr] gap-4 rounded-2xl border border-hair bg-white p-3 transition-shadow hover:shadow-[0_24px_50px_-32px_rgba(13,27,47,0.35)] sm:grid-cols-[160px_1fr_200px] sm:items-center sm:p-4">
        <Link href={href} tabIndex={-1} aria-hidden className="relative block overflow-hidden rounded-xl border border-hair">
          <SaleTag product={product} />
          <ProductImage product={product} compact sizes="160px" />
        </Link>
        <div className="min-w-0">
          <span className="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-light">{product.brand ?? " "}</span>
          <h3 className="mt-0.5 font-heading text-[1rem] font-semibold leading-snug text-ink">
            <Link href={href} className="hover:text-blue">
              {product.name}
            </Link>
          </h3>
          {product.model && <span className="text-[0.74rem] text-slate">Model {product.model}</span>}
          {specs}
          <div className="mt-2 sm:hidden">
            <Price product={product} />
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <div className="hidden sm:block">
            <Price product={product} large />
          </div>
          <AvailabilityBadge availability={product.availability} />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <AddToCartButton slug={product.slug} name={product.name} disabled={soldOut} variant="block" />
            <WishlistButton slug={product.slug} name={product.name} className="size-10 rounded-[10px]" />
          </div>
          <Link href={href} className="text-center text-[0.8rem] font-semibold text-blue hover:underline">
            View Details
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_1px_2px_rgba(13,27,47,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c9d8f2] hover:shadow-[0_30px_60px_-30px_rgba(13,27,47,0.3)]">
      <SaleTag product={product} />
      <WishlistButton slug={product.slug} name={product.name} className="absolute right-2.5 top-2.5 z-10" />
      <Link href={href} tabIndex={-1} aria-hidden className="block border-b border-hair">
        <ProductImage product={product} priority={priority} sizes="(min-width: 1280px) 220px, (min-width: 640px) 33vw, 50vw" />
      </Link>

      <div className="flex grow flex-col p-3.5 sm:p-4">
        <span className="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-light">
          {product.brand ?? " "}
        </span>
        <h3 className="mt-1 font-heading text-[0.92rem] font-semibold leading-snug text-ink sm:text-[0.96rem]">
          <Link href={href} className="hover:text-blue focus-visible:text-blue">
            {product.name}
          </Link>
        </h3>
        {product.model && <span className="mt-0.5 text-[0.72rem] text-slate">Model {product.model}</span>}
        {specs}

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <Price product={product} />
            <AvailabilityBadge availability={product.availability} />
          </div>
          <div className="mt-3 grid gap-2">
            <Link
              href={href}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border-[1.5px] border-[#c9d8f2] font-heading text-[0.82rem] font-semibold text-blue transition-colors hover:border-blue"
            >
              View Details
            </Link>
            <AddToCartButton slug={product.slug} name={product.name} disabled={soldOut} variant="block" />
          </div>
        </div>
      </div>
    </article>
  );
}
