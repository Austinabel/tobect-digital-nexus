import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { AdvancedCalculator } from "@/components/calculator/advanced-calculator";
import { APPLICATION_TYPES, type ApplicationType } from "@/lib/calculator";
import { IconCheck } from "@/components/icons";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Solar System Calculator — Inverter, Battery, Panel & Cable Sizing",
  description:
    "Free solar calculator for Nigeria: size your inverter, battery bank and solar panels, then get cable sizes and lengths, breakers and a complete shopping list for your installation.",
  alternates: { canonical: "/solar-calculator" },
};

const FEATURES = ["Inverter, battery & panel sizing", "Cable sizes & lengths", "Breakers & protection", "Shopping list & shop prices", "Generator savings", "PDF proposal"];

export default async function SolarCalculatorPage(props: PageProps<"/solar-calculator">) {
  const { d, type } = await props.searchParams;
  const signedIn = Boolean(await currentUser());
  const initialType = typeof type === "string" && type in APPLICATION_TYPES ? (type as ApplicationType) : "home";

  return (
    <>
      <PageHero
        kicker="Solar Calculator"
        title="Size Your Solar System"
        intro="Tell us what you want to power and where. Get the inverter, batteries, panels, cable sizes and lengths, breakers and a complete shopping list for your installation."
        crumbs={[{ label: "Solutions", href: "/solutions" }, { label: "Solar Calculator" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 print:hidden">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[0.86rem] font-semibold text-ink">
              <IconCheck className="size-4 text-whatsapp" /> {f}
            </li>
          ))}
        </ul>
      </PageHero>
      <section className="bg-mist/50 pb-24 pt-8 lg:pb-16 lg:pt-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <AdvancedCalculator initialType={initialType} shared={typeof d === "string" ? d : undefined} signedIn={signedIn} />
        </div>
      </section>
    </>
  );
}
