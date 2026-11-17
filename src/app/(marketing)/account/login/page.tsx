import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { LoginForm } from "@/components/account/auth-forms";
import { currentUser, safeNext } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign In", robots: { index: false, follow: false } };

export default async function LoginPage(props: PageProps<"/account/login">) {
  const next = safeNext((await props.searchParams).next);
  if (await currentUser()) redirect(next);
  return (
    <>
      <PageHero kicker="My Account" title="Sign In" intro="Track your orders and check out faster." crumbs={[{ label: "Account", href: "/account" }, { label: "Sign In" }]} />
      <section className="bg-mist/50 py-10 lg:py-14">
        <div className="mx-auto max-w-[460px] px-4">
          <div className="rounded-3xl border border-hair bg-white p-6 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
            <LoginForm next={next} />
          </div>
        </div>
      </section>
    </>
  );
}
