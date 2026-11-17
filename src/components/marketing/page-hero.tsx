import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeroProps {
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  /** breadcrumb trail after "Home" */
  crumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

/** Compact header used at the top of every inner page. */
export function PageHero({ kicker, title, intro, crumbs = [], children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-hair bg-gradient-to-b from-[#eaf3ff] to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-56 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.14),rgba(245,166,35,0)_66%)]"
      />
      <div className="relative mx-auto max-w-[1240px] px-4 pb-10 pt-6 sm:px-6 lg:px-9 lg:pb-14 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-[0.8rem] text-slate">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-blue">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <span aria-hidden className="text-slate-light">
                  /
                </span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-blue">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-ink">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <span className="kicker">{kicker}</span>
        <h1 className="mt-3 max-w-[22ch] font-heading text-[clamp(2rem,4.4vw,3.1rem)] font-extrabold leading-[1.1] tracking-tight text-ink">
          {title}
        </h1>
        {intro && <p className="mt-3.5 max-w-[60ch] text-[1.02rem] text-slate">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
