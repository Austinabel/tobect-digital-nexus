import Link from "next/link";
import { SiteButton } from "@/components/marketing/site-button";
import { HeroIllustration } from "@/components/marketing/hero-illustration";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { ProductGrid } from "@/components/marketing/product-grid";
import { SolarCalculator } from "@/components/marketing/solar-calculator";
import {
  IconShieldCheck,
  IconWrench,
  IconTruck,
  IconSupport,
  IconCart,
  IconSun,
  IconCalculator,
  IconWhatsApp,
  IconHouse,
  IconBuilding,
  IconFactory,
  IconGlobe,
  IconQuote,
  IconArrowRight,
} from "@/components/icons";

const HERO_FEATURES = [
  { Icon: IconShieldCheck, title: "Quality Products", desc: "Trusted global brands" },
  { Icon: IconWrench, title: "Professional Installation", desc: "By certified engineers" },
  { Icon: IconTruck, title: "Fast Delivery", desc: "Across Nigeria" },
  { Icon: IconSupport, title: "After-Sales Support", desc: "We're with you always" },
];

const SOLUTION_TYPES = [
  { Icon: IconHouse, title: "Residential", desc: "Homes & apartments" },
  { Icon: IconBuilding, title: "Commercial", desc: "Offices, shops, hotels" },
  { Icon: IconFactory, title: "Industrial", desc: "Factories & warehouses" },
  { Icon: IconShieldCheck, title: "Security", desc: "CCTV & surveillance" },
];

const WHY_FEATURES = [
  { Icon: IconGlobe, title: "Global Brands", desc: "Premium & reliable" },
  { Icon: IconQuote, title: "Expert Support", desc: "Real people, real help" },
  { Icon: IconWrench, title: "Professional Installation", desc: "Certified engineers" },
  { Icon: IconShieldCheck, title: "Warranty Assurance", desc: "Peace of mind" },
];

export default function HomePage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf3ff] via-[#f6faff] to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-30 -top-50 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.18),rgba(245,166,35,0)_66%)]"
        />
        <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-13 lg:px-9 lg:py-18">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-deep">
              <span>Clean Energy</span>
              <span className="text-red">&#9670;</span>
              <span>Smart Solutions</span>
              <span className="text-red">&#9670;</span>
              <span>A Brighter Tomorrow</span>
            </div>

            <h1 className="mt-4.5 font-heading text-[clamp(2.55rem,5.6vw,4.15rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
              Powering the Future with <span className="text-red">Renewable Energy.</span>
            </h1>

            <p className="mt-4.5 max-w-[46ch] text-[1.05rem] text-slate">
              Tobecat provides reliable solar solutions, premium energy products, CCTV and security systems for
              homes, businesses and industries. Get clean, affordable and sustainable power &mdash; designed for
              your needs.
            </p>

            <div className="mt-6.5 flex flex-wrap gap-2.5">
              <SiteButton href="/shop" variant="red" icon={<IconCart className="size-4" />} trailingArrow>
                Shop Products
              </SiteButton>
              <SiteButton href="/solutions" variant="outline-blue" icon={<IconSun className="size-4" />} trailingArrow>
                Solar Solutions
              </SiteButton>
              <SiteButton
                href="#calculator"
                variant="outline-blue"
                icon={<IconCalculator className="size-4" />}
                trailingArrow
              >
                Calculate Your Needs
              </SiteButton>
              <SiteButton href="https://wa.me/2348037946366" variant="outline-whatsapp" icon={<IconWhatsApp className="size-4" />}>
                Chat on WhatsApp
              </SiteButton>
            </div>

            <div className="mt-8.5 grid grid-cols-2 gap-x-2.5 gap-y-3.5 border-t border-[#d8e4f4] pt-6 sm:grid-cols-4">
              {HERO_FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <span className="grid size-8.5 shrink-0 place-items-center rounded-[9px] border border-hair bg-white text-blue shadow-[0_2px_10px_rgba(13,27,47,0.06)]">
                    <Icon className="size-[17px]" />
                  </span>
                  <span>
                    <b className="block font-heading text-[0.8rem] font-semibold text-ink">{title}</b>
                    <span className="text-[0.72rem] leading-snug text-slate">{desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="bg-white py-14 sm:py-18 lg:py-26" id="categories">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 lg:mb-11">
            <div className="max-w-[48ch]">
              <span className="kicker">Shop by Category</span>
              <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.65rem)] font-extrabold text-ink">
                Shop by Category
              </h2>
              <p className="mt-2 text-slate">Explore our wide range of solar, power and security products.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 whitespace-nowrap font-heading text-[0.9rem] font-semibold text-red">
              View All Products
              <IconArrowRight className="size-4" />
            </Link>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* ===================== SOLUTIONS SPLIT ===================== */}
      <section className="bg-gradient-to-b from-white to-mist py-14 sm:py-18 lg:py-26" id="solutions">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-5.5 px-4 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:px-9">
          {/* Find the right solution */}
          <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_130%_at_100%_0%,#1f63e6_0%,var(--color-blue-deep)_46%,var(--color-blue-darkest)_100%)] p-6.5 text-[#eaf1ff] shadow-[0_26px_54px_-22px_rgba(11,63,158,0.45)] sm:p-11">
            <div className="relative z-10 grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_0.92fr]">
              <div>
                <span className="inline-flex items-center gap-2.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#9fc0ff]">
                  <span className="h-[3px] w-[26px] rounded-full bg-[#ff6274]" />
                  Find the Right Solution
                </span>
                <h2 className="mt-3 max-w-[14ch] font-heading text-[clamp(1.55rem,2.9vw,2.15rem)] font-extrabold text-white">
                  For Your Home, Business or Industry
                </h2>
                <p className="mt-2.5 max-w-[34ch] text-[0.94rem] text-[#c7d8f7]">
                  From small homes to large industrial systems, we design and install solar solutions that work for
                  you.
                </p>
                <SiteButton href="/solutions" variant="red" trailingArrow className="mt-6">
                  Explore Solar Solutions
                </SiteButton>
              </div>
              <div className="flex flex-col gap-3.5">
                {SOLUTION_TYPES.map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="grid size-9.5 shrink-0 place-items-center rounded-full border border-white/28 bg-white/10 text-white">
                      <Icon className="size-[17px]" />
                    </span>
                    <span>
                      <b className="block font-heading text-[0.9rem] font-semibold text-white">{title}</b>
                      <span className="text-[0.75rem] text-[#b8ccef]">{desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SolarCalculator />
        </div>
      </section>

      {/* ===================== WHY ===================== */}
      <section className="bg-white py-14 sm:py-18 lg:py-26">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-13 lg:px-9">
          <div>
            <span className="kicker">Why Choose Tobecat?</span>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.65rem)] font-extrabold text-ink">
              More Than Just Products
            </h2>
            <p className="mt-3.5 text-slate">
              We&rsquo;re your trusted partner in renewable energy, offering quality products, expert advice and
              professional support &mdash; every step of the way.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4.5 gap-y-5.5 text-center md:grid-cols-4">
            {WHY_FEATURES.map(({ Icon, title, desc }) => (
              <div key={title}>
                <span className="mx-auto grid size-11.5 place-items-center rounded-full bg-mist text-blue">
                  <Icon className="size-5.5" />
                </span>
                <b className="mt-3 block font-heading text-[0.94rem] font-semibold text-ink">{title}</b>
                <span className="text-[0.78rem] text-slate">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRODUCTS ===================== */}
      <section className="bg-gradient-to-b from-mist to-white py-14 sm:py-18 lg:py-26">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 lg:mb-11">
            <div className="max-w-[48ch]">
              <span className="kicker">Featured Products</span>
              <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.65rem)] font-extrabold text-ink">
                Best Selling Products
              </h2>
              <p className="mt-2 text-slate">Top quality. Great performance. Trusted by thousands.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 whitespace-nowrap font-heading text-[0.9rem] font-semibold text-red">
              View All Products
              <IconArrowRight className="size-4" />
            </Link>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* ===================== ADVICE BAND ===================== */}
      <section className="relative overflow-hidden bg-[radial-gradient(130%_120%_at_0%_0%,#2064e8,var(--color-blue-deep)_55%,var(--color-blue-darkest))] py-14 text-[#eaf1ff] sm:py-18 lg:py-24">
        <div className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-9">
          <div>
            <span className="inline-flex items-center gap-2.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#a7c6ff]">
              <span className="h-[3px] w-[26px] rounded-full bg-[#ff6274]" />
              Ready to Power Your Work?
            </span>
            <h2 className="mt-3 max-w-[18ch] font-heading text-[clamp(1.65rem,3.3vw,2.45rem)] font-extrabold text-white">
              Get Expert Advice Today
            </h2>
            <p className="mt-2.5 max-w-[40ch] text-[#c7d8f7]">
              Need help choosing the right solution? Our team of energy experts is ready to assist you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SiteButton href="/quote" variant="red">
              Request a Quote
            </SiteButton>
            <SiteButton href="https://wa.me/2348037946366" variant="outline-white" icon={<IconWhatsApp className="size-4" />}>
              Chat on WhatsApp
            </SiteButton>
          </div>
        </div>
      </section>
    </>
  );
}
