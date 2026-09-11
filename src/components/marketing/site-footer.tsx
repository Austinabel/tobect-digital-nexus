import Link from "next/link";
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
} from "@/components/icons";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Solar Solutions", href: "/solutions" },
  { label: "Installation", href: "/installation" },
  { label: "Projects", href: "/projects" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SHOP_LINKS = [
  { label: "Solar Panels", href: "/shop/solar-panels" },
  { label: "Inverters", href: "/shop/inverters" },
  { label: "Batteries", href: "/shop/lithium-batteries" },
  { label: "Generators", href: "/shop/solar-generators" },
  { label: "CCTV & Security", href: "/shop/cctv-security" },
  { label: "Solar Lights", href: "/shop/solar-lights" },
  { label: "Accessories", href: "/shop/accessories" },
];

const SUPPORT_LINKS = [
  { label: "FAQs", href: "/support#faqs" },
  { label: "Warranty", href: "/warranty" },
  { label: "Product Support", href: "/support#product" },
  { label: "Installation Support", href: "/support#installation" },
  { label: "Contact Us", href: "/contact" },
];

const SOCIALS = [
  { label: "Facebook", href: "#", Icon: IconFacebook },
  { label: "Instagram", href: "#", Icon: IconInstagram },
  { label: "YouTube", href: "#", Icon: IconYoutube },
  { label: "WhatsApp", href: "https://wa.me/2348037946366", Icon: IconWhatsApp },
  { label: "LinkedIn", href: "#", Icon: IconLinkedin },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-3.5 font-heading text-[0.8rem] font-semibold tracking-wide text-white">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-[0.86rem] text-[#9fb0c4] transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0a1626] text-[#9fb0c4]">
      <div className="mx-auto max-w-[1240px] px-4 pb-7 pt-12 sm:px-6 lg:px-9 lg:pt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9.5 place-items-center rounded-[11px] bg-gradient-to-br from-[#2f6bff] to-blue-deep text-white">
                <IconBolt className="size-[18px]" />
              </span>
              <span className="font-heading text-[1.2rem] font-extrabold leading-none tracking-tight text-white">
                TOBECAT
                <small className="mt-[2px] block font-body text-[0.5rem] font-semibold tracking-[0.18em] text-[#6a7d92]">
                  TECHNOLOGIES NIG LTD
                </small>
              </span>
            </div>
            <p className="mt-3.5 max-w-[32ch] text-[0.86rem]">Powering the future with renewable energy.</p>
            <div className="mt-4 flex gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-8.5 place-items-center rounded-[9px] border border-[#24384c] text-[#9fb0c4] transition-colors hover:border-white hover:text-white"
                >
                  <Icon className="size-[15px]" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={QUICK_LINKS} />
          <FooterColumn title="Shop by Category" links={SHOP_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />

          <div>
            <h4 className="mb-3.5 font-heading text-[0.8rem] font-semibold tracking-wide text-white">Get in Touch</h4>
            <div className="flex flex-col gap-3 text-[0.84rem] leading-snug">
              <div className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 size-[15px] shrink-0 text-blue" />
                <span>08037946366 (Call/WhatsApp)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 size-[15px] shrink-0 text-blue" />
                <span>Tobecattech@gmail.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <IconMapPin className="mt-0.5 size-[15px] shrink-0 text-blue" />
                <span>
                  Lagos warehouse,
                  <br />
                  Alaba international market
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 size-[15px] shrink-0 text-blue" />
                <span>Mon &ndash; Sat: 8AM &ndash; 6PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c2c3d] pt-5 text-[0.8rem] text-[#6a7d92]">
          <span>&copy; 2025 Tobecat Technologies Nig Ltd. All rights reserved.</span>
          <nav className="flex gap-5">
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
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
