"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBolt,
  IconMenu,
  IconClose,
  IconSearch,
  IconCart,
  IconQuote,
} from "@/components/icons";

const NAV_ITEMS = [
  { label: "Shop", href: "/shop" },
  { label: "Solutions", href: "/solutions" },
  { label: "Installation", href: "/installation" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Tobecat Technologies — home">
      <span className="grid size-9.5 place-items-center rounded-[11px] bg-gradient-to-br from-[#2f6bff] to-blue-deep text-white shadow-[0_10px_20px_-10px_rgba(26,86,219,0.7)]">
        <IconBolt className="size-[18px]" />
      </span>
      <span className="font-heading text-[1.2rem] font-extrabold leading-none tracking-tight text-ink">
        TOBECAT
        <small className="mt-[2px] block font-body text-[0.5rem] font-semibold tracking-[0.18em] text-slate">
          TECHNOLOGIES NIG LTD
        </small>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-9">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 font-heading text-[0.9rem] font-medium text-slate transition-colors hover:bg-mist hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-[10px] border border-hair bg-white text-ink transition-colors hover:border-blue hover:text-blue"
          >
            <IconSearch className="size-[18px]" />
          </button>
          <Link
            href="/cart"
            aria-label="Cart, 0 items"
            className="relative grid size-10 place-items-center rounded-[10px] border border-hair bg-white text-ink transition-colors hover:border-blue hover:text-blue"
          >
            <IconCart className="size-[18px]" />
            <span className="absolute -right-1.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber px-1 font-heading text-[0.6rem] font-bold text-[#3a2a00]">
              0
            </span>
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 rounded-full bg-red px-6 py-3 font-heading text-[0.92rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-all hover:-translate-y-0.5 hover:bg-red-dark"
          >
            <IconQuote className="size-4" />
            Get a Quote
          </Link>
        </div>

        <Link
          href="/cart"
          aria-label="Cart, 0 items"
          className="relative ml-auto grid size-10 place-items-center rounded-[10px] border border-hair bg-white text-ink lg:hidden"
        >
          <IconCart className="size-[18px]" />
          <span className="absolute -right-1.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber px-1 font-heading text-[0.6rem] font-bold text-[#3a2a00]">
            0
          </span>
        </Link>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-[10px] border border-hair bg-white text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav-mobile"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconClose className="size-[18px]" /> : <IconMenu className="size-[18px]" />}
        </button>
      </div>

      {open && (
        <nav
          id="primary-nav-mobile"
          aria-label="Primary"
          className="flex flex-col border-b border-hair bg-white px-4 pb-4 shadow-lg sm:px-6 lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-hair py-3.5 font-heading text-[0.98rem] font-medium text-ink last:border-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
