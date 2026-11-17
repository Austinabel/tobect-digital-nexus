import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ResetPasswordForm } from "@/components/account/auth-forms";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a New Password", robots: { index: false, follow: false } };

/** Reached from the reset email (via /account/reset-password/confirm), which signs the customer in for this step. */
export default async function ResetPasswordPage() {
  const user = await currentUser();
  return (
    <>
      <PageHero kicker="My Account" title="Choose a New Password" crumbs={[{ label: "Account", href: "/account" }, { label: "New Password" }]} />
      <section className="bg-mist/50 py-10 lg:py-14">
        <div className="mx-auto max-w-[460px] px-4">
          <div className="rounded-3xl border border-hair bg-white p-6 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
            {user ? (
              <>
                <p className="mb-4 text-[0.88rem] text-slate">
                  Setting a new password for <strong className="text-ink">{user.email}</strong>.
                </p>
                <ResetPasswordForm />
              </>
            ) : (
              <div className="space-y-3 text-center">
                <p className="font-heading text-[1.05rem] font-bold text-ink">This link has expired</p>
                <p className="text-[0.9rem] text-slate">Reset links work once and expire after an hour.</p>
                <Link href="/account/forgot-password" className="inline-flex h-11 items-center rounded-full bg-blue px-6 font-heading text-[0.9rem] font-semibold text-white hover:bg-blue-deep">
                  Request a new link
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
