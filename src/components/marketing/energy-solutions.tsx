import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { IconHouse, IconBuilding, IconShieldCheck, IconArrowRight } from "@/components/icons";
// Stock photos (Unsplash License). Illustrative only — not Tobecat installations.
import homeRooftop from "@/assets/hero/home-rooftop.jpg"; // Watt A Lot — unsplash.com/photos/gqpuuF3a2tY
import commercialRooftop from "@/assets/sections/commercial-rooftop.jpg"; // Chirayu Trivedi — unsplash.com/photos/twOIx6I35tk
import cctvBuilding from "@/assets/sections/cctv-building.jpg"; // Ennio Dybeli — unsplash.com/photos/KDdNjUQwzSw

const CARDS: {
  title: string;
  description: string;
  href: string;
  image: StaticImageData;
  alt: string;
  position: string;
  Icon: typeof IconHouse;
}[] = [
  {
    title: "Residential Solar Solutions",
    description: "Enjoy dependable home backup, stable power and reduced grid dependence.",
    href: "/solutions/residential",
    image: homeRooftop,
    alt: "Family home with solar panels on the roof",
    position: "55% 35%",
    Icon: IconHouse,
  },
  {
    title: "Commercial & Industrial Solutions",
    description: "Scalable power for offices, shops, factories and industrial operations.",
    href: "/solutions/commercial",
    image: commercialRooftop,
    alt: "Large array of solar panels on the roof of a commercial building",
    position: "50% 50%",
    Icon: IconBuilding,
  },
  {
    title: "Security & CCTV Solutions",
    description: "Monitoring and protection for homes and businesses.",
    href: "/solutions/security",
    image: cctvBuilding,
    alt: "CCTV cameras mounted on the corner of a building",
    position: "60% 35%",
    Icon: IconShieldCheck,
  },
];

export function EnergySolutions() {
  return (
    <section className="reveal bg-white py-14 sm:py-18 lg:py-24" aria-labelledby="energy-solutions-heading">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <SectionHeading
          kicker="Energy Solutions for Every Need"
          title={<span id="energy-solutions-heading">Energy Solutions for Every Need</span>}
          intro="Tailored solar and security solutions for homes, businesses and facilities across Nigeria."
          link={{ href: "/solutions", label: "All Solutions" }}
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {CARDS.map(({ title, description, href, image, alt, position, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_1px_2px_rgba(13,27,47,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_34px_64px_-34px_rgba(13,27,47,0.45)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 400px, 100vw"
                    style={{ objectPosition: position }}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
                <div className="relative flex grow flex-col px-6 pb-6 pt-8">
                  <span className="absolute -top-7 left-6 grid size-14 place-items-center rounded-2xl bg-white text-blue shadow-[0_14px_30px_-12px_rgba(13,27,47,0.4)]">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-heading text-[1.15rem] font-bold text-ink">{title}</h3>
                  <p className="mt-2 grow text-[0.92rem] leading-relaxed text-slate">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-heading text-[0.88rem] font-semibold text-red">
                    Explore Solution
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
