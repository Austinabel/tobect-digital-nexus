import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/lib/supabase/server";
import { ownerExists } from "./actions";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = { title: "Admin setup", robots: { index: false, follow: false } };

export default async function AdminSetupPage() {
  const [done, user] = await Promise.all([ownerExists(), currentUser()]);
  const locked = (process.env.ADMIN_SETUP_TOKEN ?? "").length < 16;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-4 py-10">
      <div className="w-full max-w-[460px] rounded-3xl border border-hair bg-white p-7 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)]">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.18em] text-red">First-run setup</p>
        <h1 className="mt-1 font-heading text-[1.5rem] font-extrabold text-ink">Claim the admin</h1>
        {done ? (
          <>
            <p className="mt-2 text-[0.92rem] text-slate">Setup is complete — this site already has an owner. The owner adds everyone else under Team &amp; roles.</p>
            <Link href="/admin" className="mt-5 inline-flex h-11 items-center rounded-full bg-blue px-6 font-heading text-[0.88rem] font-semibold text-white">
              Go to the admin
            </Link>
          </>
        ) : !user ? (
          <>
            <p className="mt-2 text-[0.92rem] text-slate">Sign in (or create an account) with the email that should own this website, then come back here.</p>
            <div className="mt-5 flex gap-2">
              <Link href="/account/login?next=/admin/setup" className="inline-flex h-11 items-center rounded-full bg-blue px-6 font-heading text-[0.88rem] font-semibold text-white">
                Sign in
              </Link>
              <Link href="/account/register?next=/admin/setup" className="inline-flex h-11 items-center rounded-full border-2 border-[#c9d8f2] px-5 font-heading text-[0.86rem] font-semibold text-blue">
                Create account
              </Link>
            </div>
          </>
        ) : locked ? (
          <p className="mt-2 text-[0.92rem] text-slate">
            Setup is locked. Add a secret <code className="rounded bg-field px-1">ADMIN_SETUP_TOKEN</code> (16+ characters) to the server&rsquo;s environment
            (<code className="rounded bg-field px-1">.env.local</code>), restart the site, then reload this page.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[0.92rem] text-slate">
              You&rsquo;re signed in as <strong className="text-ink">{user.email}</strong>. Enter the setup code from the server&rsquo;s environment to become the owner.
            </p>
            <SetupForm />
          </>
        )}
      </div>
    </main>
  );
}
