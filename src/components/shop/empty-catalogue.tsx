import Link from "next/link";
import { getSiteLinks } from "@/lib/site-server";
import { IconWhatsApp, IconQuote } from "@/components/icons";

/** Honest empty state: the category exists, but no products are listed online yet. */
export async function EmptyCatalogue({ title, message, whatsappMessage }: { title: string; message: string; whatsappMessage: string }) {
  const { whatsappHref } = await getSiteLinks();
  return (
    <div className="rounded-3xl border border-dashed border-[#c9d8f2] bg-white px-6 py-12 text-center sm:py-16">
      <h2 className="font-heading text-[1.25rem] font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-[52ch] text-[0.95rem] text-slate">{message}</p>
      <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-heading text-[0.9rem] font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <IconWhatsApp className="size-4" />
          Ask on WhatsApp
        </a>
        <Link
          href="/quote"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] bg-white px-6 font-heading text-[0.9rem] font-semibold text-blue transition-colors hover:border-blue"
        >
          <IconQuote className="size-4" />
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
