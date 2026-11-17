import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ForgotPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage(props: PageProps<"/account/forgot-password">) {
  const { expired } = await props.searchParams;
  return (
    <>
      <PageHero
        kicker="My Account"
        title="Forgot Password"
        intro="Enter your account email and we'll send you a link to choose a new password."
        crumbs={[{ label: "Account", href: "/account" }, { label: "Forgot Password" }]}
      />
      <section className="bg-mist/50 py-10 lg:py-14">
        <div className="mx-auto max-w-[460px] px-4">
          <div className="rounded-3xl border border-hair bg-white p-6 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
            {expired && (
              <p role="alert" className="mb-4 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-[0.86rem] text-ink">
                That reset link has expired or was already used. Request a new one below.
              </p>
            )}
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
