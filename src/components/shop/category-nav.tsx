import Link from "next/link";
import { cn } from "@/lib/utils";
import { categoryGlyphs, type CategoryGlyphKey } from "@/components/icons";
import { getCatalog } from "@/lib/catalog-server";

type NavItem = { slug: string; name: string; glyph: CategoryGlyphKey; href: string };

const navItems = (CATEGORIES: { slug: string; name: string; glyph: CategoryGlyphKey }[]): NavItem[] => [
  { slug: "all", name: "All Products", glyph: "all", href: "/shop" },
  ...CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, glyph: c.glyph, href: `/shop/${c.slug}` })),
  { slug: "installation-kits", name: "Installation Kits", glyph: "kit", href: "/shop/installation-kits" },
];

/** Icon tiles for every shop category. Scrolls sideways on small screens. */
export async function CategoryNav({ active = "all" }: { active?: string }) {
  const ITEMS = navItems((await getCatalog()).categories.filter((c) => !c.parent));
  return (
    <nav aria-label="Shop categories" className="border-b border-hair bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-9">
        <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0 xl:grid xl:grid-cols-11 xl:overflow-visible">
          {ITEMS.map((item) => {
            const on = item.slug === active;
            return (
              <li key={item.slug} className="snap-start">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex h-full w-[96px] flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-all xl:w-auto",
                    on
                      ? "border-blue/40 bg-mist text-blue shadow-[0_10px_24px_-16px_var(--color-blue)]"
                      : "border-hair bg-white text-ink hover:-translate-y-0.5 hover:border-[#c9d8f2] hover:text-blue",
                  )}
                >
                  <span aria-hidden className={cn("size-9 [&>svg]:size-full", on ? "text-blue" : "text-ink/80")}>
                    {categoryGlyphs[item.glyph]}
                  </span>
                  <span className="font-heading text-[0.74rem] font-semibold leading-tight">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
