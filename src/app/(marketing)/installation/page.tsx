import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactCta } from "@/components/marketing/contact-cta";
import { SiteButton } from "@/components/marketing/site-button";
import { IconCalculator } from "@/components/icons";
import { getSite } from "@/lib/site-server";

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

export default function InstallationPage() {
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
