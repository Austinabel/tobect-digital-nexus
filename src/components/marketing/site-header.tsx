"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { IconBolt, IconMenu, IconClose, IconSearch, IconCart, IconQuote, IconUser } from "@/components/icons";
import { MobileSolutionsSection, SolutionsMenu } from "@/components/marketing/solutions-menu";
import { useSite } from "@/components/site-provider";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Solutions", href: "/solutions" },
  { label: "Installation", href: "/installation" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/shop") return pathname.startsWith("/shop") || pathname.startsWith("/product");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Logo from Admin → Site settings: an uploaded logo image, or the bolt badge, plus the wordmark. */
function Logo() {
  const site = useSite();
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label={`${site.name} — home`}>
      {site.brand.logoHeaderUrl ? (
        <Image src={site.brand.logoHeaderUrl} alt="" width={1000} height={224} priority sizes="200px" className="h-9 w-auto sm:h-11" />
      ) : site.brand.logoUrl ? (
        <Image src={site.brand.logoUrl} alt="" width={38} height={38} priority className="size-8.5 rounded-[10px] object-contain sm:size-9.5" />
      ) : (
        <span className="grid size-8.5 place-items-center rounded-[10px] bg-gradient-to-br from-[#2f6bff] to-blue-deep text-white shadow-[0_10px_20px_-10px_rgba(26,86,219,0.7)] sm:size-9.5 sm:rounded-[11px]">
          <IconBolt className="size-[18px]" />
        </span>
      )}
      <span className={cn("font-heading text-[1.05rem] font-extrabold leading-none tracking-tight text-ink sm:text-[1.2rem]", site.brand.logoHeaderUrl && "sr-only")}>
        {site.brand.wordmark}
        {site.brand.wordmarkSub && (
          <small className="mt-[2px] block font-body text-[0.5rem] font-semibold tracking-[0.1em] text-slate min-[380px]:tracking-[0.18em]">{site.brand.wordmarkSub}</small>
        )}
      </span>
    </Link>
  );
}

function SearchForm({ autoFocus, onSubmitted }: { autoFocus?: boolean; onSubmitted?: () => void }) {
  const router = useRouter();
  return (
    <form
      action="/search"
      role="search"
      onSubmit={(e) => {
        // Navigate client-side; closing the panel first would detach the form and cancel a native submit.
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q")?.toString().trim();
        if (!q) return;
        router.push(`/search?q=${encodeURIComponent(q)}`);
        onSubmitted?.();
      }}
      className="relative w-full"
    >
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate" />
      <input
        id="site-search"
        name="q"
        type="search"
        required
        autoFocus={autoFocus}
        placeholder="Search inverters, batteries, panels…"
        className="h-11 w-full rounded-full border border-hair bg-field pl-10.5 pr-4 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-slate-light focus:border-blue focus:bg-white"
      />
    </form>
  );
}

function CartLink({ count, className }: { count: number; className?: string }) {
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-[10px] border border-hair bg-white text-ink transition-colors hover:border-blue hover:text-blue",
        className,
      )}
    >
      <IconCart className="size-[18px]" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 font-heading text-[0.62rem] font-bold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close menus on navigation and on Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-shadow duration-200 print:hidden",
        scrolled ? "border-hair shadow-[0_10px_30px_-20px_rgba(13,27,47,0.35)]" : "border-transparent",
      )}
    >
      {/* Frosted background on its own layer: a backdrop-filter on the <header> itself would make
          dropdowns that hang below the header render see-through. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/92 backdrop-blur-md" />
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-2 min-[380px]:px-4 sm:gap-3 sm:px-6 lg:h-[72px] lg:px-9 xl:gap-5">
        <Logo />

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            if (item.href === "/solutions") return <SolutionsMenu key={item.href} pathname={pathname} />;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 font-heading text-[0.9rem] font-medium transition-colors",
                  active ? "text-blue" : "text-slate hover:bg-mist hover:text-ink",
                )}
              >
                {item.label}
                {active && (
                  <span aria-hidden className="absolute inset-x-3.5 -bottom-[13px] h-[3px] rounded-full bg-red" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 min-[380px]:gap-2 xl:ml-0 xl:gap-2.5">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search products"}
            aria-expanded={searchOpen}
            aria-controls="site-search-panel"
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-hair bg-white text-ink transition-colors hover:border-blue hover:text-blue"
          >
            {searchOpen ? <IconClose className="size-[18px]" /> : <IconSearch className="size-[18px]" />}
          </button>

          <Link
            href="/account"
            aria-label="My account"
            className="hidden size-10 shrink-0 place-items-center rounded-[10px] border border-hair bg-white text-ink transition-colors hover:border-blue hover:text-blue sm:grid"
          >
            <IconUser className="size-[18px]" />
          </Link>

          <CartLink count={count} />

          <Link
            href="/quote"
            className="hidden shrink-0 items-center gap-2 rounded-full bg-red px-5 py-2.5 font-heading text-[0.9rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-all hover:-translate-y-0.5 hover:bg-red-dark sm:inline-flex xl:px-6"
          >
            <IconQuote className="size-4" />
            Get a Quote
          </Link>

          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-hair bg-white text-ink xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-nav-mobile"
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? <IconClose className="size-[18px]" /> : <IconMenu className="size-[18px]" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="site-search-panel" className="border-t border-hair bg-white">
          <div className="mx-auto max-w-[760px] px-4 py-4 sm:px-6">
            <SearchForm autoFocus onSubmitted={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {menuOpen && (
        <nav
          id="primary-nav-mobile"
          aria-label="Primary"
          className="max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-hair bg-white px-4 pb-5 pt-2 shadow-lg sm:px-6 xl:hidden"
        >
          <ul>
            {NAV_ITEMS.map((item) => {
              if (item.href === "/solutions") return <MobileSolutionsSection key={item.href} pathname={pathname} onNavigate={() => setMenuOpen(false)} />;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-b border-hair py-3.5 font-heading text-[1rem] font-medium",
                      active ? "text-blue" : "text-ink",
                    )}
                  >
                    {item.label}
                    {active && <span aria-hidden className="size-1.5 rounded-full bg-red" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 border-b border-hair py-3.5 font-heading text-[1rem] font-medium text-ink"
          >
            <IconUser className="size-[18px] text-blue" />
            My Account
          </Link>
          <Link
            href="/quote"
            onClick={() => setMenuOpen(false)}
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-red font-heading text-[0.95rem] font-semibold text-white sm:hidden"
          >
            <IconQuote className="size-4" />
            Get a Quote
          </Link>
        </nav>
      )}
    </header>
  );
}
