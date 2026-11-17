import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactCta } from "@/components/marketing/contact-cta";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { BrandStrip } from "@/components/marketing/brand-strip";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteButton } from "@/components/marketing/site-button";
import { HeroWave } from "@/components/shop/hero-wave";
import { SOLUTION_ICONS } from "@/components/marketing/solution-icons";
import { SOLUTIONS } from "@/lib/data/solutions";
import { getAbout } from "@/lib/content-server";
import { getSiteLinks } from "@/lib/site-server";
import {
  IconArrowRight,
  IconBuilding,
  IconCalculator,
  IconCart,
  IconCheck,
  IconClock,
  IconCoins,
  IconHardHat,
  IconLayers,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconSupport,
  IconWhatsApp,
  IconPackage,
  IconSun,
} from "@/components/icons";
// Stock photo (Unsplash License) — illustrative of the work, not a Tobecat installation.
import commercialRooftop from "@/assets/sections/commercial-rooftop.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const { SITE } = await getSiteLinks();
  return {
    title: "About Us",
    description: `${SITE.legalName} supplies, designs and installs solar power, inverter and battery backup, CCTV and security systems for homes, businesses and industries across Nigeria — head office in ${SITE.address.city}${SITE.branches.length ? `, with branches in ${SITE.branches.join(" and ")}` : ""}.`,
    alternates: { canonical: "/about" },
  };
}

const SERVICES = [
  { Icon: IconCart, title: "Equipment supply", text: "Solar panels, inverters, lithium batteries, solar generators, CCTV and solar appliances from established brands.", href: "/shop", cta: "Visit the shop" },
  { Icon: IconCalculator, title: "System design & sizing", text: "We size the inverter, batteries, panels, cables and protection around what you actually need to power.", href: "/solar-calculator", cta: "Try the calculator" },
  { Icon: IconHardHat, title: "Installation & commissioning", text: "Site survey, installation, testing and a hand-over that shows you how to use and monitor your system.", href: "/installation", cta: "How installation works" },
  { Icon: IconShieldCheck, title: "CCTV & security", text: "Cameras and recorders for homes, estates and businesses, with backup power so they keep recording.", href: "/solutions/security", cta: "Security solutions" },
  { Icon: IconSupport, title: "After-sales & warranty", text: "Support after installation, help with warranty claims and maintenance when you need it.", href: "/support", cta: "Get support" },
  { Icon: IconPackage, title: "Bulk & commercial supply", text: "One quotation for installers, dealers, contractors and large projects.", href: "/bulk-quote", cta: "Request a bulk quote" },
];

/** Promises the site and the team already keep — not marketing figures. */
const COMMITMENTS = [
  { Icon: IconLayers, title: "Right-sized, not oversold", text: "We recommend the system your appliances need — and show you the sizing so you can see why." },
  { Icon: IconCoins, title: "Clear pricing", text: "Online prices are confirmed in a written quotation, with delivery and installation, before you pay." },
  { Icon: IconShieldCheck, title: "Established brands", text: "We stock equipment from recognised manufacturers, sold with the manufacturer's warranty." },
  { Icon: IconSupport, title: "Here after installation", text: "Our relationship doesn't end at hand-over — we're available for support, servicing and warranty help." },
];

const mapsHref = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export default async function AboutPage() {
  const { SITE, PHONE_HREF, EMAIL_HREF, whatsappHref } = await getSiteLinks();
  const COMPANY = await getAbout();
  const headOffice = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.country}`;
  const hasStoryBlock = COMPANY.story.length > 0 || COMPANY.mission || COMPANY.vision;

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_80%_20%,rgba(21,86,217,0.5),rgba(11,25,48,0)_70%),linear-gradient(120deg,#0b1930_0%,#0d2a5c_60%,#0b1930_100%)]" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-24 pt-9 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-9 lg:pb-28 lg:pt-12">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-[0.78rem] text-white/60">
              <Link href="/" className="hover:text-white">
                Home
              </Link>{" "}
              / <span className="font-semibold text-white">About</span>
            </nav>
            <span className="flex items-center gap-2.5 font-heading text-[0.74rem] font-bold uppercase tracking-[0.22em] text-white/80">
              <span aria-hidden className="h-0.5 w-7 rounded bg-red" />
              About {SITE.shortName}{COMPANY.founded ? ` · Since ${COMPANY.founded}` : COMPANY.experience ? ` · ${COMPANY.experience} of solar solutions` : ""}
            </span>
            <h1 className="mt-3 font-heading text-[clamp(2.1rem,4.8vw,3.3rem)] font-extrabold leading-[1.06] tracking-tight">Your Partner in Renewable Energy</h1>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-white/80">
              {SITE.legalName} supplies, designs and installs solar power, inverter and battery backup, CCTV and security systems for homes,
              businesses and industries across Nigeria.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <SiteButton href="/quote" variant="red" trailingArrow>
                Request a Quote
              </SiteButton>
              <SiteButton href="/solutions" variant="outline-white">
                Explore Our Solutions
              </SiteButton>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.86rem] text-white/80">
              <li className="flex items-center gap-1.5">
                <IconMapPin className="size-4 text-red" /> Head office in {SITE.address.city}
              </li>
              <li className="flex items-center gap-1.5">
                <IconBuilding className="size-4 text-red" /> Branches in {SITE.branches.join(" & ")}
              </li>
            </ul>
          </div>

          {/* parallelogram photo — the shop's brand motif */}
          <div className="relative mx-auto w-full max-w-[540px]" aria-hidden>
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-red/85 [clip-path:polygon(12%_0,100%_0,88%_100%,0_100%)]" />
            <div className="absolute inset-0 -translate-x-3 -translate-y-3 bg-white/15 [clip-path:polygon(12%_0,100%_0,88%_100%,0_100%)]" />
            <div className="relative aspect-[16/11] overflow-hidden [clip-path:polygon(12%_0,100%_0,88%_100%,0_100%)]">
              <Image src={commercialRooftop} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            </div>
          </div>
        </div>
        <HeroWave />
      </section>

      {/* ---------------- who we are ---------------- */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-9">
          <div>
            <span className="kicker">Who we are</span>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
              Reliable power, from the right equipment to a finished installation
            </h2>
            <div className="mt-5 space-y-4 text-[1rem] leading-relaxed text-slate">
              <p>
                We help homes, offices, shops, schools and factories move to dependable solar and backup power. We supply the equipment, design
                the system around what you need to power, install it professionally — and stay available for support afterwards.
              </p>
              <p>
                From a single inverter for a flat to a complete hybrid system for a business, every project starts with the same question: what
                do you need to keep running? The answer sets the size of the inverter, the batteries, the panels and even the cables — so you pay
                for the system you need, not more.
              </p>
            </div>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {["Solar panels, inverters & lithium batteries", "Solar generators & solar appliances", "CCTV & security systems", "Design, installation & after-sales support"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[0.95rem] font-semibold text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-whatsapp/15 text-[#17733b]">
                    <IconCheck className="size-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <aside className="overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)]">
            <div className="bg-[linear-gradient(135deg,#0b1930,#1556d9)] px-6 py-5 text-white">
              <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">At a glance</p>
              <p className="mt-1 font-heading text-[1.2rem] font-extrabold">{SITE.legalName}</p>
            </div>
            <dl className="divide-y divide-hair px-6">
              {[
                ...(COMPANY.founded ? [{ Icon: IconClock, k: "Founded", v: COMPANY.founded }] : []),
                ...(COMPANY.experience ? [{ Icon: IconSun, k: "Experience", v: `Providing solar solutions for the past ${COMPANY.experience}` }] : []),
                ...(COMPANY.cacNumber ? [{ Icon: IconShieldCheck, k: "CAC registration", v: `No. ${COMPANY.cacNumber}` }] : []),
                { Icon: IconMapPin, k: "Head office", v: headOffice },
                { Icon: IconBuilding, k: "Branches", v: SITE.branches.join(" · ") },
                { Icon: IconClock, k: "Opening hours", v: SITE.hours },
              ].map(({ Icon, k, v }) => (
                <div key={k} className="flex gap-3 py-3.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-red" />
                  <div>
                    <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-slate-light">{k}</dt>
                    <dd className="text-[0.92rem] font-semibold text-ink">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="grid gap-2 border-t border-hair p-4">
              <a href={PHONE_HREF} className="flex items-center gap-2.5 rounded-xl bg-field px-3.5 py-2.5 text-[0.9rem] font-semibold text-ink hover:bg-mist">
                <IconPhone className="size-4 text-blue" /> {SITE.phone}
              </a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl bg-field px-3.5 py-2.5 text-[0.9rem] font-semibold text-ink hover:bg-mist">
                <IconWhatsApp className="size-4 text-whatsapp" /> {SITE.whatsapp} (WhatsApp)
              </a>
              <a href={EMAIL_HREF} className="flex items-center gap-2.5 break-all rounded-xl bg-field px-3.5 py-2.5 text-[0.9rem] font-semibold text-ink hover:bg-mist">
                <IconMail className="size-4 shrink-0 text-blue" /> {SITE.email}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------- story / mission / vision (only when supplied) ---------------- */}
      {hasStoryBlock && (
        <section className="bg-mist/50 py-14 lg:py-20">
          <div className="mx-auto grid max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-9">
            {COMPANY.story.length > 0 && (
              <div>
                <span className="kicker">Our story</span>
                <div className="mt-4 space-y-4 text-[1rem] leading-relaxed text-slate">
                  {COMPANY.story.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="grid content-start gap-4">
              {COMPANY.mission && (
                <div className="rounded-3xl bg-ink p-6 text-white">
                  <p className="font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold">Our mission</p>
                  <p className="mt-2 text-[1.02rem] leading-relaxed">{COMPANY.mission}</p>
                </div>
              )}
              {COMPANY.vision && (
                <div className="rounded-3xl bg-blue p-6 text-white">
                  <p className="font-heading text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/75">Our vision</p>
                  <p className="mt-2 text-[1.02rem] leading-relaxed">{COMPANY.vision}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- verified figures (only when supplied) ---------------- */}
      {COMPANY.stats.length > 0 && (
        <section aria-label={`${SITE.shortName} in numbers`} className="bg-white py-10">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <dl className="grid grid-cols-2 gap-3 rounded-3xl bg-[linear-gradient(115deg,#0b3f9e,#1556d9)] p-6 text-white sm:p-8 md:grid-cols-4">
              {COMPANY.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <dd className="font-heading text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold">{s.value}</dd>
                  <dt className="text-[0.86rem] text-white/80">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ---------------- what we do ---------------- */}
      <section className="bg-mist/40 py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <SectionHeading kicker="What we do" title="Everything from the first quote to after-sales support" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ Icon, title, text, href, cta }) => (
              <li key={title}>
                <Link href={href} className="group flex h-full flex-col rounded-3xl border border-hair bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#c9d8f2] hover:shadow-[0_30px_60px_-36px_rgba(13,27,47,0.35)]">
                  <span className="grid size-12 place-items-center rounded-2xl bg-mist text-blue transition-colors group-hover:bg-blue group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-heading text-[1.1rem] font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 grow text-[0.92rem] leading-relaxed text-slate">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-heading text-[0.86rem] font-semibold text-red">
                    {cta} <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- who we serve ---------------- */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <SectionHeading kicker="Who we serve" title="Solutions for every kind of building" link={{ href: "/solutions", label: "All solutions" }} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s) => {
              const Icon = SOLUTION_ICONS[s.slug];
              return (
                <li key={s.slug}>
                  <Link href={`/solutions/${s.slug}`} className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-ink p-6 text-white">
                    <span aria-hidden className="absolute inset-y-0 -right-6 -z-10 w-16 -skew-x-[18deg] bg-red/70 transition-transform duration-300 group-hover:translate-x-[-8px]" />
                    <span className="grid size-11 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-[1.15rem] font-bold">{s.title}</h3>
                    <p className="mt-1 text-[0.86rem] text-white/75">{s.short}</p>
                    <p className="mt-3 grow text-[0.84rem] leading-relaxed text-white/70">{s.typicalLoads.slice(0, 3).join(" · ")}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-heading text-[0.84rem] font-semibold text-gold">
                      Learn more <IconArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------- how we work ---------------- */}
      <ProcessSteps />

      {/* ---------------- commitments ---------------- */}
      <section className="bg-mist/40 py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <SectionHeading kicker="Our commitments" title="How we work with every customer" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMMITMENTS.map(({ Icon, title, text }, i) => (
              <li key={title} className="relative rounded-3xl border border-hair bg-white p-6">
                <span aria-hidden className="absolute right-5 top-4 font-heading text-[2.4rem] font-extrabold leading-none text-mist">0{i + 1}</span>
                <span className="relative grid size-11 place-items-center rounded-xl bg-red/10 text-red">
                  <Icon className="size-5" />
                </span>
                <h3 className="relative mt-4 font-heading text-[1.05rem] font-bold text-ink">{title}</h3>
                <p className="relative mt-1.5 text-[0.9rem] leading-relaxed text-slate">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- milestones / team / certifications (only when supplied) ---------------- */}
      {COMPANY.milestones.length > 0 && (
        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <SectionHeading kicker="Our journey" title="Milestones" />
            <ol className="relative space-y-6 border-l-2 border-blue/20 pl-6">
              {COMPANY.milestones.map((m) => (
                <li key={`${m.year}-${m.title}`} className="relative">
                  <span aria-hidden className="absolute -left-[33px] top-1 size-4 rounded-full border-4 border-white bg-blue ring-2 ring-blue/30" />
                  <p className="font-heading text-[0.86rem] font-bold text-red">{m.year}</p>
                  <h3 className="font-heading text-[1.05rem] font-bold text-ink">{m.title}</h3>
                  {m.text && <p className="mt-1 text-[0.92rem] text-slate">{m.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {COMPANY.team.length > 0 && (
        <section className="bg-mist/40 py-14 lg:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <SectionHeading kicker="Our people" title="Meet the team" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COMPANY.team.map((t) => (
                <li key={t.name} className="overflow-hidden rounded-3xl border border-hair bg-white">
                  <div className="relative aspect-[4/5] bg-field">
                    {t.photo && <Image src={t.photo} alt={t.name} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-[1.05rem] font-bold text-ink">{t.name}</h3>
                    <p className="text-[0.86rem] font-semibold text-blue">{t.role}</p>
                    {t.bio && <p className="mt-2 text-[0.86rem] text-slate">{t.bio}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {COMPANY.certifications.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <SectionHeading kicker="Credentials" title="Registrations & certifications" />
            <ul className="flex flex-wrap gap-3">
              {COMPANY.certifications.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5 rounded-2xl border border-hair bg-white px-4 py-3">
                  <IconShieldCheck className="size-5 text-blue" />
                  <span>
                    <span className="block font-semibold text-ink">{c.name}</span>
                    {c.detail && <span className="block text-[0.78rem] text-slate">{c.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------- brands ---------------- */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <SectionHeading kicker="Brands we stock" title="Equipment from established manufacturers" link={{ href: "/shop", label: "Visit the shop" }} />
          <BrandStrip />
        </div>
      </section>

      {/* ---------------- visit us ---------------- */}
      <section className="bg-mist/40 py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <SectionHeading kicker="Visit us" title="Where to find us" intro={`Open ${SITE.hours}.`} link={{ href: "/contact", label: "Contact page" }} />
          <ul className="grid gap-4 md:grid-cols-3">
            <li className="relative isolate overflow-hidden rounded-3xl bg-ink p-6 text-white md:col-span-1">
              <span aria-hidden className="absolute inset-y-0 right-8 -z-10 w-10 -skew-x-[18deg] bg-red/70" />
              <span className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">Head office</span>
              <h3 className="mt-1 font-heading text-[1.3rem] font-extrabold">{SITE.address.city}</h3>
              <p className="mt-2 text-[0.92rem] text-white/80">{SITE.address.street}</p>
              <a href={mapsHref(headOffice)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-3 font-heading text-[0.82rem] font-semibold text-blue-deep hover:bg-white/90">
                <IconMapPin className="size-4" /> Get directions
              </a>
            </li>
            {SITE.branches.map((city) => (
              <li key={city} className="rounded-3xl border border-hair bg-white p-6">
                <span className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red">Branch</span>
                <h3 className="mt-1 font-heading text-[1.3rem] font-extrabold text-ink">{city}</h3>
                <p className="mt-2 text-[0.92rem] text-slate">Call or WhatsApp us for directions to our {city} branch.</p>
                <a
                  href={whatsappHref(`Hello ${SITE.shortName}, please share the address of your ${city} branch.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full border-2 border-[#bfe4cd] px-4 py-2.5 font-heading text-[0.82rem] font-semibold text-whatsapp hover:border-whatsapp"
                >
                  <IconWhatsApp className="size-4" /> Ask for directions
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta title="Let's power your home or business" text="Tell us what you need to keep running — we'll recommend the right system and send a detailed quotation." />
    </>
  );
}
