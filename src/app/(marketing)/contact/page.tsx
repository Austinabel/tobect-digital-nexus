import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { getSiteLinks } from "@/lib/site-server";
import { IconPhone, IconWhatsApp, IconMail, IconMapPin, IconClock, IconBuilding, IconQuote } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { SITE } = await getSiteLinks();
  return {
    title: "Contact Us",
    description: `Contact ${SITE.legalName}: call ${SITE.phone}, WhatsApp ${SITE.whatsapp}, or visit us at ${SITE.address.street}, ${SITE.address.city}.`,
    alternates: { canonical: "/contact" },
  };
}

const card = "flex items-start gap-4 rounded-2xl border border-hair bg-white p-5 transition-colors";

export default async function ContactPage() {
  const { SITE, PHONE_HREF, EMAIL_HREF, whatsappHref } = await getSiteLinks();
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Get in Touch"
        intro="Talk to our team about products, solar systems, installation or support."
        crumbs={[{ label: "Contact" }]}
      />
      <section className="bg-mist/50 py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-9">
          <a href={PHONE_HREF} className={`${card} hover:border-blue`}>
            <IconPhone className="mt-0.5 size-5 shrink-0 text-blue" />
            <span>
              <b className="block font-heading text-ink">Call us</b>
              <span className="text-slate">{SITE.phone}</span>
            </span>
          </a>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={`${card} hover:border-whatsapp`}>
            <IconWhatsApp className="mt-0.5 size-5 shrink-0 text-whatsapp" />
            <span>
              <b className="block font-heading text-ink">WhatsApp</b>
              <span className="text-slate">{SITE.whatsapp}</span>
            </span>
          </a>
          <a href={EMAIL_HREF} className={`${card} hover:border-blue`}>
            <IconMail className="mt-0.5 size-5 shrink-0 text-blue" />
            <span className="min-w-0">
              <b className="block font-heading text-ink">Email</b>
              <span className="break-all text-slate">{SITE.email}</span>
            </span>
          </a>
          <div className={card}>
            <IconMapPin className="mt-0.5 size-5 shrink-0 text-red" />
            <span>
              <b className="block font-heading text-ink">Head office</b>
              <address className="not-italic text-slate">
                {SITE.address.street}, {SITE.address.city}, {SITE.address.country}
              </address>
            </span>
          </div>
          <div className={card}>
            <IconBuilding className="mt-0.5 size-5 shrink-0 text-red" />
            <span>
              <b className="block font-heading text-ink">Branches</b>
              <span className="text-slate">{SITE.branches.join(" · ")}</span>
            </span>
          </div>
          <div className={card}>
            <IconClock className="mt-0.5 size-5 shrink-0 text-blue" />
            <span>
              <b className="block font-heading text-ink">Opening hours</b>
              <span className="text-slate">{SITE.hours}</span>
            </span>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <Link
            href="/quote"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-red px-7 font-heading text-[0.92rem] font-semibold text-white hover:bg-red-dark"
          >
            <IconQuote className="size-4" />
            Request a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
