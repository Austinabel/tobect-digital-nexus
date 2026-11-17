import Link from "next/link";
import { getCatalog } from "@/lib/catalog-server";
import { KitCard } from "@/components/shop/kit-card";
import { IconArrowRight } from "@/components/icons";

/** "Complete Solar Packages" — swipeable on mobile, four across on desktop. */
export async function KitsSection({ showAllLink = true }: { showAllLink?: boolean }) {
  const { kits: KITS } = await getCatalog();
  if (!KITS.length) return null;
  return (
    <section id="kits" aria-labelledby="kits-title" className="bg-white py-8 lg:py-10">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <div className="rounded-3xl border border-hair bg-gradient-to-b from-mist to-white p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="flex items-center gap-2 font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red">
                <span aria-hidden className="h-0.5 w-6 rounded bg-red" />
                Complete Solar Packages
              </span>
              <h2 id="kits-title" className="mt-1.5 font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight text-ink">
                All-in-One Solar Installation Kits
              </h2>
              <p className="mt-1 text-[0.92rem] text-slate">
                Pre-configured, tested and cost-effective solar systems for homes, offices and businesses.
              </p>
            </div>
            {showAllLink && (
              <Link href="/shop/installation-kits" className="inline-flex items-center gap-1.5 font-heading text-[0.86rem] font-bold text-red hover:underline">
                View All Packages
                <IconArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
            {KITS.map((kit) => (
              <KitCard key={kit.slug} kit={kit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
