import Link from "next/link";
import type { ReactNode } from "react";

/** Page title row used by every admin page. */
export function AdminHeader({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-[1.6rem] font-extrabold tracking-tight text-ink">{title}</h1>
        {intro && <p className="mt-1 max-w-[70ch] text-[0.92rem] text-slate">{intro}</p>}
      </div>
      {actions}
    </div>
  );
}

export function AdminCard({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-hair bg-white p-5 ${className}`}>
      {title && <h2 className="mb-3 font-heading text-[1rem] font-bold text-ink">{title}</h2>}
      {children}
    </section>
  );
}

/** Shown to signed-in users who aren't staff, or lack the permission for a page. */
export function NoAccess({ reason }: { reason: "not-staff" | "permission" }) {
  return (
    <div className="mx-auto mt-16 max-w-[460px] rounded-3xl border border-hair bg-white p-8 text-center">
      <h1 className="font-heading text-[1.3rem] font-extrabold text-ink">{reason === "not-staff" ? "No admin access" : "Not available for your role"}</h1>
      <p className="mt-2 text-[0.92rem] text-slate">
        {reason === "not-staff"
          ? "This account isn't on the admin team. Ask the site owner to add you under Team & roles."
          : "Your role doesn't include this section. Ask the site owner if you need access."}
      </p>
      <Link href={reason === "not-staff" ? "/" : "/admin"} className="mt-5 inline-flex h-11 items-center rounded-full bg-blue px-6 font-heading text-[0.88rem] font-semibold text-white hover:bg-blue-deep">
        {reason === "not-staff" ? "Back to the website" : "Back to dashboard"}
      </Link>
    </div>
  );
}

export const inputClass =
  // 16px on phones so iOS doesn't zoom into the field
  "h-10 w-full rounded-xl border border-hair bg-white px-3 text-[16px] sm:text-[0.9rem] text-ink outline-none transition-colors focus:border-blue focus:ring-3 focus:ring-blue/15";
export const buttonClass = "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue px-4 font-heading text-[0.86rem] font-semibold text-white hover:bg-blue-deep disabled:opacity-60";
export const ghostButtonClass = "inline-flex h-9 items-center justify-center rounded-xl border border-hair px-3 text-[0.82rem] font-semibold text-slate hover:border-blue hover:text-blue disabled:opacity-60";
