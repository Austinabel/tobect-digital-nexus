import type { Product } from "@/lib/data/products";
import { ProductCard } from "@/components/shop/product-card";
import { getCatalog } from "@/lib/catalog-server";
import { featuredProducts } from "@/lib/catalog";

/**
 * Even rows: 2 → 3 columns, then 4 on wide screens unless the list divides better by 3.
 * `layout="row"` (homepage featured strip) shows six across on wide screens.
 * Without `products`, shows the catalogue's featured products.
 */
export async function ProductGrid({ products, layout = "grid" }: { products?: Product[]; layout?: "grid" | "row" }) {
  const list = products ?? featuredProducts(await getCatalog());
  const fourUp = list.length % 3 !== 0 && list.length >= 4;
  const wide = layout === "row" ? "xl:grid-cols-6" : fourUp ? "xl:grid-cols-4" : "";
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:gap-3.5 ${wide}`}>
      {list.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
