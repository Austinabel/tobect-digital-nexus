import Link from "next/link";
import { getCatalog } from "@/lib/catalog-server";
import { KitCard } from "@/components/shop/kit-card";
import { IconArrowRight } from "@/components/icons";

/** "Complete Solar Packages" — swipeable on mobile, four across on desktop. */
export async function KitsSection({ showAllLink = true }: { showAllLink?: boolean }) {
  const { kits: KITS } = await getCatalog();
  if (!KITS.length) return null;
  return (
    <section id="kits" aria-labelledby="kits-title" className="bg-white py-4 lg:py-10">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <div className="sm:rounded-3xl sm:border sm:border-hair sm:bg-gradient-to-b sm:from-mist sm:to-white sm:p-6">
          <div className="flex items-center justify-between gap-3 sm:flex-wrap sm:items-end">
            <div>
              <span className="hidden items-center gap-2 font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red sm:flex">
                <span aria-hidden className="h-0.5 w-6 rounded bg-red" />
                Complete Solar Packages
              </span>
              <h2 id="kits-title" className="font-heading text-[1.2rem] font-extrabold tracking-tight text-ink sm:mt-1.5 sm:text-[clamp(1.4rem,2.6vw,1.9rem)]">
                <span className="sm:hidden">Complete Solar Kits</span>
                <span className="hidden sm:inline">All-in-One Solar Installation Kits</span>
              </h2>
              <p className="mt-1 hidden text-[0.92rem] text-slate sm:block">
                Pre-configured, tested and cost-effective solar systems for homes, offices and businesses.
              </p>
            </div>
            {showAllLink && (
              <Link href="/shop/complete-solar-setups" className="-my-3 inline-flex shrink-0 items-center gap-1.5 py-3 font-heading text-[0.84rem] font-bold text-blue hover:underline sm:text-[0.86rem] sm:text-red">
                <span className="sm:hidden">See all</span>
                <span className="hidden sm:inline">View All Packages</span>
                <IconArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <div className="-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mt-5 sm:gap-3.5 [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
            {KITS.map((kit) => (
              <KitCard key={kit.slug} kit={kit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
