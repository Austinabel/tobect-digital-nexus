import { IconWhatsApp } from "@/components/icons";
import { getSiteLinks } from "@/lib/site-server";

/** Persistent WhatsApp entry point — present on every marketing page. */
export async function WhatsAppFloat() {
  const { SITE, whatsappHref } = await getSiteLinks();
  return (
    <a
      href={whatsappHref(`Hello ${SITE.shortName}, I'd like some help choosing a solar / power solution.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${SITE.shortName} on WhatsApp`}
      className="fixed bottom-4 right-4 z-[70] inline-flex print:hidden size-14 items-center justify-center gap-2.5 rounded-full bg-whatsapp font-heading text-[0.9rem] font-semibold text-white shadow-[0_18px_34px_-12px_rgba(35,164,85,0.6)] transition-transform hover:-translate-y-0.5 sm:bottom-5 sm:right-5 sm:size-auto sm:py-3.5 sm:pl-4 sm:pr-5"
    >
      <IconWhatsApp className="size-[24px] sm:size-[21px]" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
