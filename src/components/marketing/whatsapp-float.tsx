import { IconWhatsApp } from "@/components/icons";

/** Persistent WhatsApp entry point — present on every marketing page. */
export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/2348037946366"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Tobecat on WhatsApp"
      className="fixed bottom-4.5 right-4.5 z-[70] inline-flex items-center gap-2.5 rounded-full bg-whatsapp py-3.5 pl-4 pr-5 font-heading text-[0.9rem] font-semibold text-white shadow-[0_18px_34px_-12px_rgba(35,164,85,0.6)] transition-transform hover:-translate-y-0.5"
    >
      <IconWhatsApp className="size-[21px]" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
