import { getAbout, getPolicy } from "@/lib/content-server";
import Image from "next/image";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog-server";
import { getSiteLinks } from "@/lib/site-server";
import {
  IconBolt,
  IconFacebook,
  IconInstagram,
  IconYoutube,
  IconWhatsApp,
  IconLinkedin,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconBuilding,
} from "@/components/icons";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Solar Solutions", href: "/solutions" },
  { label: "Installation", href: "/installation" },
  { label: "Projects", href: "/projects" },
  { label: "About Us", href: "/about" },
  { label: "Request a Quote", href: "/quote" },
];

const SUPPORT_LINKS = [
  { label: "FAQs", href: "/faq" },
  { label: "Product Support", href: "/support#product" },
  { label: "Installation Support", href: "/support#installation" },
  { label: "Contact Us", href: "/contact" },
];

const SOCIAL_ICONS = {
  Facebook: IconFacebook,
  Instagram: IconInstagram,
  YouTube: IconYoutube,
  LinkedIn: IconLinkedin,
} as const;

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-[0.88rem] text-[#9fb0c4] transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const iconLink =
  "grid size-9.5 place-items-center rounded-[10px] border border-[#24384c] text-[#9fb0c4] transition-colors hover:border-white hover:text-white";

export async function SiteFooter() {
  const { SITE, PHONE_HREF, EMAIL_HREF, whatsappHref } = await getSiteLinks();
  const [COMPANY, returns, delivery] = await Promise.all([getAbout(), getPolicy("returns"), getPolicy("delivery")]);
  // policy pages are listed only once they have text (an empty policy page is not published)
  const policyLinks = [
    { label: "Terms of Service", href: "/terms" },
    ...(returns.body.trim() ? [{ label: "Refund & Returns Policy", href: "/returns" }] : []),
    ...(delivery.body.trim() ? [{ label: "Delivery Policy", href: "/delivery" }] : []),
    { label: "Warranty", href: "/warranty" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "FAQs", href: "/faq" },
  ];
  const supportLinks = SUPPORT_LINKS;
  const CATEGORIES = (await getCatalog()).categories.filter((c) => !c.parent);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a1626] text-[#9fb0c4] print:hidden">
      <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-14 sm:px-6 sm:pb-8 lg:px-9 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1.3fr]">
          {/* 1. Company + 6. Social */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            {SITE.brand.logoFooterUrl ? (
              <Link href="/" aria-label={`${SITE.name} — home`} className="inline-block rounded-2xl bg-white px-4 py-3">
                <Image src={SITE.brand.logoFooterUrl} alt="" width={1400} height={379} sizes="240px" className="h-auto w-[220px] sm:w-[240px]" />
              </Link>
            ) : (
            <div className="flex items-center gap-2.5">
              {SITE.brand.logoUrl ? (
                <Image src={SITE.brand.logoUrl} alt="" width={38} height={38} className="size-9.5 rounded-[11px] bg-white object-contain p-0.5" />
              ) : (
                <span className="grid size-9.5 place-items-center rounded-[11px] bg-gradient-to-br from-[#2f6bff] to-blue-deep text-white">
                  <IconBolt className="size-[18px]" />
                </span>
              )}
              <span className="font-heading text-[1.2rem] font-extrabold leading-none tracking-tight text-white">
                {SITE.brand.wordmark}
                {SITE.brand.wordmarkSub && (
                  <small className="mt-[2px] block font-body text-[0.5rem] font-semibold tracking-[0.18em] text-[#6a7d92]">{SITE.brand.wordmarkSub}</small>
                )}
              </span>
            </div>
            )}
            <p className="mt-4 max-w-[34ch] text-[0.88rem] leading-relaxed">
              {SITE.legalName}
              {SITE.footerBlurb && ` — ${SITE.footerBlurb}`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5" aria-label="Contact and social channels">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={iconLink}>
                <IconWhatsApp className="size-4" />
              </a>
              <a href={EMAIL_HREF} aria-label="Email" className={iconLink}>
                <IconMail className="size-4" />
              </a>
              {SITE.social.map(({ label, href }) => {
                const Icon = SOCIAL_ICONS[label];
                return (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={iconLink}>
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={QUICK_LINKS} />
          <FooterColumn
            title="Shop by Category"
            links={CATEGORIES.slice(0, 7).map((c) => ({ label: c.name, href: `/shop/${c.slug}` }))}
          />
          <FooterColumn title="Customer Support" links={supportLinks} />
          <FooterColumn title="Policies" links={policyLinks} />

          {/* 5. Get in touch */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h2 className="mb-4 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white">
              Get in Touch
            </h2>
            <ul className="grid gap-3.5 text-[0.88rem] leading-snug sm:grid-cols-2 lg:grid-cols-1">
              <li className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 size-4 shrink-0 text-[#6f9bff]" />
                <a href={PHONE_HREF} className="hover:text-white">
                  {SITE.phone}
                  <span className="block text-[0.76rem] text-[#6a7d92]">Call</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconWhatsApp className="mt-0.5 size-4 shrink-0 text-whatsapp" />
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {SITE.whatsapp}
                  <span className="block text-[0.76rem] text-[#6a7d92]">WhatsApp</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 size-4 shrink-0 text-[#6f9bff]" />
                <a href={EMAIL_HREF} className="break-all hover:text-white">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconMapPin className="mt-0.5 size-4 shrink-0 text-[#6f9bff]" />
                <address className="not-italic">
                  {SITE.address.street},
                  <br />
                  {SITE.address.city}, {SITE.address.country}
                </address>
              </li>
              <li className="flex items-start gap-2.5">
                <IconBuilding className="mt-0.5 size-4 shrink-0 text-[#6f9bff]" />
                <span>Branches: {SITE.branches.join(" & ")}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 size-4 shrink-0 text-[#6f9bff]" />
                <span>{SITE.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c2c3d] pt-6 text-[0.8rem] text-[#6a7d92]">
          <span>
            &copy; {year} {SITE.legalName}{COMPANY.cacNumber ? ` · CAC Reg. No. ${COMPANY.cacNumber}` : ""}. All rights reserved.
          </span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
