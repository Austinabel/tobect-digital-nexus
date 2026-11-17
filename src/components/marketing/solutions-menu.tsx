"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SOLUTIONS } from "@/lib/data/solutions";
import { SOLUTION_ICONS } from "@/components/marketing/solution-icons";
import { IconArrowRight, IconCalculator, IconCheck, IconChevronDown, IconWrench, IconPackage } from "@/components/icons";

const QUICK_LINKS = [
  { label: "Solar Installation Kits", href: "/shop/installation-kits", Icon: IconPackage },
  { label: "Installation Service", href: "/installation", Icon: IconWrench },
];

const CALC_POINTS = ["Inverter, battery & panels", "Cable sizes & lengths", "Breakers & full shopping list"];

export function solutionsActive(pathname: string) {
  return pathname === "/solutions" || pathname.startsWith("/solutions/") || pathname.startsWith("/solar-calculator");
}

/** Desktop "Solutions" mega-menu: solutions on the left, featured Solar Calculator on the right. */
export function SolutionsMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();
  const active = solutionsActive(pathname);

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrapper.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // true while the panel is open because of hover — a click then keeps it open instead of toggling it shut
  const openedByHover = useRef(false);
  const enter = () => {
    window.clearTimeout(closeTimer.current);
    openedByHover.current = true;
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      ref={wrapper}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          // a click / Enter wins over a pending hover-close
          window.clearTimeout(closeTimer.current);
          // Pointer users: hover already opened it, so the click just keeps it open.
          // (Read from the ref, not `open`: the hover's state update may not have rendered yet.)
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen((o) => !o);
        }}
        className={cn(
          "relative flex items-center gap-1 rounded-lg px-3.5 py-2 font-heading text-[0.9rem] font-medium transition-colors",
          active || open ? "text-blue" : "text-slate hover:bg-mist hover:text-ink",
        )}
      >
        Solutions
        <IconChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
        {active && <span aria-hidden className="absolute inset-x-3.5 -bottom-[13px] h-[3px] rounded-full bg-red" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute -left-36 top-[calc(100%+14px)] z-50 w-[760px] animate-in fade-in-0 slide-in-from-top-2 duration-200"
      >
        {/* hover bridge so the pointer can travel from the button to the panel */}
        <span aria-hidden className="absolute -top-4 left-0 h-4 w-full" />
        {/* pointer arrow lines up with the trigger (panel starts 9rem left of it) */}
        <span aria-hidden className="absolute -top-1.5 left-[calc(9rem+3rem)] size-3 rotate-45 rounded-[2px] border-l border-t border-hair bg-white" />
        <div className="grid grid-cols-[1fr_270px] overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_40px_80px_-30px_rgba(13,27,47,0.45)]">
          <div className="p-5">
            <p className="px-2 font-heading text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-light">Energy solutions</p>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {SOLUTIONS.map((s) => {
                const Icon = SOLUTION_ICONS[s.slug];
                const here = pathname === `/solutions/${s.slug}`;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/solutions/${s.slug}`}
                      aria-current={here ? "page" : undefined}
                      className={cn("group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-mist", here && "bg-mist")}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-blue transition-colors group-hover:bg-blue group-hover:text-white">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-heading text-[0.92rem] font-bold text-ink">{s.title} Solar</span>
                        <span className="block text-[0.78rem] leading-snug text-slate">{s.short}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hair px-2 pt-3">
              {QUICK_LINKS.map(({ label, href, Icon }) => (
                <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-hair px-3 py-1.5 text-[0.78rem] font-semibold text-ink transition-colors hover:border-blue hover:text-blue">
                  <Icon className="size-3.5 text-blue" />
                  {label}
                </Link>
              ))}
              <Link href="/solutions" className="ml-auto inline-flex items-center gap-1 text-[0.8rem] font-bold text-red hover:underline">
                All solutions <IconArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <Link
            href="/solar-calculator"
            aria-current={pathname.startsWith("/solar-calculator") ? "page" : undefined}
            className="group relative isolate flex flex-col overflow-hidden bg-[linear-gradient(155deg,#0b1930_0%,#10306b_55%,#1556d9_130%)] p-6 text-white"
          >
            <span aria-hidden className="absolute inset-y-0 right-10 -z-10 w-10 -skew-x-[18deg] bg-red/80" />
            <span aria-hidden className="absolute inset-y-0 right-3 -z-10 w-3 -skew-x-[18deg] bg-white/15" />
            <span className="grid size-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <IconCalculator className="size-5" />
            </span>
            <span className="mt-4 font-heading text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white/70">Free tool</span>
            <span className="font-heading text-[1.3rem] font-extrabold leading-tight">Solar Calculator</span>
            <ul className="mt-3 space-y-1.5 text-[0.8rem] text-white/85">
              {CALC_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <IconCheck className="size-3.5 text-gold" /> {p}
                </li>
              ))}
            </ul>
            <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 font-heading text-[0.82rem] font-semibold text-blue-deep transition-transform group-hover:-translate-y-0.5">
              Size my system <IconArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Mobile menu: expandable Solutions section. */
export function MobileSolutionsSection({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const active = solutionsActive(pathname);
  const [open, setOpen] = useState(active);
  const id = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex w-full items-center justify-between border-b border-hair py-3.5 font-heading text-[1rem] font-medium", active ? "text-blue" : "text-ink")}
      >
        Solutions
        <IconChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <div id={id} hidden={!open} className="border-b border-hair py-3">
        <Link href="/solar-calculator" onClick={onNavigate} className="flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#0b1930,#1556d9)] p-3.5 text-white">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
            <IconCalculator className="size-5" />
          </span>
          <span className="min-w-0 grow">
            <span className="block font-heading text-[0.95rem] font-bold">Solar Calculator</span>
            <span className="block text-[0.76rem] text-white/80">Sizes, cables, breakers &amp; shopping list</span>
          </span>
          <IconArrowRight className="size-4 shrink-0" />
        </Link>
        <ul className="mt-2 grid grid-cols-2 gap-1.5">
          {SOLUTIONS.map((s) => {
            const Icon = SOLUTION_ICONS[s.slug];
            return (
              <li key={s.slug}>
                <Link href={`/solutions/${s.slug}`} onClick={onNavigate} className="flex items-center gap-2 rounded-xl bg-field px-3 py-2.5 text-[0.86rem] font-semibold text-ink">
                  <Icon className="size-4 shrink-0 text-blue" />
                  {s.title}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[0.84rem] font-semibold">
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={onNavigate} className="py-1 text-blue">
              {l.label}
            </Link>
          ))}
          <Link href="/solutions" onClick={onNavigate} className="py-1 text-red">
            All solutions →
          </Link>
        </div>
      </div>
    </li>
  );
}
