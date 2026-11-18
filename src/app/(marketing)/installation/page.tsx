import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactCta } from "@/components/marketing/contact-cta";
import { SiteButton } from "@/components/marketing/site-button";
import { IconCalculator, IconWhatsApp } from "@/components/icons";
import { getSite, getSiteLinks } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: "Solar & CCTV Installation",
  description:
    `Professional installation of solar panels, inverters, batteries and CCTV systems by ${SITE.name} — from site assessment to commissioning and after-sales support.`,
  alternates: { canonical: "/installation" },
  };
}

const STEPS = [
  { title: "Consultation", text: "Tell us what you want to power or protect — by phone, WhatsApp, or with our solar calculator." },
  { title: "Site assessment", text: "Where needed, our team visits to check your roof, wiring, loads and where equipment will go." },
  { title: "Design & quotation", text: "We recommend the right inverter, battery, panels or cameras and send a detailed quote." },
  { title: "Installation", text: "Our engineers install and wire the system neatly and safely." },
  { title: "Commissioning & handover", text: "We test everything, show you how it works and how to monitor it." },
  { title: "After-sales support", text: "We stay available for questions, maintenance and warranty support." },
];

/** The 70% upfront installation payment plan (Admin → Banners links here: /installation#payment-plan). */
const PLAN_MONTHS = [3, 6, 12];

export default async function InstallationPage() {
  const { SITE, whatsappHref } = await getSiteLinks();
  return (
    <>
      <PageHero
        kicker="Installation"
        title="Professional Installation, Done Right"
        intro="Good equipment only performs when it's installed properly. Our team handles your project from first conversation to final handover."
        crumbs={[{ label: "Installation" }]}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <SiteButton href="/quote" variant="red" trailingArrow>
            Book an Installation
          </SiteButton>
          <SiteButton href="/solar-calculator" variant="outline-blue" icon={<IconCalculator className="size-4" />}>
            Size Your System
          </SiteButton>
        </div>
      </PageHero>

      <section id="payment-plan" className="scroll-mt-20 bg-[radial-gradient(120%_130%_at_100%_0%,#1f63e6_0%,var(--color-blue-deep)_46%,var(--color-blue-darkest)_100%)] py-12 text-white lg:py-16">
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-9">
          <div>
            <span className="inline-flex rounded-full bg-red px-3 py-1 font-heading text-[0.72rem] font-bold uppercase tracking-[0.12em]">Installation payment plan</span>
            <h2 className="mt-4 font-heading text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.08] tracking-tight">
              Pay 70% upfront. Spread the balance over 3, 6 or 12 months.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[1rem] leading-relaxed text-white/85">
              {SITE.name} installs your complete solar system once 70% of the cost is paid. You then pay the remaining 30% in
              instalments over 3, 6 or 12 months — whichever suits you.
            </p>
            <p className="mt-3 max-w-[56ch] rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-[0.9rem] text-white/90">
              <b className="font-semibold text-white">For installations only.</b> The plan applies when our team installs the system for
              you. Products bought without installation are paid for in full.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <SiteButton href="/quote" variant="red" trailingArrow>
                Get an Installation Quote
              </SiteButton>
              <SiteButton
                href={whatsappHref(`Hello ${SITE.shortName}, I'm interested in the 70% upfront installation payment plan.`)}
                variant="outline-whatsapp-dark"
                icon={<IconWhatsApp className="size-4" />}
              >
                Ask on WhatsApp
              </SiteButton>
            </div>
          </div>
          <ol className="grid gap-3">
            <li className="flex items-center gap-4 rounded-2xl bg-white p-4 text-ink sm:p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red font-heading text-[1.3rem] font-extrabold text-white">70%</span>
              <span>
                <b className="block font-heading text-[1rem] font-bold">Upfront payment</b>
                <span className="text-[0.88rem] text-slate">We install your complete solar system.</span>
              </span>
            </li>
            <li className="rounded-2xl bg-white p-4 text-ink sm:p-5">
              <span className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue font-heading text-[1.3rem] font-extrabold text-white">30%</span>
                <span>
                  <b className="block font-heading text-[1rem] font-bold">Balance, in instalments</b>
                  <span className="text-[0.88rem] text-slate">Choose how long to spread it over:</span>
                </span>
              </span>
              <span className="mt-3 grid grid-cols-3 gap-2">
                {PLAN_MONTHS.map((m) => (
                  <span key={m} className="rounded-xl border border-hair bg-mist px-2 py-2.5 text-center">
                    <b className="block font-heading text-[1.25rem] font-extrabold leading-none text-blue">{m}</b>
                    <span className="text-[0.76rem] text-slate">months</span>
                  </span>
                ))}
              </span>
            </li>
            <li className="px-1 text-[0.82rem] text-white/75">Ask us for the instalment amounts and full terms for your system.</li>
          </ol>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <span className="kicker">How it works</span>
          <h2 className="mt-3 font-heading text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-ink">Our installation process</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-hair bg-white p-6">
                <span className="grid size-10 place-items-center rounded-full bg-blue font-heading text-[0.95rem] font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-heading text-[1.05rem] font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[0.92rem] text-slate">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[0.9rem] text-slate">
            We install solar systems, inverter and battery backup, solar street lights and CCTV for homes, businesses and
            industrial sites. Already bought your equipment? We can install that too —{" "}
            <Link href="/quote" className="font-semibold text-blue hover:underline">
              request a quote
            </Link>
            .
          </p>
        </div>
      </section>

      <ContactCta title="Ready to Install?" whatsappMessage="Hello Tobecat, I'd like to book an installation." />
    </>
  );
}
