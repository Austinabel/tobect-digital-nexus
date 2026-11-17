import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { RegisterForm } from "@/components/account/auth-forms";
import { currentUser, safeNext } from "@/lib/supabase/server";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = { title: "Create an Account", robots: { index: false, follow: false } };

const PERKS = ["Faster checkout with saved details", "See all your orders in one place", "Track order and payment status"];

export default async function RegisterPage(props: PageProps<"/account/register">) {
  const next = safeNext((await props.searchParams).next);
  if (await currentUser()) redirect(next);
  return (
    <>
      <PageHero kicker="My Account" title="Create an Account" intro="It takes a minute — no confirmation email needed." crumbs={[{ label: "Account", href: "/account" }, { label: "Register" }]} />
      <section className="bg-mist/50 py-10 lg:py-14">
        <div className="mx-auto grid max-w-[960px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl border border-hair bg-white p-6 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
            <RegisterForm next={next} />
          </div>
          <aside className="rounded-3xl bg-ink p-6 text-white">
            <h2 className="font-heading text-[1.05rem] font-bold">Why register?</h2>
            <ul className="mt-3 space-y-2.5 text-[0.9rem] text-white/85">
              {PERKS.map((p) => (
                <li key={p} className="flex gap-2">
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-whatsapp" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.8rem] text-white/60">Prefer not to? You can still check out as a guest.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
