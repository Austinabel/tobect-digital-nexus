import { siteLinks, type SiteSettings } from "@/lib/site";

/** Renders a schema.org JSON-LD block. `<` is escaped so data can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** The business, as search engines see it — from Admin → Site settings. */
export function organizationJsonLd(site: SiteSettings): Record<string, unknown> {
  const { SITE, PHONE_HREF } = siteLinks(site);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: PHONE_HREF.replace("tel:", ""),
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressCountry: "NG",
    },
    areaServed: "NG",
    ...(SITE.social.length && { sameAs: SITE.social.map((s) => s.href) }),
  };
}
