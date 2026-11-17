import Image from "next/image";
import { getTestimonials } from "@/lib/content-server";
import { SectionHeading } from "@/components/marketing/section-heading";
import { IconQuote, IconStar } from "@/components/icons";

/**
 * Customer testimonials section. Renders NOTHING until genuine,
 * permission-cleared reviews are added in Admin → Pages → Testimonials.
 */
export async function Testimonials() {
  const TESTIMONIALS = await getTestimonials();
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="reveal bg-white py-14 sm:py-18 lg:py-24" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <SectionHeading kicker="Customer Stories" title={<span id="testimonials-heading">What Our Customers Say</span>} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={`${t.name}-${t.quote.slice(0, 20)}`} className="flex flex-col rounded-2xl border border-hair bg-white p-6">
              <IconQuote className="size-6 text-red" />
              {t.rating !== undefined && (
                <div className="mt-3 flex gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <IconStar key={i} className={i < Math.round(t.rating!) ? "size-4 text-gold" : "size-4 text-hair"} />
                  ))}
                </div>
              )}
              <blockquote className="mt-3 grow text-[0.95rem] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {t.photo && (
                  <Image src={t.photo} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                )}
                <span>
                  <b className="block font-heading text-[0.9rem] font-semibold text-ink">{t.name}</b>
                  <span className="text-[0.78rem] text-slate">
                    {[t.purchase, t.location].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
