import Image from "next/image";
import { cn } from "@/lib/utils";
import { categoryGlyphs, IconImageOff } from "@/components/icons";
import type { Product } from "@/lib/data/products";

interface ProductImageProps {
  product: Product;
  /** `sizes` hint for responsive image selection */
  sizes: string;
  priority?: boolean;
  /** square (default) or 4:3 — cards on wide grids use 4:3 */
  ratio?: "square" | "wide";
  /** thumbnail use: hide the "photo coming soon" label */
  compact?: boolean;
  className?: string;
}

/**
 * Square, white product image container. Renders the real photo when the
 * product has one; otherwise an honest "photo coming soon" placeholder —
 * never a stock or repeated image pretending to be the product.
 */
export function ProductImage({ product, sizes, priority, compact, ratio = "square", className }: ProductImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-white", ratio === "wide" ? "aspect-square sm:aspect-[4/3]" : "aspect-square", className)}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-[8%] transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_120%_at_30%_20%,#fff,var(--color-field))]">
          <span aria-hidden className="size-[38%] text-blue/25 [&>svg]:size-full">
            {categoryGlyphs[product.glyph]}
          </span>
          {compact ? (
            <span className="sr-only">Product photo not available yet</span>
          ) : (
            <span className="absolute bottom-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-hair bg-white/90 px-2.5 py-1 text-[0.72rem] font-semibold text-slate">
              <IconImageOff className="size-3" />
              Photo coming soon
            </span>
          )}
        </div>
      )}
    </div>
  );
}
