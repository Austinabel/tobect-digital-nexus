import { SiteButton } from "@/components/marketing/site-button";
import { IconWhatsApp } from "@/components/icons";
import { getSiteLinks } from "@/lib/site-server";

/** Compact blue call-to-action band reused at the bottom of inner pages. */
export async function ContactCta({
  title = "Get Expert Advice Today",
  text = "Need help choosing the right solution? Our team of energy experts is ready to assist you.",
  whatsappMessage = "Hello Tobecat, I'd like some advice.",
}: {
  title?: string;
  text?: string;
  whatsappMessage?: string;
}) {
  const { whatsappHref } = await getSiteLinks();
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <div className="flex flex-col gap-6 rounded-3xl bg-[radial-gradient(130%_120%_at_0%_0%,#2064e8,var(--color-blue-deep)_55%,var(--color-blue-darkest))] p-7 text-[#c7d8f7] sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold text-white">{title}</h2>
            <p className="mt-2 max-w-[48ch]">{text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SiteButton href="/quote" variant="red" trailingArrow>
              Request a Quote
            </SiteButton>
            <SiteButton href={whatsappHref(whatsappMessage)} variant="outline-white" icon={<IconWhatsApp className="size-4" />}>
              Chat on WhatsApp
            </SiteButton>
          </div>
        </div>
      </div>
    </section>
  );
}
