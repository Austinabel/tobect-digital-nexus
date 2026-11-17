import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { QuoteForm } from "@/components/marketing/quote-form";
import { getCatalog } from "@/lib/catalog-server";
import { findProduct } from "@/lib/catalog";
import { findKit } from "@/lib/data/kits";
import { getSiteLinks } from "@/lib/site-server";
import { IconPhone, IconWhatsApp, IconMail, IconClock } from "@/components/icons";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: "Request a Quote",
  description:
    `Request a free quote for a solar system, inverter and battery backup, CCTV or installation from ${SITE.name}.`,
  alternates: { canonical: "/quote" },
  };
}

export default async function QuotePage(props: PageProps<"/quote">) {
  const { SITE, PHONE_HREF, EMAIL_HREF, whatsappHref } = await getSiteLinks();
  const { estimate, product: productSlug, kit: kitSlug } = await props.searchParams;

  let initialMessage = "";
  if (typeof estimate === "string") {
    initialMessage = estimate.slice(0, 3000);
  } else if (typeof kitSlug === "string" && findKit((await getCatalog()).kits, kitSlug)) {
    initialMessage = `I'm interested in the ${findKit((await getCatalog()).kits, kitSlug)!.name}, including installation. Please recommend the components and send a quotation.`;
  } else if (typeof productSlug === "string") {
    const product = findProduct(await getCatalog(), productSlug);
    if (product) initialMessage = `I'm interested in the ${product.name}, including installation.`;
  }

  return (
    <>
      <PageHero
        kicker="Free Quote"
        title="Request a Quote"
        intro="Tell us what you need. Our energy experts will recommend the right system and send you a detailed quotation."
        crumbs={[{ label: "Request a Quote" }]}
      />
      <section className="bg-mist/50 py-8 lg:py-14">
        <div className="mx-auto grid max-w-[1240px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-9">
          <QuoteForm key={initialMessage} initialMessage={initialMessage} />
          <aside className="space-y-3 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-ink p-6 text-[#c7d3e3]">
              <h2 className="font-heading text-[1.05rem] font-bold text-white">Prefer to talk?</h2>
              <ul className="mt-4 space-y-3.5 text-[0.9rem]">
                <li>
                  <a href={PHONE_HREF} className="-my-2.5 flex items-center gap-3 py-2.5 hover:text-white">
                    <IconPhone className="size-4 text-[#6f9bff]" /> {SITE.phone}
                  </a>
                </li>
                <li>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="-my-2.5 flex items-center gap-3 py-2.5 hover:text-white">
                    <IconWhatsApp className="size-4 text-whatsapp" /> {SITE.whatsapp} (WhatsApp)
                  </a>
                </li>
                <li>
                  <a href={EMAIL_HREF} className="-my-2.5 flex items-center gap-3 break-all py-2.5 hover:text-white">
                    <IconMail className="size-4 shrink-0 text-[#6f9bff]" /> {SITE.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <IconClock className="size-4 text-[#6f9bff]" /> {SITE.hours}
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-hair bg-white p-6 text-[0.88rem] text-slate">
              <h2 className="font-heading text-[1rem] font-bold text-ink">What happens next</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-4">
                <li>We review your requirements.</li>
                <li>An engineer may call to ask a few questions or book a site visit.</li>
                <li>You receive a detailed quotation with equipment and installation.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
