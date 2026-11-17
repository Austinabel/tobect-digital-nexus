import Image from "next/image";
import Link from "next/link";
import { SHOWCASE_BRANDS, type ShowcaseBrand } from "@/lib/data/brands";

const tile =
  "group flex h-20 w-[168px] shrink-0 items-center justify-center rounded-2xl border border-hair bg-white px-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9d8f2] hover:shadow-[0_20px_40px_-24px_rgba(13,27,47,0.3)] focus-visible:outline-2 focus-visible:outline-blue sm:h-24 sm:w-[196px]";

function BrandTiles({ copy }: { copy: boolean }) {
  // The second copy only makes the loop seamless — hidden from screen readers and the keyboard.
  const hidden = copy ? { "aria-hidden": true, tabIndex: -1 } : {};
  const items: (ShowcaseBrand | "more")[] = [...SHOWCASE_BRANDS, "more"];
  return (
    <ul className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4" {...(copy ? { "aria-hidden": true } : {})}>
      {items.map((b) =>
        b === "more" ? (
          <li key="more">
            <Link href="/shop" className={`${tile} bg-mist`} {...hidden}>
              <span className="font-heading text-[1rem] font-extrabold text-blue">And More →</span>
            </Link>
          </li>
        ) : (
          <li key={b.name}>
            <Link href="/shop" className={tile} aria-label={copy ? undefined : `${b.name} — shop`} {...hidden}>
              {b.logo ? (
                <Image src={b.logo.src} alt={copy ? "" : b.name} width={b.logo.width} height={b.logo.height} sizes="160px" loading="eager" className="max-h-11 w-auto max-w-full object-contain sm:max-h-12" />
              ) : (
                <span className="font-heading text-[1.25rem] font-extrabold uppercase tracking-[0.08em] text-ink/80">{b.name}</span>
              )}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * Brands we stock, as an endless row of logos moving left to right. Pauses
 * on hover or keyboard focus; for visitors who prefer reduced motion it
 * stays still and can be swiped instead. Every logo links to the shop.
 */
export function BrandStrip() {
  return (
    <div>
      <div className="brand-marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div className="brand-marquee-track flex w-max py-2">
          <BrandTiles copy={false} />
          <BrandTiles copy />
        </div>
      </div>
      <p className="mt-3.5 text-[0.72rem] text-slate-light">
        Brand names and logos are trademarks of their respective owners. Shown to indicate brands we sell, not an official
        partnership.
      </p>
    </div>
  );
}
