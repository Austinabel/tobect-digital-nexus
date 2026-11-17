import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { PurchasePanel } from "@/components/shop/purchase-panel";
import { AvailabilityBadge } from "@/components/shop/availability-badge";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { ProductGrid } from "@/components/marketing/product-grid";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/json-ld";
import Image from "next/image";
import { formatNaira } from "@/lib/data/products";
import { getCatalog } from "@/lib/catalog-server";
import { findCategory, findProduct, productsInCategory } from "@/lib/catalog";
import { getSiteLinks } from "@/lib/site-server";
import { IconWhatsApp, IconQuote, IconTruck, IconWrench, IconShieldCheck } from "@/components/icons";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const SITE = await getSite();
  const { slug } = await props.params;
  const product = findProduct(await getCatalog(), slug);
  if (!product) return {};
  const description =
    product.seoDescription ??
    `${product.name}${product.specs.length ? ` (${product.specs.join(", ")})` : ""} from ${SITE.name} — supply, delivery and installation across Nigeria.`;
  return {
    title: product.seoTitle ?? product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description, url: `/product/${product.slug}`, images: product.image ? [product.image] : undefined },
  };
}

const SERVICE_POINTS = [
  { Icon: IconTruck, text: "Delivery across Nigeria" },
  { Icon: IconWrench, text: "Professional installation available" },
  { Icon: IconShieldCheck, text: "Manufacturer warranty — terms confirmed at purchase" },
];

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { SITE, whatsappHref } = await getSiteLinks();
  const { slug } = await props.params;
  const catalog = await getCatalog();
  const product = findProduct(catalog, slug);
  if (!product) notFound();

  const category = findCategory(catalog, product.category);
  const parentCategory = category?.parent ? findCategory(catalog, category.parent) : undefined;
  const related = productsInCategory(catalog, product.category).filter((p) => p.slug !== product.slug).slice(0, 4);
  const soldOut = product.availability === "out-of-stock";
  // Only a genuine reduction (previous price set and higher) is shown as a saving.
  const onSale = product.compareAtPriceNgn !== undefined && product.compareAtPriceNgn > product.priceNgn;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.slug,
    ...(product.model && { mpn: product.model }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.images?.length ? { image: product.images.map((i) => i.url) } : product.image ? { image: [product.image] } : {}),
    ...(product.description && { description: product.description }),
    category: category?.name,
    url: `${SITE.url}/product/${product.slug}`,
    // Sample products carry indicative prices, so search engines are only given offers for real products.
    ...(!product.isSample && {
      offers: {
        "@type": "Offer",
        priceCurrency: "NGN",
        price: product.priceNgn,
        url: `${SITE.url}/product/${product.slug}`,
        seller: { "@id": `${SITE.url}/#organization` },
        ...(product.availability && {
          availability: product.availability === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }),
      },
    }),
  };

  const askHref = whatsappHref(`Hello ${SITE.shortName}, I'm interested in the ${product.name}. Is it available, and what is the current price?`);

  return (
    <>
      <JsonLd data={productJsonLd} />

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
            {parentCategory && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/shop/${parentCategory.slug}`} className="hover:text-blue">{parentCategory.name}</Link>
                </li>
              </>
            )}
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/shop/${category.slug}`} className="hover:text-blue">{category.name}</Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-ink">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="bg-gradient-to-b from-white to-mist/60 py-5 lg:py-14">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-9">
          <div className="group overflow-hidden rounded-3xl border border-hair bg-white lg:sticky lg:top-24 lg:self-start">
            <ProductImage product={product} priority sizes="(min-width: 1024px) 580px, 100vw" />
            {(product.images?.length ?? 0) > 1 && (
              <ul className="grid grid-cols-4 gap-2 border-t border-hair p-3" aria-label="More photos">
                {product.images!.slice(1, 8).map((img) => (
                  <li key={img.url}>
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-xl border border-hair bg-white">
                      <Image src={img.url} alt={img.alt} fill sizes="140px" className="object-contain p-1" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <span className="font-heading text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-slate-light">
              {product.brand ?? category?.name}
            </span>
            <h1 className="mt-2 font-heading text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
              {product.name}
            </h1>
            {product.model && <p className="mt-1 text-[0.9rem] text-slate">Model: {product.model}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className={`font-heading text-[2rem] font-extrabold tabular-nums ${onSale ? "text-red-dark" : "text-ink"}`}>{formatNaira(product.priceNgn)}</span>
              {onSale && (
                <>
                  <s className="text-[1.05rem] tabular-nums text-slate-light">
                    <span className="sr-only">Was </span>
                    {formatNaira(product.compareAtPriceNgn!)}
                  </s>
                  <span className="rounded-md bg-red px-2 py-0.5 font-heading text-[0.78rem] font-bold text-white">
                    Save {Math.round((1 - product.priceNgn / product.compareAtPriceNgn!) * 100)}%
                  </span>
                </>
              )}
              <AvailabilityBadge availability={product.availability} className="text-[0.82rem]" />
            </div>
            <CatalogueNotice className="mt-4" />

            <div className="mt-6">
              <PurchasePanel slug={product.slug} name={product.name} disabled={soldOut} askHref={askHref} />
            </div>
            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={askHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#bfe4cd] bg-white px-6 font-heading text-[0.9rem] font-semibold text-whatsapp transition-colors hover:border-whatsapp"
              >
                <IconWhatsApp className="size-4" />
                Ask about this product
              </a>
              <Link
                href={`/quote?product=${product.slug}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] bg-white px-6 font-heading text-[0.9rem] font-semibold text-blue transition-colors hover:border-blue"
              >
                <IconQuote className="size-4" />
                Quote with installation
              </Link>
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="font-heading text-[1rem] font-bold text-ink">About this product</h2>
                <div className="mt-2 space-y-3 text-[0.95rem] leading-relaxed text-slate">
                  {product.description.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
            <h2 className="mt-9 font-heading text-[1rem] font-bold text-ink">Specifications</h2>
            <dl className="mt-3 divide-y divide-hair overflow-hidden rounded-2xl border border-hair bg-white text-[0.9rem]">
              {[
                { label: "Brand", value: product.brand },
                { label: "Model", value: product.model },
                { label: "Category", value: category?.name },
                ...product.specs.map((s, i) => ({ label: i === 0 ? "Key specs" : "", value: s })),
              ]
                .filter((row): row is { label: string; value: string } => Boolean(row.value))
                .map((row, i) => (
                  <div key={`${row.label}-${i}`} className="grid grid-cols-[130px_1fr] gap-3 px-4 py-3">
                    <dt className="text-slate">{row.label}</dt>
                    <dd className="font-semibold text-ink">{row.value}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-2.5 text-[0.8rem] text-slate">
              Need the full datasheet?{" "}
              <a
                href={whatsappHref(`Hello ${SITE.shortName}, please send the datasheet for the ${product.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue hover:underline"
              >
                Request it on WhatsApp
              </a>
              .
            </p>

            <ul className="mt-7 grid gap-2.5">
              {SERVICE_POINTS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[0.88rem] text-ink">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-blue">
                    <Icon className="size-[18px]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white py-12 lg:py-16">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <SectionHeading
              kicker="You may also need"
              title={`More ${category?.name ?? "Products"}`}
              link={category ? { href: `/shop/${category.slug}`, label: `View all ${category.name}` } : undefined}
            />
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
