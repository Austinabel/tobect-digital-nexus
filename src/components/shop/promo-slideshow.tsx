"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/shop/campaigns";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@/components/icons";

const INTERVAL_MS = 6000;

/** Slanted shape shared by the slide window and its decorative outlines. */
const SHAPE = "[clip-path:polygon(9%_0,100%_0,91%_100%,0_100%)] sm:[clip-path:polygon(12%_0,100%_0,88%_100%,0_100%)]";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function Slide({ slide, index, total, active }: { slide: Campaign; index: number; total: number; active: boolean }) {
  const external = slide.ctaHref.startsWith("http");
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const images = slide.desktopImage && (
    <>
      <Image
        src={slide.desktopImage}
        alt={slide.designedBanner ? (slide.imageAlt ?? slide.title) : ""}
        fill
        priority={index === 0}
        sizes="(min-width: 1024px) 620px, 100vw"
        className={cn("object-cover", slide.mobileImage && "hidden sm:block", !slide.designedBanner && "transition-transform duration-[7000ms] ease-out", !slide.designedBanner && (active ? "scale-100" : "scale-[1.08]"))}
      />
      {slide.mobileImage && (
        <Image src={slide.mobileImage} alt={slide.designedBanner ? (slide.imageAlt ?? slide.title) : ""} fill priority={index === 0} sizes="100vw" className="object-cover sm:hidden" />
      )}
    </>
  );

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${slide.title}`}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0 transition-[opacity,transform] duration-700 ease-out",
        active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0",
      )}
    >
      {slide.designedBanner && slide.desktopImage ? (
        // A finished banner design: the artwork carries the message; the whole slide is the link.
        <Link href={slide.ctaHref} {...linkProps} className="absolute inset-0 block">
          {images}
          <span className="sr-only">{slide.ctaText}</span>
        </Link>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0b3f9e,#1556d9)]">{images}</div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,18,40,0.92)_15%,rgba(7,28,68,0.7)_50%,rgba(7,28,68,0.1)_85%)]" />
          <div className="relative flex h-full max-w-[78%] flex-col justify-center py-6 pl-[13%] pr-4 sm:max-w-[72%] sm:pl-[16%]">
            {slide.kicker && (
              <span className="self-start rounded-full bg-red px-2.5 py-1 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white sm:text-[0.68rem]">
                {slide.kicker}
              </span>
            )}
            <h2 className="mt-2.5 font-heading text-[clamp(1.15rem,2.4vw,1.75rem)] font-extrabold leading-[1.1] tracking-tight text-white">{slide.title}</h2>
            {slide.description && <p className="mt-2 line-clamp-3 text-[0.8rem] leading-snug text-white/85 sm:text-[0.9rem]">{slide.description.replace(/\n/g, " ")}</p>}
            {slide.discountLabel && (
              <span className="mt-2.5 self-start rounded-md bg-gold px-2 py-0.5 font-heading text-[0.78rem] font-extrabold text-ink">{slide.discountLabel}</span>
            )}
            <Link
              href={slide.ctaHref}
              {...linkProps}
              className="mt-4 inline-flex h-10 items-center gap-1.5 self-start rounded-full bg-white px-4 font-heading text-[0.82rem] font-semibold text-blue-deep shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 sm:h-11 sm:px-5 sm:text-[0.88rem]"
            >
              {slide.ctaText}
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Parallelogram promotional slideshow for the shop hero. Shows admin
 * campaigns (`position: "shop-hero"`) and evergreen slides.
 * - auto-advances every 6s; pauses on hover/focus, hidden tabs and via the
 *   pause button (WCAG 2.2.2); no auto-advance with reduced motion
 * - arrows, dots, keyboard arrows and touch swipe
 */
export function PromoSlideshow({ slides }: { slides: Campaign[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const touchX = useRef<number | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const total = slides.length;
  const playing = total > 1 && !paused && !hovered && !reducedMotion;

  const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (!playing) return;
    let timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // restart the countdown after any manual change
  }, [playing, total, index]);

  if (!total) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers and promotions"
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {/* the shadow sits on a wrapper: a clip-path would cut away a shadow on the clipped element itself */}
      <div className="relative drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]">
      {/* decorative offset parallelograms, sized to the slide */}
      <div aria-hidden className={cn("absolute inset-0 translate-x-3 translate-y-3 bg-red/85 sm:translate-x-5 sm:translate-y-4", SHAPE)} />
      <div aria-hidden className={cn("absolute inset-0 -translate-x-2 -translate-y-2 bg-white/15 sm:-translate-x-3 sm:-translate-y-3", SHAPE)} />
      <div
        className={cn("relative aspect-[4/3] overflow-hidden bg-blue-deep sm:aspect-[16/10]", SHAPE)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {slides.map((slide, i) => (
          <Slide key={slide.id} slide={slide} index={i} total={total} active={i === index} />
        ))}
      </div>
      </div>

      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Slide {index + 1} of {total}: {slides[index].title}
      </p>

      {total > 1 && (
        <div className="relative mt-5 flex items-center justify-center gap-2 sm:mt-6">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous offer" className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20">
            <IconChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5">
            {slides.map((s, i) => (
              <button key={s.id} type="button" onClick={() => go(i)} aria-label={`Show offer ${i + 1}: ${s.title}`} aria-current={i === index ? "true" : undefined} className="group grid h-10 place-items-center px-1.5">
                <span className={cn("block h-1.5 -skew-x-[20deg] transition-all duration-300", i === index ? "w-6 bg-white" : "w-2.5 bg-white/45 group-hover:bg-white/75")} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next offer" className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20">
            <IconChevronRight className="size-4" />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play offers slideshow" : "Pause offers slideshow"}
              className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              {paused ? (
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
