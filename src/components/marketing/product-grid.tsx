import Link from "next/link";
import { FEATURED_PRODUCTS, formatNaira } from "@/lib/data/products";
import { categoryGlyphs, IconStar, IconPlus } from "@/components/icons";

export function ProductGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
      {FEATURED_PRODUCTS.map((product) => (
        <article
          key={product.slug}
          className="flex flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-all duration-150 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-30px_rgba(13,27,47,0.28)]"
        >
          <Link
            href={`/product/${product.slug}`}
            className="grid aspect-square place-items-center border-b border-hair bg-[radial-gradient(120%_120%_at_30%_20%,#fff,var(--color-mist-2))] text-blue"
          >
            <span className="size-[50%] opacity-60 [&>svg]:size-full">{categoryGlyphs[product.glyph]}</span>
          </Link>
          <div className="flex grow flex-col gap-1.5 p-4">
            <Link href={`/product/${product.slug}`} className="font-heading text-[0.94rem] font-semibold leading-snug text-ink">
              {product.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[0.74rem] text-slate">
              <IconStar className="size-3.5 text-gold" />
              {product.rating}
              <span>({product.reviewCount})</span>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-heading text-[1.02rem] font-extrabold text-blue tabular-nums">
                {formatNaira(product.priceNgn)}
              </span>
              <button
                type="button"
                aria-label={`Add ${product.name} to cart`}
                className="grid size-8.5 place-items-center rounded-[9px] bg-blue text-white transition-colors hover:bg-blue-deep"
              >
                <IconPlus className="size-[15px]" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
