import { SectionHeading } from "@/components/marketing/section-heading";
import { IconChat, IconClipboard, IconHardHat, IconSupport } from "@/components/icons";

const STEPS = [
  { Icon: IconChat, title: "Tell Us What You Need", text: "Share your power needs, location and specific requirements." },
  { Icon: IconClipboard, title: "Get a System Recommendation", text: "Receive a tailored system design and a detailed quotation." },
  { Icon: IconHardHat, title: "Professional Installation", text: "Our installation team handles the installation and setup." },
  { Icon: IconSupport, title: "Ongoing Support", text: "Enjoy after-sales support, maintenance and expert guidance." },
];

/** Connected four-step timeline: horizontal from md up, vertical on phones. */
export function ProcessSteps() {
  return (
    <section className="reveal bg-white py-14 sm:py-18 lg:py-24" aria-labelledby="process-heading">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
        <SectionHeading
          kicker="From Consultation to Clean Power"
          title={<span id="process-heading">From Consultation to Clean Power</span>}
          intro="A simple, transparent process to get you up and running with the right solar solution."
          link={{ href: "/quote", label: "Start with a Free Quote" }}
        />

        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          {/* connector line: vertical on mobile, horizontal on md+ */}
          <span
            aria-hidden
            className="absolute bottom-6 left-[19px] top-6 w-[2px] bg-gradient-to-b from-blue via-blue/40 to-blue/10 md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-[19px] md:h-[2px] md:w-auto md:bg-gradient-to-r"
          />
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="relative grid grid-cols-[40px_1fr] gap-x-4 md:grid-cols-1 md:text-center">
              <span className="relative z-[1] grid size-10 place-items-center rounded-full bg-blue font-heading text-[0.95rem] font-bold text-white ring-[6px] ring-white md:mx-auto">
                {i + 1}
              </span>
              <div className="md:mt-5">
                <span className="grid size-14 place-items-center rounded-2xl bg-mist text-blue md:mx-auto">
                  <Icon className="size-7" />
                </span>
                <h3 className="mt-3.5 font-heading text-[1.02rem] font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-slate md:mx-auto md:max-w-[26ch]">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
