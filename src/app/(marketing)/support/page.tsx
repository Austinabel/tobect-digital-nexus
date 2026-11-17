import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactCta } from "@/components/marketing/contact-cta";
import { Prose } from "@/components/marketing/prose";
import { getSiteLinks } from "@/lib/site-server";
import { getFaqs } from "@/lib/content-server";
import { RichLine } from "@/components/marketing/rich-text";
import { IconChevronDown } from "@/components/icons";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: "Customer Support & FAQs",
  description: `Answers to common questions about ordering, delivery, installation and product support at ${SITE.name}.`,
  alternates: { canonical: "/support" },
  };
}


export default async function SupportPage() {
  const [{ SITE, PHONE_HREF, EMAIL_HREF, whatsappHref }, FAQS] = await Promise.all([getSiteLinks(), getFaqs()]);
  return (
    <>
      <PageHero
        kicker="Support"
        title="How Can We Help?"
        intro="Questions about an order, a product or an installation? Start here, or talk to our team directly."
        crumbs={[{ label: "Support" }]}
      />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1240px] space-y-14 px-4 sm:px-6 lg:px-9">
          <div id="faqs" className="scroll-mt-28">
            <h2 className="font-heading text-[1.5rem] font-bold text-ink">Frequently asked questions</h2>
            <div className="mt-5 max-w-[820px] divide-y divide-hair overflow-hidden rounded-2xl border border-hair">
              {FAQS.map((f) => (
                <details key={f.q} className="group bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading text-[0.98rem] font-semibold text-ink hover:bg-field [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <IconChevronDown className="size-5 shrink-0 text-slate transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-[0.94rem] leading-relaxed text-slate [&_a]:font-semibold [&_a]:text-blue [&_a]:underline">
                    <RichLine text={f.a} site={SITE} />
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <Prose>
              <h2 id="product">Product support</h2>
              <p>
                Having an issue with a product bought from us? Send us the product name, a short description and a photo
                or video of the problem on <a href={whatsappHref(`Hello ${SITE.shortName}, I need product support.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>,
                and keep your receipt handy. See our <Link href="/warranty">warranty information</Link>.
              </p>
            </Prose>
            <Prose>
              <h2 id="installation">Installation support</h2>
              <p>
                For questions about an installation we carried out — or to book maintenance — call{" "}
                <a href={PHONE_HREF}>{SITE.phone}</a> or email <a href={EMAIL_HREF}>{SITE.email}</a>. Opening hours:{" "}
                {SITE.hours}.
              </p>
            </Prose>
          </div>
        </div>
      </section>
      <ContactCta title="Still Need Help?" text="Our team is ready to assist you." whatsappMessage={`Hello ${SITE.shortName}, I need some help.`} />
    </>
  );
}
