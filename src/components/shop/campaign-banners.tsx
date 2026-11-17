import Link from "next/link";
import { getImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { categoryGlyphs, IconArrowRight, IconCheck } from "@/components/icons";
import { campaignsFor } from "@/lib/merch-server";
import { safeCampaignHref, type Campaign } from "@/lib/shop/campaigns";

const THEMES = {
  navy: "bg-[linear-gradient(115deg,#0b1930_0%,#10306b_60%,#1556d9_130%)] text-white",
  blue: "bg-[linear-gradient(115deg,#eef5ff_0%,#dce9ff_100%)] text-ink",
  red: "bg-[linear-gradient(115deg,#c40f2b_0%,#f01436_100%)] text-white",
} as const;

function CampaignImage({ c, sizes, position }: { c: Campaign; sizes: string; position?: string }) {
  if (!c.desktopImage) return null;
  const alt = c.imageAlt ?? "";
  const common = { alt, fill: true, sizes };
  const { props: desktop } = getImageProps({ ...common, src: c.desktopImage });
  const { props: mobile } = getImageProps({ ...common, src: c.mobileImage ?? c.desktopImage });
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
      <source srcSet={mobile.srcSet} sizes={mobile.sizes} />
      <img {...desktop} alt={alt} className="absolute inset-0 size-full object-cover" style={{ ...desktop.style, objectPosition: position ?? c.imagePosition }} />
    </picture>
  );
}

/** Drawn product composition used when a banner has no photo. Decorative only. */
function GlyphArt({ glyphs, light }: { glyphs: (keyof typeof categoryGlyphs)[]; light: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] items-center justify-center gap-3 sm:flex">
      {glyphs.map((g, i) => (
        <span
          key={g}
          className={cn(
            "grid place-items-center rounded-[22px] [&>svg]:size-full",
            light ? "bg-white text-blue shadow-[0_20px_40px_-24px_var(--color-blue)]" : "bg-white/10 text-white ring-1 ring-white/20",
            i === 1 ? "size-28 p-5" : "size-20 p-4",
          )}
        >
          {categoryGlyphs[g]}
        </span>
      ))}
    </div>
  );
}

function Banner({ c, size, glyphs }: { c: Campaign; size: "large" | "medium"; glyphs: (keyof typeof categoryGlyphs)[] }) {
  const href = safeCampaignHref(c.ctaHref) ?? "/shop";
  const theme = c.theme ?? "navy";
  const light = theme === "blue";
  const lines = c.description?.split("\n").filter(Boolean) ?? [];
  const asList = lines.length > 1;
  const external = href.startsWith("http");

  return (
    <article className={cn("relative isolate flex overflow-hidden rounded-3xl", THEMES[theme], size === "large" ? "min-h-[230px] sm:min-h-[260px]" : "min-h-[230px]")}>
      {c.desktopImage ? (
        <>
          <CampaignImage c={c} sizes={size === "large" ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 480px, 100vw"} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
        </>
      ) : (
        <GlyphArt glyphs={glyphs} light={light} />
      )}
      <div className={cn("relative flex max-w-[34rem] flex-col justify-center p-6 sm:p-8", !c.desktopImage && "sm:max-w-[58%]", c.desktopImage && "text-white")}>
        {c.kicker && (
          <span className={cn("self-start rounded-full px-3 py-1 font-heading text-[0.72rem] font-bold uppercase tracking-[0.08em]", light ? "bg-blue text-white" : "bg-red text-white")}>
            {c.kicker}
          </span>
        )}
        <h2 className={cn("mt-3 font-heading font-extrabold leading-[1.08] tracking-tight", size === "large" ? "text-[clamp(1.5rem,3vw,2.2rem)]" : "text-[1.45rem]")}>{c.title}</h2>
        {lines.length > 0 &&
          (asList ? (
            <ul className={cn("mt-3 space-y-1.5 text-[0.9rem] font-medium", light ? "text-ink/80" : "text-white/85")}>
              {lines.map((l) => (
                <li key={l} className="flex items-start gap-2">
                  <IconCheck className={cn("mt-0.5 size-4 shrink-0", light ? "text-blue" : "text-white")} />
                  {l.replace(/^\+\s*/, "")}
                </li>
              ))}
            </ul>
          ) : (
            <p className={cn("mt-2.5 text-[0.94rem] leading-relaxed", light && !c.desktopImage ? "text-slate" : "text-white/85")}>{lines[0]}</p>
          ))}
        {c.discountLabel && <p className="mt-3 self-start rounded-lg bg-red px-2.5 py-1 font-heading text-[0.84rem] font-bold text-white">{c.discountLabel}</p>}
        <Link
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="mt-5 inline-flex h-11 items-center gap-2 self-start rounded-full bg-red px-6 font-heading text-[0.9rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-transform hover:-translate-y-0.5"
        >
          {c.ctaText}
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

/** Primary + secondary campaign row, then any tile campaigns. */
export async function CampaignBanners({ now }: { now: Date }) {
  const [[primary], [secondary], tiles] = await Promise.all([campaignsFor("shop-primary", now, 1), campaignsFor("shop-secondary", now, 1), campaignsFor("shop-tile", now, 3)]);
  if (!primary && !secondary && !tiles.length) return null;

  return (
    <section aria-label="Offers and promotions" className="hidden bg-white pt-8 lg:block">
      <div className="mx-auto max-w-[1240px] space-y-4 px-4 sm:px-6 lg:px-9">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          {primary && <Banner c={primary} size="large" glyphs={["panel", "generator", "battery"]} />}
          {secondary && <Banner c={secondary} size="medium" glyphs={["inverter", "battery"]} />}
        </div>
        {tiles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {tiles.map((t) => (
              <Banner key={t.id} c={t} size="medium" glyphs={[]} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Full-width promotional banner between product sections (position "shop-wide").
 * A finished banner design is shown as-is (desktop/mobile art); otherwise a
 * photo with the title, offer badge and button laid over it.
 */
export async function WideBanner({ now }: { now: Date }) {
  const [c] = await campaignsFor("shop-wide", now, 1);
  if (!c) return null;
  const href = safeCampaignHref(c.ctaHref) ?? "/shop";
  const external = href.startsWith("http");
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <section aria-label="Promotion" className="hidden bg-white py-8 lg:block">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        {c.designedBanner && c.desktopImage ? (
          <Link href={href} {...linkProps} className="relative block aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[1240/300]">
            <CampaignImage c={c} sizes="(min-width: 1280px) 1240px, 100vw" />
            <span className="sr-only">{c.ctaText}</span>
          </Link>
        ) : (
          <article className="relative isolate flex min-h-[240px] items-center overflow-hidden rounded-3xl bg-ink sm:min-h-[260px]">
            {/* photo sits low in the frame so rooftops, not just sky, show in the wide crop */}
            {c.desktopImage && <CampaignImage c={{ ...c, imageAlt: "" }} sizes="(min-width: 1280px) 1240px, 100vw" position={c.imagePosition ?? "50% 78%"} />}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,18,40,0.95)_0%,rgba(7,28,68,0.82)_45%,rgba(7,28,68,0.2)_100%)]" />
            {/* slanted accent stripes, echoing the hero slideshow */}
            <div aria-hidden className="absolute inset-y-0 right-[18%] hidden w-16 -skew-x-[18deg] bg-red/85 md:block" />
            <div aria-hidden className="absolute inset-y-0 right-[12%] hidden w-6 -skew-x-[18deg] bg-white/20 md:block" />
            <div className="relative max-w-[640px] px-6 py-8 sm:px-10">
              {c.kicker && <span className="rounded-full bg-red px-3 py-1 font-heading text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white">{c.kicker}</span>}
              <h2 className="mt-3 font-heading text-[clamp(1.4rem,3vw,2.15rem)] font-extrabold leading-[1.1] tracking-tight text-white">{c.title}</h2>
              {c.description && <p className="mt-2.5 text-[0.95rem] leading-relaxed text-white/85">{c.description.replace(/\n/g, " ")}</p>}
              {c.discountLabel && <p className="mt-3 inline-block rounded-md bg-gold px-2.5 py-1 font-heading text-[0.86rem] font-extrabold text-ink">{c.discountLabel}</p>}
              <div>
                <Link
                  href={href}
                  {...linkProps}
                  className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-red px-7 font-heading text-[0.92rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-transform hover:-translate-y-0.5"
                >
                  {c.ctaText}
                  <IconArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
