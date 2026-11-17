import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findKit, kitCatalogueFrom, kitOnSale } from "@/lib/data/kits";
import { getCatalog } from "@/lib/catalog-server";
import { findProduct } from "@/lib/catalog";
import { defaultKitConfig, priceKit } from "@/lib/shop/kits";
import { getSiteLinks } from "@/lib/site-server";
import { JsonLd } from "@/components/json-ld";
import { KitConfigurator } from "@/components/shop/kit-configurator";
import { KitCard } from "@/components/shop/kit-card";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { IconCheck, IconWhatsApp, IconQuote, IconCalculator, IconWrench, IconShieldCheck, IconPlus } from "@/components/icons";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(props: PageProps<"/shop/installation-kits/[slug]">): Promise<Metadata> {
  const SITE = await getSite();
  const kit = findKit((await getCatalog()).kits, (await props.params).slug);
  if (!kit) return {};
  const description = `${kit.name}: ${kit.summary} Complete with installation accessories, from ${SITE.name}.`;
  return {
    title: kit.name,
    description,
    alternates: { canonical: `/shop/installation-kits/${kit.slug}` },
    openGraph: { title: kit.name, description, url: `/shop/installation-kits/${kit.slug}`, ...(kit.photo && { images: [kit.photo] }) },
  };
}

export default async function KitPage(props: PageProps<"/shop/installation-kits/[slug]">) {
  const { SITE, whatsappHref } = await getSiteLinks();
  const catalog = await getCatalog();
  const listed = findKit(catalog.kits, (await props.params).slug);
  if (!listed) notFound();
  const kitCatalogue = kitCatalogueFrom(catalog.products);
  const getProduct = (slug: string) => findProduct(catalog, slug);
  // Sold online only while every component is still listed; otherwise configured to order.
  const kit = kitOnSale(listed, catalog.products)
    ? listed
    : { ...listed, purchasable: false, outline: listed.outline ?? ["Hybrid inverter", "Battery storage", "Solar panels", "Installation accessories"] };

  const config = defaultKitConfig(kit);
  const price = kit.purchasable ? priceKit(kit, config, kitCatalogue) : null;
  const others = catalog.kits.filter((k) => k.slug !== kit.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: kit.name,
    sku: kit.slug,
    description: kit.summary,
    category: "Solar installation kits",
    ...(kit.photo && { image: [kit.photo] }),
    url: `${SITE.url}/shop/installation-kits/${kit.slug}`,
    // Offers are published only once catalogue prices are confirmed.
    ...(!catalog.products.some((p) => p.isSample) &&
      price &&
      !price.hasUnpricedParts && {
        offers: { "@type": "Offer", priceCurrency: "NGN", price: price.totalNgn, seller: { "@id": `${SITE.url}/#organization` } },
      }),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="border-b border-hair bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1240px] px-4 py-4 text-[0.8rem] text-slate sm:px-6 lg:px-9">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-blue">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop" className="hover:text-blue">Shop</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop/installation-kits" className="hover:text-blue">Installation Kits</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-ink">{kit.name}</li>
          </ol>
        </nav>
      </div>

      <section className="bg-gradient-to-b from-white to-mist/60 py-8 lg:py-12">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-9">
          <div className="min-w-0 space-y-8">
            <div>
              <span className="font-heading text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-red">Complete Solar Package · {kit.capacityLabel}</span>
              <h1 className="mt-2 font-heading text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.1] tracking-tight text-ink">{kit.name}</h1>
              <p className="mt-2 max-w-[60ch] text-[1rem] text-slate">{kit.summary}</p>
            </div>

            {kit.photo && <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-hair">
              <Image
                src={kit.photo}
                alt={kit.imageAlt ?? `${kit.capacityLabel} solar installation — illustrative photo`}
                fill
                priority
                sizes="(min-width: 1024px) 620px, 100vw"
                className="object-cover"
                style={{ objectPosition: kit.photoPosition ?? "50% 50%" }}
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-slate">Illustrative photo</span>
            </div>}

            <div>
              <h2 className="font-heading text-[1.15rem] font-bold text-ink">What&rsquo;s included</h2>
              {kit.purchasable ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-hair bg-white">
                  <table className="w-full text-left text-[0.84rem] sm:text-[0.88rem] [&_td]:px-3 [&_th]:px-3 sm:[&_td]:px-4 sm:[&_th]:px-4 [&_td]:break-words">
                    <caption className="sr-only">Kit components (standard configuration)</caption>
                    <thead className="bg-field text-[0.74rem] uppercase tracking-[0.06em] text-slate">
                      <tr>
                        <th scope="col" className="px-4 py-2.5 font-semibold">Component</th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">Specifications</th>
                        <th scope="col" className="px-4 py-2.5 text-right font-semibold">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hair">
                      {price!.lines.map((l) => {
                        const p = getProduct(l.productSlug)!;
                        return (
                          <tr key={l.slotKey}>
                            <td className="px-4 py-3">
                              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-slate-light">{l.label}</span>
                              <Link href={`/product/${p.slug}`} className="font-semibold text-ink hover:text-blue">{p.name}</Link>
                            </td>
                            <td className="px-4 py-3 text-slate">{[p.brand, p.model && `Model ${p.model}`, ...p.specs].filter(Boolean).join(" · ") || "—"}</td>
                            <td className="px-4 py-3 text-right font-heading font-bold tabular-nums text-ink">{l.quantity}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="px-4 py-3" colSpan={3}>
                          <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-slate-light">Installation accessories</span>
                          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                            {kit.accessories.map((a) => (
                              <li key={a.name} className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-0.5 text-[0.76rem] font-semibold text-blue-deep">
                                <IconCheck className="size-3" /> {a.name}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1.5 text-[0.76rem] text-slate">Sizes and quantities are set for your site during the survey.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[...(kit.outline ?? []), ...kit.accessories.map((a) => a.name)].map((item) => (
                    <li key={item} className="flex items-center gap-2 rounded-xl border border-hair bg-white px-3.5 py-2.5 text-[0.88rem] text-ink">
                      <IconCheck className="size-4 shrink-0 text-whatsapp" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {kit.addons.length > 0 && (
              <div>
                <h2 className="font-heading text-[1.15rem] font-bold text-ink">Optional extras</h2>
                <ul className="mt-3 grid gap-2">
                  {kit.addons.map((a) => (
                    <li key={a.key} className="flex items-start gap-2.5 rounded-xl border border-dashed border-[#c9d8f2] bg-white px-3.5 py-3 text-[0.88rem]">
                      <IconPlus className="mt-0.5 size-4 shrink-0 text-blue" />
                      <span>
                        <span className="font-semibold text-ink">{a.label}</span>
                        {a.description && <span className="block text-[0.8rem] text-slate">{a.description}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-hair bg-white p-4">
                <h2 className="font-heading text-[0.98rem] font-bold text-ink">Recommended for</h2>
                <ul className="mt-2 space-y-1 text-[0.88rem] text-slate">
                  {kit.applications.map((a) => (
                    <li key={a} className="flex items-center gap-2">
                      <IconCheck className="size-3.5 text-whatsapp" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-hair bg-white p-4">
                <h2 className="flex items-center gap-2 font-heading text-[0.98rem] font-bold text-ink">
                  <IconCalculator className="size-4 text-blue" /> What will it power?
                </h2>
                <p className="mt-2 text-[0.86rem] text-slate">
                  Runtime depends on your appliances and usage. Use our calculator, or send us your appliance list and an engineer
                  will confirm the system fits.
                </p>
                <Link href="/solar-calculator" className="mt-2 inline-block text-[0.84rem] font-semibold text-blue hover:underline">
                  Open the solar calculator →
                </Link>
              </div>
              <div className="rounded-2xl border border-hair bg-white p-4">
                <h2 className="flex items-center gap-2 font-heading text-[0.98rem] font-bold text-ink">
                  <IconWrench className="size-4 text-blue" /> Installation
                </h2>
                <p className="mt-2 text-[0.86rem] text-slate">
                  {kit.installationNote ?? "Our engineers survey the site, install and commission the system, and show you how to use it."}{" "}
                  <Link href="/installation" className="font-semibold text-blue hover:underline">How installation works</Link>
                </p>
              </div>
              <div className="rounded-2xl border border-hair bg-white p-4">
                <h2 className="flex items-center gap-2 font-heading text-[0.98rem] font-bold text-ink">
                  <IconShieldCheck className="size-4 text-blue" /> Warranty
                </h2>
                <p className="mt-2 text-[0.86rem] text-slate">
                  Each component carries its manufacturer&rsquo;s warranty; terms are confirmed at purchase.{" "}
                  <Link href="/warranty" className="font-semibold text-blue hover:underline">Warranty information</Link>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {kit.purchasable ? (
              <KitConfigurator slug={kit.slug} />
            ) : (
              <div className="rounded-3xl border border-hair bg-white p-6">
                <h2 className="font-heading text-[1.15rem] font-bold text-ink">Configured to order</h2>
                <p className="mt-2 text-[0.9rem] text-slate">
                  We build this kit around your appliances, roof space and budget, choosing the inverter, battery capacity and
                  panel count with you. Request a quote and an engineer will send a priced component list.
                </p>
                <div className="mt-5 grid gap-2.5">
                  <Link href={`/quote?kit=${kit.slug}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red font-heading text-[0.94rem] font-semibold text-white hover:bg-red-dark">
                    <IconQuote className="size-4" /> Request a Quote
                  </Link>
                  <a
                    href={whatsappHref(`Hello ${SITE.shortName}, I'd like a quote for the ${kit.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#bfe4cd] font-heading text-[0.9rem] font-semibold text-whatsapp hover:border-whatsapp"
                  >
                    <IconWhatsApp className="size-4" /> Ask on WhatsApp
                  </a>
                </div>
              </div>
            )}
            <CatalogueNotice className="mt-4" />
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <h2 className="font-heading text-[1.4rem] font-extrabold text-ink">Other solar packages</h2>
          <div className="-mx-4 mt-4 flex snap-x gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {others.map((k) => (
              <KitCard key={k.slug} kit={k} />
            ))}
          </div>
          <p className="mt-6 text-[0.84rem] text-slate">
            Need individual parts?{" "}
            <Link href="/shop/solar-panels" className="font-semibold text-blue hover:underline">Shop solar panels</Link>,{" "}
            <Link href="/shop/inverters" className="font-semibold text-blue hover:underline">inverters</Link> and{" "}
            <Link href="/shop/lithium-batteries" className="font-semibold text-blue hover:underline">batteries</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
