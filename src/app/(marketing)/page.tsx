import type { Metadata } from "next";
import Link from "next/link";
import { SiteButton } from "@/components/marketing/site-button";
import { HeroSlideshow } from "@/components/marketing/hero-slideshow";
import { HeroEquipment } from "@/components/marketing/hero-equipment";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { ProductGrid } from "@/components/marketing/product-grid";
import { SolarCalculator } from "@/components/marketing/solar-calculator";
import { SectionHeading } from "@/components/marketing/section-heading";
import { EnergySolutions } from "@/components/marketing/energy-solutions";
import { BusinessSolar } from "@/components/marketing/business-solar";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { BrandStrip } from "@/components/marketing/brand-strip";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { JsonLd, organizationJsonLd } from "@/components/json-ld";
import { getHomeSlides } from "@/lib/merch-server";
import { SOLUTIONS } from "@/lib/data/solutions";
import { SOLUTION_ICONS } from "@/components/marketing/solution-icons";
import { getSite, getSiteLinks } from "@/lib/site-server";
import {
  IconShieldCheck,
  IconWrench,
  IconTruck,
  IconSupport,
  IconCart,
  IconSun,
  IconCalculator,
  IconWhatsApp,
  IconGlobe,
  IconArrowRight,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: { absolute: `${SITE.name} | Solar, Inverters, Batteries & CCTV in Nigeria` },
  description:
    "Shop solar panels, hybrid inverters, lithium batteries, solar generators and CCTV — with professional installation and after-sales support across Nigeria. Size your system with our free solar calculator.",
  alternates: { canonical: "/" },
  };
}

const TRUST_POINTS = [
  { Icon: IconShieldCheck, title: "Quality Products", desc: "Trusted brands and genuine products." },
  { Icon: IconWrench, title: "Professional Installation", desc: "By certified and experienced engineers." },
  { Icon: IconTruck, title: "Fast Delivery", desc: "Across Nigeria." },
  { Icon: IconSupport, title: "After-Sales Support", desc: "We're with you always." },
];

const WHY_FEATURES = [
  { Icon: IconGlobe, title: "Global Brands", desc: "Trusted and reliable" },
  { Icon: IconSupport, title: "Expert Support", desc: "Real people, real help" },
  { Icon: IconWrench, title: "Professional Installation", desc: "Certified engineers" },
  { Icon: IconShieldCheck, title: "Warranty Assurance", desc: "Peace of mind" },
];

const container = "mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9";

export default async function HomePage() {
  const { SITE, whatsappHref } = await getSiteLinks();
  const heroSlides = await getHomeSlides();
  return (
    <>
      <JsonLd data={organizationJsonLd(SITE)} />

      {/* ===================== HERO: solar-farm slideshow background + equipment showcase ===================== */}
      <section className="relative isolate overflow-hidden bg-blue-darkest text-white">
        <HeroSlideshow slides={heroSlides} />

        <div
          className={`relative z-[1] grid items-center gap-10 pb-28 pt-12 sm:pt-14 lg:min-h-[min(calc(100svh-72px),760px)] lg:grid-cols-[1fr_1.02fr] lg:gap-8 lg:pb-32 lg:pt-14 ${container}`}
        >
          <div className="max-w-[620px]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-heading text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#d6e4ff] sm:text-[0.78rem]">
              <span>Clean Energy</span>
              <span aria-hidden className="text-[#ff4d63]">
                &bull;
              </span>
              <span>Smart Solutions</span>
              <span aria-hidden className="text-[#ff4d63]">
                &bull;
              </span>
              <span>A Brighter Tomorrow</span>
            </p>

            <h1 className="mt-4 font-heading text-[clamp(2.5rem,5.4vw,4.2rem)] font-extrabold leading-[1.04] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.25)]">
              Powering the Future with <span className="text-[#ff3d57]">Renewable Energy.</span>
            </h1>

            <p className="mt-5 max-w-[52ch] text-[1.02rem] leading-relaxed text-white/85 sm:text-[1.08rem]">
              {SITE.shortName} provides reliable solar solutions, premium energy products, CCTV and security systems for homes,
              businesses and industries. Get clean, affordable and sustainable power designed for your needs.
            </p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <SiteButton href="/shop" variant="red" icon={<IconCart className="size-4" />} trailingArrow>
                Shop Products
              </SiteButton>
              <SiteButton href="/solutions" variant="outline-white" icon={<IconSun className="size-4" />} trailingArrow>
                Solar Solutions
              </SiteButton>
              <SiteButton href="#calculator" variant="outline-white" icon={<IconCalculator className="size-4" />} trailingArrow>
                Calculate Your Needs
              </SiteButton>
              <SiteButton
                href={whatsappHref(`Hello ${SITE.shortName}, I'd like some advice on a solar / power system.`)}
                variant="outline-whatsapp-dark"
                icon={<IconWhatsApp className="size-4" />}
              >
                Chat on WhatsApp
              </SiteButton>
            </div>
          </div>

          <HeroEquipment className="lg:max-w-[580px] lg:justify-self-end" />
        </div>
      </section>

      {/* ===================== TRUST BAR (floats over the hero's bottom edge) ===================== */}
      <div className={`relative z-[2] -mt-16 lg:-mt-[72px] ${container}`}>
        <ul className="grid grid-cols-2 overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_30px_60px_-30px_rgba(13,27,47,0.45)] lg:grid-cols-4">
          {TRUST_POINTS.map(({ Icon, title, desc }, i) => (
            <li
              key={title}
              className={`flex items-center gap-3 p-4 sm:gap-4 sm:p-6 ${i % 2 === 0 ? "border-r border-hair" : ""} ${i < 2 ? "border-b border-hair lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mist text-blue sm:size-12">
                <Icon className="size-[22px]" />
              </span>
              <span className="min-w-0">
                <b className="block font-heading text-[0.84rem] font-semibold leading-tight text-ink sm:text-[0.95rem]">{title}</b>
                <span className="mt-0.5 block text-[0.78rem] leading-snug text-slate sm:text-[0.8rem]">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ===================== CATEGORIES ===================== */}
      <section className="reveal bg-white pb-14 pt-14 sm:pb-18 sm:pt-18 lg:pb-22 lg:pt-20" id="categories">
        <div className={container}>
          <SectionHeading
            kicker="Shop by Category"
            title="Shop by Category"
            intro="Explore our wide range of solar, power and security products."
            link={{ href: "/shop", label: "View All Products" }}
          />
          <CategoryGrid />
        </div>
      </section>

      {/* ===================== SOLUTIONS + CALCULATOR ===================== */}
      <section className="bg-gradient-to-b from-white to-mist py-14 sm:py-18 lg:py-22" id="solutions">
        <div className={`grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 ${container}`}>
          <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_130%_at_100%_0%,#1f63e6_0%,var(--color-blue-deep)_46%,var(--color-blue-darkest)_100%)] p-6 text-[#eaf1ff] shadow-[0_26px_54px_-22px_rgba(11,63,158,0.45)] sm:p-9 lg:sticky lg:top-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),rgba(255,255,255,0)_70%)]"
            />
            <div className="relative grid gap-7 sm:grid-cols-[1fr_1fr] sm:gap-6">
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-2.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#9fc0ff]">
                  <span className="h-[3px] w-[26px] rounded-full bg-[#ff6274]" />
                  Find the Right Solution
                </span>
                <h2 className="mt-3 font-heading text-[clamp(1.6rem,2.7vw,2.1rem)] font-extrabold leading-tight text-white">
                  For Your Home, Business or Industry.
                </h2>
                <p className="mt-3 text-[0.94rem] text-[#c7d8f7]">
                  From small homes to large industrial systems, we design and install solar solutions that work for you.
                </p>
                <SiteButton href="/solutions" variant="red" trailingArrow className="mt-6 self-start sm:mt-auto">
                  Explore Solar Solutions
                </SiteButton>
              </div>

              <ul className="grid content-start gap-2.5">
                {SOLUTIONS.map((s) => {
                  const Icon = SOLUTION_ICONS[s.slug];
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/solutions/${s.slug}`}
                        className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 transition-colors hover:border-white/40 hover:bg-white/[0.12]"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-white">
                          <Icon className="size-[18px]" />
                        </span>
                        <span className="min-w-0 grow">
                          <b className="block font-heading text-[0.94rem] font-semibold text-white">{s.title}</b>
                          <span className="text-[0.76rem] text-[#b8ccef]">{s.short}</span>
                        </span>
                        <IconArrowRight className="size-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <SolarCalculator />
        </div>
      </section>

      {/* ===================== WHY CHOOSE TOBECAT ===================== */}
      <section className="reveal bg-white py-14 sm:py-18 lg:py-22">
        <div className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 ${container}`}>
          <div>
            <span className="kicker">Why Choose {SITE.shortName}?</span>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
              More Than Just Products.
            </h2>
            <p className="mt-3.5 max-w-[48ch] text-slate">
              We&rsquo;re your trusted partner in renewable energy, offering quality products, expert advice and
              professional support &mdash; every step of the way.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 text-center md:grid-cols-4">
            {WHY_FEATURES.map(({ Icon, title, desc }) => (
              <li key={title} className="group">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-mist text-blue ring-8 ring-mist/40 transition-colors duration-200 group-hover:bg-blue group-hover:text-white">
                  <Icon className="size-7" />
                </span>
                <b className="mt-4 block font-heading text-[0.98rem] font-semibold text-ink">{title}</b>
                <span className="mt-0.5 block text-[0.84rem] text-slate">{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="reveal bg-gradient-to-b from-mist to-white py-14 sm:py-18 lg:py-22">
        <div className={container}>
          <SectionHeading
            kicker="Featured Products"
            title="Best Selling Products"
            intro="Hand-picked inverters, batteries, panels and security kits from our catalogue."
            link={{ href: "/shop", label: "View All Products" }}
          />
          <ProductGrid layout="row" />
          <CatalogueNotice className="mt-5" />
        </div>
      </section>

      {/* ===================== NEW: ENERGY SOLUTIONS / BUSINESS / PROCESS ===================== */}
      <EnergySolutions />
      <BusinessSolar />
      <ProcessSteps />

      {/* ===================== BRANDS ===================== */}
      <section className="reveal bg-gradient-to-b from-white to-mist/70 py-14 sm:py-18 lg:py-20" aria-labelledby="brands-heading">
        <div className={container}>
          <SectionHeading
            kicker="Trusted Brands"
            title={<span id="brands-heading">Our Brands</span>}
            intro="Quality products from trusted global and local brands."
            link={{ href: "/shop", label: "Shop All Brands" }}
          />
          <BrandStrip />
        </div>
      </section>

      {/* ===================== PROJECTS ===================== */}
      <section className="reveal bg-white py-14 sm:py-18 lg:py-22" aria-labelledby="projects-heading">
        <div className={container}>
          <SectionHeading
            kicker="Our Installation Projects"
            title={<span id="projects-heading">Recent Installation Projects</span>}
            intro="Real projects. Reliable solutions. Proven results."
            link={{ href: "/projects", label: "View All Projects" }}
          />
          <ProjectShowcase />
        </div>
      </section>

      {/* ===================== TESTIMONIALS (only with genuine reviews) ===================== */}
      <Testimonials />

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative overflow-hidden bg-[radial-gradient(130%_120%_at_0%_0%,#2064e8,var(--color-blue-deep)_55%,var(--color-blue-darkest))] py-14 text-[#eaf1ff] sm:py-18 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.22),rgba(245,166,35,0)_65%)]"
        />
        <div className={`relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between ${container}`}>
          <div>
            <span className="inline-flex items-center gap-2.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#a7c6ff]">
              <span className="h-[3px] w-[26px] rounded-full bg-[#ff6274]" />
              Ready to Power Your World?
            </span>
            <h2 className="mt-3 max-w-[18ch] font-heading text-[clamp(1.75rem,3.4vw,2.6rem)] font-extrabold leading-tight text-white">
              Get Expert Advice Today
            </h2>
            <p className="mt-2.5 max-w-[44ch] text-[#c7d8f7]">
              Need help choosing the right solution? Our team of energy experts is ready to assist you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SiteButton href="/quote" variant="red" trailingArrow>
              Request a Quote
            </SiteButton>
            <SiteButton
              href={whatsappHref(`Hello ${SITE.shortName}, I'd like expert advice on a solar / power system.`)}
              variant="outline-white"
              icon={<IconWhatsApp className="size-4" />}
            >
              Chat on WhatsApp
            </SiteButton>
          </div>
        </div>
      </section>
    </>
  );
}
