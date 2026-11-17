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
      <div className="mx-auto max-w-[1240px] px-4 py-3 sm:px-6 lg:px-9 lg:py-4">
        <ul className="-mx-4 flex snap-x gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:gap-2.5 lg:pb-1 xl:grid xl:grid-cols-11 xl:overflow-visible [&::-webkit-scrollbar]:hidden">
          {ITEMS.map((item) => {
            const on = item.slug === active;
            return (
              <li key={item.slug} className="snap-start">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    // phones: app-style round icons; desktop: bordered tiles
                    "group flex h-full w-[74px] flex-col items-center gap-1.5 px-0.5 py-1 text-center transition-all lg:w-[96px] lg:gap-2 lg:rounded-2xl lg:border lg:px-2 lg:py-3 xl:w-auto",
                    on
                      ? "text-blue lg:border-blue/40 lg:bg-mist lg:shadow-[0_10px_24px_-16px_var(--color-blue)]"
                      : "text-ink lg:border-hair lg:bg-white lg:hover:-translate-y-0.5 lg:hover:border-[#c9d8f2] lg:hover:text-blue",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-14 place-items-center rounded-full p-3.5 [&>svg]:size-full lg:size-9 lg:rounded-none lg:bg-transparent lg:p-0",
                      on ? "bg-blue text-white lg:text-blue" : "bg-mist text-blue lg:text-ink/80",
                    )}
                  >
                    {categoryGlyphs[item.glyph]}
                  </span>
                  <span className="font-heading text-[0.78rem] font-semibold leading-tight">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
