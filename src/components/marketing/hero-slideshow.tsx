"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/merch-server";

const INTERVAL_MS = 6500;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Full-bleed crossfading background slideshow.
 * - auto-advances every 6.5s, pauses on hidden tabs and via the pause button
 *   (WCAG 2.2.2 requires a way to stop auto-moving content)
 * - no auto-advance for visitors who prefer reduced motion
 * - first image is prioritised; slides are edited in Admin → Banners & slides
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const playing = !paused && !reducedMotion && slides.length > 1;

  useEffect(() => {
    if (!playing) return;
    let timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // restart the timer whenever the user jumps to a slide
  }, [playing, slides.length, index]);

  return (
    <>
      <div aria-hidden className="absolute inset-0 overflow-hidden bg-blue-darkest">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={slide.url}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                style={{ objectPosition: slide.position ?? "50% 50%" }}
                className={cn(
                  "object-cover transition-transform duration-[8000ms] ease-out",
                  active ? "scale-100" : "scale-[1.08]",
                )}
              />
            </div>
          );
        })}
        {/* Legibility overlays: navy from the left (text side) + darker base for the trust bar */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,40,0.92)_0%,rgba(7,28,68,0.78)_38%,rgba(7,28,68,0.35)_70%,rgba(7,28,68,0.15)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,40,0.35)_0%,rgba(6,18,40,0)_30%,rgba(6,18,40,0)_60%,rgba(6,18,40,0.7)_100%)]" />
      </div>

      {/* Screen-reader description of the current background, announced only when it changes by user action */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Background image {index + 1} of {slides.length}: {slides[index]?.alt}
      </p>

      {slides.length > 1 && (
        // Sits above the trust bar that overlaps the hero's bottom edge (-mt-12 / lg:-mt-14).
        <div className="absolute bottom-[68px] right-4 z-10 flex items-center gap-2 sm:right-6 lg:bottom-[80px] lg:right-9">
          <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-2 backdrop-blur-sm">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show background image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className="group grid h-6 place-items-center px-0.5"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 group-hover:bg-white/80",
                  )}
                />
              </button>
            ))}
          </div>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play background slideshow" : "Pause background slideshow"}
              className="grid size-10 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
            >
              {paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <rect x="6.5" y="5" width="4" height="14" rx="1" />
                  <rect x="13.5" y="5" width="4" height="14" rx="1" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </>
  );
}
