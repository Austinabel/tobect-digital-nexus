import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { ContactCta } from "@/components/marketing/contact-cta";
import { getProjects } from "@/lib/content-server";
import { getSite } from "@/lib/site-server";

export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  return {
  title: "Installation Projects",
  description: `Solar, backup power and CCTV installations completed by ${SITE.name}.`,
  alternates: { canonical: "/projects" },
  };
}

export default async function ProjectsPage() {
  return (
    <>
      <PageHero
        kicker="Projects"
        title="Our Installation Projects"
        intro="Solar and security installations for homes, businesses and industries."
        crumbs={[{ label: "Projects" }]}
      />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <ProjectShowcase limit={(await getProjects()).length || 1} />
        </div>
      </section>
      <ContactCta title="Want a System Like This?" whatsappMessage="Hello Tobecat, I'd like to discuss a project." />
    </>
  );
}
