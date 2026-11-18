"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/components/catalog-provider";
import { useSiteLinks } from "@/components/site-provider";
import { categoryGlyphs, IconCart, IconClose, IconGrid, IconHouse, IconUser, IconWhatsApp } from "@/components/icons";

/**
 * Pages that get the app-style bottom bar on phones. The product, cart and
 * checkout pages have their own buy / checkout bar in its place.
 */
function showsTabBar(pathname: string) {
  return pathname === "/shop" || pathname.startsWith("/shop/") || pathname === "/wishlist" || pathname === "/search";
}

const tab = "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 font-heading text-[0.72rem] font-semibold";

/** Bottom sheet listing every shop category (top level, then subcategories). */
function CategorySheet({ onClose }: { onClose: () => void }) {
  const { categories } = useCatalog();
  const closeRef = useRef<HTMLButtonElement>(null);
  const top = categories.filter((c) => !c.parent);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const items = [
    { href: "/shop", name: "All Products", glyph: "all" as const },
    ...top.map((c) => ({ href: `/shop/${c.slug}`, name: c.name, glyph: c.glyph })),
  ];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Shop categories">
      <button type="button" aria-label="Close categories" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="sticky top-0 -mx-4 flex items-center justify-between bg-white px-4 pb-2">
          <h2 className="font-heading text-[1.1rem] font-bold text-ink">Categories</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close categories" className="grid size-11 place-items-center rounded-full hover:bg-field">
            <IconClose className="size-5" />
          </button>
        </div>
        <ul className="grid grid-cols-3 gap-2.5">
          {items.map((c) => (
            <li key={c.href}>
              <Link href={c.href} onClick={onClose} className="flex h-full flex-col items-center gap-2 rounded-2xl bg-field px-2 py-3.5 text-center active:bg-mist">
                <span aria-hidden className="size-9 text-blue [&>svg]:size-full">
                  {categoryGlyphs[c.glyph]}
                </span>
                <span className="font-heading text-[0.78rem] font-semibold leading-tight text-ink">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {categories.some((c) => c.parent) && (
          <div className="mt-4 border-t border-hair pt-3">
            <h3 className="font-heading text-[0.78rem] font-bold uppercase tracking-[0.12em] text-slate">Browse by type</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {categories
                .filter((c) => c.parent)
                .map((c) => (
                  <li key={c.slug}>
                    <Link href={`/shop/${c.slug}`} onClick={onClose} className="inline-flex h-10 items-center rounded-full border border-hair px-4 text-[0.84rem] font-semibold text-ink active:bg-mist">
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** App-style navigation fixed to the bottom of the screen on phones and tablets (shop pages only). */
export function ShopTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { SITE, whatsappHref } = useSiteLinks();
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);

  // close the sheet when the page changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSheet(false);
  }

  if (!showsTabBar(pathname)) return null;
  const onShop = pathname === "/shop";

  return (
    <>
      <nav
        aria-label="Shop"
        className="shop-tabbar fixed inset-x-0 bottom-0 z-[65] border-t border-hair bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(13,27,47,0.35)] backdrop-blur-md print:hidden lg:hidden"
      >
        <ul className="mx-auto flex h-16 max-w-[640px] items-stretch">
          <li className="flex flex-1">
            <Link href="/shop" aria-current={onShop ? "page" : undefined} className={cn(tab, onShop ? "text-blue" : "text-slate")}>
              <IconHouse className="size-[22px]" />
              Shop
            </Link>
          </li>
          <li className="flex flex-1">
            <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog" className={cn(tab, sheet ? "text-blue" : "text-slate")}>
              <IconGrid className="size-[22px]" />
              Categories
            </button>
          </li>
          <li className="flex flex-1">
            <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} className={cn(tab, "text-slate")}>
              <span className="relative">
                <IconCart className="size-[22px]" />
                {count > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 text-[0.66rem] font-bold leading-none text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
              Cart
            </Link>
          </li>
          <li className="flex flex-1">
            <a
              href={whatsappHref(`Hello ${SITE.shortName}, I'd like some help with an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(tab, "text-whatsapp")}
            >
              <IconWhatsApp className="size-[22px]" />
              Chat
            </a>
          </li>
          <li className="flex flex-1">
            <Link href="/account" className={cn(tab, "text-slate")}>
              <IconUser className="size-[22px]" />
              Account
            </Link>
          </li>
        </ul>
      </nav>
      {sheet && <CategorySheet onClose={closeSheet} />}
    </>
  );
}
