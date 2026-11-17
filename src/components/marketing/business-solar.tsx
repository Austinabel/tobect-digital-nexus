import Image from "next/image";
import { SiteButton } from "@/components/marketing/site-button";
import { IconCoins, IconBolt, IconLayers, IconWrench } from "@/components/icons";
// Stock photo (Unsplash License) — Markus Spiske, unsplash.com/photos/rNn_TU8dvoY. Illustrative, not a Tobecat crew.
import installerPanels from "@/assets/sections/installer-panels.jpg";

// Qualitative benefits only — no invented savings figures or performance numbers.
const BENEFITS = [
  { Icon: IconCoins, title: "Reduce Energy Costs", text: "Lower your operating expenses." },
  { Icon: IconBolt, title: "Reliable Backup Power", text: "Keep your business running during power outages." },
  { Icon: IconLayers, title: "Scalable System Design", text: "Start with your current needs and expand later." },
  { Icon: IconWrench, title: "Professional Installation and Support", text: "End-to-end setup and ongoing technical support." },
];

export function BusinessSolar() {
  return (
    <section className="reveal bg-gradient-to-b from-white to-mist py-14 sm:py-18 lg:py-24" aria-labelledby="business-solar-heading">
      <div className="mx-auto grid max-w-[1240px] items-center gap-9 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:px-9">
        <div className="relative isolate">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_40px_70px_-40px_rgba(13,27,47,0.55)] lg:aspect-[4/5]">
            <Image
              src={installerPanels}
              alt="Solar installer fastening panels on a mounting rail"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover object-[70%_40%]"
            />
          </div>
          <div aria-hidden className="absolute -bottom-4 -right-4 -z-10 hidden size-40 rounded-3xl bg-blue/15 lg:block" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(13,27,47,0.5)] backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-blue text-white">
              <IconWrench className="size-5" />
            </span>
            <span>
              <b className="block font-heading text-[0.88rem] font-bold text-ink">End-to-end service</b>
              <span className="text-[0.74rem] text-slate">Design · Supply · Install · Support</span>
            </span>
          </div>
        </div>

        <div>
          <span className="kicker">Smart Energy for Businesses</span>
          <h2
            id="business-solar-heading"
            className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-ink"
          >
            Why More Businesses Are Choosing Solar
          </h2>
          <p className="mt-3.5 max-w-[56ch] text-slate">
            A smarter, more reliable and sustainable way to power your operations. Get a solar solution that fits your
            business and keeps you running.
          </p>
          <ul className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-blue shadow-[0_12px_28px_-14px_rgba(21,86,217,0.55)] ring-1 ring-hair">
                  <Icon className="size-[22px]" />
                </span>
                <span>
                  <b className="block font-heading text-[1rem] font-semibold text-ink">{title}</b>
                  <span className="mt-0.5 block text-[0.88rem] leading-snug text-slate">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <SiteButton href="/solutions/commercial" variant="red" trailingArrow className="mt-9">
            Power Your Business
          </SiteButton>
        </div>
      </div>
    </section>
  );
}
