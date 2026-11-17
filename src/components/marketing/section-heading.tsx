import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconArrowRight } from "@/components/icons";

interface SectionHeadingProps {
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  link?: { href: string; label: string };
  /** heading level — defaults to h2 */
  as?: "h1" | "h2";
  className?: string;
}

/** Kicker + heading + intro (+ optional "view all" link) used by every homepage section. */
export function SectionHeading({ kicker, title, intro, link, as: Heading = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-end justify-between gap-4 lg:mb-10", className)}>
      <div className="max-w-[52ch]">
        <span className="kicker">{kicker}</span>
        <Heading className="mt-3 font-heading text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
          {title}
        </Heading>
        {intro && <p className="mt-2.5 text-slate">{intro}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full -my-2 py-3 font-heading text-[0.9rem] font-semibold text-red transition-colors hover:text-red-dark"
        >
          {link.label}
          <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
