"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { categoryGlyphs, IconArrowRight } from "@/components/icons";
import type { Campaign } from "@/lib/shop/campaigns";

const INTERVAL_MS = 5000;

const THEMES = {
  navy: "bg-[linear-gradient(115deg,#0b1930_0%,#10306b_60%,#1556d9_130%)] text-white",
  blue: "bg-[linear-gradient(115deg,#eef5ff_0%,#dce9ff_100%)] text-ink",
  red: "bg-[linear-gradient(115deg,#c40f2b_0%,#f01436_100%)] text-white",
} as const;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function SlideBody({ c, first }: { c: Campaign; first: boolean }) {
  const img = c.mobileImage ?? c.desktopImage;
  if (c.designedBanner && img) {
    // finished artwork carries its own message
    return <Image src={img} alt={c.imageAlt ?? c.title} fill sizes="92vw" priority={first} className="object-cover" />;
  }
  const theme = c.theme ?? "navy";
  const light = theme === "blue" && !img;
  return (
    <>
      <div className={cn("absolute inset-0", THEMES[theme])}>
        {img && <Image src={img} alt="" fill sizes="92vw" priority={first} className="object-cover" style={{ objectPosition: c.imagePosition }} />}
      </div>
      {img ? (
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,18,40,0.92)_0%,rgba(7,28,68,0.72)_55%,rgba(7,28,68,0.15)_100%)]" />
      ) : (
        <span aria-hidden className={cn("absolute -bottom-4 -right-3 size-32 [&>svg]:size-full", light ? "text-blue/20" : "text-white/15")}>
          {categoryGlyphs.kit}
        </span>
      )}
      <div className={cn("relative flex h-full max-w-[80%] flex-col justify-center px-4 py-3", light ? "text-ink" : "text-white")}>
        {c.kicker && (
          <span className={cn("self-start rounded-full px-2 py-0.5 font-heading text-[0.66rem] font-bold uppercase tracking-[0.08em] text-white", light ? "bg-blue" : "bg-red")}>
            {c.kicker}
          </span>
        )}
        <span className="mt-1.5 line-clamp-2 font-heading text-[1.08rem] font-extrabold leading-[1.15] tracking-tight">{c.title}</span>
        {c.discountLabel && <span className="mt-1.5 self-start rounded-md bg-gold px-1.5 py-0.5 font-heading text-[0.72rem] font-extrabold text-ink">{c.discountLabel}</span>}
        <span className={cn("mt-2.5 inline-flex h-8 items-center gap-1 self-start rounded-full px-3.5 font-heading text-[0.76rem] font-semibold", light ? "bg-red text-white" : "bg-white text-blue-deep")}>
          {c.ctaText}
          <IconArrowRight className="size-3.5" />
        </span>
      </div>
    </>
  );
}

/**
 * Short, swipeable offers slider for phones (all shop banners in one place).
 * Native scroll-snap so it follows the finger; auto-advances every 5s until
 * the visitor touches it, with a pause button (WCAG 2.2.2) and no motion for
 * visitors who prefer reduced motion.
 */
export function MobileBannerSlider({ slides }: { slides: Campaign[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const total = slides.length;
  const playing = total > 1 && !stopped && !reducedMotion;

  // keep the dots in step with the visible slide
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i));
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [total]);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      const li = el?.children[i] as HTMLElement | undefined;
      const first = el?.children[0] as HTMLElement | undefined;
      if (el && li && first) el.scrollTo({ left: li.offsetLeft - first.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion],
  );

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) goTo((index + 1) % total);
    }, INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, total, goTo]);

  if (!total) return null;

  return (
    <section aria-roledescription="carousel" aria-label="Offers and promotions" className="bg-white pt-3 lg:hidden">
      <ul
        ref={track}
        onTouchStart={() => setStopped(true)}
        onFocus={() => setStopped(true)}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((c, i) => {
          const external = c.ctaHref.startsWith("http");
          return (
            <li key={c.id} data-i={i} aria-roledescription="slide" aria-label={`${i + 1} of ${total}: ${c.title}`} className="w-[92%] shrink-0 snap-start">
              <Link
                href={c.ctaHref}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="relative isolate block aspect-[2.15/1] overflow-hidden rounded-2xl bg-blue-deep"
              >
                <SlideBody c={c} first={i === 0} />
              </Link>
            </li>
          );
        })}
      </ul>
      {total > 1 && (
        <div className="mt-1 flex items-center justify-center gap-1">
          {slides.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setStopped(true);
                goTo(i);
              }}
              aria-label={`Show offer ${i + 1}: ${c.title}`}
              aria-current={i === index ? "true" : undefined}
              className="grid h-8 min-w-6 place-items-center px-1"
            >
              <span className={cn("block h-1.5 rounded-full transition-all duration-300", i === index ? "w-5 bg-blue" : "w-1.5 bg-[#c9d8f2]")} />
            </button>
          ))}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              aria-label={stopped ? "Play offers slideshow" : "Pause offers slideshow"}
              className="ml-1 grid size-8 place-items-center rounded-full text-slate hover:bg-field"
            >
              {stopped ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <rect x="6.5" y="5" width="4" height="14" rx="1" />
                  <rect x="13.5" y="5" width="4" height="14" rx="1" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
