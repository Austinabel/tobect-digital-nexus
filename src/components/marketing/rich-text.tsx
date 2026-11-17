import Link from "next/link";
import type { ReactNode } from "react";
import { parseInline, parseRichText, type Inline } from "@/lib/content";
import { siteLinks, type SiteSettings } from "@/lib/site";

/** Fills a {token} with the business's current details (links where useful). */
function token(name: string, site: SiteSettings): ReactNode {
  const { PHONE_HREF, EMAIL_HREF, whatsappHref } = siteLinks(site);
  switch (name) {
    case "email":
      return <a href={EMAIL_HREF}>{site.email}</a>;
    case "phone":
      return <a href={PHONE_HREF}>{site.phone}</a>;
    case "whatsapp":
      return (
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
          {site.whatsapp}
        </a>
      );
    case "legalName":
      return site.legalName;
    case "name":
      return site.name;
    case "shortName":
      return site.shortName;
    case "hours":
      return site.hours;
    case "branches":
      return site.branches.join(" and ");
    case "address":
      return `${site.address.street}, ${site.address.city}, ${site.address.country}`;
    default:
      return `{${name}}`;
  }
}

export function InlineText({ parts, site }: { parts: Inline[]; site: SiteSettings }) {
  return (
    <>
      {parts.map((p, i) => {
        if (p.t === "bold") return <strong key={i}>{p.v}</strong>;
        if (p.t === "token") return <span key={i}>{token(p.v, site)}</span>;
        if (p.t === "link")
          return p.href.startsWith("/") ? (
            <Link key={i} href={p.href}>
              {p.v}
            </Link>
          ) : (
            <a key={i} href={p.href} {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {p.v}
            </a>
          );
        return <span key={i}>{p.v}</span>;
      })}
    </>
  );
}

/** Staff-written text (see the format in src/lib/content.ts). Use inside <Prose> for styling. */
export function RichText({ text, site }: { text: string; site: SiteSettings }) {
  return (
    <>
      {parseRichText(text).map((b, i) => {
        if (b.t === "h2") return <h2 key={i}>{b.v}</h2>;
        if (b.t === "p")
          return (
            <p key={i}>
              <InlineText parts={b.c} site={site} />
            </p>
          );
        const Tag = b.t === "ul" ? "ul" : "ol";
        return (
          <Tag key={i}>
            {b.items.map((item, j) => (
              <li key={j}>
                <InlineText parts={item} site={site} />
              </li>
            ))}
          </Tag>
        );
      })}
    </>
  );
}

/** One line of rich text (e.g. an FAQ answer) without paragraph wrappers. */
export function RichLine({ text, site }: { text: string; site: SiteSettings }) {
  return <InlineText parts={parseInline(text.replace(/\s*\n\s*/g, " "))} site={site} />;
}
