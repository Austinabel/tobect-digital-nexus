import Link from "next/link";
import { getCatalog } from "@/lib/catalog-server";
import { catalogueBrands } from "@/lib/catalog";

/**
 * Brands Tobecat stocks, derived from the catalogue itself so the list
 * can never show a brand that isn't actually sold here. Rendered as
 * text wordmarks until official logo files are supplied — and worded as
 * "brands we stock", not as an official partnership.
 */
export async function BrandStrip() {
  const brands = catalogueBrands(await getCatalog());
  if (brands.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {brands.map((brand) => (
          <li key={brand.slug}>
            <Link
              href={`/shop?brand=${brand.slug}`}
              className="group flex h-[88px] flex-col items-center justify-center rounded-2xl border border-hair bg-white px-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9d8f2] hover:shadow-[0_20px_40px_-24px_rgba(13,27,47,0.3)]"
            >
              <span className="font-heading text-[1.15rem] font-extrabold tracking-tight text-slate transition-colors group-hover:text-ink sm:text-[1.25rem]">
                {brand.name}
              </span>
              <span className="mt-1 text-[0.7rem] font-semibold text-slate-light transition-colors group-hover:text-blue">
                {brand.count} {brand.count === 1 ? "product" : "products"} &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 text-[0.72rem] text-slate-light">
        Brand names are trademarks of their respective owners. Listing indicates products we stock, not an official
        partnership.
      </p>
    </div>
  );
}
