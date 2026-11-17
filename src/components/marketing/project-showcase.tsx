import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/data/projects";
import { getProjects } from "@/lib/content-server";
import { getSiteLinks } from "@/lib/site-server";
import { IconMapPin, IconWrench, IconWhatsApp, IconArrowRight, IconImageOff } from "@/components/icons";

function ProjectCard({ project }: { project: Project }) {
  const specs = [
    { label: "System", value: project.systemCapacity },
    { label: "Inverter", value: project.inverter },
    { label: "Battery", value: project.battery },
    { label: "Panels", value: project.panels },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value));

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-hair bg-white">
      <div className="relative aspect-[4/3] bg-field">
        {project.image ? (
          <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-slate-light">
            <IconImageOff className="size-10" />
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-5">
        <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-slate">
          <IconMapPin className="size-3.5 text-red" />
          {project.location}
        </span>
        <h3 className="mt-1.5 font-heading text-[1.05rem] font-bold text-ink">{project.title}</h3>
        <p className="mt-1.5 text-[0.88rem] text-slate">{project.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {specs.map((s) => (
            <div key={s.label} className="rounded-lg bg-mist px-2.5 py-2">
              <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate">{s.label}</dt>
              <dd className="font-heading text-[0.84rem] font-semibold text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

/**
 * Renders verified installation projects. With no verified projects yet,
 * it shows an honest "case studies coming" panel instead of fictional work.
 */
export async function ProjectShowcase({ limit = 3 }: { limit?: number }) {
  const { SITE, whatsappHref } = await getSiteLinks();
  const projects = (await getProjects()).slice(0, limit);

  if (projects.length > 0) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-center gap-6 rounded-3xl border border-hair bg-gradient-to-br from-white to-mist p-6 sm:p-9 md:grid-cols-[auto_1fr_auto]">
      <span className="grid size-14 place-items-center rounded-2xl bg-blue text-white shadow-[0_14px_26px_-14px_var(--color-blue)]">
        <IconWrench className="size-6" />
      </span>
      <div>
        <h3 className="font-heading text-[1.15rem] font-bold text-ink">Installation case studies are on the way</h3>
        <p className="mt-1.5 max-w-[58ch] text-[0.92rem] text-slate">
          We&rsquo;re documenting recent installations with photos and system details. In the meantime, ask us about
          systems we&rsquo;ve installed for homes and businesses like yours.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5 md:flex-col">
        <a
          href={whatsappHref(`Hello ${SITE.shortName}, can you share examples of installations you've done?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#bfe4cd] bg-white px-5 py-2.5 font-heading text-[0.88rem] font-semibold text-whatsapp transition-colors hover:border-whatsapp"
        >
          <IconWhatsApp className="size-4" />
          Ask on WhatsApp
        </a>
        <Link
          href="/installation"
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-heading text-[0.88rem] font-semibold text-blue hover:text-blue-deep"
        >
          Our installation service
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
