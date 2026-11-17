import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { SolarCalculator } from "@/components/marketing/solar-calculator";
import { ContactCta } from "@/components/marketing/contact-cta";
import { SOLUTIONS, getSolution } from "@/lib/data/solutions";
import { getCatalog } from "@/lib/catalog-server";
import { findCategory } from "@/lib/catalog";
import { categoryGlyphs, IconCheck, IconArrowRight } from "@/components/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ type: s.slug }));
}

export async function generateMetadata(props: PageProps<"/solutions/[type]">): Promise<Metadata> {
  const { type } = await props.params;
  const solution = getSolution(type);
  if (!solution) return {};
  return {
    title: `${solution.title} Solar & Power Solutions`,
    description: solution.intro,
    alternates: { canonical: `/solutions/${solution.slug}` },
  };
}

export default async function SolutionPage(props: PageProps<"/solutions/[type]">) {
  const { type } = await props.params;
  const solution = getSolution(type);
  if (!solution) notFound();

  const catalog = await getCatalog();
  const categories = solution.categories.flatMap((slug) => {
    const c = findCategory(catalog, slug);
    return c ? [c] : [];
  });

  return (
    <>
      <PageHero
        kicker={`${solution.title} Solutions`}
        title={solution.short}
        intro={solution.intro}
        crumbs={[{ label: "Solutions", href: "/solutions" }, { label: solution.title }]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1240px] items-start gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:px-9">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="font-heading text-[1.2rem] font-bold text-ink">What we typically power</h2>
              <ul className="mt-4 grid gap-2.5">
                {solution.typicalLoads.map((load) => (
                  <li key={load} className="flex items-center gap-3 text-[0.95rem] text-ink">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mist text-blue">
                      <IconCheck className="size-3.5" />
                    </span>
                    {load}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-[1.2rem] font-bold text-ink">Related products</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop/${c.slug}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-hair p-3 text-[0.86rem] font-semibold text-ink transition-colors hover:border-blue"
                    >
                      <span aria-hidden className="size-6 shrink-0 text-blue [&>svg]:size-full">{categoryGlyphs[c.glyph]}</span>
                      <span className="grow">{c.name}</span>
                      <IconArrowRight className="size-3.5 text-slate-light group-hover:text-blue" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {solution.calculatorPreset ? (
            <SolarCalculator initialType={solution.calculatorPreset} />
          ) : (
            <div className="rounded-3xl border border-hair bg-gradient-to-br from-white to-mist p-7 sm:p-9">
              <h2 className="font-heading text-[1.3rem] font-bold text-ink">Designed around your site</h2>
              <p className="mt-2 text-slate">
                Every security installation is different — the number of cameras, recording time, coverage and backup power
                depend on your property. Request a quote and we&rsquo;ll recommend the right setup.
              </p>
              <Link
                href="/quote"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-red px-6 font-heading text-[0.92rem] font-semibold text-white hover:bg-red-dark"
              >
                Request a Security Quote <IconArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <ContactCta whatsappMessage={`Hello Tobecat, I'd like advice on a ${solution.title.toLowerCase()} solution.`} />
    </>
  );
}
