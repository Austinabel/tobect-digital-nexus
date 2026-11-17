import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactCta } from "@/components/marketing/contact-cta";
import { RichLine } from "@/components/marketing/rich-text";
import { IconChevronDown } from "@/components/icons";
import { getFaqs } from "@/lib/content-server";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
    title: "Frequently Asked Questions",
    description: `Answers about ordering, payment, delivery, returns, refunds, warranty and installation at ${SITE.name}.`,
    alternates: { canonical: "/faq" },
  };
}

/** Questions edited in Admin → Pages → FAQs (the Support page shows the same list). */
export default async function FaqPage() {
  const [faqs, SITE] = await Promise.all([getFaqs(), getSite()]);
  return (
    <>
      <PageHero kicker="Help" title="Frequently Asked Questions" crumbs={[{ label: "FAQs" }]} />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <div className="max-w-[820px] divide-y divide-hair overflow-hidden rounded-2xl border border-hair">
            {faqs.map((f, i) => (
              <details key={f.q} className="group bg-white" open={i === 0}>
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
          <p className="mt-6 max-w-[820px] text-[0.9rem] text-slate">
            Read our full{" "}
            <Link href="/terms" className="font-semibold text-blue underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/returns" className="font-semibold text-blue underline">
              Refund &amp; Returns Policy
            </Link>
            ,{" "}
            <Link href="/delivery" className="font-semibold text-blue underline">
              Delivery Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-blue underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
      <ContactCta title="Still have a question?" text="Our team is happy to help." whatsappMessage="Hello Tobecat, I have a question." />
    </>
  );
}
