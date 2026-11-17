import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { SolarCalculator } from "@/components/marketing/solar-calculator";
import { ContactCta } from "@/components/marketing/contact-cta";
import { SOLUTIONS } from "@/lib/data/solutions";
import { SOLUTION_ICONS } from "@/components/marketing/solution-icons";
import { IconArrowRight } from "@/components/icons";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: "Solar Solutions for Homes, Businesses & Industry",
  description:
    `Residential, commercial and industrial solar and backup power systems, plus CCTV and security — designed and installed by ${SITE.name}.`,
  alternates: { canonical: "/solutions" },
  };
}

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        kicker="Solar Solutions"
        title="Power Solutions for Every Need"
        intro="From small homes to large industrial systems, we design and install solar and security solutions that work for you."
        crumbs={[{ label: "Solutions" }]}
      />

      <section className="bg-white py-12 lg:py-16">
        <ul className="mx-auto grid max-w-[1240px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-9">
          {SOLUTIONS.map((s) => {
            const Icon = SOLUTION_ICONS[s.slug];
            return (
              <li key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-hair bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#c9d8f2] hover:shadow-[0_30px_60px_-36px_rgba(13,27,47,0.35)] sm:p-8"
                >
                  <span className="grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-blue to-blue-deep text-white">
                    <Icon className="size-6" />
                  </span>
                  <h2 className="mt-5 font-heading text-[1.35rem] font-bold text-ink">{s.title}</h2>
                  <p className="text-[0.86rem] font-semibold text-blue">{s.short}</p>
                  <p className="mt-3 grow text-[0.94rem] text-slate">{s.intro}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-heading text-[0.88rem] font-semibold text-red">
                    Learn more <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-mist/60 py-12 lg:py-16">
        <div className="mx-auto max-w-[860px] px-4 sm:px-6">
          <SolarCalculator />
        </div>
      </section>

      <ContactCta whatsappMessage="Hello Tobecat, I'd like advice on a solar solution." />
    </>
  );
}
