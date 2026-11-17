"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconBolt, IconMenu, IconClose, IconArrowRight } from "@/components/icons";
import type { AdminNavItem } from "@/lib/admin/nav";

interface Props {
  nav: { group: string; items: AdminNavItem[] }[];
  staff: { email: string; roleLabel: string };
  signOut: () => Promise<void>;
  children: ReactNode;
}

function NavList({ nav, pathname, onNavigate }: { nav: Props["nav"]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="space-y-6">
      {nav.map((g) => (
        <div key={g.group}>
          <p className="px-3 font-heading text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white/40">{g.group}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  {item.ready ? (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-xl px-3 py-2 text-[0.88rem] font-medium transition-colors",
                        active ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-[0.88rem] text-white/35" title="Coming in a later phase">
                      {item.label}
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/45">Soon</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ nav, staff, signOut, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-3">
      <span className="grid size-9 place-items-center rounded-xl bg-blue">
        <IconBolt className="size-[18px] text-white" />
      </span>
      <span className="font-heading text-[1rem] font-extrabold leading-none text-white">
        Admin
        <small className="mt-1 block text-[0.62rem] font-semibold tracking-[0.14em] text-white/50">CONTROL PANEL</small>
      </span>
    </Link>
  );

  const account = (
    <div className="space-y-2 border-t border-white/10 px-3 pt-4">
      <p className="truncate text-[0.8rem] font-semibold text-white" title={staff.email}>
        {staff.email}
      </p>
      <p className="text-[0.72rem] text-white/50">{staff.roleLabel}</p>
      <div className="flex gap-2 pt-1">
        <Link href="/" className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[0.76rem] font-semibold text-white hover:bg-white/20">
          View site <IconArrowRight className="size-3" />
        </Link>
        <form action={signOut}>
          <button type="submit" className="rounded-lg px-2.5 py-1.5 text-[0.76rem] font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f6fb] lg:grid lg:grid-cols-[256px_1fr]">
      {/* desktop sidebar */}
      <aside className="results-scroll sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto bg-ink py-6 lg:flex">
        {brand}
        <div className="grow px-3">
          <NavList nav={nav} pathname={pathname} />
        </div>
        {account}
      </aside>

      {/* mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        {brand}
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
          <IconMenu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/60" />
          <div className="absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col gap-6 overflow-y-auto bg-ink py-5">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="grid size-9 place-items-center rounded-xl text-white hover:bg-white/10">
                <IconClose className="size-5" />
              </button>
            </div>
            <div className="grow px-3">
              <NavList nav={nav} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            {account}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
