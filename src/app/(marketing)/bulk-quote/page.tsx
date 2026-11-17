import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { BulkQuoteForm } from "@/components/shop/bulk-quote-form";
import { getSiteLinks } from "@/lib/site-server";
import { IconPhone, IconWhatsApp, IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: "Bulk & Commercial Orders",
  description:
    "Request a bulk or commercial quotation for solar panels, inverters, batteries and CCTV — special pricing for installers, dealers, contractors and large projects.",
  alternates: { canonical: "/bulk-quote" },
};

const FOR = ["Solar installers and electrical contractors", "Dealers and resellers", "Estates, schools, clinics and offices", "Commercial and industrial projects"];

export default async function BulkQuotePage() {
  const { SITE, PHONE_HREF, whatsappHref } = await getSiteLinks();
  return (
    <>
      <PageHero
        kicker="Bulk & Commercial Orders"
        title="Request a Bulk Quote"
        intro="Special pricing for installers, dealers and large projects. List the products and quantities you need — our sales team will reply with a quotation."
        crumbs={[{ label: "Shop", href: "/shop" }, { label: "Bulk Orders" }]}
      />
      <section className="bg-mist/50 py-8 lg:py-14">
        <div className="mx-auto grid max-w-[1240px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-9">
          <BulkQuoteForm />
          <aside className="space-y-3 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-ink p-6 text-[#c7d3e3]">
              <h2 className="font-heading text-[1.05rem] font-bold text-white">Talk to sales</h2>
              <ul className="mt-4 space-y-3.5 text-[0.9rem]">
                <li>
                  <a href={whatsappHref(`Hello ${SITE.shortName}, I'd like to discuss a bulk / commercial order.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white">
                    <IconWhatsApp className="size-4 text-whatsapp" /> WhatsApp Sales · {SITE.whatsapp}
                  </a>
                </li>
                <li>
                  <a href={PHONE_HREF} className="flex items-center gap-3 hover:text-white">
                    <IconPhone className="size-4 text-[#6f9bff]" /> {SITE.phone}
                  </a>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-hair bg-white p-6 text-[0.88rem] text-slate">
              <h2 className="font-heading text-[1rem] font-bold text-ink">Who this is for</h2>
              <ul className="mt-3 space-y-2">
                {FOR.map((f) => (
                  <li key={f} className="flex gap-2">
                    <IconCheck className="mt-0.5 size-4 shrink-0 text-whatsapp" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
