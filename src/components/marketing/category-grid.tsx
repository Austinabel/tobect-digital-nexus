import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/catalog-server";
import { topCategories } from "@/lib/catalog";
import { categoryGlyphs, IconArrowRight } from "@/components/icons";

/**
 * Category cards with a product-style image area. Uses the category photo
 * when one exists (`Category.image`); until real category photography is
 * supplied, a large rendered glyph fills the frame instead of stock imagery.
 */
export async function CategoryGrid() {
  const CATEGORIES = topCategories(await getCatalog());
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:gap-3.5 lg:grid-cols-9 lg:gap-3">
      {CATEGORIES.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/shop/${category.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-white text-center shadow-[0_1px_2px_rgba(13,27,47,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c9d8f2] hover:shadow-[0_22px_44px_-24px_rgba(13,27,47,0.3)]"
          >
            <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#ffffff,var(--color-mist)_70%,var(--color-mist-2))]">
              {category.image ? (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 130px, 33vw"
                  className="object-contain p-[10%] transition-transform duration-300 group-hover:scale-[1.06]"
                />
              ) : (
                <span
                  aria-hidden
                  className="size-[52%] text-blue transition-transform duration-300 group-hover:scale-110 [&>svg]:size-full [&>svg]:[stroke-width:1.3]"
                >
                  {categoryGlyphs[category.glyph]}
                </span>
              )}
            </div>
            <div className="flex grow flex-col items-center px-1.5 pb-3.5 pt-2.5">
              <h3 className="flex min-h-[2.4em] items-center font-heading text-[0.78rem] font-semibold leading-tight text-ink sm:text-[0.86rem] lg:text-[0.8rem] xl:text-[0.86rem]">
                {category.name}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 font-heading text-[0.7rem] font-semibold text-red">
                Shop Now
                <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
