import Link from "next/link";
import { CATEGORIES } from "@/lib/data/categories";
import { categoryGlyphs, IconArrowRight } from "@/components/icons";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={`/shop/${category.slug}`}
          className="group overflow-hidden rounded-2xl border border-hair bg-white text-center transition-all duration-150 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_44px_-22px_rgba(13,27,47,0.2)]"
        >
          <div className="grid aspect-[5/4] place-items-center border-b border-hair bg-gradient-to-br from-white to-field text-blue">
            <span className="size-[46%] opacity-60 [&>svg]:size-full">{categoryGlyphs[category.glyph]}</span>
          </div>
          <div className="px-2.5 pb-4 pt-3">
            <h3 className="font-heading text-[0.9rem] font-semibold text-ink">{category.name}</h3>
            <span className="mt-1.5 inline-flex items-center gap-1 font-heading text-[0.72rem] font-semibold text-red">
              Shop Now
              <IconArrowRight className="size-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
